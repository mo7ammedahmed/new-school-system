<?php

namespace App\Http\Controllers;

use App\Models\Installment;
use App\Models\PaymentIntent;
use App\Models\Receipt;
use App\Models\School;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FinanceReportController
{
    public function outstanding(Request $request, int $school): Response
    {
        $schoolModel = School::query()->withoutGlobalScopes()->findOrFail($school);
        Gate::authorize('manage-finance', $schoolModel);
        $rows = $this->rows($request, $schoolModel);
        $failedPayments = PaymentIntent::query()->with(['invoice.student'])->where('school_id', $schoolModel->id)->where('status', 'failed')->latest('updated_at')->limit(50)->get()->map(fn (PaymentIntent $intent): array => ['id' => $intent->id, 'student' => trim($intent->invoice->student->first_name.' '.$intent->invoice->student->last_name), 'invoice' => $intent->invoice->number, 'amountMinor' => $intent->amount_minor, 'failedAt' => $intent->updated_at?->toIso8601String()])->values();

        return Inertia::render('admin/reports/finance', ['school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name], 'rows' => $rows, 'failedPayments' => $failedPayments, 'summary' => $this->summary($request, $schoolModel), 'filters' => $request->only(['status', 'from', 'to'])]);
    }

    public function export(Request $request, int $school, AuditLogger $audit): StreamedResponse
    {
        $schoolModel = School::query()->withoutGlobalScopes()->findOrFail($school);
        Gate::authorize('manage-finance', $schoolModel);
        $rows = $this->rows($request, $schoolModel);
        $audit->record('finance.outstanding_exported', $schoolModel, metadata: ['row_count' => count($rows), 'filters' => $request->only(['status', 'from', 'to'])]);

        return response()->streamDownload(function () use ($rows): void {
            $output = fopen('php://output', 'wb');

            if ($output === false) {
                throw new \RuntimeException('Failed to open CSV stream.');
            }

            fputcsv($output, array_map([$this, 'csvEscape'], ['Student', 'Student number', 'Invoice', 'Installment', 'Due on', 'Amount', 'Paid', 'Outstanding', 'Status']));
            foreach ($rows as $row) {
                fputcsv($output, array_map([$this, 'csvEscape'], [$row['student'], $row['studentNumber'], $row['invoice'], $row['installment'], $row['dueOn'], $row['amountMinor'], $row['paidMinor'], $row['outstandingMinor'], $row['status']]));
            }
            fclose($output);
        }, 'finance-outstanding.csv', ['Content-Type' => 'text/csv']);
    }

    /**
     * @return array<int, array{id: mixed, student: string, studentNumber: string, invoice: string, installment: int, dueOn: ?string, amountMinor: int, paidMinor: int, outstandingMinor: int, status: string}>
     */
    private function rows(Request $request, School $school): array
    {
        return Installment::query()->with(['invoice.student'])->where('school_id', $school->id)->whereColumn('paid_minor', '<', 'amount_minor')->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')->toString()))->when($request->filled('from'), fn ($query) => $query->whereDate('due_on', '>=', $request->input('from')))->when($request->filled('to'), fn ($query) => $query->whereDate('due_on', '<=', $request->input('to')))->orderBy('due_on')->get()->map(fn (Installment $part): array => ['id' => $part->id, 'student' => trim($part->invoice->student->first_name.' '.$part->invoice->student->last_name), 'studentNumber' => $part->invoice->student->student_number, 'invoice' => $part->invoice->number, 'installment' => $part->sequence, 'dueOn' => $part->due_on?->toDateString(), 'amountMinor' => $part->amount_minor, 'paidMinor' => $part->paid_minor, 'outstandingMinor' => $part->amount_minor - $part->paid_minor, 'status' => $part->status])->values()->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function summary(Request $request, School $school): array
    {
        $receipts = Receipt::query()->where('school_id', $school->id)->when($request->filled('from'), fn ($query) => $query->whereDate('issued_at', '>=', $request->input('from')))->when($request->filled('to'), fn ($query) => $query->whereDate('issued_at', '<=', $request->input('to')));
        $failed = PaymentIntent::query()->where('school_id', $school->id)->where('status', 'failed')->when($request->filled('from'), fn ($query) => $query->whereDate('updated_at', '>=', $request->input('from')))->when($request->filled('to'), fn ($query) => $query->whereDate('updated_at', '<=', $request->input('to')));
        $outstanding = Installment::query()->where('school_id', $school->id)->whereColumn('paid_minor', '<', 'amount_minor')->selectRaw('COALESCE(SUM(amount_minor - paid_minor), 0) AS total')->value('total');

        return ['revenueMinor' => (int) $receipts->sum('amount_minor'), 'receiptCount' => (int) $receipts->count(), 'failedPaymentCount' => (int) $failed->count(), 'failedPaymentMinor' => (int) $failed->sum('amount_minor'), 'outstandingMinor' => (int) $outstanding];
    }

    private function csvEscape(mixed $value): string
    {
        $value = (string) $value;
        if (preg_match('/^[=\+\-\@\t\r]/', $value)) {
            return '\''.$value;
        }

        return $value;
    }
}
