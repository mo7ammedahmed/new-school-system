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
 * @property int $user_id
 * @property string $provider
 * @property string $provider_intent_id
 * @property string $idempotency_key
 * @property int $amount_minor
 * @property string $currency
 * @property string $status
 * @property array<string, mixed> $provider_payload
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class PaymentIntent extends Model
{
    use Tenantable;

    protected $fillable = ['organization_id', 'school_id', 'invoice_id', 'installment_id', 'user_id', 'provider', 'provider_intent_id', 'idempotency_key', 'amount_minor', 'currency', 'status', 'provider_payload'];

    protected $casts = ['amount_minor' => 'integer', 'provider_payload' => 'array'];

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
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
