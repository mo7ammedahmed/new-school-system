<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Guardian;
use App\Models\Notice;
use App\Models\Organization;
use App\Models\School;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NoticeTest extends TestCase
{
    use RefreshDatabase;

    public function test_school_admin_can_create_and_publish_a_notice(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $admin = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::SchoolAdmin]);

        $this->actingAs($admin)->post(route('admin.notices.store', $school->id), ['title' => 'Welcome', 'body' => 'Welcome back.'])->assertRedirect();
        $notice = Notice::query()->firstOrFail();
        $this->actingAs($admin)->post(route('admin.notices.publish', [$school->id, $notice->id]))->assertRedirect();

        $this->assertSame('published', $notice->fresh()->status);
        $this->assertNotNull($notice->fresh()->published_at);
    }

    public function test_guardian_sees_whole_school_and_linked_targeted_notices_only(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $linked = Student::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_number' => 'S-1', 'first_name' => 'Linked', 'last_name' => 'Student']);
        $other = Student::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_number' => 'S-2', 'first_name' => 'Other', 'last_name' => 'Student']);
        $wholeSchool = Notice::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'title' => 'Whole school', 'body' => 'All families', 'status' => 'published', 'published_at' => now()]);
        $targeted = Notice::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'title' => 'Linked only', 'body' => 'For linked', 'status' => 'published', 'published_at' => now()]);
        $targeted->students()->attach($linked->id, ['organization_id' => $organization->id]);
        $hidden = Notice::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'title' => 'Other only', 'body' => 'Not for linked', 'status' => 'published', 'published_at' => now()]);
        $hidden->students()->attach($other->id, ['organization_id' => $organization->id]);
        $user = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::Guardian]);
        $guardian = Guardian::create(['organization_id' => $organization->id, 'user_id' => $user->id, 'name' => 'Guardian', 'email' => $user->email]);
        $guardian->students()->attach($linked->id, ['organization_id' => $organization->id]);

        $response = $this->actingAs($user)->get(route('guardian.portal'));

        $response->assertOk()->assertSee('Whole school')->assertSee('Linked only')->assertDontSee('Other only');
    }
}
