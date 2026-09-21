<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\Section;
use App\Models\TeacherAssignment;
use App\Models\User;
use App\Enums\UserRole;
use App\Services\AuditLogger;
use App\Http\Requests\UserRequest; // Reusing UserRequest for teacher_id validation
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TeacherAssignmentController
{
    /**
     * Display a listing of teacher assignments.
     */
    public function index(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('view', TeacherAssignment::class);

        $assignments = TeacherAssignment::query()
            ->where('school_id', $schoolModel->id)
            ->with(['teacher', 'section.academicClass'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('teacher-assignments/index', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'assignments' => $assignments,
        ]);
    }

    /**
     * Show the form for creating a new teacher assignment.
     */
    public function create(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('create', TeacherAssignment::class);

        $teachers = User::query()
            ->where('organization_id', $schoolModel->organization_id)
            ->where('role', UserRole::Teacher)
            ->orderBy('name')
            ->get(['id', 'name']);

        $sections = Section::query()
            ->where('school_id', $schoolModel->id)
            ->with('academicClass')
            ->orderBy('name')
            ->get(['id', 'name', 'academic_class_id', 'academic_class.name']);

        return Inertia::render('teacher-assignments/create', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'teachers' => $teachers,
            'sections' => $sections,
        ]);
    }

    /**
     * Store a newly created teacher assignment in storage.
     */
    public function store(UserRequest $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('create', TeacherAssignment::class);

        $validated = $request->validated();

        $teacher = User::query()
            ->where('organization_id', $schoolModel->organization_id)
            ->where('role', UserRole::Teacher)
            ->findOrFail($validated['teacher_id']);

        $section = Section::query()
            ->where('school_id', $schoolModel->id)
            ->findOrFail($validated['section_id']);

        $assignment = TeacherAssignment::create([
            ...$validated,
            'organization_id' => $schoolModel->organization_id,
            'school_id' => $schoolModel->id,
        ]);

        $audit->record('teacher.assigned_section', $assignment, after: [
            'teacher_id' => $teacher->id,
            'section_id' => $section->id,
        ]);

        return back()->with('success', 'Teacher assigned to section successfully.');
    }

    /**
     * Display the specified teacher assignment.
     */
    public function show(int $school, int $assignment): Response
    {
        $schoolModel = $this->school($school);
        $assignmentModel = TeacherAssignment::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $assignment)
            ->with(['teacher', 'section.academicClass'])
            ->firstOrFail();

        Gate::authorize('view', $assignmentModel);

        return Inertia::render('teacher-assignments/show', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'assignment' => [
                'id' => $assignmentModel->id,
                'teacher' => [
                    'id' => $assignmentModel->teacher->id,
                    'name' => $assignmentModel->teacher->name,
                    'email' => $assignmentModel->teacher->email,
                ],
                'section' => [
                    'id' => $assignmentModel->section->id,
                    'name' => $assignmentModel->section->name,
                    'academic_class' => [
                        'id' => $assignmentModel->section->academicClass->id,
                        'name' => $assignmentModel->section->academicClass->name,
                    ],
                ],
            ],
        ]);
    }

    /**
     * Show the form for editing the specified teacher assignment.
     */
    public function edit(int $school, int $assignment): Response
    {
        $schoolModel = $this->school($school);
        $assignmentModel = TeacherAssignment::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $assignment)
            ->with(['teacher', 'section'])
            ->firstOrFail();

        Gate::authorize('update', $assignmentModel);

        $teachers = User::query()
            ->where('organization_id', $schoolModel->organization_id)
            ->where('role', UserRole::Teacher)
            ->orderBy('name')
            ->get(['id', 'name']);

        $sections = Section::query()
            ->where('school_id', $schoolModel->id)
            ->with('academicClass')
            ->orderBy('name')
            ->get(['id', 'name', 'academic_class_id', 'academic_class.name']);

        return Inertia::render('teacher-assignments/edit', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'assignment' => [
                'id' => $assignmentModel->id,
                'teacher_id' => $assignmentModel->teacher->id,
                'section_id' => $assignmentModel->section->id,
            ],
            'teachers' => $teachers,
            'sections' => $sections,
        ]);
    }

    /**
     * Update the specified teacher assignment in storage.
     */
    public function update(UserRequest $request, int $school, int $assignment, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        $assignmentModel = TeacherAssignment::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $assignment)
            ->firstOrFail();

        Gate::authorize('update', $assignmentModel);

        $validated = $request->validated();

        // Store old values for audit
        $oldValues = [
            'teacher_id' => $assignmentModel->teacher_id,
            'section_id' => $assignmentModel->section_id,
        ];

        $assignmentModel->update($validated);

        $audit->record('teacher.assigned_section', $assignmentModel, before: $oldValues, after: [
            'teacher_id' => $assignmentModel->teacher_id,
            'section_id' => $assignmentModel->section_id,
        ]);

        return back()->with('success', 'Teacher assignment updated successfully.');
    }

    /**
     * Remove the specified teacher assignment from storage.
     */
    public function destroy(int $school, int $assignment, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        $assignmentModel = TeacherAssignment::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $assignment)
            ->firstOrFail();

        Gate::authorize('delete', $assignmentModel);

        // Store values for audit before deletion
        $recordValues = [
            'teacher_id' => $assignmentModel->teacher_id,
            'section_id' => $assignmentModel->section_id,
        ];

        $assignmentModel->delete();

        $audit->record('teacher.assigned_section.deleted', null, before: $recordValues);

        return back()->with('success', 'Teacher assignment removed successfully.');
    }

    private function school(int $id): School
    {
        return School::query()->findOrFail($id);
    }
}