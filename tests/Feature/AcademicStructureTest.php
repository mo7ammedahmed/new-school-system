<?php

namespace Tests\Feature;

use App\Models\AcademicClass;
use App\Models\AcademicYear;
use App\Models\Enrollment;
use App\Models\Organization;
use App\Models\School;
use App\Models\Student;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AcademicStructureTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_be_enrolled_once_per_academic_year(): void
    {
        [$organization, $school] = $this->schoolContext();
        $year = AcademicYear::create([
            'organization_id' => $organization->id,
            'school_id' => $school->id,
            'name' => '2026–2027',
            'starts_on' => '2026-09-01',
            'ends_on' => '2027-06-30',
            'is_current' => true,
        ]);
        $class = AcademicClass::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'name' => 'Grade 1']);
        $student = Student::create([
            'organization_id' => $organization->id,
            'school_id' => $school->id,
            'student_number' => 'S-001',
            'first_name' => 'Student',
            'last_name' => 'One',
        ]);

        Enrollment::create([
            'organization_id' => $organization->id,
            'school_id' => $school->id,
            'student_id' => $student->id,
            'academic_year_id' => $year->id,
            'class_id' => $class->id,
            'enrolled_on' => '2026-09-01',
        ]);

        $this->assertDatabaseHas('enrollments', ['student_id' => $student->id, 'academic_year_id' => $year->id]);
        $this->expectException(QueryException::class);
        Enrollment::create([
            'organization_id' => $organization->id,
            'school_id' => $school->id,
            'student_id' => $student->id,
            'academic_year_id' => $year->id,
            'class_id' => $class->id,
            'enrolled_on' => '2026-09-02',
        ]);
    }

    /** @return array{Organization, School} */
    private function schoolContext(): array
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);

        return [$organization, $school];
    }
}
