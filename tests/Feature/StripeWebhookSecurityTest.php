<?php

namespace Tests\Feature;

use App\Models\Installment;
use App\Models\Invoice;
use App\Models\Organization;
use App\Models\PaymentIntent;
use App\Models\School;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class StripeWebhookSecurityTest extends TestCase
{
    use RefreshDatabase;

    private string $secret = 'whsec_test_secret';

    private function sign(string $payload, int $timestamp): string
    {
        return hash_hmac('sha256', $timestamp.'.'.$payload, $this->secret);
    }

    private function setupFinance(): array
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $user = User::factory()->create(['organization_id' => $organization->id]);
        $student = Student::create([
            'organization_id' => $organization->id,
            'school_id' => $school->id,
            'student_number' => 'S-1',
            'first_name' => 'Paying',
            'last_name' => 'Student',
            'status' => 'active',
        ]);
        $invoice = Invoice::create([
            'organization_id' => $organization->id,
            'school_id' => $school->id,
            'student_id' => $student->id,
            'issued_by' => $user->id,
            'number' => 'INV-1',
            'issued_on' => '2026-09-16',
            'due_on' => '2026-09-16',
            'status' => 'issued',
            'currency' => 'SAR',
            'subtotal_minor' => 1000,
            'total_minor' => 1000,
            'items' => [],
        ]);
        $installment = Installment::create([
            'organization_id' => $organization->id,
            'school_id' => $school->id,
            'invoice_id' => $invoice->id,
            'sequence' => 1,
            'due_on' => '2026-09-16',
            'amount_minor' => 1000,
            'paid_minor' => 0,
            'status' => 'pending',
        ]);
        $intent = PaymentIntent::create([
            'organization_id' => $organization->id,
            'school_id' => $school->id,
            'invoice_id' => $invoice->id,
            'installment_id' => $installment->id,
            'user_id' => $user->id,
            'provider' => 'stripe',
            'provider_intent_id' => 'pi_test',
            'idempotency_key' => 'key-1',
            'amount_minor' => 1000,
            'currency' => 'SAR',
            'status' => 'requires_action',
        ]);

        return ['intent' => $intent, 'installment' => $installment];
    }

    private function webhookCall(string $payload, int $timestamp, string $signature): mixed
    {
        return $this->call(
            'POST',
            route('webhooks.stripe'),
            [],
            [],
            [],
            ['HTTP_STRIPE_SIGNATURE' => "t={$timestamp},v1={$signature}", 'CONTENT_TYPE' => 'application/json'],
            $payload,
        );
    }

    public function test_empty_secret_returns_503_and_no_db_change(): void
    {
        config(['services.stripe.webhook_secret' => null]);
        $data = $this->setupFinance();
        $intent = $data['intent'];

        $payload = json_encode(['id' => 'evt_empty_secret', 'type' => 'payment_intent.succeeded', 'data' => ['object' => ['id' => 'pi_test', 'amount' => 1000]]], JSON_THROW_ON_ERROR);
        $timestamp = time();
        $signature = hash_hmac('sha256', $timestamp.'.'.$payload, '');

        Log::spy();

        $this->webhookCall($payload, $timestamp, $signature)
            ->assertStatus(503);

        $this->assertDatabaseHas('payment_intents', ['id' => $intent->id, 'status' => 'requires_action']);
        $this->assertDatabaseCount('receipts', 0);
    }

    public function test_valid_signature_is_accepted(): void
    {
        config(['services.stripe.webhook_secret' => $this->secret]);
        ['intent' => $intent] = $this->setupFinance();

        $payload = json_encode(['id' => 'evt_valid', 'type' => 'payment_intent.succeeded', 'data' => ['object' => ['id' => 'pi_test', 'amount' => 1000]]], JSON_THROW_ON_ERROR);
        $timestamp = time();
        $signature = $this->sign($payload, $timestamp);

        $this->webhookCall($payload, $timestamp, $signature)
            ->assertNoContent();

        $this->assertDatabaseHas('payment_intents', ['id' => $intent->id, 'status' => 'succeeded']);
        $this->assertDatabaseCount('receipts', 1);
    }

    public function test_multiple_v1_signatures_where_only_second_matches(): void
    {
        config(['services.stripe.webhook_secret' => $this->secret]);
        ['intent' => $intent] = $this->setupFinance();

        $payload = json_encode(['id' => 'evt_multi_sig', 'type' => 'payment_intent.succeeded', 'data' => ['object' => ['id' => 'pi_test', 'amount' => 1000]]], JSON_THROW_ON_ERROR);
        $timestamp = time();
        $wrongSig = hash_hmac('sha256', ($timestamp - 100).'.'.$payload, $this->secret);
        $rightSig = $this->sign($payload, $timestamp);

        $this->webhookCall($payload, $timestamp, "{$wrongSig},v1={$rightSig}")
            ->assertNoContent();

        $this->assertDatabaseHas('payment_intents', ['id' => $intent->id, 'status' => 'succeeded']);
    }

    public function test_stale_timestamp_returns_400(): void
    {
        config(['services.stripe.webhook_secret' => $this->secret]);
        $this->setupFinance();

        $payload = json_encode(['id' => 'evt_stale', 'type' => 'payment_intent.succeeded', 'data' => ['object' => ['id' => 'pi_test', 'amount' => 1000]]], JSON_THROW_ON_ERROR);
        $timestamp = time() - 400;
        $signature = $this->sign($payload, $timestamp);

        $this->webhookCall($payload, $timestamp, $signature)
            ->assertStatus(400);
    }

    public function test_duplicate_webhook_creates_only_one_receipt(): void
    {
        config(['services.stripe.webhook_secret' => $this->secret]);
        $data = $this->setupFinance();
        $intent = $data['intent'];
        $installment = $data['installment'];

        $payload = json_encode(['id' => 'evt_dup', 'type' => 'payment_intent.succeeded', 'data' => ['object' => ['id' => 'pi_test', 'amount' => 1000]]], JSON_THROW_ON_ERROR);
        $timestamp = time();
        $signature = $this->sign($payload, $timestamp);

        $this->webhookCall($payload, $timestamp, $signature)->assertNoContent();
        $this->webhookCall($payload, $timestamp, $signature)->assertNoContent();

        $this->assertDatabaseCount('receipts', 1);
        $this->assertDatabaseHas('payment_intents', ['id' => $intent->id, 'status' => 'succeeded']);
        $this->assertSame(1000, (int) $installment->fresh()->paid_minor);
    }

    public function test_amount_mismatch_does_not_mark_paid_and_is_audited(): void
    {
        config(['services.stripe.webhook_secret' => $this->secret]);
        $data = $this->setupFinance();
        $intent = $data['intent'];

        $payload = json_encode(['id' => 'evt_mismatch', 'type' => 'payment_intent.succeeded', 'data' => ['object' => ['id' => 'pi_test', 'amount' => 500]]], JSON_THROW_ON_ERROR);
        $timestamp = time();
        $signature = $this->sign($payload, $timestamp);

        $this->webhookCall($payload, $timestamp, $signature)
            ->assertNoContent();

        $this->assertDatabaseHas('payment_intents', ['id' => $intent->id, 'status' => 'amount_mismatch']);
        $this->assertDatabaseCount('receipts', 0);
        $this->assertNotNull(DB::table('payment_webhook_events')->where('event_id', 'evt_mismatch')->value('processed_at'));
    }

    public function test_partial_manual_payment_survives_stripe_webhook(): void
    {
        config(['services.stripe.webhook_secret' => $this->secret]);
        $data = $this->setupFinance();
        $installment = $data['installment'];

        DB::table('installments')->whereKey($installment->id)->update(['paid_minor' => 300]);

        $payload = json_encode(['id' => 'evt_partial', 'type' => 'payment_intent.succeeded', 'data' => ['object' => ['id' => 'pi_test', 'amount' => 1000]]], JSON_THROW_ON_ERROR);
        $timestamp = time();
        $signature = $this->sign($payload, $timestamp);

        $this->webhookCall($payload, $timestamp, $signature)
            ->assertNoContent();

        $this->assertSame(1000, (int) $installment->fresh()->paid_minor);
    }
}
