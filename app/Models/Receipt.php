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
 * @property int $invoice_id
 * @property int $installment_id
 * @property int $payment_intent_id
 * @property int $user_id
 * @property string $number
 * @property int $amount_minor
 * @property string $currency
 * @property string $provider
 * @property string|null $provider_reference
 * @property CarbonImmutable|null $issued_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class Receipt extends Model
{
    use Tenantable;

    protected $fillable = ['organization_id', 'school_id', 'invoice_id', 'installment_id', 'payment_intent_id', 'user_id', 'number', 'amount_minor', 'currency', 'provider', 'provider_reference', 'issued_at'];

    protected $casts = ['amount_minor' => 'integer', 'issued_at' => 'datetime'];

    /**
     * @return BelongsTo<Invoice, $this>
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * @return BelongsTo<Installment, $this>
     */
    public function installment(): BelongsTo
    {
        return $this->belongsTo(Installment::class);
    }

    /**
     * @return BelongsTo<PaymentIntent, $this>
     */
    public function paymentIntent(): BelongsTo
    {
        return $this->belongsTo(PaymentIntent::class);
    }
}
