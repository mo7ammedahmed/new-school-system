<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Guardian;
use App\Models\Organization;
use App\Models\School;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class StudentGuardianTest extends TestCase
{
    use RefreshDatabase;

    public function test_guardian_can_view_only_a_linked_student(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $student = Student::create([
            'organization_id' => $organization->id,
            'school_id' => $school->id,
            'student_number' => 'S-001',
            'first_name' => 'Student',
            'last_name' => 'One',
        ]);
        $unlinked = Student::create([
            'organization_id' => $organization->id,
            'school_id' => $school->id,
            'student_number' => 'S-002',
            'first_name' => 'Student',
            'last_name' => 'Two',
        ]);
        $user = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::Guardian]);
        $guardian = Guardian::create([
            'organization_id' => $organization->id,
            'user_id' => $user->id,
            'name' => 'Guardian',
            'email' => $user->email,
        ]);
        $guardian->students()->attach($student->id, ['organization_id' => $organization->id, 'is_primary' => true]);

        $this->assertTrue(Gate::forUser($user)->allows('view-student', $student));
        $this->assertFalse(Gate::forUser($user)->allows('view-student', $unlinked));
    }

    public function test_guardian_cannot_view_a_student_from_another_organization(): void
    {
        $first = Organization::create(['name' => 'First', 'slug' => 'first']);
        $second = Organization::create(['name' => 'Second', 'slug' => 'second']);
        $school = School::create(['organization_id' => $second->id, 'name' => 'School', 'slug' => 'school']);
        $student = Student::create([
            'organization_id' => $second->id,
            'school_id' => $school->id,
            'student_number' => 'S-001',
            'first_name' => 'Other',
            'last_name' => 'Student',
        ]);
        $user = User::factory()->create(['organization_id' => $first->id, 'role' => UserRole::Guardian]);

        $this->actingAs($user)->get(route('students.show', $student->id))->assertNotFound();
    }
}
