<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\School;
use App\Services\AuditLogger;
use App\Http\Requests\AcademicYearRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AcademicYearController
{
    /**
     * Display a listing of academic years.
     */
    public function index(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('view', AcademicYear::class);

        $academicYears = AcademicYear::query()
            ->where('school_id', $schoolModel->id)
            ->orderBy('starts_on', 'desc')
            ->get();

        return Inertia::render('academic-years/index', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'academicYears' => $academicYears,
        ]);
    }

    /**
     * Show the form for creating a new academic year.
     */
    public function create(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('create', AcademicYear::class);

        return Inertia::render('academic-years/create', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
        ]);
    }

    /**
     * Store a newly created academic year in storage.
     */
    public function store(AcademicYearRequest $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('create', AcademicYear::class);

        $validated = $request->validated();

        $academicYear = AcademicYear::create([...$validated, 'organization_id' => $schoolModel->organization_id, 'school_id' => $schoolModel->id]);

        $audit->record('academic_year.created', $academicYear, after: $academicYear->only([
            'name', 'starts_on', 'ends_on', 'is_current'
        ]));

        return redirect()->route('academic-years.index', $schoolModel->id)
            ->with('success', 'Academic year created successfully.');
    }

    /**
     * Display the specified academic year.
     */
    public function show(int $school, int $academicYear): Response
    {
        $schoolModel = $this->school($school);
        $academicYearModel = AcademicYear::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $academicYear)
            ->firstOrFail();

        Gate::authorize('view', $academicYearModel);

        return Inertia::render('academic-years/show', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'academicYear' => [
                'id' => $academicYearModel->id,
                'name' => $academicYearModel->name,
                'starts_on' => $academicYearModel->starts_on?->toDateString(),
                'ends_on' => $academicYearModel->ends_on?->toDateString(),
                'is_current' => $academicYearModel->is_current,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified academic year.
     */
    public function edit(int $school, int $academicYear): Response
    {
        $schoolModel = $this->school($school);
        $academicYearModel = AcademicYear::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $academicYear)
            ->firstOrFail();

        Gate::authorize('update', $academicYearModel);

        return Inertia::render('academic-years/edit', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'academicYear' => [
                'id' => $academicYearModel->id,
                'name' => $academicYearModel->name,
                'starts_on' => $academicYearModel->starts_on?->toDateString(),
                'ends_on' => $academicYearModel->ends_on?->toDateString(),
                'is_current' => $academicYearModel->is_current,
            ],
        ]);
    }

    /**
     * Update the specified academic year in storage.
     */
    public function update(AcademicYearRequest $request, int $school, int $academicYear, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        $academicYearModel = AcademicYear::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $academicYear)
            ->firstOrFail();

        Gate::authorize('update', $academicYearModel);

        $validated = $request->validated();

        // Store old values for audit
        $oldValues = $academicYearModel->only([
            'name', 'starts_on', 'ends_on', 'is_current'
        ]);

        $academicYearModel->update($validated);

        $audit->record('academic_year.updated', $academicYearModel, before: $oldValues, after: $academicYearModel->only([
            'name', 'starts_on', 'ends_on', 'is_current'
        ]));

        return back()->with('success', 'Academic year updated successfully.');
    }

    /**
     * Remove the specified academic year from storage.
     */
    public function destroy(int $school, int $academicYear, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        $academicYearModel = AcademicYear::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $academicYear)
            ->firstOrFail();

        Gate::authorize('delete', $academicYearModel);

        // Store values for audit before deletion
        $recordValues = $academicYearModel->only([
            'name', 'starts_on', 'ends_on', 'is_current'
        ]);

        $academicYearModel->delete();

        $audit->record('academic_year.deleted', null, before: $recordValues);

        return redirect()->route('academic-years.index', $schoolModel->id)
            ->with('success', 'Academic year deleted successfully.');
    }

    private function school(int $id): School
    {
        return School::query()->findOrFail($id);
    }
}