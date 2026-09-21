<?php

namespace App\Models;

use App\Concerns\Tenantable;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $organization_id
 * @property int $user_id
 * @property string $type
 * @property string $title
 * @property string $body
 * @property array<string, mixed> $data
 * @property string $dedupe_key
 * @property CarbonImmutable|null $read_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class Notification extends Model
{
    use Tenantable;

    protected $fillable = ['organization_id', 'user_id', 'type', 'title', 'body', 'data', 'dedupe_key', 'read_at'];

    protected $casts = ['data' => 'array', 'read_at' => 'datetime'];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
