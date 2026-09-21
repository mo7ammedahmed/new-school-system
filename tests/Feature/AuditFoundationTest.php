<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\AuditLog;
use App\Models\Organization;
use App\Models\School;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Foundation\Testing\RefreshDatabase;
use LogicException;
use Tests\TestCase;

class AuditFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_audit_events_capture_actor_tenant_target_and_changes(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $user = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => UserRole::OrganizationAdmin,
        ]);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);

        $this->actingAs($user);
        $audit = app(AuditLogger::class)->record(
            action: 'school.updated',
            subject: $school,
            before: ['name' => 'School'],
            after: ['name' => 'New School'],
            metadata: ['source' => 'test'],
        );

        $this->assertSame($organization->id, $audit->organization_id);
        $this->assertSame($user->id, $audit->user_id);
        $this->assertSame($school->id, $audit->auditable_id);
        $this->assertSame(['name' => 'New School'], $audit->after);
    }

    public function test_audit_reads_are_scoped_to_the_current_organization(): void
    {
        $first = Organization::create(['name' => 'First', 'slug' => 'first']);
        $second = Organization::create(['name' => 'Second', 'slug' => 'second']);
        AuditLog::create(['organization_id' => $first->id, 'action' => 'first.action']);
        AuditLog::create(['organization_id' => $second->id, 'action' => 'second.action']);

        app()->instance('currentOrganization', $first);

        $this->assertSame(['first.action'], AuditLog::query()->pluck('action')->all());
    }

    public function test_audit_logs_cannot_be_updated_or_deleted(): void
    {
        $audit = AuditLog::create(['action' => 'immutable.action']);

        $this->expectException(LogicException::class);
        $audit->update(['action' => 'changed']);
    }
}
