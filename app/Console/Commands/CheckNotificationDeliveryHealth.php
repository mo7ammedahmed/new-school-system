<?php

namespace App\Console\Commands;

use App\Jobs\DeliverInAppNotification;
use App\Models\NotificationDelivery;
use App\Models\Organization;
use Illuminate\Console\Command;

class CheckNotificationDeliveryHealth extends Command
{
    protected $signature = 'notifications:check-delivery-health';

    protected $description = 'Alert organization administrators when email delivery health crosses configured thresholds';

    public function handle(): int
    {
        $since = now()->subHour();
        $failureThreshold = (int) config('notifications.delivery_failure_threshold', 10);
        $queueThreshold = (int) config('notifications.delivery_queue_threshold', 50);
        $organizations = Organization::query()->get();

        foreach ($organizations as $organization) {
            $base = NotificationDelivery::query()->withoutGlobalScopes()->where('organization_id', $organization->id)->where('channel', 'email')->where('created_at', '>=', $since);
            $failed = (clone $base)->where('status', 'failed')->count();
            $queued = (clone $base)->where('status', 'queued')->count();
            if ($failed < $failureThreshold && $queued < $queueThreshold) {
                continue;
            }

            $reason = $failed >= $failureThreshold ? "{$failed} failed email deliveries" : "{$queued} queued email deliveries";
            $users = $organization->users()->whereIn('role', ['organization_admin', 'school_admin'])->get();
            foreach ($users as $user) {
                DeliverInAppNotification::dispatch(
                    $organization->id,
                    $user->id,
                    'notification.delivery_health',
                    'Email delivery health alert',
                    "Email delivery requires attention: {$reason} in the last hour.",
                    ['failed' => $failed, 'queued' => $queued, 'window' => '1h'],
                    'delivery-health:'.$organization->id.':'.$since->format('Y-m-d-H'),
                    ['en' => ['title' => 'Email delivery health alert', 'body' => "Email delivery requires attention: {$reason} in the last hour."], 'ar' => ['title' => 'تنبيه حالة البريد الإلكتروني', 'body' => "تحتاج خدمة البريد الإلكتروني إلى مراجعة: {$reason} خلال الساعة الماضية."]],
                );
            }
            $this->line("Organization {$organization->id}: {$reason}.");
        }

        return self::SUCCESS;
    }
}
