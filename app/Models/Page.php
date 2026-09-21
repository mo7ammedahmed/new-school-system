<?php

namespace App\Models;

use App\Concerns\Tenantable;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $organization_id
 * @property int $school_id
 * @property string $slug
 * @property array<string, string> $title
 * @property array<string, string> $body
 * @property string $status
 * @property CarbonImmutable|null $published_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class Page extends Model
{
    use Tenantable;

    protected $fillable = [
        'organization_id',
        'school_id',
        'slug',
        'title',
        'body',
        'status',
        'published_at',
    ];

    protected $casts = [
        'title' => 'array',
        'body' => 'array',
        'published_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<School, $this>
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public function localizedTitle(?string $locale = null): string
    {
        return $this->localizedValue($this->title, $locale);
    }

    public function localizedBody(?string $locale = null): string
    {
        return $this->localizedValue($this->body, $locale);
    }

    /**
     * A scalar is tolerated: `title`/`body` are json columns, so a row written
     * outside the admin form can legitimately hold one plain string.
     *
     * @param  array<string, string>|string|null  $values
     */
    private function localizedValue(array|string|null $values, ?string $locale): string
    {
        if (! is_array($values)) {
            return (string) $values;
        }

        $locale ??= app()->getLocale();
        $fallback = config('localization.fallback', 'en');

        return (string) ($values[$locale] ?? $values[$fallback] ?? reset($values) ?: '');
    }
}
