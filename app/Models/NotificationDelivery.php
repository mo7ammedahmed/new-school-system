<?php

namespace App\Models;

use App\Concerns\Tenantable;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $organization_id
 * @property int $user_id
 * @property string $channel
 * @property string $type
 * @property string $dedupe_key
 * @property string $recipient
 * @property string $locale
 * @property string $status
 * @property int $attempts
 * @property string|null $last_error
 * @property CarbonImmutable|null $sent_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class NotificationDelivery extends Model
{
    use Tenantable;

    protected $fillable = ['organization_id', 'user_id', 'channel', 'type', 'dedupe_key', 'recipient', 'locale', 'status', 'attempts', 'last_error', 'sent_at'];

    protected $casts = ['attempts' => 'integer', 'sent_at' => 'datetime'];
}
