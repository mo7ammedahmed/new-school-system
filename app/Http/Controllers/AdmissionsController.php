<?php

namespace App\Http\Controllers;

use App\Models\AcademicClass;
use App\Models\AcademicYear;
use App\Models\Enrollment;
use App\Models\Guardian;
use App\Models\Organization;
use App\Models\School;
use App\Models\Section;
use App\Models\Student;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AdmissionsController
{
    public function create(Organization $organization, string $school): Response
    {
        $schoolModel = $organization->schools()->where('slug', $school)->firstOrFail();

        return Inertia::render('admissions/apply', [
            'school' => ['name' => $schoolModel->name, 'slug' => $schoolModel->slug, 'organizationSlug' => $organization->slug],
        ]);
    }

    public function store(Request $request, Organization $organization, string $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $organization->schools()->where('slug', $school)->firstOrFail();
        $data = $request->validate([
            'guardian_name' => ['required', 'string', 'max:160'],
            'guardian_email' => ['required', 'email', 'max:255'],
            'guardian_phone' => ['nullable', 'string', 'max:40'],
            'student_name' => ['required', 'string', 'max:160'],
            'student_date_of_birth' => ['nullable', 'date', 'before:today'],
            'message' => ['nullable', 'string', 'max:5000'],
        ]);
        $application = $schoolModel->applications()->create([
            ...$data,
            'organization_id' => $organization->id,
            'locale' => app()->getLocale(),
            'status' => 'pending',
        ]);
        $audit->record('application.submitted', $application, organization: $organization, after: $application->only(['school_id', 'student_name', 'guardian_email', 'status']));

        return to_route('public.admissions.create', [$organization->slug, $schoolModel->slug])
            ->with('success', 'Application submitted.');
    }

    public function index(int $school): Response
    {
        $schoolModel = School::query()->findOrFail($school);
        Gate::authorize('manage-admissions', $schoolModel);

        return Inertia::render('admin/admissions/index', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'applications' => $schoolModel->applications()->latest('submitted_at')->get(),
            'years' => AcademicYear::query()->where('school_id', $schoolModel->id)->latest('starts_on')->get(['id', 'name']),
            'classes' => AcademicClass::query()->where('school_id', $schoolModel->id)->with('sections:id,class_id,name')->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function updateStatus(Request $request, int $school, int $application, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = School::query()->findOrFail($school);
        Gate::authorize('manage-admissions', $schoolModel);
        $record = $schoolModel->applications()->findOrFail($application);
        $data = $request->validate(['status' => ['required', 'in:pending,reviewing,accepted,rejected,withdrawn']]);
        $before = ['status' => $record->status];
        $record->transitionTo($data['status']);
        $audit->record('application.status_changed', $record, before: $before, after: ['status' => $record->status]);

        return to_route('admin.admissions.index', $schoolModel->id);
    }

    public function accept(int $school, int $application, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = School::query()->findOrFail($school);
        Gate::authorize('manage-admissions', $schoolModel);
        $record = $schoolModel->applications()->findOrFail($application);

        if ($record->student_id !== null) {
            return back()->with('success', 'Application is already converted.');
        }

        [$firstName, $lastName] = array_pad(preg_split('/\s+/', trim($record->student_name), 2) ?: ['Student'], 2, '');

        $student = DB::transaction(function () use ($record, $schoolModel, $firstName, $lastName): Student {
            $student = Student::create([
                'organization_id' => $record->organization_id,
                'school_id' => $schoolModel->id,
                'student_number' => 'APP-'.$record->id,
                'first_name' => $firstName ?: 'Student',
                'last_name' => $lastName ?: $firstName ?: 'Applicant',
                'date_of_birth' => $record->student_date_of_birth,
            ]);
            $guardian = Guardian::firstOrCreate(
                ['organization_id' => $record->organization_id, 'email' => $record->guardian_email],
                ['name' => $record->guardian_name, 'phone' => $record->guardian_phone],
            );
            $guardian->students()->syncWithoutDetaching([$student->id => ['organization_id' => $record->organization_id, 'is_primary' => true]]);
            $record->update(['student_id' => $student->id, 'status' => 'accepted']);

            return $student;
        });

        $audit->record('application.accepted', $record, after: ['student_id' => $student->id, 'status' => 'accepted']);

        return back()->with('success', 'Application accepted and student created.');
    }

    public function enroll(Request $request, int $school, int $application, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = School::query()->findOrFail($school);
        Gate::authorize('manage-enrollment', $schoolModel);
        $record = $schoolModel->applications()->findOrFail($application);
        abort_if($record->student_id === null || $record->status !== 'accepted', 422, 'Accept the application before enrollment.');
        $data = $request->validate([
            'academic_year_id' => ['required', 'integer'],
            'class_id' => ['required', 'integer'],
            'section_id' => ['nullable', 'integer'],
            'enrolled_on' => ['required', 'date'],
        ]);
        $year = AcademicYear::query()->where('school_id', $schoolModel->id)->where('id', $data['academic_year_id'])->firstOrFail();
        $class = AcademicClass::query()->where('school_id', $schoolModel->id)->where('id', $data['class_id'])->firstOrFail();
        if ($data['section_id'] ?? null) {
            Section::query()->where('school_id', $schoolModel->id)->where('class_id', $class->id)->where('id', $data['section_id'])->firstOrFail();
        }
        $enrollment = Enrollment::firstOrCreate(
            ['organization_id' => $schoolModel->organization_id, 'student_id' => $record->student_id, 'academic_year_id' => $year->id],
            [...$data, 'school_id' => $schoolModel->id, 'status' => 'active'],
        );
        $audit->record('application.enrolled', $record, after: ['student_id' => $record->student_id, 'enrollment_id' => $enrollment->id, 'class_id' => $class->id, 'section_id' => $data['section_id'] ?? null]);

        return back()->with('success', 'Student enrolled.');
    }
}
