<?php

namespace App\Http\Controllers;

use App\Concerns\ResolvesSchool;
use App\Enums\UserRole;
use App\Http\Requests\Academics\LinkStudentAccountRequest;
use App\Models\AcademicClass;
use App\Models\AcademicYear;
use App\Models\Enrollment;
use App\Models\School;
use App\Models\Section;
use App\Models\Student;
use App\Models\TeacherAssignment;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AcademicAdminController
{
    use ResolvesSchool;

    /**
     * Display the academic administration dashboard.
     */
    public function index(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);

        return Inertia::render('admin/academics/index', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'years' => AcademicYear::query()->where('school_id', $schoolModel->id)->latest('starts_on')->get(),
            'classes' => AcademicClass::query()->where('school_id', $schoolModel->id)->with('sections')->orderBy('name')->get(),
            'students' => Student::query()->where('school_id', $schoolModel->id)->where('status', 'active')->orderBy('last_name')->get(['id', 'first_name', 'last_name', 'student_number', 'user_id']),
            'studentAccounts' => $this->unlinkedStudentAccounts($schoolModel),
            'teachers' => User::query()->where('organization_id', $schoolModel->organization_id)->where('role', UserRole::Teacher)->orderBy('name')->get(['id', 'name', 'email']),
        ]);
    }

    /**
     * Bind an existing student login to a student record.
     *
     * Onboarding a student is a binding problem, not a second student module:
     * the record already exists, only the login is missing. Repeating the same
     * binding is intentionally a no-op.
     */
    public function linkStudentAccount(LinkStudentAccountRequest $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);

        $data = $request->validated();

        $student = Student::query()
            ->where('school_id', $schoolModel->id)
            ->whereKey($data['student_id'])
            ->firstOrFail();

        $account = User::query()
            ->where('organization_id', $schoolModel->organization_id)
            ->where('role', UserRole::Student)
            ->whereKey($data['user_id'])
            ->firstOrFail();

        if ($student->user_id === $account->id) {
            return back();
        }

        $previous = $student->user_id;
        $student->fill(['user_id' => $account->id])->save();

        $audit->record(
            'student.account_linked',
            $student,
            before: ['user_id' => $previous],
            after: ['user_id' => $account->id],
        );

        return back();
    }

    public function storeYear(Request $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);
        $data = $request->validate(['name' => ['required', 'string', 'max:80'], 'starts_on' => ['required', 'date'], 'ends_on' => ['required', 'date', 'after:starts_on'], 'is_current' => ['sometimes', 'boolean']]);
        $year = $schoolModel->academicYears()->create([...$data, 'organization_id' => $schoolModel->organization_id]);
        $audit->record('academic_year.created', $year, after: $year->only(['school_id', 'name', 'starts_on', 'ends_on']));

        return back();
    }

    public function storeClass(Request $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);
        $data = $request->validate(['name' => ['required', 'string', 'max:80']]);
        $class = $schoolModel->academicClasses()->create([...$data, 'organization_id' => $schoolModel->organization_id]);
        $audit->record('academic_class.created', $class, after: $class->only(['school_id', 'name']));

        return back();
    }

    public function storeSection(Request $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);
        $data = $request->validate(['class_id' => ['required', 'integer'], 'name' => ['required', 'string', 'max:80']]);
        $class = AcademicClass::query()->where('school_id', $schoolModel->id)->where('id', $data['class_id'])->firstOrFail();
        $section = $class->sections()->create(['organization_id' => $schoolModel->organization_id, 'school_id' => $schoolModel->id, 'name' => $data['name']]);
        $audit->record('section.created', $section, after: $section->only(['school_id', 'class_id', 'name']));

        return back();
    }

    public function enroll(Request $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);
        $data = $request->validate(['student_id' => ['required', 'integer'], 'academic_year_id' => ['required', 'integer'], 'class_id' => ['required', 'integer'], 'section_id' => ['nullable', 'integer'], 'enrolled_on' => ['required', 'date']]);
        $student = Student::query()->where('school_id', $schoolModel->id)->where('id', $data['student_id'])->firstOrFail();
        $year = AcademicYear::query()->where('school_id', $schoolModel->id)->where('id', $data['academic_year_id'])->firstOrFail();
        $class = AcademicClass::query()->where('school_id', $schoolModel->id)->where('id', $data['class_id'])->firstOrFail();
        if (! empty($data['section_id'])) {
            Section::query()->where('school_id', $schoolModel->id)->where('class_id', $class->id)->where('id', $data['section_id'])->firstOrFail();
        }
        $enrollment = Enrollment::create([...$data, 'organization_id' => $schoolModel->organization_id, 'school_id' => $schoolModel->id, 'status' => 'active']);
        $audit->record('enrollment.created', $enrollment, after: $enrollment->only(['student_id', 'academic_year_id', 'class_id', 'section_id']));

        return back();
    }

    public function assignTeacher(Request $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);
        $data = $request->validate(['teacher_id' => ['required', 'integer'], 'section_id' => ['required', 'integer']]);
        $teacher = User::query()->where('organization_id', $schoolModel->organization_id)->where('role', UserRole::Teacher)->where('id', $data['teacher_id'])->firstOrFail();
        $section = Section::query()->where('school_id', $schoolModel->id)->where('id', $data['section_id'])->firstOrFail();
        $assignment = TeacherAssignment::create([...$data, 'organization_id' => $schoolModel->organization_id, 'school_id' => $schoolModel->id]);
        $audit->record('teacher.assigned_section', $assignment, after: ['teacher_id' => $teacher->id, 'section_id' => $section->id]);

        return back();
    }

    /**
     * Student logins in this organization that are not bound to a record yet,
     * so the surface only ever offers accounts that can actually be linked.
     *
     * @return array<int, array{id: int, name: string, email: string}>
     */
    private function unlinkedStudentAccounts(School $school): array
    {
        $linkedUserIds = Student::query()
            ->where('organization_id', $school->organization_id)
            ->whereNotNull('user_id')
            ->pluck('user_id')
            ->all();

        return User::query()
            ->where('organization_id', $school->organization_id)
            ->where('role', UserRole::Student)
            ->whereNotIn('id', $linkedUserIds)
            ->orderBy('name')
            ->get(['id', 'name', 'email'])
            ->map(fn (User $account): array => [
                'id' => $account->id,
                'name' => $account->name,
                'email' => $account->email,
            ])
            ->all();
    }
}
