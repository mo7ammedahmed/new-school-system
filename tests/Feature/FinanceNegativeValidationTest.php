<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\FeeStructure;
use App\Models\Guardian;
use App\Models\Installment;
use App\Models\Invoice;
use App\Models\Organization;
use App\Models\School;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinanceNegativeValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_invoice_rejects_installment_count_outside_one_to_twelve(): void
    {
        [$organization, $school, $staff, $student, $fee] = $this->invoiceFixture();
        foreach ([0, 13] as $count) {
            $this->actingAs($staff)->post(route('admin.finance.invoices.store', $school), ['student_id' => $student->id, 'fee_structure_id' => $fee->id, 'issued_on' => '2026-09-16', 'due_on' => '2026-09-16', 'installment_count' => $count])->assertSessionHasErrors('installment_count');
        }
        $this->assertDatabaseCount('invoices', 0);
    }

    public function test_invoice_rejects_due_date_before_issue_date(): void
    {
        [, $school, $staff, $student, $fee] = $this->invoiceFixture();
        $this->actingAs($staff)->post(route('admin.finance.invoices.store', $school), ['student_id' => $student->id, 'fee_structure_id' => $fee->id, 'issued_on' => '2026-09-17', 'due_on' => '2026-09-16', 'installment_count' => 1])->assertSessionHasErrors('due_on');
    }

    public function test_manual_match_rejects_negative_and_overpayment(): void
    {
        [$organization, $school, $staff, $student] = $this->paymentFixture();
        $invoice = Invoice::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_id' => $student->id, 'issued_by' => $staff->id, 'number' => 'INV-N', 'issued_on' => '2026-09-16', 'due_on' => '2026-09-16', 'status' => 'issued', 'currency' => 'SAR', 'subtotal_minor' => 1000, 'total_minor' => 1000, 'items' => []]);
        $installment = Installment::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'invoice_id' => $invoice->id, 'sequence' => 1, 'due_on' => '2026-09-16', 'amount_minor' => 1000, 'paid_minor' => 0, 'status' => 'pending']);
        $this->actingAs($staff)->post(route('admin.finance.installments.manual-payment', $installment), ['amount_minor' => 0, 'reference' => 'bad'])->assertSessionHasErrors('amount_minor');
        $this->actingAs($staff)->post(route('admin.finance.installments.manual-payment', $installment), ['amount_minor' => 1001, 'reference' => 'too-much'])->assertStatus(422);
        $this->assertDatabaseCount('receipts', 0);
    }

    public function test_guardian_idempotency_key_cannot_move_between_installments(): void
    {
        [$organization, $school, $guardianUser, $student] = $this->paymentFixture(true);
        $guardian = Guardian::create(['organization_id' => $organization->id, 'user_id' => $guardianUser->id, 'name' => 'Guardian', 'email' => 'guardian@example.com']);
        $guardian->students()->attach($student->id, ['organization_id' => $organization->id, 'relationship' => 'parent', 'is_primary' => true]);
        $invoice = Invoice::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_id' => $student->id, 'issued_by' => $guardianUser->id, 'number' => 'INV-I', 'issued_on' => '2026-09-16', 'due_on' => '2026-09-16', 'status' => 'issued', 'currency' => 'SAR', 'subtotal_minor' => 2000, 'total_minor' => 2000, 'items' => []]);
        $first = Installment::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'invoice_id' => $invoice->id, 'sequence' => 1, 'due_on' => '2026-09-16', 'amount_minor' => 1000, 'paid_minor' => 0, 'status' => 'pending']);
        $second = Installment::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'invoice_id' => $invoice->id, 'sequence' => 2, 'due_on' => '2026-10-16', 'amount_minor' => 1000, 'paid_minor' => 0, 'status' => 'pending']);
        $this->actingAs($guardianUser)->post(route('guardian.payment-intents.store', $first), ['idempotency_key' => 'reused-key'])->assertRedirect();
        $this->actingAs($guardianUser)->post(route('guardian.payment-intents.store', $second), ['idempotency_key' => 'reused-key'])->assertStatus(409);
    }

    private function invoiceFixture(): array
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $staff = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::FinanceStaff]);
        $student = Student::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_number' => 'N-1', 'first_name' => 'Test', 'last_name' => 'Student', 'status' => 'active']);
        $fee = FeeStructure::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'name' => 'Annual', 'amount_minor' => 1000, 'currency' => 'SAR', 'frequency' => 'annual', 'is_active' => true]);

        return [$organization, $school, $staff, $student, $fee];
    }

    private function paymentFixture(bool $guardian = false): array
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $user = User::factory()->create(['organization_id' => $organization->id, 'role' => $guardian ? UserRole::Guardian : UserRole::FinanceStaff]);
        $student = Student::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_number' => 'P-1', 'first_name' => 'Pay', 'last_name' => 'Student', 'status' => 'active']);

        return [$organization, $school, $user, $student];
    }
}
