<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Organization;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Route as RoutingRoute;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

/**
 * Route-table invariants.
 *
 * These tests fail when a route is added without authorization, when two named
 * routes resolve to the same target, or when a low-privilege role can reach a
 * screen that is not meant for it.
 */
class RouteAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Routes that any signed-in user may legitimately open.
     *
     * @var list<string>
     */
    private const SHARED_ROUTE_NAMES = [
        'dashboard',
        'notifications.index',
        'notifications.read',
        'notifications.preferences.update',
        'logout',
    ];

    /**
     * @return array<int, RoutingRoute>
     */
    private function authenticatedRoutes(): array
    {
        $routes = [];

        foreach (Route::getRoutes() as $route) {
            $middleware = $route->gatherMiddleware();

            if (! in_array('auth', $middleware, true)) {
                continue;
            }

            // Personal settings pages are shared by every signed-in user and
            // are deliberately reachable without an organization.
            if (str_starts_with($route->uri(), 'settings')) {
                continue;
            }

            $routes[] = $route;
        }

        return $routes;
    }

    private function urlFor(RoutingRoute $route): string
    {
        $uri = $route->uri();
        $uri = preg_replace('#/\{[^}]*\?\}#', '', $uri) ?? $uri;
        $uri = preg_replace('#\{[^}]+\}#', '1', $uri) ?? $uri;

        return '/'.ltrim($uri, '/');
    }

    /**
     * @return list<string>
     */
    private function writableMethods(RoutingRoute $route): array
    {
        return array_values(array_diff($route->methods(), ['HEAD', 'OPTIONS']));
    }

    public function test_no_two_named_routes_share_the_same_target(): void
    {
        /** @var array<string, string> $targets */
        $targets = [];
        $duplicates = [];

        foreach (Route::getRoutes() as $route) {
            $name = $route->getName();

            if ($name === null) {
                continue;
            }

            $methods = implode('|', array_diff($route->methods(), ['HEAD', 'OPTIONS']));
            $key = $methods.' '.$route->uri();

            if (isset($targets[$key])) {
                $duplicates[] = sprintf(
                    '[%s] and [%s] both resolve to %s %s',
                    $targets[$key],
                    $name,
                    $methods,
                    $route->uri(),
                );

                continue;
            }

            $targets[$key] = $name;
        }

        $this->assertSame([], $duplicates, 'Duplicate route targets found.');
    }

    public function test_every_authenticated_route_rejects_a_guest(): void
    {
        $offenders = [];

        foreach ($this->authenticatedRoutes() as $route) {
            foreach ($this->writableMethods($route) as $method) {
                $response = $this->json($method, $this->urlFor($route));

                $status = $response->getStatusCode();

                if ($status === 200 || $status >= 500) {
                    $offenders[] = sprintf(
                        '%s %s (%s) returned %d for a guest',
                        $method,
                        $this->urlFor($route),
                        (string) $route->getName(),
                        $status,
                    );
                }
            }
        }

        $this->assertSame([], $offenders, 'Guests reached protected routes.');
    }

    public function test_a_guardian_cannot_open_administration_or_other_family_records(): void
    {
        $context = $this->context();

        $guardian = User::factory()->create([
            'organization_id' => $context['org']->id,
            'role' => UserRole::Guardian,
        ]);

        $allowed = [
            ...self::SHARED_ROUTE_NAMES,
            'guardian.portal',
        ];

        $offenders = [];

        foreach ($this->authenticatedRoutes() as $route) {
            $name = (string) $route->getName();

            if (in_array($name, $allowed, true)) {
                continue;
            }

            foreach ($this->writableMethods($route) as $method) {
                $response = $this->actingAs($guardian)->json($method, $this->urlFor($route));

                if ($response->getStatusCode() === 200) {
                    $offenders[] = $method.' '.$this->urlFor($route).' ('.$name.')';
                }
            }
        }

        $this->assertSame([], $offenders, 'A guardian reached routes outside their allowlist.');
    }

    public function test_a_teacher_cannot_open_administration_records(): void
    {
        $context = $this->context();

        $teacher = User::factory()->create([
            'organization_id' => $context['org']->id,
            'role' => UserRole::Teacher,
        ]);

        $allowed = [
            ...self::SHARED_ROUTE_NAMES,
            'teacher.portal',
        ];

        $offenders = [];

        foreach ($this->authenticatedRoutes() as $route) {
            $name = (string) $route->getName();

            if (in_array($name, $allowed, true)) {
                continue;
            }

            foreach ($this->writableMethods($route) as $method) {
                $response = $this->actingAs($teacher)->json($method, $this->urlFor($route));

                if ($response->getStatusCode() === 200) {
                    $offenders[] = $method.' '.$this->urlFor($route).' ('.$name.')';
                }
            }
        }

        $this->assertSame([], $offenders, 'A teacher reached administration routes.');
    }

    public function test_a_user_without_an_organization_is_rejected_everywhere(): void
    {
        $outsider = User::factory()->create([
            'organization_id' => null,
            'role' => UserRole::Guardian,
        ]);

        $offenders = [];

        foreach ($this->authenticatedRoutes() as $route) {
            foreach ($this->writableMethods($route) as $method) {
                $response = $this->actingAs($outsider)->json($method, $this->urlFor($route));

                if ($response->getStatusCode() === 200) {
                    $offenders[] = $method.' '.$this->urlFor($route);
                }
            }
        }

        $this->assertSame([], $offenders, 'An organization-less user reached protected routes.');
    }

    /**
     * @return array{org: Organization, school: School}
     */
    private function context(): array
    {
        $org = Organization::factory()->create(['name' => 'Route Org']);
        $school = School::factory()->create(['organization_id' => $org->id, 'name' => 'Route School']);

        return ['org' => $org, 'school' => $school];
    }
}
