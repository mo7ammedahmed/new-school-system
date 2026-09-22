<?php

namespace App\Http\Controllers;

use App\Http\Requests\FeeStructureRequest;
use App\Models\FeeStructure;
use App\Models\School;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class FeeStructureController
{
    /**
     * Display a listing of fee structures for the school.
     */
    public function index(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);

        $feeStructures = FeeStructure::query()
            ->where('school_id', $schoolModel->id)
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/fee-structures/index', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'feeStructures' => $feeStructures,
        ]);
    }

    /**
     * Show the form for creating a new fee structure.
     */
    public function create(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);

        return Inertia::render('admin/fee-structures/create', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
        ]);
    }

    /**
     * Store a newly created fee structure in storage.
     */
    public function store(FeeStructureRequest $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);

        $validated = $request->validated();

        $feeStructure = FeeStructure::create([...$validated, 'organization_id' => $schoolModel->organization_id, 'school_id' => $schoolModel->id]);

        $audit->record('fee_structure.created', $feeStructure, after: $feeStructure->only([
            'name', 'description', 'amount_minor', 'currency', 'frequency', 'is_active',
        ]));

        return redirect()->route('fee-structures.index', $schoolModel->id)
            ->with('success', 'Fee structure created successfully.');
    }

    /**
     * Display the specified fee structure.
     */
    public function show(int $school, int $feeStructure): Response
    {
        $schoolModel = $this->school($school);
        $feeStructureModel = FeeStructure::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $feeStructure)
            ->firstOrFail();

        Gate::authorize('manage-enrollment', $schoolModel);

        return Inertia::render('admin/fee-structures/show', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'feeStructure' => [
                'id' => $feeStructureModel->id,
                'name' => $feeStructureModel->name,
                'description' => $feeStructureModel->description,
                'amount_minor' => $feeStructureModel->amount_minor,
                'currency' => $feeStructureModel->currency,
                'frequency' => $feeStructureModel->frequency,
                'is_active' => $feeStructureModel->is_active,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified fee structure.
     */
    public function edit(int $school, int $feeStructure): Response
    {
        $schoolModel = $this->school($school);
        $feeStructureModel = FeeStructure::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $feeStructure)
            ->firstOrFail();

        Gate::authorize('manage-enrollment', $schoolModel);

        return Inertia::render('admin/fee-structures/edit', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'feeStructure' => [
                'id' => $feeStructureModel->id,
                'name' => $feeStructureModel->name,
                'description' => $feeStructureModel->description,
                'amount_minor' => $feeStructureModel->amount_minor,
                'currency' => $feeStructureModel->currency,
                'frequency' => $feeStructureModel->frequency,
                'is_active' => $feeStructureModel->is_active,
            ],
        ]);
    }

    /**
     * Update the specified fee structure in storage.
     */
    public function update(FeeStructureRequest $request, int $school, int $feeStructure, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        $feeStructureModel = FeeStructure::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $feeStructure)
            ->firstOrFail();

        Gate::authorize('manage-enrollment', $schoolModel);

        $validated = $request->validated();

        // Store old values for audit
        $oldValues = $feeStructureModel->only([
            'name', 'description', 'amount_minor', 'currency', 'frequency', 'is_active',
        ]);

        $feeStructureModel->update($validated);

        $audit->record('fee_structure.updated', $feeStructureModel, before: $oldValues, after: $feeStructureModel->only([
            'name', 'description', 'amount_minor', 'currency', 'frequency', 'is_active',
        ]));

        return back()->with('success', 'Fee structure updated successfully.');
    }

    /**
     * Remove the specified fee structure from storage.
     */
    public function destroy(int $school, int $feeStructure, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        $feeStructureModel = FeeStructure::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $feeStructure)
            ->firstOrFail();

        Gate::authorize('manage-enrollment', $schoolModel);

        // Store values for audit before deletion
        $recordValues = $feeStructureModel->only([
            'name', 'description', 'amount_minor', 'currency', 'frequency', 'is_active',
        ]);

        $feeStructureModel->delete();

        $audit->record('fee_structure.deleted', null, before: $recordValues);

        return redirect()->route('fee-structures.index', $schoolModel->id)
            ->with('success', 'Fee structure deleted successfully.');
    }

    private function school(int $id): School
    {
        return School::query()->findOrFail($id);
    }
}