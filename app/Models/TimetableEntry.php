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
 * @property int $timetable_version_id
 * @property int $section_id
 * @property int $subject_id
 * @property int|null $teacher_id
 * @property int $day_of_week
 * @property int $period_number
 * @property string $lesson_type
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class TimetableEntry extends Model
{
    use Tenantable;

    protected $fillable = [
        'organization_id',
        'school_id',
        'timetable_version_id',
        'section_id',
        'subject_id',
        'teacher_id',
        'day_of_week',
        'period_number',
        'lesson_type',
    ];

    /**
     * @return BelongsTo<TimetableVersion, $this>
     */
    public function timetableVersion(): BelongsTo
    {
        return $this->belongsTo(TimetableVersion::class);
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
     * @return BelongsTo<User, $this>
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}
