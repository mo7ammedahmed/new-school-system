<?php

namespace App\Models;

use App\Concerns\Tenantable;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $organization_id
 * @property int $school_id
 * @property int $bell_schedule_id
 * @property int $number
 * @property string $label_en
 * @property string $label_ar
 * @property string $starts_at
 * @property string $ends_at
 * @property bool $is_break
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class BellPeriod extends Model
{
    use Tenantable;

    protected $fillable = [
        'organization_id',
        'school_id',
        'bell_schedule_id',
        'number',
        'label_en',
        'label_ar',
        'starts_at',
        'ends_at',
        'is_break',
    ];

    /**
     * Times stay plain `HH:MM:SS` strings: TIME columns have no date part and
     * Laravel has no `time` cast (declaring one threw an InvalidCastException
     * on every read).
     */
    protected $casts = [
        'is_break' => 'boolean',
    ];

    /**
     * @return BelongsTo<BellSchedule, $this>
     */
    public function bellSchedule(): BelongsTo
    {
        return $this->belongsTo(BellSchedule::class);
    }

    public function label(string $locale = 'en'): string
    {
        return $locale === 'ar' ? $this->label_ar : $this->label_en;
    }
}
