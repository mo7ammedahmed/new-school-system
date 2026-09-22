<?php

namespace App\Http\Controllers;

use App\Http\Requests\InstallmentRequest;
use App\Models\Installment;
use App\Models\School;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class InstallmentController
{
    /**
     * Display a listing of installments for the school.
     */
    public function index(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);

        $installments = Installment::query()
            ->where('school_id', $schoolModel->id)
            ->with(['invoice.student'])
            ->orderBy('due_on')
            ->get();

        return Inertia::render('admin/installments/index', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'installments' => $installments->map(function ($installment) {
                return [
                    'id' => $installment->id,
                    'sequence' => $installment->sequence,
                    'due_on' => $installment->due_on?->toDateString(),
                    'amount_minor' => $installment->amount_minor,
                    'paid_minor' => $installment->paid_minor,
                    'status' => $installment->status,
                    'invoice_number' => $installment->invoice->number ?? '',
                    'student_name' => trim($installment->invoice->student->first_name . ' ' . $installment->invoice->student->last_name ?? ''),
                ];
            }),
        ]);
    }

    /**
     * Show the form for creating a new installment.
     */
    public function create(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);

        return Inertia::render('admin/installments/create', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
        ]);
    }

    /**
     * Store a newly created installment in storage.
     */
    public function store(InstallmentRequest $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);

        $validated = $request->validated();

        $installment = Installment::create([...$validated, 'organization_id' => $schoolModel->organization_id, 'school_id' => $schoolModel->id]);

        $audit->record('installment.created', $installment, after: $installment->only([
            'invoice_id', 'sequence', 'due_on', 'amount_minor', 'paid_minor', 'status', 'paid_at',
        ]));

        return redirect()->route('installments.index', $schoolModel->id)
            ->with('success', 'Installment created successfully.');
    }

    /**
     * Display the specified installment.
     */
    public function show(int $school, int $installment): Response
    {
        $schoolModel = $this->school($school);
        $installmentModel = Installment::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $installment)
            ->with(['invoice.student'])
            ->firstOrFail();

        Gate::authorize('manage-enrollment', $schoolModel);

        return Inertia::render('admin/installments/show', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'installment' => [
                'id' => $installmentModel->id,
                'invoice_id' => $installmentModel->invoice_id,
                'sequence' => $installmentModel->sequence,
                'due_on' => $installmentModel->due_on?->toDateString(),
                'amount_minor' => $installmentModel->amount_minor,
                'paid_minor' => $installmentModel->paid_minor,
                'status' => $installmentModel->status,
                'paid_at' => $installmentModel->paid_at?->toDateString(),
                'invoice_number' => $installmentModel->invoice->number ?? '',
                'student_name' => trim($installmentModel->invoice->student->first_name . ' ' . $installmentModel->invoice->student->last_name ?? ''),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified installment.
     */
    public function edit(int $school, int $installment): Response
    {
        $schoolModel = $this->school($school);
        $installmentModel = Installment::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $installment)
            ->firstOrFail();

        Gate::authorize('manage-enrollment', $schoolModel);

        return Inertia::render('admin/installments/edit', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'installment' => [
                'id' => $installmentModel->id,
                'invoice_id' => $installmentModel->invoice_id,
                'sequence' => $installmentModel->sequence,
                'due_on' => $installmentModel->due_on?->toDateString(),
                'amount_minor' => $installmentModel->amount_minor,
                'paid_minor' => $installmentModel->paid_minor,
                'status' => $installmentModel->status,
                'paid_at' => $installmentModel->paid_at?->toDateString(),
            ],
        ]);
    }

    /**
     * Update the specified installment in storage.
     */
    public function update(InstallmentRequest $request, int $school, int $installment, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);

        $validated = $request->validated();

        // Store old values for audit
        $oldValues = $installmentModel->only([
            'invoice_id', 'sequence', 'due_on', 'amount_minor', 'paid_minor', 'status', 'paid_at',
        ]);

        $installmentModel->update($validated);

        $audit->record('installment.updated', $installmentModel, before: $oldValues, after: $installmentModel->only([
            'invoice_id', 'sequence', 'due_on', 'amount_minor', 'paid_minor', 'status', 'paid_at',
        ]));

        return back()->with('success', 'Installment updated successfully.');
    }

    /**
     * Remove the specified installment from storage.
     */
    public function destroy(int $school, int $installment, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);

        // Store values for audit before deletion
        $recordValues = $installmentModel->only([
            'invoice_id', 'sequence', 'due_on', 'amount_minor', 'paid_minor', 'status', 'paid_at',
        ]);

        $installmentModel->delete();

        $audit->record('installment.deleted', null, before: $recordValues);

        return redirect()->route('installments.index', $schoolModel->id)
            ->with('success', 'Installment deleted successfully.');
    }

    private function school(int $id): School
    {
        return School::query()->findOrFail($id);
    }
}