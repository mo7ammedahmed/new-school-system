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
 * @property string $category
 * @property string $locale
 * @property bool $enabled
 * @property bool $email_enabled
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class NotificationPreference extends Model
{
    use Tenantable;

    protected $fillable = ['organization_id', 'user_id', 'category', 'locale', 'enabled', 'email_enabled'];

    protected $casts = ['enabled' => 'boolean', 'email_enabled' => 'boolean'];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
