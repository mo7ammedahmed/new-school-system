<?php

namespace App\Http\Controllers;

use App\Models\AcademicClass;
use App\Models\AcademicYear;
use App\Models\Enrollment;
use App\Models\School;
use App\Models\Section;
use App\Models\Student;
use App\Services\AuditLogger;
use App\Http\Requests\EnrollmentRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class EnrollmentController
{
    /**
     * Display a listing of enrollments.
     */
    public function index(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('view', Enrollment::class);

        $enrollments = Enrollment::query()
            ->where('school_id', $schoolModel->id)
            ->with(['student', 'academicYear', 'academicClass', 'section'])
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('enrollments/index', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'enrollments' => $enrollments,
        ]);
    }

    /**
     * Show the form for creating a new enrollment.
     */
    public function create(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('create', Enrollment::class);

        $students = Student::query()
            ->where('school_id', $schoolModel->id)
            ->where('status', 'active')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'student_number']);

        $academicYears = AcademicYear::query()
            ->where('school_id', $schoolModel->id)
            ->orderBy('starts_on', 'desc')
            ->get(['id', 'name']);

        $academicClasses = AcademicClass::query()
            ->where('school_id', $schoolModel->id)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('enrollments/create', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'students' => $students,
            'academicYears' => $academicYears,
            'academicClasses' => $academicClasses,
        ]);
    }

    /**
     * Store a newly created enrollment in storage.
     */
    public function store(EnrollmentRequest $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('create', Enrollment::class);

        $validated = $request->validated();

        $student = Student::query()->where('school_id', $schoolModel->id)->findOrFail($validated['student_id']);
        $academicYear = AcademicYear::query()->where('school_id', $schoolModel->id)->findOrFail($validated['academic_year_id']);
        $academicClass = AcademicClass::query()->where('school_id', $schoolModel->id)->findOrFail($validated['class_id']);

        $enrollment = Enrollment::create([
            ...$validated,
            'organization_id' => $schoolModel->organization_id,
            'school_id' => $schoolModel->id,
            'status' => 'active',
        ]);

        $audit->record('enrollment.created', $enrollment, after: $enrollment->only([
            'student_id', 'academic_year_id', 'class_id', 'section_id'
        ]));

        return redirect()->route('enrollments.index', $schoolModel->id)
            ->with('success', 'Enrollment created successfully.');
    }

    /**
     * Display the specified enrollment.
     */
    public function show(int $school, int $enrollment): Response
    {
        $schoolModel = $this->school($school);
        $enrollmentModel = Enrollment::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $enrollment)
            ->with(['student', 'academicYear', 'academicClass', 'section'])
            ->firstOrFail();

        Gate::authorize('view', $enrollmentModel);

        return Inertia::render('enrollments/show', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'enrollment' => [
                'id' => $enrollmentModel->id,
                'student' => [
                    'id' => $enrollmentModel->student->id,
                    'name' => trim($enrollmentModel->student->first_name . ' ' . $enrollmentModel->student->last_name),
                    'student_number' => $enrollmentModel->student->student_number,
                ],
                'academicYear' => [
                    'id' => $enrollmentModel->academicYear->id,
                    'name' => $enrollmentModel->academicYear->name,
                ],
                'academicClass' => [
                    'id' => $enrollmentModel->academicClass->id,
                    'name' => $enrollmentModel->academicClass->name,
                ],
                'section' => $enrollmentModel->section
                    ? [
                        'id' => $enrollmentModel->section->id,
                        'name' => $enrollmentModel->section->name,
                    ]
                    : null,
                ],
            ],
        ]);
    }

    /**
     * Show the form for editing the specified enrollment.
     */
    public function edit(int $school, int $enrollment): Response
    {
        $schoolModel = $this->school($school);
        $enrollmentModel = Enrollment::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $enrollment)
            ->with(['student', 'academicYear', 'academicClass'])
            ->firstOrFail();

        Gate::authorize('update', $enrollmentModel);

        $academicYears = AcademicYear::query()
            ->where('school_id', $schoolModel->id)
            ->orderBy('starts_on', 'desc')
            ->get(['id', 'name']);

        $academicClasses = AcademicClass::query()
            ->where('school_id', $schoolModel->id)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('enrollments/edit', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'enrollment' => [
                'id' => $enrollmentModel->id,
                'student_id' => $enrollmentModel->student->id,
                'academic_year_id' => $enrollmentModel->academicYear->id,
                'class_id' => $enrollmentModel->academicClass->id,
                'section_id' => $enrollmentModel->section_id,
            ],
            'academicYears' => $academicYears,
            'academicClasses' => $academicClasses,
        ]);
    }

    /**
     * Update the specified enrollment in storage.
     */
    public function update(EnrollmentRequest $request, int $school, int $enrollment, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        $enrollmentModel = Enrollment::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $enrollment)
            ->firstOrFail();

        Gate::authorize('update', $enrollmentModel);

        $validated = $request->validated();

        // Store old values for audit
        $oldValues = $enrollmentModel->only([
            'student_id', 'academic_year_id', 'class_id', 'section_id'
        ]);

        $enrollmentModel->update($validated);

        $audit->record('enrollment.updated', $enrollmentModel, before: $oldValues, after: $enrollmentModel->only([
            'student_id', 'academic_year_id', 'class_id', 'section_id'
        ]));

        return back()->with('success', 'Enrollment updated successfully.');
    }

    /**
     * Remove the specified enrollment from storage.
     */
    public function destroy(int $school, int $enrollment, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        $enrollmentModel = Enrollment::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $enrollment)
            ->firstOrFail();

        Gate::authorize('delete', $enrollmentModel);

        // Store values for audit before deletion
        $recordValues = $enrollmentModel->only([
            'student_id', 'academic_year_id', 'class_id', 'section_id'
        ]);

        $enrollmentModel->delete();

        $audit->record('enrollment.deleted', null, before: $recordValues);

        return redirect()->route('enrollments.index', $schoolModel->id)
            ->with('success', 'Enrollment deleted successfully.');
    }

    private function school(int $id): School
    {
        return School::query()->findOrFail($id);
    }
}