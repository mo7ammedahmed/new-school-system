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
 * @property string $name
 * @property string|null $description
 * @property int $amount_minor
 * @property string $currency
 * @property string $frequency
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class FeeStructure extends Model
{
    use Tenantable;

    protected $fillable = ['organization_id', 'school_id', 'name', 'description', 'amount_minor', 'currency', 'frequency', 'is_active'];

    protected $casts = ['amount_minor' => 'integer', 'is_active' => 'boolean'];

    /**
     * @return BelongsTo<School, $this>
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }
}
