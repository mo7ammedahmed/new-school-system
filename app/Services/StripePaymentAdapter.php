<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class StripePaymentAdapter
{
    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>|null
     */
    public function create(array $attributes): ?array
    {
        $secret = config('services.stripe.secret');
        if (! is_string($secret) || $secret === '') {
            return null;
        }

        $response = Http::asForm()->withToken($secret)->withHeaders(['Idempotency-Key' => $attributes['idempotency_key']])->post('https://api.stripe.com/v1/payment_intents', [
            'amount' => $attributes['amount_minor'],
            'currency' => strtolower($attributes['currency']),
            'metadata[organization_id]' => $attributes['organization_id'],
            'metadata[invoice_id]' => $attributes['invoice_id'],
            'metadata[installment_id]' => $attributes['installment_id'],
            'metadata[user_id]' => $attributes['user_id'],
        ])->throw();

        return $response->json();
    }
}
