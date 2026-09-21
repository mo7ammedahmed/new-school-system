<?php

namespace App\Http\Controllers;

use App\Models\Installment;
use App\Models\PaymentIntent;
use App\Models\Receipt;
use App\Services\AuditLogger;
use App\Services\StripePaymentAdapter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

class FinanceReconciliationController
{
    public function retry(Request $request, int $paymentIntent, StripePaymentAdapter $stripe, AuditLogger $audit): RedirectResponse
    {
        $previous = PaymentIntent::query()->with('invoice.school')->findOrFail($paymentIntent);
        Gate::authorize('manage-finance', $previous->invoice->school);
        abort_unless($previous->provider === 'stripe' && $previous->status === 'failed', 422, 'Only failed Stripe intents can be retried.');

        $key = 'retry:'.$previous->id.':'.Str::uuid();
        $new = PaymentIntent::query()->create(['organization_id' => $previous->organization_id, 'school_id' => $previous->school_id, 'invoice_id' => $previous->invoice_id, 'installment_id' => $previous->installment_id, 'user_id' => $request->user()->id, 'provider' => 'stripe', 'idempotency_key' => $key, 'amount_minor' => $previous->amount_minor, 'currency' => $previous->currency, 'status' => 'created']);
        $payload = $stripe->create(['amount_minor' => $new->amount_minor, 'currency' => $new->currency, 'organization_id' => $new->organization_id, 'invoice_id' => $new->invoice_id, 'installment_id' => $new->installment_id, 'user_id' => $new->user_id, 'idempotency_key' => $new->idempotency_key]);
        if ($payload) {
            $new->update(['provider_intent_id' => $payload['id'] ?? null, 'status' => 'requires_action', 'provider_payload' => $payload]);
        }
        $audit->record('payment_intent.retried', $new, metadata: ['previous_payment_intent_id' => $previous->id]);

        return back()->with('success', 'A new payment attempt was created.');
    }

    public function manualMatch(Request $request, int $installment, AuditLogger $audit): RedirectResponse
    {
        $data = $request->validate(['amount_minor' => ['required', 'integer', 'min:1'], 'reference' => ['required', 'string', 'max:120']]);
        $part = Installment::query()->with(['invoice.school'])->findOrFail($installment);
        Gate::authorize('manage-finance', $part->invoice->school);
        $remaining = $part->amount_minor - $part->paid_minor;
        abort_if($remaining <= 0, 422, 'This installment is already fully paid.');
        abort_if($data['amount_minor'] > $remaining, 422, 'Manual payment exceeds the outstanding balance.');
        abort_if(Receipt::query()->where('provider', 'manual')->where('provider_reference', $data['reference'])->exists(), 409, 'This payment reference has already been reconciled.');

        DB::transaction(function () use ($data, $part, $request, $audit): void {
            $intent = PaymentIntent::query()->withoutGlobalScopes()->firstOrCreate(
                ['organization_id' => $part->organization_id, 'user_id' => $request->user()->id, 'idempotency_key' => 'manual:'.$data['reference']],
                ['school_id' => $part->school_id, 'invoice_id' => $part->invoice_id, 'installment_id' => $part->id, 'provider' => 'manual', 'provider_intent_id' => $data['reference'], 'amount_minor' => $data['amount_minor'], 'currency' => $part->invoice->currency, 'status' => 'succeeded'],
            );
            abort_if($intent->installment_id !== $part->id, 409, 'This reference was already used for another installment.');
            $locked = Installment::query()->withoutGlobalScopes()->lockForUpdate()->findOrFail($part->id);
            $newPaid = $locked->paid_minor + $data['amount_minor'];
            $locked->update(['paid_minor' => $newPaid, 'status' => $newPaid >= $locked->amount_minor ? 'paid' : 'partially_paid', 'paid_at' => $newPaid >= $locked->amount_minor ? now() : null]);
            $invoice = $locked->invoice()->withoutGlobalScopes()->lockForUpdate()->firstOrFail();
            $invoice->update(['status' => $invoice->installments()->withoutGlobalScopes()->whereColumn('paid_minor', '<', 'amount_minor')->exists() ? 'partially_paid' : 'paid']);
            $receipt = Receipt::query()->withoutGlobalScopes()->firstOrCreate(['payment_intent_id' => $intent->id], ['organization_id' => $intent->organization_id, 'school_id' => $intent->school_id, 'invoice_id' => $intent->invoice_id, 'installment_id' => $intent->installment_id, 'user_id' => $request->user()->id, 'number' => 'RCT-'.$intent->id, 'amount_minor' => $intent->amount_minor, 'currency' => $intent->currency, 'provider' => 'manual', 'provider_reference' => $data['reference'], 'issued_at' => now()]);
            $audit->record('payment.manual_matched', $receipt, metadata: ['installment_id' => $part->id, 'reference' => $data['reference'], 'amount_minor' => $data['amount_minor']]);
        });

        return back()->with('success', 'Manual payment matched and receipt issued.');
    }
}
