<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Organization;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Staff accounts are created through this flow, not through factories — and
 * factories bypass mass assignment, so only an HTTP round trip proves that the
 * role and organization actually reach the database.
 */
class StaffAccountTest extends TestCase
{
    use RefreshDatabase;

    public function test_creating_staff_assigns_the_role_and_organization(): void
    {
        [$organization, $school, $admin] = $this->school();

        $this->actingAs($admin)
            ->post(route('users.store', ['school' => $school->id]), [
                'name' => 'New Teacher',
                'email' => 'new.teacher@example.test',
                'role' => UserRole::Teacher->value,
                'password' => 'password-1234',
            ])
            ->assertRedirect(route('users.index', ['school' => $school->id]));

        $created = User::query()->where('email', 'new.teacher@example.test')->firstOrFail();

        $this->assertSame(UserRole::Teacher, $created->role);
        $this->assertSame($organization->id, $created->organization_id);
        $this->assertTrue(Hash::check('password-1234', $created->password));
    }

    public function test_updating_staff_changes_the_role(): void
    {
        [$organization, $school, $admin] = $this->school();

        $teacher = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => UserRole::Teacher,
        ]);

        $this->actingAs($admin)
            ->put(route('users.update', ['school' => $school->id, 'user' => $teacher->id]), [
                'name' => 'Promoted Teacher',
                'email' => $teacher->email,
                'role' => UserRole::AcademicCoordinator->value,
                'password' => '',
            ])
            ->assertRedirect();

        $teacher->refresh();

        $this->assertSame(UserRole::AcademicCoordinator, $teacher->role);
        $this->assertSame('Promoted Teacher', $teacher->name);
    }

    public function test_a_crafted_role_cannot_escalate_beyond_managed_roles(): void
    {
        [$organization, $school, $admin] = $this->school();

        $this->actingAs($admin)
            ->post(route('users.store', ['school' => $school->id]), [
                'name' => 'Sneaky',
                'email' => 'sneaky@example.test',
                'role' => UserRole::PlatformSuperAdmin->value,
                'password' => 'password-1234',
            ])
            ->assertSessionHasErrors('role');

        $this->assertNull(User::query()->where('email', 'sneaky@example.test')->first());
    }

    /**
     * @return array{Organization, School, User}
     */
    private function school(): array
    {
        $organization = Organization::factory()->create(['name' => 'Staff Org', 'slug' => 'staff-org']);
        $school = School::factory()->create([
            'organization_id' => $organization->id,
            'name' => 'Staff School',
            'slug' => 'staff-school',
        ]);

        $admin = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => UserRole::SchoolAdmin,
        ]);

        return [$organization, $school, $admin];
    }
}
