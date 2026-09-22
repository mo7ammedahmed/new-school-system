<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'organization_id',
        'school_id',
        'installment_id',
        'invoice_id',
        'received_by',
        'payment_method',
        'reference_number',
        'payment_date',
        'amount_minor',
        'status',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount_minor' => 'integer',
    ];

    public function organization()
    {
        return $this->belongsTo(\App\Models\Organization::class);
    }

    public function school()
    {
        return $this->belongsTo(\App\Models\School::class);
    }

    public function installment()
    {
        return $this->belongsTo(\App\Models\Installment::class);
    }

    public function invoice()
    {
        return $this->belongsTo(\App\Models\Invoice::class);
    }

    public function receivedBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'received_by');
    }
}
