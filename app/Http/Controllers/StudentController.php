<?php

namespace App\Http\Controllers;

use App\Http\Requests\StudentRequest;
use App\Jobs\DeliverInAppNotification;
use App\Models\ReportCardSnapshot;
use App\Models\School;
use App\Models\Student;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The student record surface.
 *
 * A student record is shared with whoever the record belongs to: guardians and
 * the student themselves reach the read-only record view, while only school
 * administrators manage the roster.
 */
class StudentController
{
    /** Columns that actually exist on the student record. */
    private const AUDITED_COLUMNS = [
        'first_name',
        'last_name',
        'student_number',
        'date_of_birth',
        'status',
    ];

    public function index(Request $request): Response
    {
        $school = $this->school($request);

        if ($school === null) {
            return Inertia::render('admin/students/index', [
                'school' => null,
                'filters' => $request->only(['search', 'status']),
                'students' => [],
            ]);
        }

        Gate::authorize('manage-enrollment', $school);

        $students = Student::query()
            ->where('school_id', $school->id)
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = $request->string('search')->toString();
                $query->where(function ($query) use ($search): void {
                    $query->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('student_number', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/students/index', [
            'school' => ['id' => $school->id, 'name' => $school->name],
            'filters' => $request->only(['search', 'status']),
            'students' => $students->through(fn (Student $student): array => [
                'id' => $student->id,
                'name' => trim($student->first_name.' '.$student->last_name),
                'studentNumber' => $student->student_number,
                'status' => $student->status,
            ]),
        ]);
    }

    public function create(Request $request): Response
    {
        $school = $this->school($request);

        if ($school !== null) {
            Gate::authorize('manage-enrollment', $school);
        }

        return Inertia::render('admin/students/create', [
            'school' => $school ? ['id' => $school->id, 'name' => $school->name] : null,
        ]);
    }

    public function store(StudentRequest $request, AuditLogger $audit): RedirectResponse
    {
        $school = $this->school($request);

        if ($school === null) {
            abort(403);
        }

        Gate::authorize('manage-enrollment', $school);

        $student = Student::create([
            ...$request->validated(),
            'organization_id' => $school->organization_id,
            'school_id' => $school->id,
        ]);

        $audit->record('student.created', $student, after: $student->only(self::AUDITED_COLUMNS));

        return redirect()->route('students.index')
            ->with('success', 'Student created successfully.');
    }

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
                'status' => $record->status,
                'school' => $record->school?->name,
                'canManage' => Gate::allows('manage-enrollment', $record->school),
                'enrollments' => $record->enrollments->map(fn ($enrollment): array => [
                    'year' => $enrollment->academicYear?->name,
                    'class' => $enrollment->academicClass?->name,
                    'section' => $enrollment->section?->name,
                ])->values(),
                'attendance' => [
                    'present' => (int) $record->attendanceRecords->where('status', 'present')->count(),
                    'absent' => (int) $record->attendanceRecords->where('status', 'absent')->count(),
                    'late' => (int) $record->attendanceRecords->where('status', 'late')->count(),
                    'excused' => (int) $record->attendanceRecords->where('status', 'excused')->count(),
                ],
                'assessments' => $record->assessments->map(fn ($assessment): array => [
                    'title' => $assessment->title,
                    'score' => (float) $assessment->score,
                    'maxScore' => (float) $assessment->max_score,
                    'date' => $assessment->assessed_on?->toDateString(),
                    'comment' => $assessment->comment,
                ])->values(),
                'snapshots' => $record->reportCardSnapshots->map(fn ($snapshot): array => [
                    'id' => $snapshot->id,
                    'term' => $snapshot->term,
                    'issuedAt' => $snapshot->issued_at?->toIso8601String(),
                    'enrollment' => $snapshot->enrollment,
                    'attendance' => $snapshot->attendance,
                    'assessments' => $snapshot->assessments,
                ])->values(),
                'canIssueSnapshot' => Gate::allows('issue-report-card', $record),
            ],
        ]);
    }

    public function edit(int $student): Response
    {
        $record = Student::query()->findOrFail($student);
        Gate::authorize('manage-enrollment', $record->school);

        return Inertia::render('admin/students/edit', [
            'school' => ['id' => $record->school_id, 'name' => $record->school?->name],
            'student' => [
                'id' => $record->id,
                'first_name' => $record->first_name,
                'last_name' => $record->last_name,
                'student_number' => $record->student_number,
                'date_of_birth' => $record->date_of_birth?->toDateString(),
                'status' => $record->status,
            ],
        ]);
    }

    public function update(StudentRequest $request, int $student, AuditLogger $audit): RedirectResponse
    {
        $record = Student::query()->findOrFail($student);
        Gate::authorize('manage-enrollment', $record->school);

        $before = $record->only(self::AUDITED_COLUMNS);

        $record->update($request->validated());

        $audit->record('student.updated', $record, before: $before, after: $record->only(self::AUDITED_COLUMNS));

        return back()->with('success', 'Student updated successfully.');
    }

    public function destroy(int $student, AuditLogger $audit): RedirectResponse
    {
        $record = Student::query()->findOrFail($student);
        Gate::authorize('manage-enrollment', $record->school);

        $before = $record->only(self::AUDITED_COLUMNS);

        $record->delete();

        $audit->record('student.deleted', null, before: $before);

        return redirect()->route('students.index')
            ->with('success', 'Student deleted successfully.');
    }

    public function issueSnapshot(Request $request, int $student, AuditLogger $audit): RedirectResponse
    {
        $record = Student::query()->with(['school', 'enrollments' => fn ($query) => $query->where('status', 'active')->with(['academicYear', 'academicClass', 'section']), 'attendanceRecords', 'assessments'])->findOrFail($student);
        Gate::authorize('issue-report-card', $record);
        $term = $request->validate(['term' => ['required', 'string', 'max:80']])['term'];
        $snapshot = ReportCardSnapshot::firstOrCreate(
            ['organization_id' => $record->organization_id, 'student_id' => $record->id, 'term' => $term],
            [
                'school_id' => $record->school_id,
                'issued_by' => $request->user()?->id,
                'enrollment' => $record->enrollments->map(fn ($e) => ['year' => $e->academicYear?->name, 'class' => $e->academicClass?->name, 'section' => $e->section?->name])->values()->all(),
                'attendance' => $record->attendanceRecords->groupBy('status')->map->count()->all(),
                'assessments' => $record->assessments->map(fn ($a) => ['title' => $a->title, 'score' => (float) $a->score, 'maxScore' => (float) $a->max_score, 'date' => $a->assessed_on?->toDateString(), 'comment' => $a->comment])->values()->all(),
                'issued_at' => now(),
            ],
        );
        $audit->record('report_card.issued', $snapshot, after: ['student_id' => $record->id, 'term' => $term]);

        $title = 'Report card issued';
        $body = "A report card for {$record->first_name} {$record->last_name} is available for {$term}.";

        foreach ($record->guardians()->with('user')->get() as $guardian) {
            if ($guardian->user) {
                DeliverInAppNotification::dispatch($record->organization_id, $guardian->user->id, 'report_card.issued', $title, $body, ['snapshot_id' => $snapshot->id], 'report-card:'.$snapshot->id);
            }
        }

        User::query()
            ->where('organization_id', $record->organization_id)
            ->whereIn('role', ['organization_admin', 'school_admin'])
            ->get()
            ->each(fn ($user) => DeliverInAppNotification::dispatch($record->organization_id, $user->id, 'report_card.issued', $title, $body, ['snapshot_id' => $snapshot->id], 'report-card:'.$snapshot->id));

        return back()->with('success', 'Report card issued.');
    }

    /**
     * The school an administration request applies to.
     */
    private function school(Request $request): ?School
    {
        $user = $request->user();

        if ($user === null) {
            return null;
        }

        if ($user->isPlatformOperator()) {
            return School::query()->orderBy('name')->first();
        }

        return $user->accessibleSchools()->first();
    }
}
