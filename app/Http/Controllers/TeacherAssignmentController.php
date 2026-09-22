<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Requests\TeacherAssignmentRequest;
use App\Models\School;
use App\Models\Section;
use App\Models\TeacherAssignment;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
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
        Gate::authorize('manage-enrollment', $schoolModel);

        $assignments = TeacherAssignment::query()
            ->where('school_id', $schoolModel->id)
            ->with(['teacher', 'section.academicClass'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/teacher-assignments/index', [
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
        Gate::authorize('manage-enrollment', $schoolModel);

        $teachers = User::query()
            ->where('organization_id', $schoolModel->organization_id)
            ->where('role', UserRole::Teacher)
            ->orderBy('name')
            ->get(['id', 'name']);

        $sections = Section::query()
            ->where('school_id', $schoolModel->id)
            ->with('academicClass')
            ->orderBy('name')
            ->get(['id', 'name', 'class_id']);

        return Inertia::render('admin/teacher-assignments/create', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'teachers' => $teachers,
            'sections' => $sections,
        ]);
    }

    /**
     * Store a newly created teacher assignment in storage.
     */
    public function store(TeacherAssignmentRequest $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);

        $validated = $request->validated();

        /** @var User $teacher */
        $teacher = User::query()
            ->where('organization_id', $schoolModel->organization_id)
            ->where('role', UserRole::Teacher)
            ->findOrFail($validated['teacher_id']);

        /** @var Section $section */
        $section = Section::query()
            ->where('school_id', $schoolModel->id)
            ->findOrFail($validated['section_id']);

        if ($section->teachers()->whereKey($teacher->id)->exists()) {
            return back()->withErrors([
                'teacher_id' => 'This teacher is already assigned to the section.',
            ]);
        }

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
        /** @var TeacherAssignment $assignmentModel */
        $assignmentModel = TeacherAssignment::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $assignment)
            ->with(['teacher', 'section.academicClass'])
            ->firstOrFail();

        Gate::authorize('manage-enrollment', $schoolModel);

        $teacher = $assignmentModel->teacher;
        $section = $assignmentModel->section;

        return Inertia::render('admin/teacher-assignments/show', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'assignment' => [
                'id' => $assignmentModel->id,
                'teacher' => [
                    'id' => $teacher?->id,
                    'name' => $teacher?->name,
                    'email' => $teacher?->email,
                ],
                'section' => [
                    'id' => $section?->id,
                    'name' => $section?->name,
                    'academic_class' => [
                        'id' => $section?->academicClass?->id,
                        'name' => $section?->academicClass?->name,
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
        /** @var TeacherAssignment $assignmentModel */
        $assignmentModel = TeacherAssignment::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $assignment)
            ->with(['teacher', 'section'])
            ->firstOrFail();

        Gate::authorize('manage-enrollment', $schoolModel);

        $teachers = User::query()
            ->where('organization_id', $schoolModel->organization_id)
            ->where('role', UserRole::Teacher)
            ->orderBy('name')
            ->get(['id', 'name']);

        $sections = Section::query()
            ->where('school_id', $schoolModel->id)
            ->with('academicClass')
            ->orderBy('name')
            ->get(['id', 'name', 'class_id']);

        return Inertia::render('admin/teacher-assignments/edit', [
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
    public function update(TeacherAssignmentRequest $request, int $school, int $assignment, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        /** @var TeacherAssignment $assignmentModel */
        $assignmentModel = TeacherAssignment::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $assignment)
            ->firstOrFail();

        Gate::authorize('manage-enrollment', $schoolModel);

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
        /** @var TeacherAssignment $assignmentModel */
        $assignmentModel = TeacherAssignment::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $assignment)
            ->firstOrFail();

        Gate::authorize('manage-enrollment', $schoolModel);

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
