<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\AcademicClass;
use App\Models\AcademicYear;
use App\Models\Application;
use App\Models\AuditLog;
use App\Models\Enrollment;
use App\Models\Guardian;
use App\Models\Organization;
use App\Models\School;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdmissionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_application_is_created_in_the_school_tenant_and_audited(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);

        $this->post(route('public.admissions.store', [$organization->slug, $school->slug]), [
            'guardian_name' => 'Guardian',
            'guardian_email' => 'guardian@example.test',
            'student_name' => 'Student',
            'message' => 'Please contact us.',
        ])->assertRedirect();

        $application = Application::query()->firstOrFail();
        $this->assertSame($organization->id, $application->organization_id);
        $this->assertSame('pending', $application->status);
        $this->assertSame('application.submitted', AuditLog::query()->firstOrFail()->action);
    }

    public function test_school_admin_can_transition_application_status(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $application = Application::create([
            'organization_id' => $organization->id,
            'school_id' => $school->id,
            'guardian_name' => 'Guardian',
            'guardian_email' => 'guardian@example.test',
            'student_name' => 'Student',
        ]);
        $user = User::factory()->create();
        $user->organization_id = $organization->id;
        $user->role = UserRole::SchoolAdmin;
        $user->save();

        $this->actingAs($user)
            ->patch(route('admin.admissions.status', [$school->id, $application->id]), ['status' => 'accepted'])
            ->assertRedirect();

        $this->assertSame('accepted', $application->fresh()->status);
        $this->assertSame('application.status_changed', AuditLog::query()->firstOrFail()->action);
    }

    public function test_accepting_an_application_creates_a_student_and_guardian_link_once(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $application = Application::create([
            'organization_id' => $organization->id,
            'school_id' => $school->id,
            'guardian_name' => 'Guardian',
            'guardian_email' => 'guardian@example.test',
            'guardian_phone' => '123',
            'student_name' => 'Student One',
        ]);
        $admin = User::factory()->create();
        $admin->organization_id = $organization->id;
        $admin->role = UserRole::SchoolAdmin;
        $admin->save();

        $this->actingAs($admin)->post(route('admin.admissions.accept', [$school->id, $application->id]))->assertRedirect();
        $this->actingAs($admin)->post(route('admin.admissions.accept', [$school->id, $application->id]))->assertRedirect();

        $student = Student::query()->firstOrFail();
        $this->assertSame($student->id, $application->fresh()->student_id);
        $this->assertSame('accepted', $application->fresh()->status);
        $this->assertSame(1, Student::query()->count());
        $this->assertSame(1, Guardian::query()->firstOrFail()->students()->whereKey($student->id)->count());
        $this->assertSame('application.accepted', AuditLog::query()->firstOrFail()->action);
    }

    public function test_accepted_application_can_be_enrolled_once_in_the_school_academic_structure(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $year = AcademicYear::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'name' => '2026–2027', 'starts_on' => '2026-09-01', 'ends_on' => '2027-06-30']);
        $class = AcademicClass::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'name' => 'Grade 1']);
        $application = Application::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'guardian_name' => 'Guardian', 'guardian_email' => 'guardian@example.test', 'student_name' => 'Student One']);
        $admin = User::factory()->create();
        $admin->organization_id = $organization->id;
        $admin->role = UserRole::SchoolAdmin;
        $admin->save();

        $this->actingAs($admin)->post(route('admin.admissions.accept', [$school->id, $application->id]));
        $this->actingAs($admin)->post(route('admin.admissions.enroll', [$school->id, $application->id]), ['academic_year_id' => $year->id, 'class_id' => $class->id, 'enrolled_on' => '2026-09-01'])->assertRedirect();
        $this->actingAs($admin)->post(route('admin.admissions.enroll', [$school->id, $application->id]), ['academic_year_id' => $year->id, 'class_id' => $class->id, 'enrolled_on' => '2026-09-01'])->assertRedirect();

        $this->assertSame(1, Enrollment::query()->count());
        $this->assertSame('application.enrolled', AuditLog::query()->latest('id')->firstOrFail()->action);
    }
}
