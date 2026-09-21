<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\AcademicClass;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\Guardian;
use App\Models\Organization;
use App\Models\School;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuardianPortalTest extends TestCase
{
    use RefreshDatabase;

    public function test_guardian_portal_shows_only_linked_students(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $linked = Student::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_number' => 'S-001', 'first_name' => 'Linked', 'last_name' => 'Student']);
        Student::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_number' => 'S-002', 'first_name' => 'Hidden', 'last_name' => 'Student']);
        $user = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::Guardian]);
        $guardian = Guardian::create(['organization_id' => $organization->id, 'user_id' => $user->id, 'name' => 'Guardian', 'email' => $user->email]);
        $guardian->students()->attach($linked->id, ['organization_id' => $organization->id]);

        $response = $this->actingAs($user)->get(route('guardian.portal'));

        $response->assertOk();
        $this->assertStringContainsString('Linked', $response->getContent());
        $this->assertStringNotContainsString('Hidden', $response->getContent());
    }

    public function test_non_guardian_cannot_open_guardian_portal(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $user = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::Teacher]);

        $this->actingAs($user)->get(route('guardian.portal'))->assertForbidden();
    }

    public function test_guardian_sees_attendance_only_for_linked_student(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $class = AcademicClass::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'name' => 'Grade 1']);
        $section = Section::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'class_id' => $class->id, 'name' => 'A']);
        $linked = Student::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_number' => 'S-001', 'first_name' => 'Linked', 'last_name' => 'Student']);
        $hidden = Student::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_number' => 'S-002', 'first_name' => 'Hidden', 'last_name' => 'Student']);
        $session = AttendanceSession::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'section_id' => $section->id, 'attendance_date' => '2026-09-14']);
        AttendanceRecord::create(['organization_id' => $organization->id, 'attendance_session_id' => $session->id, 'student_id' => $linked->id, 'status' => 'present']);
        AttendanceRecord::create(['organization_id' => $organization->id, 'attendance_session_id' => $session->id, 'student_id' => $hidden->id, 'status' => 'absent']);
        $user = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::Guardian]);
        $guardian = Guardian::create(['organization_id' => $organization->id, 'user_id' => $user->id, 'name' => 'Guardian', 'email' => $user->email]);
        $guardian->students()->attach($linked->id, ['organization_id' => $organization->id]);

        $response = $this->actingAs($user)->get(route('guardian.portal'));

        $response->assertOk();
        $this->assertStringContainsString('present', $response->getContent());
        $this->assertStringNotContainsString('absent', $response->getContent());
    }
}
