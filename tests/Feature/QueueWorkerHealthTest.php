<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Jobs\DeliverInAppNotification;
use App\Models\Organization;
use App\Models\QueueWorkerHeartbeat;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class QueueWorkerHealthTest extends TestCase
{
    use RefreshDatabase;

    public function test_heartbeat_command_is_idempotent_per_worker_queue(): void
    {
        Artisan::call('queue:heartbeat', ['worker' => 'worker-a', '--connection' => 'database', '--queue' => 'default', '--processed' => 12, '--failed' => 1]);
        Artisan::call('queue:heartbeat', ['worker' => 'worker-a', '--connection' => 'database', '--queue' => 'default', '--processed' => 15, '--failed' => 2]);

        $this->assertDatabaseCount('queue_worker_heartbeats', 1);
        $this->assertDatabaseHas('queue_worker_heartbeats', ['worker_id' => 'worker-a', 'processed_jobs' => 15, 'failed_jobs' => 2]);
    }

    public function test_queue_health_alerts_organization_and_school_admins_when_backlog_exceeds_threshold(): void
    {
        Queue::fake();
        config(['notifications.queue_backlog_threshold' => 0]);
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::OrganizationAdmin]);
        User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::SchoolAdmin]);

        Artisan::call('queue:check-health');

        Queue::assertPushed(DeliverInAppNotification::class, 2);
    }

    public function test_queue_health_alerts_when_worker_heartbeat_is_stale(): void
    {
        Queue::fake();
        config(['notifications.queue_worker_stale_minutes' => 5, 'notifications.queue_backlog_threshold' => 100000, 'notifications.queue_failed_threshold' => 100000]);
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::OrganizationAdmin]);
        QueueWorkerHeartbeat::create(['worker_id' => 'stale-worker', 'connection' => 'database', 'queue' => 'default', 'last_seen_at' => now()->subMinutes(6), 'processed_jobs' => 1, 'failed_jobs' => 0]);

        Artisan::call('queue:check-health');

        Queue::assertPushed(DeliverInAppNotification::class, 1);
    }
}
