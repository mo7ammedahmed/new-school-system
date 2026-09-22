<?php

namespace App\Models;

use App\Concerns\Tenantable;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $organization_id
 * @property int $school_id
 * @property int $invoice_id
 * @property int $sequence
 * @property CarbonImmutable|null $due_on
 * @property int $amount_minor
 * @property int $paid_minor
 * @property string $status
 * @property CarbonImmutable|null $paid_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class Installment extends Model
{
    use Tenantable;

    protected $fillable = ['organization_id', 'school_id', 'invoice_id', 'sequence', 'due_on', 'amount_minor', 'paid_minor', 'status', 'paid_at'];

    protected $casts = ['due_on' => 'date', 'amount_minor' => 'integer', 'paid_minor' => 'integer', 'paid_at' => 'datetime'];

    /**
     * @return BelongsTo<Invoice, $this>
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * @return BelongsTo<School, $this>
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * @return HasMany<Payment, $this>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
