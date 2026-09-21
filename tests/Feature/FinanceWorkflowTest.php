<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\FeeStructure;
use App\Models\Guardian;
use App\Models\Installment;
use App\Models\Invoice;
use App\Models\Organization;
use App\Models\PaymentIntent;
use App\Models\School;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinanceWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_finance_staff_issuance_creates_rounding_safe_installments(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $staff = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::FinanceStaff]);
        $student = Student::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_number' => 'S-1', 'first_name' => 'A', 'last_name' => 'Student', 'status' => 'active']);
        $fee = FeeStructure::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'name' => 'Annual', 'amount_minor' => 10001, 'currency' => 'SAR', 'frequency' => 'annual', 'is_active' => true]);

        $this->actingAs($staff)->post(route('admin.finance.invoices.store', $school), ['student_id' => $student->id, 'fee_structure_id' => $fee->id, 'issued_on' => '2026-09-16', 'due_on' => '2026-09-16', 'installment_count' => 3])->assertRedirect();

        $this->assertDatabaseCount('installments', 3);
        $this->assertSame(10001, (int) Installment::query()->sum('amount_minor'));
        $this->assertDatabaseHas('installments', ['sequence' => 1, 'amount_minor' => 3335]);
    }

    public function test_guardian_cannot_create_payment_intent_for_unlinked_student(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $user = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::Guardian]);
        Guardian::create(['organization_id' => $organization->id, 'user_id' => $user->id, 'name' => 'Guardian', 'email' => 'guardian@example.com']);
        $student = Student::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_number' => 'S-2', 'first_name' => 'Other', 'last_name' => 'Student', 'status' => 'active']);
        $invoice = Invoice::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_id' => $student->id, 'issued_by' => $user->id, 'number' => 'INV-2', 'issued_on' => '2026-09-16', 'due_on' => '2026-09-16', 'status' => 'issued', 'currency' => 'SAR', 'subtotal_minor' => 1000, 'total_minor' => 1000, 'items' => []]);
        $installment = Installment::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'invoice_id' => $invoice->id, 'sequence' => 1, 'due_on' => '2026-09-16', 'amount_minor' => 1000, 'paid_minor' => 0, 'status' => 'pending']);

        $this->actingAs($user)->post(route('guardian.payment-intents.store', $installment), ['idempotency_key' => 'guardian-key'])->assertForbidden();
    }

    public function test_duplicate_stripe_webhook_does_not_create_duplicate_receipt(): void
    {
        $secret = 'test-webhook-secret';
        config(['services.stripe.webhook_secret' => $secret]);
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $user = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::Guardian]);
        $student = Student::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_number' => 'S-3', 'first_name' => 'Paying', 'last_name' => 'Student', 'status' => 'active']);
        $invoice = Invoice::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_id' => $student->id, 'issued_by' => $user->id, 'number' => 'INV-3', 'issued_on' => '2026-09-16', 'due_on' => '2026-09-16', 'status' => 'issued', 'currency' => 'SAR', 'subtotal_minor' => 1000, 'total_minor' => 1000, 'items' => []]);
        $installment = Installment::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'invoice_id' => $invoice->id, 'sequence' => 1, 'due_on' => '2026-09-16', 'amount_minor' => 1000, 'paid_minor' => 0, 'status' => 'pending']);
        $intent = PaymentIntent::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'invoice_id' => $invoice->id, 'installment_id' => $installment->id, 'user_id' => $user->id, 'provider' => 'stripe', 'provider_intent_id' => 'pi_test', 'idempotency_key' => 'key-3', 'amount_minor' => 1000, 'currency' => 'SAR', 'status' => 'requires_action']);
        $payload = json_encode(['id' => 'evt_test', 'type' => 'payment_intent.succeeded', 'data' => ['object' => ['id' => 'pi_test', 'amount' => 1000]]], JSON_THROW_ON_ERROR);
        $timestamp = time();
        $signature = hash_hmac('sha256', $timestamp.'.'.$payload, $secret);

        $this->postJson(route('webhooks.stripe'), json_decode($payload, true), ['HTTP_STRIPE_SIGNATURE' => "t={$timestamp},v1={$signature}"])->assertNoContent();
        $this->postJson(route('webhooks.stripe'), json_decode($payload, true), ['HTTP_STRIPE_SIGNATURE' => "t={$timestamp},v1={$signature}"])->assertNoContent();

        $this->assertDatabaseCount('receipts', 1);
        $this->assertDatabaseHas('payment_intents', ['id' => $intent->id, 'status' => 'succeeded']);
    }
}
