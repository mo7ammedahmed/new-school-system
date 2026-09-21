<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\AcademicClass;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\Organization;
use App\Models\School;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_school_admin_can_view_and_export_attendance_report(): void
    {
        [$organization, $school, $section, $student] = $this->context();
        $session = AttendanceSession::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'section_id' => $section->id, 'attendance_date' => '2026-09-14']);
        AttendanceRecord::create(['organization_id' => $organization->id, 'attendance_session_id' => $session->id, 'student_id' => $student->id, 'status' => 'present']);
        $admin = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::SchoolAdmin]);

        $this->actingAs($admin)->get(route('admin.reports.attendance', $school->id))->assertOk()->assertSee('Student One');
        $this->actingAs($admin)->get(route('admin.reports.attendance.export', $school->id))->assertOk()->assertHeader('content-type', 'text/csv; charset=UTF-8')->assertSee('Student One');
    }

    public function test_teacher_cannot_view_a_school_where_they_have_no_assignment(): void
    {
        [$organization, $school] = $this->context();
        $teacher = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::Teacher]);

        $this->actingAs($teacher)->get(route('admin.reports.attendance', $school->id))->assertForbidden();
    }

    private function context(): array
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $class = AcademicClass::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'name' => 'Grade 1']);
        $section = Section::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'class_id' => $class->id, 'name' => 'A']);
        $student = Student::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_number' => 'S-001', 'first_name' => 'Student', 'last_name' => 'One']);

        return [$organization, $school, $section, $student];
    }
}
