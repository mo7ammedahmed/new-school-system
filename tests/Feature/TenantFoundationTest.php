<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Organization;
use App\Models\School;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_school_queries_are_scoped_to_the_current_organization(): void
    {
        $first = Organization::create(['name' => 'First Org', 'slug' => 'first-org']);
        $second = Organization::create(['name' => 'Second Org', 'slug' => 'second-org']);

        School::create(['organization_id' => $first->id, 'name' => 'First School', 'slug' => 'school']);
        School::create(['organization_id' => $second->id, 'name' => 'Second School', 'slug' => 'school']);

        app()->instance('currentOrganization', $first);

        $this->assertSame(['First School'], School::query()->pluck('name')->all());
    }

    public function test_branch_cannot_be_created_for_a_school_in_another_organization(): void
    {
        $first = Organization::create(['name' => 'First Org', 'slug' => 'first-org']);
        $second = Organization::create(['name' => 'Second Org', 'slug' => 'second-org']);
        $school = School::create(['organization_id' => $first->id, 'name' => 'First School', 'slug' => 'school']);

        $this->expectException(QueryException::class);

        Branch::create([
            'organization_id' => $second->id,
            'school_id' => $school->id,
            'name' => 'Invalid Branch',
            'slug' => 'invalid',
        ]);
    }

    public function test_authenticated_routes_resolve_and_clear_the_current_organization(): void
    {
        $organization = Organization::create(['name' => 'First Org', 'slug' => 'first-org']);
        $user = User::factory()->create(['organization_id' => $organization->id]);

        $this->actingAs($user)->get(route('dashboard'))->assertOk();

        $this->assertFalse(app()->bound('currentOrganization'));
    }
}
