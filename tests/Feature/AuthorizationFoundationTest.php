<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Organization;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class AuthorizationFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_school_admin_can_access_only_a_school_in_their_organization(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $otherOrganization = Organization::create(['name' => 'Other', 'slug' => 'other']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $otherSchool = School::create(['organization_id' => $otherOrganization->id, 'name' => 'Other School', 'slug' => 'school']);
        $user = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => UserRole::SchoolAdmin,
        ]);

        $this->assertTrue(Gate::forUser($user)->allows('access-school', $school));
        $this->assertFalse(Gate::forUser($user)->allows('access-school', $otherSchool));
    }

    public function test_finance_staff_cannot_record_attendance(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $user = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => UserRole::FinanceStaff,
        ]);

        $this->assertFalse(Gate::forUser($user)->allows('record-attendance', $school));
        $this->assertTrue(Gate::forUser($user)->allows('manage-finance', $school));
    }

    public function test_platform_super_admin_is_not_limited_by_organization_gates(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $user = User::factory()->create([
            'organization_id' => null,
            'role' => UserRole::PlatformSuperAdmin,
        ]);

        $this->assertTrue(Gate::forUser($user)->allows('manage-finance', $school));
    }
}
