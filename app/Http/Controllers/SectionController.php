<?php

namespace App\Http\Controllers;

use App\Models\AcademicClass;
use App\Models\Section;
use App\Models\School;
use App\Services\AuditLogger;
use App\Http\Requests\SectionRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SectionController
{
    /**
     * Display a listing of sections.
     */
    public function index(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('view', Section::class);

        $sections = Section::query()
            ->where('school_id', $schoolModel->id)
            ->with('academicClass')
            ->orderBy('name')
            ->get();

        return Inertia::render('sections/index', [
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
        Gate::authorize('create', Section::class);

        return Inertia::render('sections/create', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
        ]);
    }

    /**
     * Store a newly created section in storage.
     */
    public function store(SectionRequest $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('create', Section::class);

        $validated = $request->validated();

        $academicClass = AcademicClass::query()->where('school_id', $schoolModel->id)->findOrFail($validated['class_id']);
        $section = $academicClass->sections()->create([
            ...$validated,
            'organization_id' => $schoolModel->organization_id,
            'school_id' => $schoolModel->id,
        ]);

        $audit->record('section.created', $section, after: $section->only([
            'class_id', 'name'
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

        Gate::authorize('view', $sectionModel);

        return Inertia::render('sections/show', [
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

        Gate::authorize('update', $sectionModel);

        return Inertia::render('sections/edit', [
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
     * Update the specified section in storage.
     */
    public function update(SectionRequest $request, int $school, int $section, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        $sectionModel = Section::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $section)
            ->firstOrFail();

        Gate::authorize('update', $sectionModel);

        $validated = $request->validated();

        // Store old values for audit
        $oldValues = $sectionModel->only([
            'class_id', 'name'
        ]);

        $sectionModel->update($validated);

        $audit->record('section.updated', $sectionModel, before: $oldValues, after: $sectionModel->only([
            'class_id', 'name'
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

        Gate::authorize('delete', $sectionModel);

        // Store values for audit before deletion
        $recordValues = $sectionModel->only([
            'class_id', 'name'
        ]);

        $sectionModel->delete();

        $audit->record('section.deleted', null, before: $recordValues);

        return redirect()->route('sections.index', $schoolModel->id)
            ->with('success', 'Section deleted successfully.');
    }

    private function school(int $id): School
    {
        return School::query()->findOrFail($id);
    }
}