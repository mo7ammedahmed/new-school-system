<?php

namespace App\Console\Commands;

use App\Jobs\DeliverInAppNotification;
use App\Models\Organization;
use App\Models\QueueWorkerHeartbeat;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CheckQueueWorkerHealth extends Command
{
    protected $signature = 'queue:check-health';

    protected $description = 'Check queue backlog, failed jobs, and worker heartbeats';

    public function handle(): int
    {
        $staleMinutes = (int) config('notifications.queue_worker_stale_minutes', 10);
        $backlogThreshold = (int) config('notifications.queue_backlog_threshold', 100);
        $failedThreshold = (int) config('notifications.queue_failed_threshold', 10);
        $backlog = (int) DB::table('jobs')->count();
        $failed = (int) DB::table('failed_jobs')->where('failed_at', '>=', now()->subHour())->count();
        $stale = QueueWorkerHeartbeat::query()->where('last_seen_at', '<', now()->subMinutes($staleMinutes))->count();
        if ($backlog < $backlogThreshold && $failed < $failedThreshold && $stale === 0) {
            $this->info('Queue health is within thresholds.');

            return self::SUCCESS;
        }
        $reason = collect([$backlog >= $backlogThreshold ? "{$backlog} queued jobs" : null, $failed >= $failedThreshold ? "{$failed} failed jobs" : null, $stale > 0 ? "{$stale} stale worker heartbeat(s)" : null])->filter()->implode(', ');
        foreach (Organization::query()->with(['users' => fn ($query) => $query->whereIn('role', ['organization_admin', 'school_admin'])])->get() as $organization) {
            foreach ($organization->users as $user) {
                DeliverInAppNotification::dispatch($organization->id, $user->id, 'queue.worker_health', 'Queue worker health alert', "Queue processing requires attention: {$reason}.", ['backlog' => $backlog, 'failed' => $failed, 'stale_workers' => $stale], 'queue-health:'.$organization->id.':'.now()->format('Y-m-d-H'), ['en' => ['title' => 'Queue worker health alert', 'body' => "Queue processing requires attention: {$reason}."], 'ar' => ['title' => 'تنبيه حالة معالج المهام', 'body' => "تحتاج معالجة المهام إلى مراجعة: {$reason}."]]);
            }
        }
        $this->warn($reason);

        return self::SUCCESS;
    }
}
