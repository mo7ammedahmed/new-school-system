<?php

namespace App\Http\Controllers;

use App\Models\FeeStructure;
use App\Models\Invoice;
use App\Models\School;
use App\Models\Student;
use App\Services\AuditLogger;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class FinanceController
{
    public function index(int $school): Response
    {
        $schoolModel = School::query()->findOrFail($school);
        Gate::authorize('manage-finance', $schoolModel);

        return Inertia::render('admin/finance/index', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'feeStructures' => FeeStructure::query()->where('school_id', $schoolModel->id)->latest()->get(),
            'invoices' => Invoice::query()->where('school_id', $schoolModel->id)->with(['student', 'installments'])->latest()->limit(100)->get(),
            'students' => Student::query()->where('school_id', $schoolModel->id)->orderBy('first_name')->get(['id', 'first_name', 'last_name', 'student_number']),
        ]);
    }

    public function storeFee(Request $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = School::query()->findOrFail($school);
        Gate::authorize('manage-finance', $schoolModel);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:1000'],
            'amount_minor' => ['required', 'integer', 'min:1'],
            'frequency' => ['required', 'in:annual,term,monthly,one_time'],
        ]);
        $fee = $schoolModel->feeStructures()->create(['organization_id' => $schoolModel->organization_id, ...$data, 'currency' => 'SAR', 'is_active' => true]);
        $audit->record('fee_structure.created', $fee, after: ['school_id' => $schoolModel->id, 'amount_minor' => $fee->amount_minor]);

        return back()->with('success', 'Fee structure created.');
    }

    public function storeInvoice(Request $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = School::query()->findOrFail($school);
        Gate::authorize('manage-finance', $schoolModel);
        $data = $request->validate([
            'student_id' => ['required', 'integer'],
            'fee_structure_id' => ['required', 'integer'],
            'issued_on' => ['required', 'date'],
            'due_on' => ['required', 'date', 'after_or_equal:issued_on'],
            'installment_count' => ['required', 'integer', 'min:1', 'max:12'],
        ]);
        $student = Student::query()->where('school_id', $schoolModel->id)->where('id', $data['student_id'])->firstOrFail();
        $fee = FeeStructure::query()->where('school_id', $schoolModel->id)->where('is_active', true)->where('id', $data['fee_structure_id'])->firstOrFail();
        $invoice = DB::transaction(function () use ($data, $schoolModel, $student, $fee, $request): Invoice {
            $invoice = Invoice::create([
                'organization_id' => $schoolModel->organization_id,
                'school_id' => $schoolModel->id,
                'student_id' => $student->id,
                'issued_by' => $request->user()->id,
                'number' => 'INV-'.now()->format('Ymd').'-'.Str::upper(Str::random(8)),
                'issued_on' => $data['issued_on'],
                'due_on' => $data['due_on'],
                'status' => 'issued',
                'currency' => $fee->currency,
                'subtotal_minor' => $fee->amount_minor,
                'total_minor' => $fee->amount_minor,
                'items' => [['fee_structure_id' => $fee->id, 'description' => $fee->name, 'amount_minor' => $fee->amount_minor]],
            ]);
            $count = (int) $data['installment_count'];
            $base = intdiv($invoice->total_minor, $count);
            $remainder = $invoice->total_minor % $count;
            for ($sequence = 1; $sequence <= $count; $sequence++) {
                $invoice->installments()->create([
                    'organization_id' => $schoolModel->organization_id,
                    'school_id' => $schoolModel->id,
                    'sequence' => $sequence,
                    'due_on' => CarbonImmutable::parse($data['due_on'])->addMonths($sequence - 1)->toDateString(),
                    'amount_minor' => $base + ($sequence === 1 ? $remainder : 0),
                    'paid_minor' => 0,
                    'status' => 'pending',
                ]);
            }

            return $invoice;
        });
        $audit->record('invoice.issued', $invoice, after: ['school_id' => $schoolModel->id, 'student_id' => $student->id, 'total_minor' => $invoice->total_minor, 'installment_count' => $data['installment_count']]);

        return back()->with('success', 'Invoice issued.');
    }
}
