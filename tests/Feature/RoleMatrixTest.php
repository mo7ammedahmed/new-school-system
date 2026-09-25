<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Organization;
use App\Models\School;
use App\Models\SchoolMembership;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

/**
 * The roles screen must report the authorization the server actually enforces.
 * These assertions pin the link between the two: if a Gate definition changes,
 * the matrix has to change with it.
 */
class RoleMatrixTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_matrix_reports_the_abilities_the_gate_grants(): void
    {
        [$organization, $school, $admin] = $this->school();

        User::factory()->create([
            'organization_id' => $organization->id,
            'role' => UserRole::FinanceStaff,
        ]);
        User::factory()->create([
            'organization_id' => $organization->id,
            'role' => UserRole::Teacher,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.roles.index', ['school' => $school->id]))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('admin/roles/index')
                ->has('roles', 8)
                ->has('matrix')
                // School administration and finance staff may manage finance.
                ->where('matrix', fn ($rows) => $this->grant($rows, 'manage-finance', 'school_admin') === true
                    && $this->grant($rows, 'manage-finance', 'finance_staff') === true
                    // A teacher may not.
                    && $this->grant($rows, 'manage-finance', 'teacher') === false
                    // Recording attendance is the teacher's ability.
                    && $this->grant($rows, 'record-attendance', 'teacher') === true
                    && $this->grant($rows, 'record-attendance', 'finance_staff') === false
                    // A role nobody holds is unknown, not denied: this school has
                    // no guardian account, so there is no user to ask.
                    && $this->grant($rows, 'manage-finance', 'guardian') === null)
                // Record-scoped abilities are listed, not given a role verdict.
                ->has('resourceAbilities'));
    }

    public function test_a_teacher_may_not_read_the_role_matrix(): void
    {
        [$organization, $school, $admin] = $this->school();

        $teacher = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => UserRole::Teacher,
        ]);

        $this->actingAs($teacher)
            ->get(route('admin.roles.index', ['school' => $school->id]))
            ->assertForbidden();
    }

    /**
     * Reads one cell of the matrix. Inertia hands arrays back as collections.
     */
    private function grant(mixed $rows, string $ability, string $role): ?bool
    {
        foreach (is_iterable($rows) ? $rows : [] as $row) {
            if (($row['ability'] ?? null) === $ability) {
                $granted = $row['grants'][$role] ?? null;

                return $granted === null ? null : (bool) $granted;
            }
        }

        return null;
    }

    public function test_a_school_admin_with_membership_can_manage_the_schedule(): void
    {
        [$organization, $school, $admin] = $this->school();

        SchoolMembership::create([
            'organization_id' => $organization->id,
            'school_id' => $school->id,
            'user_id' => $admin->id,
        ]);

        // manage-schedule additionally requires school membership, which only a
        // real account can satisfy.
        $this->actingAs($admin)
            ->get(route('admin.roles.index', ['school' => $school->id]))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('matrix', fn ($rows) => $this->grant($rows, 'manage-schedule', 'school_admin') === true));
    }

    /**
     * @return array{Organization, School, User}
     */
    private function school(): array
    {
        $organization = Organization::factory()->create(['name' => 'Matrix Org', 'slug' => 'matrix-org']);
        $school = School::factory()->create([
            'organization_id' => $organization->id,
            'name' => 'Matrix School',
            'slug' => 'matrix-school',
        ]);

        $admin = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => UserRole::SchoolAdmin,
        ]);

        return [$organization, $school, $admin];
    }
}
