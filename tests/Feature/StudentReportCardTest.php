<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\AcademicClass;
use App\Models\AcademicYear;
use App\Models\Assessment;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\Enrollment;
use App\Models\Guardian;
use App\Models\Organization;
use App\Models\ReportCardSnapshot;
use App\Models\School;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentReportCardTest extends TestCase
{
    use RefreshDatabase;

    public function test_linked_guardian_can_view_combined_student_report_card(): void
    {
        [$organization, $school, $section, $student, $class, $year] = $this->context();
        $teacher = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::Teacher]);
        $session = AttendanceSession::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'section_id' => $section->id, 'attendance_date' => '2026-09-14']);
        AttendanceRecord::create(['organization_id' => $organization->id, 'attendance_session_id' => $session->id, 'student_id' => $student->id, 'status' => 'present']);
        Assessment::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'section_id' => $section->id, 'student_id' => $student->id, 'teacher_id' => $teacher->id, 'title' => 'Math quiz', 'score' => 18, 'max_score' => 20, 'assessed_on' => '2026-09-14']);
        $user = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::Guardian]);
        $guardian = Guardian::create(['organization_id' => $organization->id, 'user_id' => $user->id, 'name' => 'Guardian', 'email' => $user->email]);
        $guardian->students()->attach($student->id, ['organization_id' => $organization->id]);

        $this->actingAs($user)->get(route('students.show', $student->id))->assertOk()->assertInertia(fn ($page) => $page->where('student.attendance.present', 1)->etc());
    }

    public function test_unlinked_guardian_cannot_view_report_card(): void
    {
        [$organization, , , $student] = $this->context();
        $user = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::Guardian]);

        $this->actingAs($user)->get(route('students.show', $student->id))->assertForbidden();
    }

    public function test_school_admin_can_issue_a_term_snapshot(): void
    {
        [$organization, $school, , $student] = $this->context();
        $admin = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::SchoolAdmin]);

        $this->actingAs($admin)->post(route('students.report-card.issue', $student->id), ['term' => '2026 Term 1'])->assertRedirect();

        $this->assertDatabaseHas('report_card_snapshots', ['student_id' => $student->id, 'term' => '2026 Term 1', 'issued_by' => $admin->id]);
    }

    public function test_linked_guardian_can_download_snapshot_and_download_is_audited(): void
    {
        [$organization, $school, , $student] = $this->context();
        $admin = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::SchoolAdmin]);
        $this->actingAs($admin)->post(route('students.report-card.issue', $student->id), ['term' => '2026 Term 1']);
        $snapshot = ReportCardSnapshot::query()->firstOrFail();
        $user = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::Guardian]);
        $guardian = Guardian::create(['organization_id' => $organization->id, 'user_id' => $user->id, 'name' => 'Guardian', 'email' => $user->email]);
        $guardian->students()->attach($student->id, ['organization_id' => $organization->id]);

        $response = $this->actingAs($user)->get(route('students.report-card.download', $snapshot->id));
        $response->assertOk()->assertHeader('content-type', 'text/html; charset=UTF-8');
        $this->assertStringContainsString('2026 Term 1', $response->streamedContent());
        $this->assertDatabaseHas('audit_logs', ['action' => 'report_card.downloaded', 'user_id' => $user->id]);
    }

    private function context(): array
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $class = AcademicClass::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'name' => 'Grade 1']);
        $section = Section::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'class_id' => $class->id, 'name' => 'A']);
        $year = AcademicYear::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'name' => '2026–2027', 'starts_on' => '2026-09-01', 'ends_on' => '2027-06-30']);
        $student = Student::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_number' => 'S-001', 'first_name' => 'Student', 'last_name' => 'One']);
        Enrollment::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_id' => $student->id, 'academic_year_id' => $year->id, 'class_id' => $class->id, 'section_id' => $section->id, 'enrolled_on' => '2026-09-01']);

        return [$organization, $school, $section, $student, $class, $year];
    }
}
