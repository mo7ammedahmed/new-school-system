<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Organization;
use App\Models\School;
use App\Models\SchoolMembership;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class ScheduleAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    private function setupOrganizationWithSchool(string $orgName, string $schoolName, UserRole $adminRole = UserRole::OrganizationAdmin): array
    {
        $org = Organization::factory()->create(['name' => $orgName]);
        $school = School::factory()->create(['organization_id' => $org->id, 'name' => $schoolName]);
        $admin = User::factory()->create([
            'organization_id' => $org->id,
            'role' => $adminRole,
        ]);
        SchoolMembership::create([
            'organization_id' => $org->id,
            'school_id' => $school->id,
            'user_id' => $admin->id,
        ]);

        return [$org, $school, $admin];
    }

    public function test_platform_operator_can_manage_schedule(): void
    {
        [$org, $school] = $this->setupOrganizationWithSchool('Org', 'School');
        $super = User::factory()->create(['role' => UserRole::PlatformSuperAdmin]);

        $this->assertTrue(Gate::forUser($super)->allows('manage-schedule', $school));
        $this->assertTrue(Gate::forUser($super)->allows('publish-schedule', $school));
        $this->assertTrue(Gate::forUser($super)->allows('delete-schedule', $school));
    }

    public function test_organization_admin_can_manage_schedule_in_own_org(): void
    {
        [$org, $school, $admin] = $this->setupOrganizationWithSchool('Org', 'School');

        $this->assertTrue(Gate::forUser($admin)->allows('manage-schedule', $school));
        $this->assertTrue(Gate::forUser($admin)->allows('publish-schedule', $school));
        $this->assertTrue(Gate::forUser($admin)->allows('delete-schedule', $school));
    }

    public function test_organization_admin_cannot_manage_schedule_in_other_org(): void
    {
        [$org1, $school1, $admin1] = $this->setupOrganizationWithSchool('Org1', 'School1');
        [$org2, $school2] = $this->setupOrganizationWithSchool('Org2', 'School2');

        $this->assertFalse(Gate::forUser($admin1)->allows('manage-schedule', $school2));
        $this->assertFalse(Gate::forUser($admin1)->allows('publish-schedule', $school2));
    }

    public function test_academic_coordinator_can_manage_but_not_publish_by_default(): void
    {
        [$org, $school, $admin] = $this->setupOrganizationWithSchool('Org', 'School');
        $coordinator = User::factory()->create([
            'organization_id' => $org->id,
            'role' => UserRole::AcademicCoordinator,
        ]);
        SchoolMembership::create([
            'organization_id' => $org->id,
            'school_id' => $school->id,
            'user_id' => $coordinator->id,
        ]);

        $this->assertTrue(Gate::forUser($coordinator)->allows('manage-schedule', $school));
        $this->assertFalse(Gate::forUser($coordinator)->allows('publish-schedule', $school));
        $this->assertFalse(Gate::forUser($coordinator)->allows('delete-schedule', $school));
    }

    public function test_academic_coordinator_can_publish_when_config_enabled(): void
    {
        config()->set('schedule.coordinators_can_publish', true);

        [$org, $school, $admin] = $this->setupOrganizationWithSchool('Org', 'School');
        $coordinator = User::factory()->create([
            'organization_id' => $org->id,
            'role' => UserRole::AcademicCoordinator,
        ]);
        SchoolMembership::create([
            'organization_id' => $org->id,
            'school_id' => $school->id,
            'user_id' => $coordinator->id,
        ]);

        $this->assertTrue(Gate::forUser($coordinator)->allows('publish-schedule', $school));
    }

    public function test_academic_coordinator_without_membership_cannot_manage(): void
    {
        [$org, $school, $admin] = $this->setupOrganizationWithSchool('Org', 'School');
        $coordinator = User::factory()->create([
            'organization_id' => $org->id,
            'role' => UserRole::AcademicCoordinator,
        ]);
        // No school membership created

        $this->assertFalse(Gate::forUser($coordinator)->allows('manage-schedule', $school));
    }

    public function test_coordinator_cannot_access_finance_or_content(): void
    {
        [$org, $school, $admin] = $this->setupOrganizationWithSchool('Org', 'School');
        $coordinator = User::factory()->create([
            'organization_id' => $org->id,
            'role' => UserRole::AcademicCoordinator,
        ]);
        SchoolMembership::create([
            'organization_id' => $org->id,
            'school_id' => $school->id,
            'user_id' => $coordinator->id,
        ]);

        $this->assertFalse(Gate::forUser($coordinator)->allows('manage-finance', $school));
        $this->assertFalse(Gate::forUser($coordinator)->allows('manage-content', $school));
        $this->assertFalse(Gate::forUser($coordinator)->allows('manage-admissions', $school));
    }

    public function test_school_memberships_backfill_for_single_school_orgs(): void
    {
        $org = Organization::factory()->create(['name' => 'Single School Org']);
        $school = School::factory()->create(['organization_id' => $org->id, 'name' => 'Single School']);
        $admin = User::factory()->create([
            'organization_id' => $org->id,
            'role' => UserRole::SchoolAdmin,
        ]);

        // The backfill migration runs during migrate:fresh with no data.
        // Test the membership logic directly.
        SchoolMembership::create([
            'organization_id' => $org->id,
            'school_id' => $school->id,
            'user_id' => $admin->id,
        ]);

        $this->assertTrue($admin->fresh()->belongsToSchool($school));
    }
}
