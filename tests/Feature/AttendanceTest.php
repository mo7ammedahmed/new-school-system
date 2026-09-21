<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\AcademicClass;
use App\Models\AcademicYear;
use App\Models\AttendanceRecord;
use App\Models\AuditLog;
use App\Models\Enrollment;
use App\Models\Organization;
use App\Models\School;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_assigned_teacher_can_record_attendance_for_enrolled_students(): void
    {
        [$organization, $school, $section, $student] = $this->sectionContext();
        $teacher = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::Teacher]);
        $section->teachers()->attach($teacher->id, ['organization_id' => $organization->id, 'school_id' => $school->id]);

        $this->actingAs($teacher)->post(route('attendance.store', $section->id), [
            'attendance_date' => '2026-09-14',
            'records' => [['student_id' => $student->id, 'status' => 'present']],
        ])->assertRedirect();

        $this->assertDatabaseHas('attendance_records', ['student_id' => $student->id, 'status' => 'present']);
        $this->assertSame('attendance.recorded', AuditLog::query()->firstOrFail()->action);
    }

    public function test_unassigned_teacher_cannot_record_section_attendance(): void
    {
        [$organization, , $section, $student] = $this->sectionContext();
        $teacher = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::Teacher]);

        $this->actingAs($teacher)->post(route('attendance.store', $section->id), [
            'attendance_date' => '2026-09-14',
            'records' => [['student_id' => $student->id, 'status' => 'present']],
        ])->assertForbidden();
    }

    public function test_assigned_teacher_can_correct_a_record_and_correction_is_audited(): void
    {
        [$organization, $school, $section, $student] = $this->sectionContext();
        $teacher = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::Teacher]);
        $section->teachers()->attach($teacher->id, ['organization_id' => $organization->id, 'school_id' => $school->id]);
        $this->actingAs($teacher)->post(route('attendance.store', $section->id), ['attendance_date' => '2026-09-14', 'records' => [['student_id' => $student->id, 'status' => 'present']]]);
        $record = AttendanceRecord::query()->firstOrFail();

        $this->actingAs($teacher)->patch(route('attendance.update', $record->id), ['status' => 'late', 'note' => 'Arrived after first period'])->assertRedirect();

        $this->assertDatabaseHas('attendance_records', ['id' => $record->id, 'status' => 'late', 'note' => 'Arrived after first period']);
        $this->assertSame('attendance.corrected', AuditLog::query()->latest('id')->firstOrFail()->action);
    }

    /** @return array{Organization, School, Section, Student} */
    private function sectionContext(): array
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $class = AcademicClass::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'name' => 'Grade 1']);
        $section = Section::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'class_id' => $class->id, 'name' => 'A']);
        $year = AcademicYear::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'name' => '2026–2027', 'starts_on' => '2026-09-01', 'ends_on' => '2027-06-30']);
        $student = Student::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_number' => 'S-001', 'first_name' => 'Student', 'last_name' => 'One']);
        Enrollment::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_id' => $student->id, 'academic_year_id' => $year->id, 'class_id' => $class->id, 'section_id' => $section->id, 'enrolled_on' => '2026-09-01']);

        return [$organization, $school, $section, $student];
    }
}
