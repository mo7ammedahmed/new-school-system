<?php

namespace App\Models;

use App\Concerns\Tenantable;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $school_id
 * @property int $organization_id
 * @property string $name
 * @property string $slug
 * @property array<string, mixed> $settings
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class Branch extends Model
{
    use Tenantable;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'school_id',
        'organization_id',
        'name',
        'slug',
        'settings',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'settings' => 'array',
    ];

    /**
     * Get the school that owns the branch.
     *
     * @return BelongsTo<School, $this>
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the branch's display name.
     *
     * @return Attribute<string, string>
     */
    public function name(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => ucwords($value),
        );
    }
}
