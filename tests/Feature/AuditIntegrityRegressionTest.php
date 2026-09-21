<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Jobs\DeliverInAppNotification;
use App\Models\AuditLog;
use App\Models\Installment;
use App\Models\Invoice;
use App\Models\Organization;
use App\Models\School;
use App\Models\Student;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Foundation\Testing\RefreshDatabase;
use LogicException;
use Tests\TestCase;

class AuditIntegrityRegressionTest extends TestCase
{
    use RefreshDatabase;

    public function test_audit_logs_cannot_be_deleted(): void
    {
        $audit = AuditLog::create(['action' => 'immutable.delete.test']);

        $this->expectException(LogicException::class);
        $audit->delete();
    }

    public function test_queue_notification_audit_keeps_explicit_tenant_attribution_without_actor(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $user = User::factory()->create(['organization_id' => $organization->id]);

        (new DeliverInAppNotification($organization->id, $user->id, 'notice.published', 'Notice', 'Published.', [], 'notice:audit'))->handle(app(AuditLogger::class));

        $audit = AuditLog::query()->withoutGlobalScopes()->where('action', 'notification.dispatched')->latest('id')->firstOrFail();
        $this->assertSame($organization->id, $audit->organization_id);
        $this->assertNull($audit->user_id);
        $this->assertSame(['type' => 'notice.published', 'user_id' => $user->id], $audit->after);
    }

    public function test_manual_payment_creates_audited_event_with_reference_and_amount(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $staff = User::factory()->create(['organization_id' => $organization->id, 'role' => UserRole::FinanceStaff]);
        $student = Student::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_number' => 'AUD-1', 'first_name' => 'Audit', 'last_name' => 'Student', 'status' => 'active']);
        $invoice = Invoice::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'student_id' => $student->id, 'issued_by' => $staff->id, 'number' => 'INV-AUD', 'issued_on' => '2026-09-16', 'due_on' => '2026-09-16', 'status' => 'issued', 'currency' => 'SAR', 'subtotal_minor' => 1000, 'total_minor' => 1000, 'items' => []]);
        $installment = Installment::create(['organization_id' => $organization->id, 'school_id' => $school->id, 'invoice_id' => $invoice->id, 'sequence' => 1, 'due_on' => '2026-09-16', 'amount_minor' => 1000, 'paid_minor' => 0, 'status' => 'pending']);

        $this->actingAs($staff)->post(route('admin.finance.installments.manual-payment', $installment), ['amount_minor' => 1000, 'reference' => 'AUD-REF-1'])->assertRedirect();

        $audit = AuditLog::query()->where('organization_id', $organization->id)->where('action', 'payment.manual_matched')->latest('id')->firstOrFail();
        $this->assertSame($staff->id, $audit->user_id);
        $this->assertSame(['installment_id' => $installment->id, 'reference' => 'AUD-REF-1', 'amount_minor' => 1000], $audit->metadata);
    }
}
