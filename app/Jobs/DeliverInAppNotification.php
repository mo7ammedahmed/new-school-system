<?php

namespace App\Jobs;

use App\Models\Notification;
use App\Models\NotificationPreference;
use App\Models\Organization;
use App\Services\AuditLogger;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class DeliverInAppNotification implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $uniqueFor = 86400;

    public function __construct(
        public readonly int $organizationId,
        public readonly int $userId,
        public readonly string $type,
        public readonly string $title,
        public readonly string $body,
        /** @var array<string, mixed> */
        public readonly array $data = [],
        public readonly ?string $dedupeKey = null,
        /** @var array<string, array{title: string, body: string}> */
        public readonly array $translations = [],
    ) {}

    public function uniqueId(): string
    {
        return $this->organizationId.':'.$this->userId.':'.($this->dedupeKey ?: $this->type);
    }

    public function handle(AuditLogger $audit): void
    {
        $category = explode('.', $this->type)[0];
        $preference = NotificationPreference::query()->withoutGlobalScopes()->where('organization_id', $this->organizationId)->where('user_id', $this->userId)->where('category', $category)->first();
        if (in_array($this->type, ['payment.succeeded', 'installment.due_soon', 'installment.overdue'], true)) {
            DeliverEmailNotification::dispatch($this->organizationId, $this->userId, $this->type, $this->title, $this->body, $this->dedupeKey ?: $this->type, $this->translations);
        }
        if ($preference && ! $preference->enabled) {
            $audit->record('notification.skipped', metadata: ['type' => $this->type, 'user_id' => $this->userId, 'reason' => 'preference_disabled'], organization: Organization::findOrFail($this->organizationId));

            return;
        }
        $locale = $preference?->locale ?: 'en';
        $title = $this->translations[$locale]['title'] ?? $this->title;
        $body = $this->translations[$locale]['body'] ?? $this->body;
        $notification = Notification::query()->forOrganization($this->organizationId)->firstOrCreate(
            ['user_id' => $this->userId, 'dedupe_key' => $this->dedupeKey],
            ['organization_id' => $this->organizationId, 'type' => $this->type, 'title' => $title, 'body' => $body, 'data' => $this->data],
        );
        $audit->record('notification.dispatched', $notification, after: ['type' => $this->type, 'user_id' => $this->userId], organization: Organization::findOrFail($this->organizationId));
    }
}
