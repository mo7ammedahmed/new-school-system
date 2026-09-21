<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\Page;
use App\Models\School;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicSchoolTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_route_renders_the_published_page_in_the_selected_locale(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        Page::create([
            'organization_id' => $organization->id,
            'school_id' => $school->id,
            'slug' => 'home',
            'title' => ['en' => 'Welcome', 'ar' => 'أهلاً'],
            'body' => ['en' => 'English body', 'ar' => 'النص العربي'],
            'status' => 'published',
            'published_at' => now(),
        ]);

        $response = $this->withUnencryptedCookies(['locale' => 'ar'])->get(route('public.school', [$organization->slug, $school->slug]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->where('page.title', 'أهلاً')->where('page.body', 'النص العربي'));
    }

    public function test_draft_pages_are_not_public(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        Page::create([
            'organization_id' => $organization->id,
            'school_id' => $school->id,
            'slug' => 'home',
            'title' => ['en' => 'Draft'],
            'body' => ['en' => 'Not public'],
        ]);

        $this->get(route('public.school', [$organization->slug, $school->slug]))->assertNotFound();
    }

    public function test_a_page_stored_as_a_plain_string_still_renders(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        Page::create([
            'organization_id' => $organization->id,
            'school_id' => $school->id,
            'slug' => 'home',
            'title' => 'Welcome',
            'body' => 'English body',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $this->get(route('public.school', [$organization->slug, $school->slug]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('page.title', 'Welcome')->where('page.body', 'English body'));
    }

    public function test_a_school_cannot_be_resolved_through_another_organization_slug(): void
    {
        $owner = Organization::create(['name' => 'Owner', 'slug' => 'owner']);
        $other = Organization::create(['name' => 'Other', 'slug' => 'other']);
        $school = School::create(['organization_id' => $owner->id, 'name' => 'School', 'slug' => 'school']);

        $this->get(route('public.school', [$other->slug, $school->slug]))->assertNotFound();
    }
}
