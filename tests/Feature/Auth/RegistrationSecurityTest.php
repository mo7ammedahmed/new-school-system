<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Organization;
use App\Models\School;
use App\Models\SiteContent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_route_is_not_available(): void
    {
        $this->get('/register')->assertNotFound();
        $this->post('/register', [
            'name' => 'Attacker',
            'email' => 'attacker@evil.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertNotFound();
        $this->assertGuest();
    }

    public function test_user_without_organization_is_forbidden_from_protected_routes(): void
    {
        $user = User::factory()->create([
            'organization_id' => null,
            'role' => UserRole::Guardian,
        ]);

        $this->actingAs($user);

        $this->get(route('dashboard'))->assertForbidden();
        $this->get(route('admin.site-content.index'))->assertForbidden();
        $this->post(route('admin.site-content.upsert'))->assertForbidden();
        $this->get(route('guardian.portal'))->assertForbidden();
    }

    public function test_platform_operator_can_read_and_write_site_content(): void
    {
        $operator = User::factory()->create([
            'organization_id' => null,
            'role' => UserRole::PlatformSuperAdmin,
        ]);

        $this->actingAs($operator);

        $response = $this->get(route('admin.site-content.index'));
        $response->assertOk();

        $this->post(route('admin.site-content.upsert'), [
            'page' => 'privacy',
            'locale' => 'en',
            'content' => ['body' => 'Privacy policy text.'],
            'seo_title' => 'Privacy',
            'seo_description' => 'Our privacy policy',
            'status' => 'published',
        ])->assertRedirect();

        $this->assertDatabaseHas('site_contents', [
            'page' => 'privacy',
            'locale' => 'en',
            'status' => 'published',
        ]);
    }

    public function test_organization_admin_is_forbidden_from_site_content(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $admin = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => UserRole::OrganizationAdmin,
        ]);

        $this->actingAs($admin);

        $initialCount = SiteContent::query()->count();

        $this->get(route('admin.site-content.index'))->assertForbidden();
        $this->post(route('admin.site-content.upsert'), [
            'page' => 'privacy',
            'locale' => 'en',
            'content' => ['body' => 'Hacked.'],
            'seo_title' => 'Privacy',
            'seo_description' => 'Hacked',
            'status' => 'published',
        ])->assertForbidden();

        $this->assertSame($initialCount, SiteContent::query()->count());
    }

    public function test_school_admin_is_forbidden_from_site_content(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $admin = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => UserRole::SchoolAdmin,
        ]);

        $this->actingAs($admin);

        $initialCount = SiteContent::query()->count();

        $this->get(route('admin.site-content.index'))->assertForbidden();
        $this->post(route('admin.site-content.upsert'), [
            'page' => 'privacy',
            'locale' => 'en',
            'content' => ['body' => 'Hacked.'],
            'seo_title' => 'Privacy',
            'seo_description' => 'Hacked',
            'status' => 'published',
        ])->assertForbidden();

        $this->assertSame($initialCount, SiteContent::query()->count());
    }
}
