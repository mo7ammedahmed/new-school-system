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
 * @property int $exam_paper_id
 * @property int $teacher_id
 * @property string $role
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class ExamPaperInvigilator extends Model
{
    use Tenantable;

    protected $fillable = [
        'organization_id',
        'school_id',
        'exam_paper_id',
        'teacher_id',
        'role',
    ];

    /**
     * @return BelongsTo<ExamPaper, $this>
     */
    public function examPaper(): BelongsTo
    {
        return $this->belongsTo(ExamPaper::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}
