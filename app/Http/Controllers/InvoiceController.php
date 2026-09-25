<?php

namespace App\Http\Controllers;

use App\Concerns\ResolvesSchool;
use App\Http\Requests\InvoiceRequest;
use App\Models\Invoice;
use App\Models\School;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController
{
    use ResolvesSchool;

    /**
     * Display a listing of invoices for the school.
     */
    public function index(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);

        $invoices = Invoice::query()
            ->where('school_id', $schoolModel->id)
            ->with(['student', 'issuer'])
            ->orderBy('issued_on', 'desc')
            ->get();

        return Inertia::render('admin/invoices/index', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'invoices' => $invoices->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'number' => $invoice->number,
                    'student_name' => $invoice->student?->full_name,
                    'issued_on' => $invoice->issued_on?->toDateString(),
                    'due_on' => $invoice->due_on?->toDateString(),
                    'status' => $invoice->status,
                    'currency' => $invoice->currency,
                    'subtotal_minor' => $invoice->subtotal_minor,
                    'total_minor' => $invoice->total_minor,
                    'items_count' => count($invoice->items ?? []),
                ];
            }),
        ]);
    }

    /**
     * Show the form for creating a new invoice.
     */
    public function create(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);

        return Inertia::render('admin/invoices/create', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
        ]);
    }

    /**
     * Store a newly created invoice in storage.
     */
    public function store(InvoiceRequest $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);

        $validated = $request->validated();

        $invoice = Invoice::create([...$validated, 'organization_id' => $schoolModel->organization_id, 'school_id' => $schoolModel->id]);

        $audit->record('invoice.created', $invoice, after: $invoice->only([
            'student_id', 'issued_by', 'number', 'issued_on', 'due_on', 'status', 'currency', 'subtotal_minor', 'total_minor', 'items',
        ]));

        return redirect()->route('invoices.index', $schoolModel->id)
            ->with('success', 'Invoice created successfully.');
    }

    /**
     * Display the specified invoice.
     */
    public function show(int $school, int $invoice): Response
    {
        $schoolModel = $this->school($school);
        $invoiceModel = Invoice::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $invoice)
            ->with(['student', 'issuer', 'installments'])
            ->firstOrFail();

        Gate::authorize('manage-enrollment', $schoolModel);

        return Inertia::render('admin/invoices/show', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'invoice' => [
                'id' => $invoiceModel->id,
                'student_id' => $invoiceModel->student_id,
                'issued_by' => $invoiceModel->issued_by,
                'number' => $invoiceModel->number,
                'issued_on' => $invoiceModel->issued_on?->toDateString(),
                'due_on' => $invoiceModel->due_on?->toDateString(),
                'status' => $invoiceModel->status,
                'currency' => $invoiceModel->currency,
                'subtotal_minor' => $invoiceModel->subtotal_minor,
                'total_minor' => $invoiceModel->total_minor,
                'items' => $invoiceModel->items,
                'student_name' => $invoiceModel->student?->full_name,
                'issuer_name' => $invoiceModel->issuer?->name,
                'installments_count' => $invoiceModel->installments->count(),
                'installments' => $invoiceModel->installments->map(function ($installment) {
                    return [
                        'id' => $installment->id,
                        'sequence' => $installment->sequence,
                        'due_on' => $installment->due_on?->toDateString(),
                        'amount_minor' => $installment->amount_minor,
                        'paid_minor' => $installment->paid_minor,
                        'status' => $installment->status,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified invoice.
     */
    public function edit(int $school, int $invoice): Response
    {
        $schoolModel = $this->school($school);
        $invoiceModel = Invoice::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $invoice)
            ->firstOrFail();

        Gate::authorize('manage-enrollment', $schoolModel);

        return Inertia::render('admin/invoices/edit', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'invoice' => [
                'id' => $invoiceModel->id,
                'student_id' => $invoiceModel->student_id,
                'issued_by' => $invoiceModel->issued_by,
                'number' => $invoiceModel->number,
                'issued_on' => $invoiceModel->issued_on?->toDateString(),
                'due_on' => $invoiceModel->due_on?->toDateString(),
                'status' => $invoiceModel->status,
                'currency' => $invoiceModel->currency,
                'subtotal_minor' => $invoiceModel->subtotal_minor,
                'total_minor' => $invoiceModel->total_minor,
                'items' => $invoiceModel->items,
            ],
        ]);
    }

    /**
     * Update the specified invoice in storage.
     */
    public function update(InvoiceRequest $request, int $school, int $invoice, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);

        $invoiceModel = Invoice::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $invoice)
            ->firstOrFail();

        $validated = $request->validated();

        // Store old values for audit
        $oldValues = $invoiceModel->only([
            'student_id', 'issued_by', 'number', 'issued_on', 'due_on', 'status', 'currency', 'subtotal_minor', 'total_minor', 'items',
        ]);

        $invoiceModel->update($validated);

        $audit->record('invoice.updated', $invoiceModel, before: $oldValues, after: $invoiceModel->only([
            'student_id', 'issued_by', 'number', 'issued_on', 'due_on', 'status', 'currency', 'subtotal_minor', 'total_minor', 'items',
        ]));

        return back()->with('success', 'Invoice updated successfully.');
    }

    /**
     * Remove the specified invoice from storage.
     */
    public function destroy(int $school, int $invoice, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        $invoiceModel = Invoice::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $invoice)
            ->firstOrFail();

        Gate::authorize('manage-enrollment', $schoolModel);

        // Store values for audit before deletion
        $recordValues = $invoiceModel->only([
            'student_id', 'issued_by', 'number', 'issued_on', 'due_on', 'status', 'currency', 'subtotal_minor', 'total_minor', 'items',
        ]);

        $invoiceModel->delete();

        $audit->record('invoice.deleted', null, before: $recordValues);

        return redirect()->route('invoices.index', $schoolModel->id)
            ->with('success', 'Invoice deleted successfully.');
    }
}
