<?php

namespace App\Http\Controllers;

use App\Concerns\ResolvesSchool;
use App\Http\Requests\AcademicClassRequest;
use App\Models\AcademicClass;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AcademicClassController
{
    use ResolvesSchool;

    /**
     * Display a listing of academic classes.
     */
    public function index(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);

        $academicClasses = AcademicClass::query()
            ->where('school_id', $schoolModel->id)
            ->with('sections')
            ->withCount('enrollments')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/academic-classes/index', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'academicClasses' => $academicClasses,
        ]);
    }

    /**
     * Show the form for creating a new academic class.
     */
    public function create(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);

        return Inertia::render('admin/academic-classes/create', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
        ]);
    }

    /**
     * Store a newly created academic class in storage.
     */
    public function store(AcademicClassRequest $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);

        $validated = $request->validated();

        $academicClass = AcademicClass::create([...$validated, 'organization_id' => $schoolModel->organization_id, 'school_id' => $schoolModel->id]);

        $audit->record('academic_class.created', $academicClass, after: $academicClass->only([
            'name',
        ]));

        return redirect()->route('academic-classes.index', $schoolModel->id)
            ->with('success', 'Academic class created successfully.');
    }

    /**
     * Display the specified academic class.
     */
    public function show(int $school, int $academicClass): Response
    {
        $schoolModel = $this->school($school);
        $academicClassModel = AcademicClass::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $academicClass)
            ->firstOrFail();

        Gate::authorize('manage-enrollment', $schoolModel);

        return Inertia::render('admin/academic-classes/show', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'academicClass' => [
                'id' => $academicClassModel->id,
                'name' => $academicClassModel->name,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified academic class.
     */
    public function edit(int $school, int $academicClass): Response
    {
        $schoolModel = $this->school($school);
        $academicClassModel = AcademicClass::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $academicClass)
            ->firstOrFail();

        Gate::authorize('manage-enrollment', $schoolModel);

        return Inertia::render('admin/academic-classes/edit', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'academicClass' => [
                'id' => $academicClassModel->id,
                'name' => $academicClassModel->name,
            ],
        ]);
    }

    /**
     * Update the specified academic class in storage.
     */
    public function update(AcademicClassRequest $request, int $school, int $academicClass, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        $academicClassModel = AcademicClass::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $academicClass)
            ->firstOrFail();

        Gate::authorize('manage-enrollment', $schoolModel);

        $validated = $request->validated();

        // Store old values for audit
        $oldValues = $academicClassModel->only([
            'name',
        ]);

        $academicClassModel->update($validated);

        $audit->record('academic_class.updated', $academicClassModel, before: $oldValues, after: $academicClassModel->only([
            'name',
        ]));

        return back()->with('success', 'Academic class updated successfully.');
    }

    /**
     * Remove the specified academic class from storage.
     */
    public function destroy(int $school, int $academicClass, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        $academicClassModel = AcademicClass::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $academicClass)
            ->firstOrFail();

        Gate::authorize('manage-enrollment', $schoolModel);

        // Store values for audit before deletion
        $recordValues = $academicClassModel->only([
            'name',
        ]);

        $academicClassModel->delete();

        $audit->record('academic_class.deleted', null, before: $recordValues);

        return redirect()->route('academic-classes.index', $schoolModel->id)
            ->with('success', 'Academic class deleted successfully.');
    }
}
