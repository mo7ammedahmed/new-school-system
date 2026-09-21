<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\AcademicClass;
use App\Models\AcademicYear;
use App\Models\Assessment;
use App\Models\Enrollment;
use App\Models\Guardian;
use App\Models\Organization;
use App\Models\School;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssessmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_assigned_teacher_can_record_assessment_for_active_roster(): void
    {
        [$organization, $school, $section, $student] = $this->context();
        $teacher = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::Teacher]);
        $section->teachers()->attach($teacher->id, ['organization_id' => $organization->id, 'school_id' => $school->id]);

        $this->actingAs($teacher)->post(route('assessments.store', $section->id), ['title' => 'Math quiz', 'assessed_on' => '2026-09-14', 'max_score' => 20, 'records' => [['student_id' => $student->id, 'score' => 18, 'comment' => 'Good work']]])->assertRedirect();

        $this->assertDatabaseHas('assessments', ['student_id' => $student->id, 'title' => 'Math quiz', 'score' => 18]);
    }

    public function test_guardian_sees_progress_only_for_linked_student(): void
    {
        [$organization, $school, $section, $student] = $this->context();
        $hidden = Student::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_number' => 'S-002', 'first_name' => 'Hidden', 'last_name' => 'Student']);
        $teacher = User::factory()->create();
        $teacher->organization_id = $organization->id;
        $teacher->role = UserRole::Teacher;
        $teacher->save();
        Assessment::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'section_id' => $section->id, 'student_id' => $student->id, 'teacher_id' => $teacher->id, 'title' => 'Math quiz', 'score' => 18, 'max_score' => 20, 'assessed_on' => '2026-09-14']);
        $teacher2 = User::factory()->create();
        $teacher2->organization_id = $organization->id;
        $teacher2->role = UserRole::Teacher;
        $teacher2->save();
        Assessment::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'section_id' => $section->id, 'student_id' => $hidden->id, 'teacher_id' => $teacher2->id, 'title' => 'Hidden quiz', 'score' => 5, 'max_score' => 20, 'assessed_on' => '2026-09-14']);
        $user = User::factory()->create();
        $user->organization_id = $organization->id;
        $user->role = UserRole::Guardian;
        $user->save();
        $guardian = Guardian::create(['organization_id' => $organization->id, 'user_id' => $user->id, 'name' => 'Guardian', 'email' => $user->email]);
        $guardian->students()->attach($student->id, ['organization_id' => $organization->id]);

        $this->actingAs($user)->get(route('guardian.portal'))->assertOk()->assertSee('Math quiz')->assertDontSee('Hidden quiz');
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

        return [$organization, $school, $section, $student];
    }
}
