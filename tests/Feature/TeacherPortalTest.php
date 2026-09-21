<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\AcademicClass;
use App\Models\AcademicYear;
use App\Models\Enrollment;
use App\Models\Organization;
use App\Models\School;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherPortalTest extends TestCase
{
    use RefreshDatabase;

    public function test_teacher_sees_only_assigned_section_rosters(): void
    {
        [$organization, $school, $assigned, $unassigned] = $this->sections();
        $teacher = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::Teacher]);
        $teacher->assignedSections()->attach($assigned->id, ['organization_id' => $organization->id, 'school_id' => $school->id]);
        $student = Student::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_number' => 'S-1', 'first_name' => 'Assigned', 'last_name' => 'Student']);
        $year = AcademicYear::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'name' => '2026–2027', 'starts_on' => '2026-09-01', 'ends_on' => '2027-06-30']);
        Enrollment::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_id' => $student->id, 'academic_year_id' => $year->id, 'class_id' => $assigned->class_id, 'section_id' => $assigned->id, 'enrolled_on' => '2026-09-01']);

        $response = $this->actingAs($teacher)->get(route('teacher.portal'));

        $response->assertOk()->assertSee('Assigned Student')->assertSee($assigned->name)->assertDontSee($unassigned->name);
    }

    public function test_non_teacher_cannot_open_teacher_workspace(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $user = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::Guardian]);

        $this->actingAs($user)->get(route('teacher.portal'))->assertForbidden();
    }

    private function sections(): array
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $class = AcademicClass::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'name' => 'Grade 1']);
        $assigned = Section::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'class_id' => $class->id, 'name' => 'Assigned']);
        $unassigned = Section::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'class_id' => $class->id, 'name' => 'Hidden']);

        return [$organization, $school, $assigned, $unassigned];
    }
}
