<?php

namespace App\Http\Controllers;

use App\Jobs\DeliverEmailNotification;
use App\Models\Notification;
use App\Models\NotificationDelivery;
use App\Models\QueueWorkerHeartbeat;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DeliveryMonitoringController
{
    public function index(Request $request): Response
    {
        $this->authorizeStaff($request);
        $organizationId = $request->user()->organization_id;
        $deliveries = NotificationDelivery::query()->where('organization_id', $organizationId)->latest()->limit(100)->get();
        $window = now()->subDay();
        $windowed = NotificationDelivery::query()->where('organization_id', $organizationId)->where('created_at', '>=', $window);
        $sent = (clone $windowed)->where('status', 'sent')->get(['created_at', 'sent_at']);
        $averageSeconds = $sent->filter(fn (NotificationDelivery $delivery): bool => $delivery->sent_at !== null)->avg(fn (NotificationDelivery $delivery) => $delivery->sent_at !== null ? $delivery->sent_at->diffInSeconds($delivery->created_at) : 0);

        return Inertia::render('admin/notifications/deliveries', [
            'deliveries' => $deliveries->map(fn (NotificationDelivery $delivery): array => ['id' => $delivery->id, 'type' => $delivery->type, 'recipient' => $delivery->recipient, 'locale' => $delivery->locale, 'status' => $delivery->status, 'attempts' => $delivery->attempts, 'lastError' => $delivery->last_error, 'sentAt' => $delivery->sent_at?->toIso8601String(), 'createdAt' => $delivery->created_at?->toIso8601String()])->values(),
            'metrics' => [
                'queued' => (clone $windowed)->where('status', 'queued')->count(),
                'failed' => (clone $windowed)->where('status', 'failed')->count(),
                'sent' => $sent->count(),
                'failureThreshold' => (int) config('notifications.delivery_failure_threshold', 10),
                'queueThreshold' => (int) config('notifications.delivery_queue_threshold', 50),
                'averageSeconds' => round((float) ($averageSeconds ?: 0), 1),
                'queueBacklog' => (int) DB::table('jobs')->count(),
                'failedJobs' => (int) DB::table('failed_jobs')->where('failed_at', '>=', now()->subHour())->count(),
                'workerHeartbeats' => QueueWorkerHeartbeat::query()->get()->map(fn (QueueWorkerHeartbeat $heartbeat): array => ['worker' => $heartbeat->worker_id, 'queue' => $heartbeat->queue, 'lastSeenAt' => $heartbeat->last_seen_at?->toIso8601String()])->values(),
            ],
        ]);
    }

    public function resend(Request $request, int $delivery, AuditLogger $audit): RedirectResponse
    {
        $this->authorizeStaff($request);
        $record = NotificationDelivery::query()->where('organization_id', $request->user()->organization_id)->findOrFail($delivery);
        abort_unless($record->channel === 'email' && $record->status === 'failed', 422, 'Only failed email deliveries can be resent.');
        $notification = Notification::query()->where('organization_id', $record->organization_id)->where('user_id', $record->user_id)->where('dedupe_key', $record->dedupe_key)->first();
        $record->update(['status' => 'queued', 'last_error' => null]);
        DeliverEmailNotification::dispatch($record->organization_id, $record->user_id, $record->type, $notification?->title ?: 'School notification', $notification?->body ?: 'You have a new school notification.', $record->dedupe_key, ['en' => ['title' => $notification?->title ?: 'School notification', 'body' => $notification?->body ?: 'You have a new school notification.']]);
        $audit->record('notification.email_resent', $record, metadata: ['previous_status' => 'failed', 'delivery_id' => $record->id]);

        return back()->with('success', 'Email delivery queued again.');
    }

    private function authorizeStaff(Request $request): void
    {
        abort_unless($request->user()->organization_id !== null && ($request->user()->hasRole('organization_admin') || $request->user()->hasRole('school_admin') || $request->user()->hasRole('finance_staff')), 403);
    }
}
