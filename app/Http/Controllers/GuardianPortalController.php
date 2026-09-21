<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\Assessment;
use App\Models\AttendanceRecord;
use App\Models\Enrollment;
use App\Models\Guardian;
use App\Models\Installment;
use App\Models\Invoice;
use App\Models\Notice;
use App\Models\PaymentIntent;
use App\Models\Receipt;
use App\Models\Student;
use App\Services\AuditLogger;
use App\Services\StripePaymentAdapter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class GuardianPortalController
{
    public function index(AuditLogger $audit): Response
    {
        $user = Auth::user();
        abort_unless($user?->hasRole(UserRole::Guardian), 403);

        $guardian = Guardian::query()->where('user_id', $user->id)->firstOrFail();
        $students = $guardian->students()
            ->with([
                'school',
                'enrollments' => fn ($query) => $query->where('status', 'active')->with(['academicYear', 'academicClass', 'section']),
                'attendanceRecords' => fn ($query) => $query->latest()->limit(10)->with('session'),
                'assessments' => fn ($query) => $query->latest('assessed_on')->limit(10),
            ])
            ->orderBy('last_name')
            ->get();
        $studentIds = $students->modelKeys();
        $schoolIds = $students->pluck('school_id')->unique();
        $invoices = Invoice::query()->whereIn('student_id', $studentIds)->with(['student', 'installments'])->latest('issued_on')->limit(50)->get();
        $receipts = Receipt::query()->whereIn('invoice_id', $invoices->modelKeys())->with(['invoice.student', 'installment'])->latest('issued_at')->limit(50)->get();
        $audit->record('invoice.viewed', after: ['invoice_ids' => $invoices->modelKeys(), 'student_ids' => $studentIds]);
        $notices = Notice::query()->published()
            ->whereIn('school_id', $schoolIds)
            ->where(function ($query) use ($studentIds): void {
                $query->whereDoesntHave('students')->orWhereHas('students', fn ($studentsQuery) => $studentsQuery->whereIn('students.id', $studentIds));
            })->latest('published_at')->limit(20)->get(['id', 'school_id', 'title', 'body', 'published_at']);

        return Inertia::render('guardian/portal', [
            'guardian' => ['name' => $guardian->name],
            'notices' => $notices->map(fn (Notice $notice): array => ['id' => $notice->id, 'schoolId' => $notice->school_id, 'title' => $notice->title, 'body' => $notice->body, 'publishedAt' => $notice->published_at !== null ? $notice->published_at->toIso8601String() : null])->values(),
            'invoices' => $invoices->map(fn (Invoice $invoice): array => ['id' => $invoice->id, 'number' => $invoice->number, 'studentId' => $invoice->student_id, 'studentName' => trim($invoice->student->first_name.' '.$invoice->student->last_name), 'issuedOn' => $invoice->issued_on !== null ? $invoice->issued_on->toDateString() : null, 'dueOn' => $invoice->due_on !== null ? $invoice->due_on->toDateString() : null, 'status' => $invoice->status, 'totalMinor' => $invoice->total_minor, 'currency' => $invoice->currency, 'items' => $invoice->items, 'installments' => $invoice->installments->map(fn (Installment $installment): array => ['id' => $installment->id, 'sequence' => $installment->sequence, 'dueOn' => $installment->due_on !== null ? $installment->due_on->toDateString() : null, 'amountMinor' => $installment->amount_minor, 'paidMinor' => $installment->paid_minor, 'status' => $installment->status])->values()])->values(),
            'receipts' => $receipts->map(fn (Receipt $receipt): array => ['id' => $receipt->id, 'number' => $receipt->number, 'invoiceNumber' => $receipt->invoice->number, 'studentName' => trim($receipt->invoice->student->first_name.' '.$receipt->invoice->student->last_name), 'amountMinor' => $receipt->amount_minor, 'currency' => $receipt->currency, 'issuedAt' => $receipt->issued_at !== null ? $receipt->issued_at->toIso8601String() : null, 'providerReference' => $receipt->provider_reference])->values(),
            'students' => $students->map(fn (Student $student): array => [
                'id' => $student->id,
                'name' => trim($student->first_name.' '.$student->last_name),
                'studentNumber' => $student->student_number,
                'school' => $student->school->name,
                'enrollments' => $student->enrollments->map(fn (Enrollment $enrollment): array => [
                    'year' => $enrollment->academicYear->name,
                    'class' => $enrollment->academicClass->name,
                    'section' => $enrollment->section !== null ? $enrollment->section->name : null,
                ])->values(),
                'attendance' => [
                    'totals' => $student->attendanceRecords->groupBy('status')->map->count(),
                    'recent' => $student->attendanceRecords->map(fn (AttendanceRecord $record): array => [
                        'date' => $record->session->attendance_date !== null ? $record->session->attendance_date->toDateString() : null,
                        'status' => $record->status,
                        'note' => $record->note,
                    ])->values(),
                ],
                'progress' => $student->assessments->map(fn (Assessment $assessment): array => [
                    'title' => $assessment->title,
                    'score' => (float) $assessment->score,
                    'maxScore' => (float) $assessment->max_score,
                    'assessedOn' => $assessment->assessed_on !== null ? $assessment->assessed_on->toDateString() : null,
                    'comment' => $assessment->comment,
                ])->values(),
            ])->values(),
        ]);
    }

    public function createPaymentIntent(Request $request, int $installment, AuditLogger $audit, StripePaymentAdapter $stripe): RedirectResponse
    {
        $request->validate(['idempotency_key' => ['required', 'string', 'max:100']]);
        Guardian::query()->where('user_id', $request->user()->id)->firstOrFail();
        $record = Installment::query()->with('invoice')->findOrFail($installment);
        Gate::authorize('view-student', $record->invoice->student);
        abort_if($record->paid_minor >= $record->amount_minor || $record->status === 'paid', 422, 'This installment is already paid.');

        $existing = PaymentIntent::query()->forOrganization($record->organization_id)->where('user_id', $request->user()->id)->where('idempotency_key', $request->string('idempotency_key')->toString())->first();
        abort_if($existing && $existing->installment_id !== $record->id, 409, 'This idempotency key was already used for another installment.');
        $intent = $existing ?? PaymentIntent::query()->create([
            'organization_id' => $record->organization_id, 'school_id' => $record->school_id, 'invoice_id' => $record->invoice_id, 'installment_id' => $record->id, 'user_id' => $request->user()->id, 'provider' => 'stripe', 'idempotency_key' => $request->string('idempotency_key')->toString(), 'amount_minor' => $record->amount_minor - $record->paid_minor, 'currency' => $record->invoice->currency, 'status' => 'created',
        ]);
        if (! $existing) {
            $providerPayload = $stripe->create(['amount_minor' => $intent->amount_minor, 'currency' => $intent->currency, 'organization_id' => $intent->organization_id, 'invoice_id' => $intent->invoice_id, 'installment_id' => $intent->installment_id, 'user_id' => $intent->user_id, 'idempotency_key' => $intent->idempotency_key]);
            if ($providerPayload) {
                $intent->update(['provider_intent_id' => $providerPayload['id'] ?? null, 'status' => 'requires_action', 'provider_payload' => $providerPayload]);
            }
        }
        $audit->record('payment_intent.created', $intent, after: ['installment_id' => $record->id, 'amount_minor' => $intent->amount_minor]);

        return back()->with('success', 'Payment intent created. Payment provider integration is pending configuration.');
    }
}
