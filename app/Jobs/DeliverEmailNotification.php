<?php

namespace App\Jobs;

use App\Mail\LocalizedNotificationMail;
use App\Models\NotificationDelivery;
use App\Models\NotificationPreference;
use App\Models\Organization;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Throwable;

class DeliverEmailNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly int $organizationId, public readonly int $userId, public readonly string $type, public readonly string $title, public readonly string $body, public readonly string $dedupeKey, /** @var array<string, array{title: string, body: string}> */ public readonly array $translations = []) {}

    public function handle(AuditLogger $audit): void
    {
        $user = User::query()->findOrFail($this->userId);
        if (! $user->email) {
            return;
        }
        $category = explode('.', $this->type)[0];
        $preference = NotificationPreference::query()->withoutGlobalScopes()->where('organization_id', $this->organizationId)->where('user_id', $this->userId)->where('category', $category)->first();
        if ($preference && ! $preference->email_enabled) {
            return;
        }
        $locale = $preference?->locale ?: 'en';
        $title = $this->translations[$locale]['title'] ?? $this->title;
        $body = $this->translations[$locale]['body'] ?? $this->body;
        $delivery = NotificationDelivery::query()->withoutGlobalScopes()->firstOrCreate(['organization_id' => $this->organizationId, 'user_id' => $this->userId, 'channel' => 'email', 'dedupe_key' => $this->dedupeKey], ['type' => $this->type, 'recipient' => $user->email, 'locale' => $locale, 'status' => 'queued']);
        if ($delivery->status === 'sent') {
            return;
        }
        $delivery->increment('attempts');
        try {
            Mail::to($user->email)->send(new LocalizedNotificationMail($title, $body, $locale));
            $delivery->update(['status' => 'sent', 'sent_at' => now(), 'last_error' => null]);
            $audit->record('notification.email_sent', $delivery, after: ['type' => $this->type, 'recipient' => $user->email], organization: Organization::findOrFail($this->organizationId));
        } catch (Throwable $exception) {
            $delivery->update(['status' => 'failed', 'last_error' => mb_substr($exception->getMessage(), 0, 1000)]);
            throw $exception;
        }
    }
}
