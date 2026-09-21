<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class InertiaContextTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_shared_context_contains_safe_identity_and_capabilities(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $user = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => UserRole::FinanceStaff,
        ]);
        $request = Request::create('/dashboard', 'GET');
        $request->setUserResolver(fn () => $user);

        $shared = (new HandleInertiaRequests)->share($request);

        $this->assertSame('finance_staff', $shared['auth']['user']['role']);
        $this->assertSame('Org', $shared['auth']['organization']['name']);
        $this->assertTrue($shared['auth']['abilities']['manageFinance']);
        $this->assertFalse($shared['auth']['abilities']['recordAttendance']);
    }

    public function test_guest_shared_context_does_not_expose_identity(): void
    {
        $request = Request::create('/', 'GET');
        $shared = (new HandleInertiaRequests)->share($request);

        $this->assertNull($shared['auth']['user']);
        $this->assertNull($shared['auth']['organization']);
        $this->assertFalse($shared['auth']['abilities']['manageFinance']);
    }
}
