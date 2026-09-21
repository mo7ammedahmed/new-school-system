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
 * @property int $student_id
 * @property int $issued_by
 * @property string $term
 * @property array<string, mixed> $enrollment
 * @property array<string, mixed> $attendance
 * @property array<string, mixed> $assessments
 * @property CarbonImmutable|null $issued_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class ReportCardSnapshot extends Model
{
    use Tenantable;

    protected $fillable = ['organization_id', 'school_id', 'student_id', 'issued_by', 'term', 'enrollment', 'attendance', 'assessments', 'issued_at'];

    protected $casts = ['enrollment' => 'array', 'attendance' => 'array', 'assessments' => 'array', 'issued_at' => 'datetime'];

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
    public function issuer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }
}
