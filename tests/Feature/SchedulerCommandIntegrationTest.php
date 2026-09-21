<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Jobs\DeliverInAppNotification;
use App\Models\Guardian;
use App\Models\Installment;
use App\Models\Invoice;
use App\Models\NotificationDelivery;
use App\Models\Organization;
use App\Models\School;
use App\Models\Student;
use App\Models\User;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class SchedulerCommandIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_application_schedule_registers_daily_reminders_and_hourly_health_checks(): void
    {
        Artisan::call('list');

        $commands = collect(app(Schedule::class)->events())->map(fn ($event) => $event->command);

        $this->assertTrue($commands->contains(fn ($command) => str_contains((string) $command, 'finance:send-installment-reminders')));
        $this->assertTrue($commands->contains(fn ($command) => str_contains((string) $command, 'notifications:check-delivery-health')));
        $this->assertTrue($commands->contains(fn ($command) => str_contains((string) $command, 'queue:check-health')));
    }

    public function test_installment_reminder_command_targets_only_due_and_overdue_unpaid_installments(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-09-16 07:00:00'));
        Queue::fake();
        [$organization, $school, $student, $guardianUser] = $this->studentFixture();
        $invoice = Invoice::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_id' => $student->id, 'issued_by' => $guardianUser->id, 'number' => 'INV-REM', 'issued_on' => '2026-09-01', 'due_on' => '2026-09-16', 'status' => 'issued', 'currency' => 'SAR', 'subtotal_minor' => 3000, 'total_minor' => 3000, 'items' => []]);
        $due = Installment::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'invoice_id' => $invoice->id, 'sequence' => 1, 'due_on' => '2026-09-17', 'amount_minor' => 1000, 'paid_minor' => 0, 'status' => 'pending']);
        $overdue = Installment::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'invoice_id' => $invoice->id, 'sequence' => 2, 'due_on' => '2026-09-15', 'amount_minor' => 1000, 'paid_minor' => 0, 'status' => 'pending']);
        Installment::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'invoice_id' => $invoice->id, 'sequence' => 3, 'due_on' => '2026-09-17', 'amount_minor' => 1000, 'paid_minor' => 1000, 'status' => 'paid']);

        Artisan::call('finance:send-installment-reminders');

        Queue::assertPushed(DeliverInAppNotification::class, 2);
        Queue::assertPushed(DeliverInAppNotification::class, fn ($job) => $job->dedupeKey === 'installment:'.$due->id.':due-soon:2026-09-16');
        Queue::assertPushed(DeliverInAppNotification::class, fn ($job) => $job->dedupeKey === 'installment:'.$overdue->id.':overdue:2026-09-16');
        Carbon::setTestNow();
    }

    public function test_email_delivery_health_command_alerts_only_after_threshold(): void
    {
        Queue::fake();
        config(['notifications.delivery_failure_threshold' => 2, 'notifications.delivery_queue_threshold' => 100]);
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $admin = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::OrganizationAdmin]);
        NotificationDelivery::create(['organization_id' => $organization->id, 'user_id' => $admin->id, 'channel' => 'email', 'type' => 'payment.succeeded', 'dedupe_key' => 'failed-1', 'recipient' => $admin->email, 'locale' => 'en', 'status' => 'failed']);
        Artisan::call('notifications:check-delivery-health');
        Queue::assertNothingPushed();

        NotificationDelivery::create(['organization_id' => $organization->id, 'user_id' => $admin->id, 'channel' => 'email', 'type' => 'payment.succeeded', 'dedupe_key' => 'failed-2', 'recipient' => $admin->email, 'locale' => 'en', 'status' => 'failed']);
        Artisan::call('notifications:check-delivery-health');
        Queue::assertPushed(DeliverInAppNotification::class, 1);
    }

    public function test_repeated_reminder_jobs_share_a_stable_unique_id(): void
    {
        $first = new DeliverInAppNotification(7, 11, 'installment.due_soon', 'Due', 'Due tomorrow', [], 'installment:22:due-soon:2026-09-16');
        $second = new DeliverInAppNotification(7, 11, 'installment.due_soon', 'Due', 'Due tomorrow', [], 'installment:22:due-soon:2026-09-16');

        $this->assertSame($first->uniqueId(), $second->uniqueId());
        $this->assertSame('7:11:installment:22:due-soon:2026-09-16', $first->uniqueId());
    }

    private function studentFixture(): array
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $guardianUser = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::Guardian]);
        $student = Student::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_number' => 'REM-1', 'first_name' => 'Reminder', 'last_name' => 'Student', 'status' => 'active']);
        $guardian = Guardian::create(['organization_id' => $organization->id, 'user_id' => $guardianUser->id, 'name' => 'Guardian', 'email' => 'guardian@example.com']);
        $guardian->students()->attach($student->id, ['organization_id' => $organization->id, 'relationship' => 'parent', 'is_primary' => true]);

        return [$organization, $school, $student, $guardianUser];
    }
}
