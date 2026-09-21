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
 * @property int|null $student_id
 * @property string $status
 * @property string $guardian_name
 * @property string $guardian_email
 * @property string $guardian_phone
 * @property string $student_name
 * @property CarbonImmutable $student_date_of_birth
 * @property string|null $message
 * @property string $locale
 * @property CarbonImmutable $submitted_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class Application extends Model
{
    use Tenantable;

    protected $fillable = [
        'organization_id',
        'school_id',
        'student_id',
        'status',
        'guardian_name',
        'guardian_email',
        'guardian_phone',
        'student_name',
        'student_date_of_birth',
        'message',
        'locale',
        'submitted_at',
    ];

    protected $casts = [
        'student_date_of_birth' => 'date',
        'submitted_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<School, $this>
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * @return BelongsTo<Organization, $this>
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * @return BelongsTo<Student, $this>
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function transitionTo(string $status): void
    {
        if (! in_array($status, ['pending', 'reviewing', 'accepted', 'rejected', 'withdrawn'], true)) {
            throw new \InvalidArgumentException('Unsupported application status.');
        }

        $this->update(['status' => $status]);
    }
}
