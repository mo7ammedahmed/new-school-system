<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\AuditLog;
use App\Models\Organization;
use App\Models\Page;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PageAdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_school_admin_can_create_and_publish_a_page_with_an_audit_record(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $user = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => UserRole::SchoolAdmin,
        ]);
        $this->actingAs($user);
        $payload = [
            'slug' => 'home',
            'title' => ['en' => 'Welcome', 'ar' => 'أهلاً'],
            'body' => ['en' => 'Welcome body', 'ar' => 'النص'],
        ];

        $this->post(route('admin.pages.store', $school->id), $payload)->assertRedirect();
        $page = Page::query()->firstOrFail();
        $this->assertSame('draft', $page->status);
        $this->assertSame('page.created', AuditLog::query()->firstOrFail()->action);

        $this->post(route('admin.pages.publish', [$school->id, $page->id]))->assertRedirect();
        $this->assertSame('published', $page->fresh()->status);
        $this->assertSame(2, AuditLog::query()->count());
    }

    public function test_finance_staff_cannot_manage_school_pages(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $user = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => UserRole::FinanceStaff,
        ]);

        $this->actingAs($user)->get(route('admin.pages.index', $school->id))->assertForbidden();
    }
}
