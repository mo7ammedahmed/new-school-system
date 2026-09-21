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
 * @property int $section_id
 * @property int $student_id
 * @property int $teacher_id
 * @property string $title
 * @property float $score
 * @property float $max_score
 * @property CarbonImmutable|null $assessed_on
 * @property string|null $comment
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class Assessment extends Model
{
    use Tenantable;

    protected $fillable = ['organization_id', 'school_id', 'section_id', 'student_id', 'teacher_id', 'title', 'score', 'max_score', 'assessed_on', 'comment'];

    protected $casts = ['score' => 'decimal:2', 'max_score' => 'decimal:2', 'assessed_on' => 'date'];

    /**
     * @return BelongsTo<Section, $this>
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    /**
     * @return BelongsTo<Student, $this>
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}
