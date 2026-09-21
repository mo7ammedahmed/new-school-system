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
 * @property int $exam_schedule_id
 * @property int $class_id
 * @property int $section_id
 * @property int $subject_id
 * @property CarbonImmutable $exam_date
 * @property string $starts_at
 * @property string $ends_at
 * @property string|null $room
 * @property string|null $max_score
 * @property string|null $instructions
 * @property string|null $batch_uuid
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class ExamPaper extends Model
{
    use Tenantable;

    protected $fillable = [
        'organization_id',
        'school_id',
        'exam_schedule_id',
        'class_id',
        'section_id',
        'subject_id',
        'exam_date',
        'starts_at',
        'ends_at',
        'room',
        'max_score',
        'instructions',
        'batch_uuid',
    ];

    protected $casts = [
        // Y-m-d keeps the stored DATE column free of a time component,
        // so equality filters behave the same on SQLite and MySQL.
        'exam_date' => 'date:Y-m-d',
        'max_score' => 'decimal:2',
    ];

    /**
     * @return BelongsTo<ExamSchedule, $this>
     */
    public function examSchedule(): BelongsTo
    {
        return $this->belongsTo(ExamSchedule::class);
    }

    /**
     * @return BelongsTo<AcademicClass, $this>
     */
    public function academicClass(): BelongsTo
    {
        return $this->belongsTo(AcademicClass::class, 'class_id');
    }

    /**
     * @return BelongsTo<Section, $this>
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    /**
     * @return BelongsTo<Subject, $this>
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * @return HasMany<ExamPaperInvigilator, $this>
     */
    public function invigilators(): HasMany
    {
        return $this->hasMany(ExamPaperInvigilator::class);
    }

    /**
     * A paper is only visible once the exam period it belongs to is published.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeInPublishedPeriod(Builder $query): Builder
    {
        return $query->whereHas('examSchedule', fn (Builder $schedule): Builder => $schedule->published());
    }

    public function weekday(): int
    {
        return $this->exam_date->dayOfWeek;
    }
}
