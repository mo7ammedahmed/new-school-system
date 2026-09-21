<?php

namespace App\Http\Controllers;

use App\Jobs\DeliverInAppNotification;
use App\Models\ReportCardSnapshot;
use App\Models\Student;
use App\Models\User;
use App\Services\AuditLogger;
<<<<<<< HEAD
use App\Jobs\DeliverInAppNotification;
use App\Http\Requests\StudentRequest;
=======
>>>>>>> origin/main
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class StudentController
{
    /**
     * Display a listing of the students.
     */
    public function index(Request $request): Response
    {
        $school = $request->user()?->organization?->schools()->first();

        if (!$school) {
            return Inertia::render('students/index', [
                'filters' => $request->all(),
                'students' => [],
            ]);
        }

        $students = Student::query()
            ->where('school_id', $school->id)
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->input('search');
                $query->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('student_number', 'like', "%{$search}%");
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('students/index', [
            'filters' => $request->all(),
            'students' => $students,
        ]);
    }

    /**
     * Show the form for creating a new student.
     */
    public function create(Request $request): Response
    {
        $school = $request->user()?->organization?->schools()->first();

        Gate::authorize('create', Student::class);

        return Inertia::render('students/create', [
            'school' => $school ? ['id' => $school->id, 'name' => $school->name] : null,
        ]);
    }

    /**
     * Store a newly created student in storage.
     */
    public function store(StudentRequest $request, AuditLogger $audit): RedirectResponse
    {
        $school = $request->user()?->organization?->schools()->first();

        Gate::authorize('create', Student::class);

        $validated = $request->validated();

        $student = Student::create([...$validated, 'organization_id' => $school->organization_id, 'school_id' => $school->id]);

        $audit->record('student.created', $student, after: $student->only([
            'first_name', 'last_name', 'student_number', 'date_of_birth', 'gender',
            'phone', 'email', 'address', 'status'
        ]));

        return redirect()->route('students.index')
            ->with('success', 'Student created successfully.');
    }

    /**
     * Display the specified student.
     */
    public function show(int $student): Response
    {
        $record = Student::query()->with([
            'school',
            'enrollments' => fn ($query) => $query->where('status', 'active')->with(['academicYear', 'academicClass', 'section']),
            'attendanceRecords.session',
            'assessments.section',
            'reportCardSnapshots',
        ])->findOrFail($student);
        Gate::authorize('view-student', $record);

        return Inertia::render('students/show', [
            'student' => [
                'id' => $record->id,
                'name' => trim($record->first_name.' '.$record->last_name),
                'studentNumber' => $record->student_number,
                'school' => $record->school->name,
                'enrollments' => $record->enrollments->map(fn ($enrollment): array => ['year' => $enrollment->academicYear->name, 'class' => $enrollment->academicClass->name, 'section' => $enrollment->section?->name])->values(),
                'attendance' => $record->attendanceRecords->groupBy('status')->map->count(),
                'assessments' => $record->assessments->map(fn ($assessment): array => ['title' => $assessment->title, 'score' => (float) $assessment->score, 'maxScore' => (float) $assessment->max_score, 'date' => $assessment->assessed_on?->toDateString(), 'comment' => $assessment->comment])->values(),
                'snapshots' => $record->reportCardSnapshots->map(fn ($snapshot): array => ['id' => $snapshot->id, 'term' => $snapshot->term, 'issuedAt' => $snapshot->issued_at?->toIso8601String(), 'enrollment' => $snapshot->enrollment, 'attendance' => $snapshot->attendance, 'assessments' => $snapshot->assessments])->values(),
                'canIssueSnapshot' => Gate::allows('issue-report-card', $record),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified student.
     */
    public function edit(int $student): Response
    {
        $record = Student::query()->findOrFail($student);
        Gate::authorize('update', $record);

        return Inertia::render('students/edit', [
            'student' => [
                'id' => $record->id,
                'first_name' => $record->first_name,
                'last_name' => $record->last_name,
                'student_number' => $record->student_number,
                'date_of_birth' => $record->date_of_birth?->toDateString(),
                'gender' => $record->gender,
                'phone' => $record->phone,
                'email' => $record->email,
                'address' => $record->address,
                'status' => $record->status,
            ],
        ]);
    }

    /**
     * Update the specified student in storage.
     */
    public function update(StudentRequest $request, int $student, AuditLogger $audit): RedirectResponse
    {
        $record = Student::query()->findOrFail($student);
        Gate::authorize('update', $record);

        $validated = $request->validated();

        // Store the old values for audit
        $oldValues = $record->only([
            'first_name', 'last_name', 'student_number', 'date_of_birth', 'gender',
            'phone', 'email', 'address', 'status'
        ]);

        $record->update($validated);

        $audit->record('student.updated', $record, before: $oldValues, after: $record->only([
            'first_name', 'last_name', 'student_number', 'date_of_birth', 'gender',
            'phone', 'email', 'address', 'status'
        ]));

        return back()->with('success', 'Student updated successfully.');
    }

    /**
     * Remove the specified student from storage.
     */
    public function destroy(int $student, AuditLogger $audit): RedirectResponse
    {
        $record = Student::query()->findOrFail($student);
        Gate::authorize('delete', $record);

        // Store values for audit before deletion
        $recordValues = $record->only([
            'first_name', 'last_name', 'student_number', 'date_of_birth', 'gender',
            'phone', 'email', 'address', 'status'
        ]);

        $record->delete();

        $audit->record('student.deleted', null, before: $recordValues);

        return redirect()->route('students.index')
            ->with('success', 'Student deleted successfully.');
    }

    public function issueSnapshot(Request $request, int $student, AuditLogger $audit): RedirectResponse
    {
        $record = Student::query()->with(['school', 'enrollments' => fn ($query) => $query->where('status', 'active')->with(['academicYear', 'academicClass', 'section']), 'attendanceRecords', 'assessments'])->findOrFail($student);
        Gate::authorize('issue-report-card', $record);
        $term = $request->validate(['term' => ['required', 'string', 'max:80']])['term'];
        $snapshot = ReportCardSnapshot::firstOrCreate(['organization_id' => $record->organization_id, 'student_id' => $record->id, 'term' => $term], ['school_id' => $record->school_id, 'issued_by' => auth()->id(), 'enrollment' => $record->enrollments->map(fn ($e) => ['year' => $e->academicYear->name, 'class' => $e->academicClass->name, 'section' => $e->section?->name])->values()->all(), 'attendance' => $record->attendanceRecords->groupBy('status')->map->count()->all(), 'assessments' => $record->assessments->map(fn ($a) => ['title' => $a->title, 'score' => (float) $a->score, 'maxScore' => (float) $a->max_score, 'date' => $a->assessed_on?->toDateString(), 'comment' => $a->comment])->values()->all(), 'issued_at' => now()]);
        $audit->record('report_card.issued', $snapshot, after: ['student_id' => $record->id, 'term' => $term]);
        foreach ($record->guardians()->with('user')->get() as $guardian) {
            if ($guardian->user) {
                DeliverInAppNotification::dispatch($record->organization_id, $guardian->user->id, 'report_card.issued', 'Report card issued', "A report card for {$record->first_name} {$record->last_name} is available for {$term}.", ['snapshot_id' => $snapshot->id], 'report-card:'.$snapshot->id);
            }
        }
        User::query()->where('organization_id', $record->organization_id)->whereIn('role', ['organization_admin', 'school_admin'])->get()->each(fn ($user) => DeliverInAppNotification::dispatch($record->organization_id, $user->id, 'report_card.issued', 'Report card issued', "A report card for {$record->first_name} {$record->last_name} is available for {$term}.", ['snapshot_id' => $snapshot->id], 'report-card:'.$snapshot->id));

        return back()->with('success', 'Report card issued.');
    }
}