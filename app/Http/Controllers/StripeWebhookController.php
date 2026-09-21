<?php

namespace App\Http\Controllers;

use App\Jobs\DeliverInAppNotification;
use App\Models\Installment;
use App\Models\Organization;
use App\Models\PaymentIntent;
use App\Models\Receipt;
use App\Services\AuditLogger;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StripeWebhookController
{
    public function __invoke(Request $request, AuditLogger $audit): Response
    {
        $payload = $request->getContent();
        $signature = (string) $request->header('Stripe-Signature');
        $secret = config('services.stripe.webhook_secret');
        if (empty($secret)) {
            Log::critical('Stripe webhook secret is missing.');

            return response()->noContent()->setStatusCode(503);
        }
        abort_unless($this->validSignature($payload, $signature), 400, 'Invalid Stripe signature.');
        $event = json_decode($payload, true);
        abort_unless(is_array($event) && isset($event['id'], $event['type'], $event['data']['object']), 400, 'Invalid Stripe event.');

        $webhook = DB::transaction(function () use ($event, $payload): ?object {
            $row = DB::table('payment_webhook_events')
                ->where('provider', 'stripe')
                ->where('event_id', $event['id'])
                ->lockForUpdate()
                ->first();

            if ($row === null) {
                try {
                    DB::table('payment_webhook_events')->insert([
                        'provider' => 'stripe',
                        'event_id' => $event['id'],
                        'event_type' => $event['type'],
                        'payload' => $payload,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                } catch (UniqueConstraintViolationException) {
                }
                $row = DB::table('payment_webhook_events')
                    ->where('provider', 'stripe')
                    ->where('event_id', $event['id'])
                    ->lockForUpdate()
                    ->first();
            }

            return $row;
        });

        if ($webhook === null || $webhook->processed_at !== null) {
            return response()->noContent();
        }

        $object = $event['data']['object'];
        $providerIntentId = $object['id'] ?? null;
        $intent = PaymentIntent::query()->withoutGlobalScopes()->where('provider', 'stripe')->where('provider_intent_id', $providerIntentId)->first();
        if (! $intent) {
            DB::table('payment_webhook_events')->where('id', $webhook->id)->update(['processed_at' => now()]);

            return response()->noContent();
        }

        $receipt = null;
        $amountMismatch = false;
        DB::transaction(function () use ($event, $object, $intent, $webhook, $audit, &$receipt, &$amountMismatch): void {
            $intent = PaymentIntent::query()->withoutGlobalScopes()->lockForUpdate()->findOrFail($intent->id);
            if ($event['type'] === 'payment_intent.succeeded') {
                $webhookAmount = (int) ($object['amount'] ?? 0);
                if ($webhookAmount !== 0 && $webhookAmount !== (int) $intent->amount_minor) {
                    Log::error('Stripe webhook amount mismatch', [
                        'expected' => $intent->amount_minor,
                        'received' => $webhookAmount,
                        'payment_intent_id' => $intent->id,
                        'webhook_event_id' => $event['id'],
                    ]);
                    $intent->update([
                        'status' => 'amount_mismatch',
                        'provider_payload' => $object,
                    ]);
                    $amountMismatch = true;
                } else {
                    $intent->update(['status' => 'succeeded', 'provider_payload' => $object]);
                    $installment = Installment::query()->withoutGlobalScopes()->lockForUpdate()->findOrFail($intent->installment_id);
                    $installment->update([
                        'paid_minor' => min($installment->amount_minor, $installment->paid_minor + (int) $intent->amount_minor),
                        'status' => 'paid',
                        'paid_at' => now(),
                    ]);
                    $invoice = $installment->invoice()->withoutGlobalScopes()->lockForUpdate()->firstOrFail();
                    $invoice->update([
                        'status' => $invoice->installments()->withoutGlobalScopes()->where('status', '!=', 'paid')->exists() ? 'partially_paid' : 'paid',
                    ]);
                    $receipt = Receipt::query()->withoutGlobalScopes()->firstOrCreate(
                        ['payment_intent_id' => $intent->id],
                        [
                            'organization_id' => $intent->organization_id,
                            'school_id' => $intent->school_id,
                            'invoice_id' => $intent->invoice_id,
                            'installment_id' => $intent->installment_id,
                            'user_id' => $intent->user_id,
                            'number' => 'RCT-'.$intent->id,
                            'amount_minor' => $intent->amount_minor,
                            'currency' => $intent->currency,
                            'provider' => $intent->provider,
                            'provider_reference' => $intent->provider_intent_id,
                            'issued_at' => now(),
                        ],
                    );
                }
            } elseif ($event['type'] === 'payment_intent.payment_failed') {
                $intent->update(['status' => 'failed', 'provider_payload' => $object]);
            } else {
                $intent->update(['provider_payload' => $object]);
            }
            DB::table('payment_webhook_events')->where('id', $webhook->id)->update(['processed_at' => now()]);
            $audit->record(
                'payment.webhook.processed',
                $intent,
                after: ['event_id' => $event['id'], 'event_type' => $event['type'], 'status' => $intent->status],
                organization: Organization::findOrFail($intent->organization_id),
            );
        });

        if ($amountMismatch) {
            return response()->noContent();
        }

        if ($receipt) {
            DeliverInAppNotification::dispatch(
                $intent->organization_id,
                $intent->user_id,
                'payment.succeeded',
                'Payment received',
                "Payment {$receipt->number} was received successfully.",
                ['receipt_id' => $receipt->id, 'installment_id' => $intent->installment_id],
                'payment:'.$intent->id.':succeeded',
                [
                    'en' => ['title' => 'Payment received', 'body' => "Payment {$receipt->number} was received successfully."],
                    'ar' => ['title' => 'تم استلام الدفقة', 'body' => "تم استلام الدفقة بنجاح. رقم الإيصال {$receipt->number}."],
                ],
            );
        }

        return response()->noContent();
    }

    private function validSignature(string $payload, string $header): bool
    {
        $secret = (string) config('services.stripe.webhook_secret');
        if (empty($secret)) {
            return false;
        }

        $parts = explode(',', $header);
        $timestamp = null;
        $signatures = [];
        foreach ($parts as $part) {
            $part = trim($part);
            if (str_starts_with($part, 't=')) {
                $timestamp = (int) substr($part, 2);
            } elseif (str_starts_with($part, 'v1=')) {
                $signatures[] = substr($part, 3);
            }
        }

        if ($timestamp === null || abs(time() - $timestamp) > 300) {
            return false;
        }

        foreach ($signatures as $signature) {
            $expected = hash_hmac('sha256', $timestamp.'.'.$payload, $secret);
            if (hash_equals($expected, (string) $signature)) {
                return true;
            }
        }

        return false;
    }
}
