<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Guardian;
use App\Models\Notification;
use App\Models\NotificationDelivery;
use App\Models\Organization;
use App\Models\School;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class AuthorizationIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_finance_staff_cannot_access_another_organization_finance_report(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $other = Organization::create(['name' => 'Other', 'slug' => 'other']);
        $school = School::create(['organization_id' => $other->id, 'name' => 'Other School', 'slug' => 'other-school']);
        $staff = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::FinanceStaff]);

        $this->actingAs($staff)->get(route('admin.reports.finance', $school))->assertForbidden();
    }

    public function test_guardian_gate_requires_explicit_student_link_and_same_organization(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $other = Organization::create(['name' => 'Other', 'slug' => 'other']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $otherSchool = School::create(['organization_id' => $other->id, 'name' => 'Other School', 'slug' => 'other-school']);
        $user = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::Guardian]);
        $guardian = Guardian::create(['organization_id' => $organization->id, 'user_id' => $user->id, 'name' => 'Guardian', 'email' => 'guardian@example.com']);
        $linked = Student::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_number' => 'L-1', 'first_name' => 'Linked', 'last_name' => 'Student', 'status' => 'active']);
        $unlinked = Student::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_number' => 'U-1', 'first_name' => 'Unlinked', 'last_name' => 'Student', 'status' => 'active']);
        $foreign = Student::create(['organization_id' => $other->id, 'school_id' => $otherSchool->id, 'student_number' => 'F-1', 'first_name' => 'Foreign', 'last_name' => 'Student', 'status' => 'active']);
        $guardian->students()->attach($linked->id, ['organization_id' => $organization->id, 'relationship' => 'parent', 'is_primary' => true]);

        $this->assertTrue(Gate::forUser($user)->allows('view-student', $linked));
        $this->assertFalse(Gate::forUser($user)->allows('view-student', $unlinked));
        $this->assertFalse(Gate::forUser($user)->allows('view-student', $foreign));
    }

    public function test_notification_inbox_cannot_read_another_users_notification(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $user = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::Guardian]);
        $other = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::Guardian]);
        $notification = Notification::create(['organization_id' => $organization->id, 'user_id' => $other->id, 'type' => 'payment.succeeded', 'title' => 'Private', 'body' => 'Private']);

        $this->actingAs($user)->patch(route('notifications.read', $notification))->assertNotFound();
    }

    public function test_delivery_resend_cannot_cross_organization_boundary(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $other = Organization::create(['name' => 'Other', 'slug' => 'other']);
        $admin = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::OrganizationAdmin]);
        $recipient = User::factory()->create(['organization_id' => $other->id, 'role' => UserRole::Guardian]);
        $delivery = NotificationDelivery::create(['organization_id' => $other->id, 'user_id' => $recipient->id, 'channel' => 'email', 'type' => 'payment.succeeded', 'dedupe_key' => 'foreign', 'recipient' => $recipient->email, 'locale' => 'en', 'status' => 'failed']);

        $this->actingAs($admin)->post(route('admin.notifications.deliveries.resend', $delivery))->assertNotFound();
    }
}
