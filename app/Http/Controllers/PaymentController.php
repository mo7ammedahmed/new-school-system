<?php

namespace App\Http\Controllers;

use App\Concerns\ResolvesSchool;
use App\Http\Requests\PaymentRequest;
use App\Models\Payment;
use App\Models\School;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController
{
    use ResolvesSchool;

    /**
     * Display a listing of payments for the school.
     */
    public function index(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-finance', $schoolModel);

        $payments = Payment::query()
            ->where('school_id', $schoolModel->id)
            ->with(['installment.invoice.student', 'invoice.student', 'receivedBy'])
            ->orderBy('payment_date', 'desc')
            ->get();

        return Inertia::render('admin/payments/index', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'payments' => $payments->map(function ($payment) {
                $related = $payment->installment ?? $payment->invoice;
                $studentName = null;
                $reference = '';

                if ($related) {
                    if ($payment->installment) {
                        $reference = 'Installment #'.$payment->installment->sequence;
                        $studentName = $payment->installment->invoice?->student?->full_name;
                    } elseif ($payment->invoice) {
                        $reference = 'Invoice #'.$payment->invoice->number;
                        $studentName = $payment->invoice->student?->full_name;
                    }
                }

                return [
                    'id' => $payment->id,
                    'payment_date' => $payment->payment_date->toDateString(),
                    'amount_minor' => $payment->amount_minor,
                    'status' => $payment->status,
                    'payment_method' => $payment->payment_method,
                    'reference_number' => $payment->reference_number,
                    'reference' => $reference,
                    'student_name' => $studentName,
                    'received_by' => $payment->receivedBy?->name,
                ];
            }),
        ]);
    }

    /**
     * Show the form for creating a new payment.
     */
    public function create(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-finance', $schoolModel);

        return Inertia::render('admin/payments/create', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
        ]);
    }

    /**
     * Store a newly created payment in storage.
     */
    public function store(PaymentRequest $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-finance', $schoolModel);

        $validated = $request->validated();

        // Ensure either installment_id or invoice_id is set, but not both
        if (
            ($validated['installment_id'] !== null && $validated['invoice_id'] !== null) ||
            ($validated['installment_id'] === null && $validated['invoice_id'] === null)
        ) {
            // This should be caught by validation, but double-check
            return back()->withErrors(['_method' => 'Either installment or invoice must be specified, but not both.'])
                ->withInput();
        }

        $payment = Payment::create([...$validated, 'organization_id' => $schoolModel->organization_id, 'school_id' => $schoolModel->id]);

        $audit->record('payment.created', $payment, after: $payment->only([
            'installment_id', 'invoice_id', 'payment_date', 'amount_minor', 'status', 'payment_method',
        ]));

        return redirect()->route('payments.index', $schoolModel->id)
            ->with('success', 'Payment recorded successfully.');
    }

    /**
     * Display the specified payment.
     */
    public function show(int $school, int $payment): Response
    {
        $schoolModel = $this->school($school);
        $paymentModel = Payment::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $payment)
            ->with(['installment.invoice.student', 'invoice.student', 'receivedBy'])
            ->firstOrFail();

        Gate::authorize('manage-finance', $schoolModel);

        $related = $paymentModel->installment ?? $paymentModel->invoice;
        $reference = '';
        $studentName = null;
        $dueOn = null;
        $amountDueMinor = 0;
        $amountPaidMinor = 0;

        if ($related) {
            if ($paymentModel->installment) {
                $reference = 'Installment #'.$paymentModel->installment->sequence;
                $studentName = $paymentModel->installment->invoice?->student?->full_name;
                $dueOn = $paymentModel->installment->due_on?->toDateString();
                $amountDueMinor = $paymentModel->installment->amount_minor;
                $amountPaidMinor = $paymentModel->installment->paid_minor;
            } elseif ($paymentModel->invoice) {
                $reference = 'Invoice #'.$paymentModel->invoice->number;
                $studentName = $paymentModel->invoice->student?->full_name;
                // For invoices, we might want to show total amount due
                $amountDueMinor = $paymentModel->invoice->total_minor;
                $amountPaidMinor = $paymentModel->invoice->installments->sum('paid_minor');
            }
        }

        return Inertia::render('admin/payments/show', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'payment' => [
                'id' => $paymentModel->id,
                'payment_date' => $paymentModel->payment_date->toDateString(),
                'amount_minor' => $paymentModel->amount_minor,
                'status' => $paymentModel->status,
                'payment_method' => $paymentModel->payment_method,
                'reference_number' => $paymentModel->reference_number,
                'reference' => $reference,
                'student_name' => $studentName,
                'due_on' => $dueOn,
                'amount_due_minor' => $amountDueMinor,
                'amount_paid_minor' => $amountPaidMinor,
                'received_by' => $paymentModel->receivedBy?->name,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified payment.
     */
    public function edit(int $school, int $payment): Response
    {
        $schoolModel = $this->school($school);
        $paymentModel = Payment::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $payment)
            ->firstOrFail();

        Gate::authorize('manage-finance', $schoolModel);

        return Inertia::render('admin/payments/edit', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'payment' => [
                'id' => $paymentModel->id,
                'installment_id' => $paymentModel->installment_id,
                'invoice_id' => $paymentModel->invoice_id,
                'received_by' => $paymentModel->received_by,
                'payment_method' => $paymentModel->payment_method,
                'reference_number' => $paymentModel->reference_number,
                'payment_date' => $paymentModel->payment_date->toDateString(),
                'amount_minor' => $paymentModel->amount_minor,
                'status' => $paymentModel->status,
            ],
        ]);
    }

    /**
     * Update the specified payment in storage.
     */
    public function update(PaymentRequest $request, int $school, int $payment, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-finance', $schoolModel);

        $paymentModel = Payment::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $payment)
            ->firstOrFail();

        $validated = $request->validated();

        // Ensure either installment_id or invoice_id is set, but not both
        if (
            ($validated['installment_id'] !== null && $validated['invoice_id'] !== null) ||
            ($validated['installment_id'] === null && $validated['invoice_id'] === null)
        ) {
            // This should be caught by validation, but double-check
            return back()->withErrors(['_method' => 'Either installment or invoice must be specified, but not both.'])
                ->withInput();
        }

        // Store old values for audit
        $oldValues = $paymentModel->only([
            'installment_id', 'invoice_id', 'payment_date', 'amount_minor', 'status', 'payment_method',
        ]);

        $paymentModel->update($validated);

        $audit->record('payment.updated', $paymentModel, before: $oldValues, after: $paymentModel->only([
            'installment_id', 'invoice_id', 'payment_date', 'amount_minor', 'status', 'payment_method',
        ]));

        return back()->with('success', 'Payment updated successfully.');
    }

    /**
     * Remove the specified payment from storage.
     */
    public function destroy(int $school, int $payment, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-finance', $schoolModel);

        $paymentModel = Payment::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $payment)
            ->firstOrFail();

        // Store values for audit before deletion
        $recordValues = $paymentModel->only([
            'installment_id', 'invoice_id', 'payment_date', 'amount_minor', 'status', 'payment_method',
        ]);

        $paymentModel->delete();

        $audit->record('payment.deleted', null, before: $recordValues);

        return redirect()->route('payments.index', $schoolModel->id)
            ->with('success', 'Payment deleted successfully.');
    }
}
