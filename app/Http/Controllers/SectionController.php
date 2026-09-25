<?php

namespace App\Http\Controllers;

use App\Concerns\ResolvesSchool;
use App\Http\Requests\SectionRequest;
use App\Models\AcademicClass;
use App\Models\School;
use App\Models\Section;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SectionController
{
    use ResolvesSchool;

    /**
     * Display a listing of sections.
     */
    public function index(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);

        $sections = Section::query()
            ->where('school_id', $schoolModel->id)
            ->with('academicClass')
            ->withCount('enrollments')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/sections/index', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'sections' => $sections,
        ]);
    }

    /**
     * Show the form for creating a new section.
     */
    public function create(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);

        return Inertia::render('admin/sections/create', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'academicClasses' => $this->academicClasses($schoolModel),
        ]);
    }

    /**
     * Store a newly created section in storage.
     */
    public function store(SectionRequest $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);

        $validated = $request->validated();

        /** @var AcademicClass $academicClass */
        $academicClass = AcademicClass::query()->where('school_id', $schoolModel->id)->findOrFail($validated['class_id']);
        $section = $academicClass->sections()->create([
            ...$validated,
            'organization_id' => $schoolModel->organization_id,
            'school_id' => $schoolModel->id,
        ]);

        $audit->record('section.created', $section, after: $section->only([
            'class_id', 'name',
        ]));

        return redirect()->route('sections.index', $schoolModel->id)
            ->with('success', 'Section created successfully.');
    }

    /**
     * Display the specified section.
     */
    public function show(int $school, int $section): Response
    {
        $schoolModel = $this->school($school);
        $sectionModel = Section::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $section)
            ->firstOrFail();

        Gate::authorize('manage-enrollment', $schoolModel);

        return Inertia::render('admin/sections/show', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'section' => [
                'id' => $sectionModel->id,
                'name' => $sectionModel->name,
                'class' => [
                    'id' => $sectionModel->academicClass->id,
                    'name' => $sectionModel->academicClass->name,
                ],
            ],
        ]);
    }

    /**
     * Show the form for editing the specified section.
     */
    public function edit(int $school, int $section): Response
    {
        $schoolModel = $this->school($school);
        $sectionModel = Section::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $section)
            ->firstOrFail();

        Gate::authorize('manage-enrollment', $schoolModel);

        return Inertia::render('admin/sections/edit', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'section' => [
                'id' => $sectionModel->id,
                'name' => $sectionModel->name,
                'class_id' => $sectionModel->class_id,
                'class' => [
                    'id' => $sectionModel->academicClass->id,
                    'name' => $sectionModel->academicClass->name,
                ],
            ],
            'academicClasses' => $this->academicClasses($schoolModel),
        ]);
    }

    /**
     * Update the specified section in storage.
     */
    public function update(SectionRequest $request, int $school, int $section, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        $sectionModel = Section::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $section)
            ->firstOrFail();

        Gate::authorize('manage-enrollment', $schoolModel);

        $validated = $request->validated();

        // Store old values for audit
        $oldValues = $sectionModel->only([
            'class_id', 'name',
        ]);

        $sectionModel->update($validated);

        $audit->record('section.updated', $sectionModel, before: $oldValues, after: $sectionModel->only([
            'class_id', 'name',
        ]));

        return back()->with('success', 'Section updated successfully.');
    }

    /**
     * Remove the specified section from storage.
     */
    public function destroy(int $school, int $section, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        $sectionModel = Section::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $section)
            ->firstOrFail();

        Gate::authorize('manage-enrollment', $schoolModel);

        // Store values for audit before deletion
        $recordValues = $sectionModel->only([
            'class_id', 'name',
        ]);

        $sectionModel->delete();

        $audit->record('section.deleted', null, before: $recordValues);

        return redirect()->route('sections.index', $schoolModel->id)
            ->with('success', 'Section deleted successfully.');
    }

    /**
     * @return Collection<int, AcademicClass>
     */
    private function academicClasses(School $school): Collection
    {
        return AcademicClass::query()
            ->where('school_id', $school->id)
            ->orderBy('name')
            ->get(['id', 'name']);
    }
}
