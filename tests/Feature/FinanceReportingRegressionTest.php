<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Guardian;
use App\Models\Installment;
use App\Models\Invoice;
use App\Models\Organization;
use App\Models\Receipt;
use App\Models\School;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinanceReportingRegressionTest extends TestCase
{
    use RefreshDatabase;

    public function test_guardian_can_download_linked_receipt_and_receipt_content_is_printable(): void
    {
        [$organization, $school, $student, $invoice, $installment] = $this->invoiceFixture();
        $user = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::Guardian]);
        $guardian = Guardian::create(['organization_id' => $organization->id, 'user_id' => $user->id, 'name' => 'Guardian', 'email' => 'guardian@example.com']);
        $guardian->students()->attach($student->id, ['organization_id' => $organization->id, 'relationship' => 'parent', 'is_primary' => true]);
        $receipt = Receipt::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'invoice_id' => $invoice->id, 'installment_id' => $installment->id, 'user_id' => $user->id, 'number' => 'RCT-REG-1', 'amount_minor' => 400, 'currency' => 'SAR', 'provider' => 'manual', 'provider_reference' => 'manual-reg-1', 'issued_at' => now()]);

        $response = $this->actingAs($user)->get(route('guardian.receipts.download', $receipt));

        $response->assertOk()->assertHeader('Content-Type', 'text/html; charset=UTF-8')->assertHeader('Content-Disposition');
        $this->assertStringContainsString('RCT-REG-1', $response->streamedContent());
        $this->assertStringContainsString('4.00 SAR', $response->streamedContent());
    }

    public function test_guardian_cannot_download_receipt_for_unlinked_student(): void
    {
        [$organization, $school, $student, $invoice, $installment] = $this->invoiceFixture();
        $user = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::Guardian]);
        Guardian::create(['organization_id' => $organization->id, 'user_id' => $user->id, 'name' => 'Guardian', 'email' => 'guardian@example.com']);
        $receipt = Receipt::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'invoice_id' => $invoice->id, 'installment_id' => $installment->id, 'user_id' => $user->id, 'number' => 'RCT-REG-2', 'amount_minor' => 400, 'currency' => 'SAR', 'provider' => 'manual', 'provider_reference' => 'manual-reg-2', 'issued_at' => now()]);

        $this->actingAs($user)->get(route('guardian.receipts.download', $receipt))->assertForbidden();
    }

    public function test_finance_report_counts_only_remaining_partial_installment_balance(): void
    {
        [$organization, $school, $student, $invoice, $installment] = $this->invoiceFixture();
        $staff = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::FinanceStaff]);
        $installment->update(['paid_minor' => 400, 'status' => 'partially_paid']);

        $this->actingAs($staff)->get(route('admin.reports.finance', $school))->assertOk()->assertInertia(fn ($page) => $page->where('summary.outstandingMinor', 600)->where('rows.0.outstandingMinor', 600)->where('rows.0.status', 'partially_paid'));
    }

    public function test_finance_report_excludes_paid_installments_from_open_rows(): void
    {
        [$organization, $school, $student, $invoice, $installment] = $this->invoiceFixture();
        $staff = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::FinanceStaff]);
        $installment->update(['paid_minor' => 1000, 'status' => 'paid']);

        $this->actingAs($staff)->get(route('admin.reports.finance', $school))->assertOk()->assertInertia(fn ($page) => $page->where('summary.outstandingMinor', 0)->where('rows', []));
    }

    private function invoiceFixture(): array
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $student = Student::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_number' => 'R-1', 'first_name' => 'Report', 'last_name' => 'Student', 'status' => 'active']);
        $invoice = Invoice::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_id' => $student->id, 'issued_by' => null, 'number' => 'INV-REG', 'issued_on' => '2026-09-16', 'due_on' => '2026-09-16', 'status' => 'issued', 'currency' => 'SAR', 'subtotal_minor' => 1000, 'total_minor' => 1000, 'items' => []]);
        $installment = Installment::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'invoice_id' => $invoice->id, 'sequence' => 1, 'due_on' => '2026-09-16', 'amount_minor' => 1000, 'paid_minor' => 0, 'status' => 'pending']);

        return [$organization, $school, $student, $invoice, $installment];
    }
}
