<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Jobs\DeliverEmailNotification;
use App\Jobs\DeliverInAppNotification;
use App\Mail\LocalizedNotificationMail;
use App\Models\NotificationDelivery;
use App\Models\NotificationPreference;
use App\Models\Organization;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use ReflectionObject;
use RuntimeException;
use Tests\TestCase;

class NotificationDeliveryTest extends TestCase
{
    use RefreshDatabase;

    public function test_disabled_email_preference_prevents_delivery(): void
    {
        Mail::fake();
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $user = User::factory()->create(['organization_id' => $organization->id]);
        NotificationPreference::create(['organization_id' => $organization->id, 'user_id' => $user->id, 'category' => 'payment', 'locale' => 'ar', 'enabled' => true, 'email_enabled' => false]);

        (new DeliverEmailNotification($organization->id, $user->id, 'payment.succeeded', 'Payment received', 'Paid.', 'payment:1', ['ar' => ['title' => 'تم الدفع', 'body' => 'تم استلام الدفعة.']]))->handle(app(AuditLogger::class));

        Mail::assertNothingSent();
        $this->assertDatabaseMissing('notification_deliveries', ['user_id' => $user->id]);
    }

    public function test_enabled_arabic_preference_sends_localized_email_once(): void
    {
        Mail::fake();
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $user = User::factory()->create(['organization_id' => $organization->id]);
        NotificationPreference::create(['organization_id' => $organization->id, 'user_id' => $user->id, 'category' => 'payment', 'locale' => 'ar', 'enabled' => true, 'email_enabled' => true]);
        $job = new DeliverEmailNotification($organization->id, $user->id, 'payment.succeeded', 'Payment received', 'Paid.', 'payment:1', ['ar' => ['title' => 'تم الدفع', 'body' => 'تم استلام الدفعة.']]);

        $job->handle(app(AuditLogger::class));
        $job->handle(app(AuditLogger::class));

        Mail::assertSentCount(1);
        Mail::assertSent(LocalizedNotificationMail::class);
        $this->assertDatabaseHas('notification_deliveries', ['user_id' => $user->id, 'status' => 'sent', 'locale' => 'ar', 'attempts' => 1]);
    }

    public function test_arabic_email_has_correct_locale_and_content(): void
    {
        Mail::fake();
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $user = User::factory()->create(['organization_id' => $organization->id]);
        NotificationPreference::create(['organization_id' => $organization->id, 'user_id' => $user->id, 'category' => 'payment', 'locale' => 'ar', 'enabled' => true, 'email_enabled' => true]);
        $job = new DeliverEmailNotification($organization->id, $user->id, 'payment.succeeded', 'Payment received', 'Paid.', 'payment:1', ['ar' => ['title' => 'تم الدفع', 'body' => 'تم استلام الدفعة.']]);

        $job->handle(app(AuditLogger::class));

        Mail::assertSentCount(1);
        Mail::assertSent(LocalizedNotificationMail::class, function ($mail) {
            $reflection = new ReflectionObject($mail);
            $property = $reflection->getProperty('notificationLocale');
            $property->setAccessible(true);
            $locale = $property->getValue($mail);
            $this->assertEquals('ar', $locale);
            $this->assertEquals('تم الدفع', $mail->title);
            $this->assertEquals('تم استلام الدفعة.', $mail->body);
            $content = $mail->content();
            $this->assertEquals('emails.notification', $content->view);
            $this->assertEquals('ar', $content->with['locale']);
            $this->assertEquals('تم الدفع', $content->with['title']);
            $this->assertEquals('تم استلام الدفعة.', $content->with['body']);

            return true;
        });

        $this->assertDatabaseHas('notification_deliveries', ['user_id' => $user->id, 'status' => 'sent', 'locale' => 'ar', 'attempts' => 1]);
    }

    public function test_delivery_monitoring_rejects_user_from_another_organization(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $other = Organization::create(['name' => 'Other', 'slug' => 'other']);
        $admin = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::OrganizationAdmin]);
        NotificationDelivery::create(['organization_id' => $other->id, 'user_id' => $admin->id, 'channel' => 'email', 'type' => 'payment.succeeded', 'dedupe_key' => 'x', 'recipient' => $admin->email, 'locale' => 'en', 'status' => 'failed']);

        $this->actingAs($admin)->get(route('admin.notifications.deliveries'))->assertOk()->assertInertia(fn ($page) => $page->where('deliveries', []));
    }

    public function test_mail_transport_failure_marks_delivery_failed_and_rethrows_for_queue_retry(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $user = User::factory()->create(['organization_id' => $organization->id]);
        Mail::shouldReceive('to')->once()->andThrow(new RuntimeException('SMTP unavailable'));
        $job = new DeliverEmailNotification($organization->id, $user->id, 'payment.succeeded', 'Payment received', 'Paid.', 'payment:failure');

        $this->expectException(RuntimeException::class);
        try {
            $job->handle(app(AuditLogger::class));
        } finally {
            $this->assertDatabaseHas('notification_deliveries', ['user_id' => $user->id, 'status' => 'failed', 'attempts' => 1]);
        }
    }

    public function test_in_app_delivery_is_deduplicated_by_user_and_key(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $user = User::factory()->create(['organization_id' => $organization->id]);
        $job = new DeliverInAppNotification($organization->id, $user->id, 'notice.published', 'Notice', 'Published.', [], 'notice:1');

        $job->handle(app(AuditLogger::class));
        $job->handle(app(AuditLogger::class));

        $this->assertDatabaseCount('notifications', 1);
    }
}
