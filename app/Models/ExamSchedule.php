<?php

namespace App\Models;

use App\Concerns\Tenantable;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $organization_id
 * @property int $school_id
 * @property int $academic_year_id
 * @property string|null $term
 * @property string $title
 * @property string|null $title_ar
 * @property CarbonImmutable $starts_on
 * @property CarbonImmutable $ends_on
 * @property string $status
 * @property int $created_by
 * @property int|null $published_by
 * @property CarbonImmutable|null $published_at
 * @property int $lock_version
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class ExamSchedule extends Model
{
    use Tenantable;

    protected $fillable = [
        'organization_id',
        'school_id',
        'academic_year_id',
        'term',
        'title',
        'title_ar',
        'starts_on',
        'ends_on',
        'status',
        'created_by',
        'published_by',
        'published_at',
        'lock_version',
    ];

    protected $casts = [
        'starts_on' => 'date:Y-m-d',
        'ends_on' => 'date:Y-m-d',
        'published_at' => 'datetime',
        'lock_version' => 'integer',
    ];

    /**
     * @return BelongsTo<School, $this>
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * @return BelongsTo<AcademicYear, $this>
     */
    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function publisher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'published_by');
    }

    /**
     * @return HasMany<ExamPaper, $this>
     */
    public function papers(): HasMany
    {
        return $this->hasMany(ExamPaper::class);
    }

    /**
     * Students, guardians and teachers only ever see published periods.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    public function isEditable(): bool
    {
        return $this->status === 'draft';
    }

    public function title(string $locale = 'en'): string
    {
        return $locale === 'ar' && $this->title_ar !== null ? $this->title_ar : $this->title;
    }
}
