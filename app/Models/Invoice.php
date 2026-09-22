<?php

namespace App\Models;

use App\Concerns\Tenantable;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations.HasMany;

/**
 * @property int $id
 * @property int $organization_id
 * @property int $school_id
 * @property int $student_id
 * @property int $issued_by
 * @property string $number
 * @property CarbonImmutable|null $issued_on
 * @property CarbonImmutable|null $due_on
 * @property string $status
 * @property string $currency
 * @property int $subtotal_minor
 * @property int $total_minor
 * @property array<string, mixed> $items
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class Invoice extends Model
{
    use Tenantable;

    protected $fillable = ['organization_id', 'school_id', 'student_id', 'issued_by', 'number', 'issued_on', 'due_on', 'status', 'currency', 'subtotal_minor', 'total_minor', 'items'];

    protected $casts = ['issued_on' => 'date', 'due_on' => 'date', 'subtotal_minor' => 'integer', 'total_minor' => 'integer', 'items' => 'array'];

    /**
     * @return BelongsTo<School, $this>
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
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
    public function issuer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    /**
     * @return HasMany<Installment, $this>
     */
    public function installments(): HasMany
    {
        return $this->hasMany(Installment::class);
    }

    /**
     * @return HasMany<Payment, $this>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
