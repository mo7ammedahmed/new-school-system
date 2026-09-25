<?php

namespace App\Http\Controllers;

use App\Concerns\ResolvesSchool;
use App\Enums\UserRole;
use App\Models\School;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use ReflectionFunction;
use ReflectionNamedType;

/**
 * The role/permission matrix is derived from the Gate definitions themselves
 * rather than a hand-maintained table, so it can never drift from the code that
 * actually authorizes requests. Adding an ability in AppServiceProvider's
 * configureAuthorization() shows up here with no change to this controller.
 */
class RoleController
{
    use ResolvesSchool;

    /** Key for abilities that take no subject at all. */
    private const ACCOUNT_SCOPE = 'account';

    public function index(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-users', $schoolModel);

        ['school' => $schoolAbilities, 'resource' => $resourceAbilities] = $this->abilityInventory();

        // Verdicts come from asking the real Gate as real accounts, because
        // several abilities require school membership (belongsToSchool()) and a
        // role alone cannot answer that. A role nobody holds yet is reported as
        // unknown rather than denied — inventing a "no" there would be a claim
        // about a user that does not exist.
        $accounts = User::query()
            ->where('organization_id', $schoolModel->organization_id)
            ->get()
            ->groupBy(fn (User $user): string => $user->role->value);

        $matrix = array_map(function (string $ability) use ($schoolModel, $accounts): array {
            $grants = [];

            foreach (UserRole::cases() as $role) {
                $holders = $accounts->get($role->value) ?? collect();

                $grants[$role->value] = $holders->isEmpty()
                    ? null
                    : $holders->contains(fn (User $user): bool => Gate::forUser($user)->allows($ability, $schoolModel));
            }

            return ['ability' => $ability, 'grants' => $grants];
        }, $schoolAbilities);

        $privileged = [
            UserRole::PlatformSuperAdmin->value,
            UserRole::OrganizationAdmin->value,
            UserRole::SchoolAdmin->value,
        ];

        $accountsByRole = fn (array $roles): int => (int) collect($roles)
            ->sum(fn (string $role): int => ($accounts->get($role) ?? collect())->count());

        return Inertia::render('admin/roles/index', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'stats' => [
                'roles' => count(UserRole::cases()),
                'provisionedUsers' => $accounts->flatten()->count(),
                'privilegedAccounts' => $accountsByRole($privileged),
                'abilities' => count($schoolAbilities) + (int) collect($resourceAbilities)->sum('count'),
            ],
            'roles' => array_map(fn (UserRole $role): array => [
                'value' => $role->value,
                'users' => ($accounts->get($role->value) ?? collect())->count(),
            ], UserRole::cases()),
            'matrix' => $matrix,
            'resourceAbilities' => $resourceAbilities,
        ]);
    }

    /**
     * Groups every registered ability by what it is decided on. An ability
     * taking a school is a school-wide capability that can be answered for a
     * role alone; everything else depends on the individual record (ownership,
     * guardianship, teaching assignment), so this screen lists it under its
     * subject without inventing a verdict.
     *
     * The ability's own signature is the source of truth here — a newly defined
     * ability groups itself, and one that is dropped from the Gate disappears.
     *
     * @return array{school: list<string>, resource: array<string, list<string>>}
     */
    private function abilityInventory(): array
    {
        $school = [];
        $resource = [];

        foreach (Gate::abilities() as $ability => $callback) {
            $parameter = (new ReflectionFunction($callback))->getParameters()[1] ?? null;
            $type = $parameter?->getType();
            $subject = $type instanceof ReflectionNamedType ? $type->getName() : null;

            // Schedule abilities declare their school untyped but name it.
            if ($subject === School::class || ($subject === null && $this->isSchoolParameter($parameter))) {
                $school[] = $ability;

                continue;
            }

            $resource[$subject ?? self::ACCOUNT_SCOPE][] = $ability;
        }

        sort($school);
        ksort($resource);

        return ['school' => $school, 'resource' => $resource];
    }

    private function isSchoolParameter(?\ReflectionParameter $parameter): bool
    {
        return $parameter !== null && str_contains(strtolower($parameter->getName()), 'school');
    }
}
