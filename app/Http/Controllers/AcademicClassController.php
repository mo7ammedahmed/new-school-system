<?php

namespace App\Http\Controllers;

use App\Models\AcademicClass;
use App\Models\School;
use App\Services\AuditLogger;
use App\Http\Requests\AcademicClassRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AcademicClassController
{
    /**
     * Display a listing of academic classes.
     */
    public function index(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('view', AcademicClass::class);

        $academicClasses = AcademicClass::query()
            ->where('school_id', $schoolModel->id)
            ->with('sections')
            ->orderBy('name')
            ->get();

        return Inertia::render('academic-classes/index', [
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
        Gate::authorize('create', AcademicClass::class);

        return Inertia::render('academic-classes/create', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
        ]);
    }

    /**
     * Store a newly created academic class in storage.
     */
    public function store(AcademicClassRequest $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('create', AcademicClass::class);

        $validated = $request->validated();

        $academicClass = AcademicClass::create([...$validated, 'organization_id' => $schoolModel->organization_id, 'school_id' => $schoolModel->id]);

        $audit->record('academic_class.created', $academicClass, after: $academicClass->only([
            'name'
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

        Gate::authorize('view', $academicClassModel);

        return Inertia::render('academic-classes/show', [
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

        Gate::authorize('update', $academicClassModel);

        return Inertia::render('academic-classes/edit', [
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

        Gate::authorize('update', $academicClassModel);

        $validated = $request->validated();

        // Store old values for audit
        $oldValues = $academicClassModel->only([
            'name'
        ]);

        $academicClassModel->update($validated);

        $audit->record('academic_class.updated', $academicClassModel, before: $oldValues, after: $academicClassModel->only([
            'name'
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

        Gate::authorize('delete', $academicClassModel);

        // Store values for audit before deletion
        $recordValues = $academicClassModel->only([
            'name'
        ]);

        $academicClassModel->delete();

        $audit->record('academic_class.deleted', null, before: $recordValues);

        return redirect()->route('academic-classes.index', $schoolModel->id)
            ->with('success', 'Academic class deleted successfully.');
    }

    private function school(int $id): School
    {
        return School::query()->findOrFail($id);
    }
}