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
 * @property array<int> $working_days
 * @property int $max_exams_per_day_per_section
 * @property int|null $teacher_max_periods_per_day
 * @property int|null $teacher_max_periods_per_week
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class SchoolScheduleSetting extends Model
{
    use Tenantable;

    protected $fillable = [
        'organization_id',
        'school_id',
        'working_days',
        'max_exams_per_day_per_section',
        'teacher_max_periods_per_day',
        'teacher_max_periods_per_week',
    ];

    protected $attributes = [
        'working_days' => '[0,1,2,3,4]',
    ];

    protected $casts = [
        'working_days' => 'array',
        'max_exams_per_day_per_section' => 'integer',
        'teacher_max_periods_per_day' => 'integer',
        'teacher_max_periods_per_week' => 'integer',
    ];

    /**
     * @return BelongsTo<School, $this>
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public static function forSchool(School $school): self
    {
        return static::firstOrCreate(
            ['school_id' => $school->id],
            [
                'organization_id' => $school->organization_id,
                'working_days' => config('schedule.working_days', [0, 1, 2, 3, 4]),
                'max_exams_per_day_per_section' => config('schedule.max_exams_per_day_per_section', 1),
                'teacher_max_periods_per_day' => config('schedule.teacher_max_periods_per_day'),
                'teacher_max_periods_per_week' => config('schedule.teacher_max_periods_per_week'),
            ],
        );
    }
}
