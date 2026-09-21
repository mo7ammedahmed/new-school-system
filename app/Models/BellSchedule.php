<?php

namespace App\Models;

use App\Concerns\Tenantable;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $organization_id
 * @property int $school_id
 * @property string $name
 * @property bool $is_default
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class BellSchedule extends Model
{
    use Tenantable;

    protected $fillable = ['organization_id', 'school_id', 'name', 'is_default'];

    protected $casts = ['is_default' => 'boolean'];

    /**
     * @return BelongsTo<School, $this>
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * @return HasMany<BellPeriod, $this>
     */
    public function bellPeriods(): HasMany
    {
        return $this->hasMany(BellPeriod::class)->orderBy('number');
    }
}
