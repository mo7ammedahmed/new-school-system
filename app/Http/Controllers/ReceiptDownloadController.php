<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReceiptDownloadController
{
    public function __invoke(Request $request, int $receipt, AuditLogger $audit): StreamedResponse
    {
        $record = Receipt::query()->with(['invoice.student.school', 'installment'])->findOrFail($receipt);
        if ($request->user()->hasRole('guardian')) {
            Gate::authorize('view-student', $record->invoice->student);
        } else {
            Gate::authorize('manage-finance', $record->invoice->school);
        }
        $audit->record('receipt.downloaded', $record, metadata: ['receipt_number' => $record->number, 'invoice_id' => $record->invoice_id]);

        return response()->streamDownload(function () use ($record): void {
            echo '<!doctype html><html><head><meta charset="utf-8"><title>Receipt '.e($record->number).'</title><style>body{font-family:Arial,sans-serif;max-width:760px;margin:40px auto;color:#222}section{border:1px solid #ddd;padding:20px;margin-top:20px}table{width:100%;border-collapse:collapse}td{padding:9px;border-bottom:1px solid #eee}td:last-child{text-align:right}</style></head><body>';
            echo '<h1>Payment receipt</h1><p>'.e($record->number).' · '.e($record->issued_at?->toDateString()).'</p><section><table><tr><td>Student</td><td>'.e($record->invoice->student->first_name.' '.$record->invoice->student->last_name).'</td></tr><tr><td>School</td><td>'.e($record->invoice->school->name).'</td></tr><tr><td>Invoice</td><td>'.e($record->invoice->number).'</td></tr><tr><td>Installment</td><td>'.e((string) $record->installment->sequence).'</td></tr><tr><td>Amount</td><td>'.e(number_format($record->amount_minor / 100, 2).' '.$record->currency).'</td></tr><tr><td>Provider reference</td><td>'.e($record->provider_reference).'</td></tr></table></section><p>Generated from an immutable payment record.</p></body></html>';
        }, 'receipt-'.$record->number.'.html', ['Content-Type' => 'text/html; charset=UTF-8']);
    }
}
