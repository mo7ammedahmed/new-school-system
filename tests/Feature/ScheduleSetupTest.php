<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\AuditLog;
use App\Models\Organization;
use App\Models\School;
use App\Models\SchoolMembership;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class ScheduleSetupTest extends TestCase
{
    use RefreshDatabase;

    private function setupOrganizationWithSchool(string $orgName = 'Org', string $schoolName = 'School'): array
    {
        $org = Organization::factory()->create(['name' => $orgName]);
        $school = School::factory()->create(['organization_id' => $org->id, 'name' => $schoolName]);
        $coordinator = User::factory()->create([
            'organization_id' => $org->id,
            'role' => UserRole::AcademicCoordinator,
        ]);
        SchoolMembership::create([
            'organization_id' => $org->id,
            'school_id' => $school->id,
            'user_id' => $coordinator->id,
        ]);

        $teacher = User::factory()->create([
            'organization_id' => $org->id,
            'role' => UserRole::Teacher,
        ]);

        return [$org, $school, $coordinator, $teacher];
    }

    public function test_coordinator_can_view_setup_page(): void
    {
        [$org, $school, $coordinator] = $this->setupOrganizationWithSchool();

        $this->actingAs($coordinator)
            ->get(route('admin.schedule.setup.index', $school->id))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->has('school'));
    }

    public function test_coordinator_can_create_subject(): void
    {
        [$org, $school, $coordinator] = $this->setupOrganizationWithSchool();

        $this->actingAs($coordinator)
            ->post(route('admin.schedule.setup.subjects.store', $school->id), [
                'code' => 'MATH',
                'name_en' => 'Mathematics',
                'name_ar' => 'الرياضيات',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('subjects', [
            'school_id' => $school->id,
            'organization_id' => $org->id,
            'code' => 'MATH',
            'name_en' => 'Mathematics',
        ]);

        $this->assertSame(1, AuditLog::query()->where('action', 'schedule.subject_created')->count());
    }

    public function test_coordinator_can_update_subject(): void
    {
        [$org, $school, $coordinator] = $this->setupOrganizationWithSchool();

        $subject = Subject::create([
            'organization_id' => $org->id,
            'school_id' => $school->id,
            'code' => 'MATH',
            'name_en' => 'Mathematics',
            'name_ar' => 'الرياضيات',
        ]);

        $this->actingAs($coordinator)
            ->put(route('admin.schedule.setup.subjects.update', [$school->id, $subject->id]), [
                'code' => 'MATH101',
                'name_en' => 'Advanced Mathematics',
                'name_ar' => 'الرياضيات المتقدمة',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('subjects', [
            'id' => $subject->id,
            'code' => 'MATH101',
            'name_en' => 'Advanced Mathematics',
        ]);
    }

    public function test_coordinator_can_deactivate_subject(): void
    {
        [$org, $school, $coordinator] = $this->setupOrganizationWithSchool();

        $subject = Subject::create([
            'organization_id' => $org->id,
            'school_id' => $school->id,
            'code' => 'SCI',
            'name_en' => 'Science',
            'name_ar' => 'العلوم',
            'is_active' => true,
        ]);

        $this->actingAs($coordinator)
            ->post(route('admin.schedule.setup.subjects.deactivate', [$school->id, $subject->id]))
            ->assertRedirect();

        $this->assertDatabaseHas('subjects', [
            'id' => $subject->id,
            'is_active' => false,
        ]);
    }

    public function test_teacher_cannot_access_setup(): void
    {
        [$org, $school, $coordinator, $teacher] = $this->setupOrganizationWithSchool();

        SchoolMembership::create([
            'organization_id' => $org->id,
            'school_id' => $school->id,
            'user_id' => $teacher->id,
        ]);

        $this->actingAs($teacher)
            ->get(route('admin.schedule.setup.index', $school->id))
            ->assertForbidden();
    }

    public function test_user_cannot_create_subject_in_other_org(): void
    {
        [$org1, $school1, $coordinator1] = $this->setupOrganizationWithSchool('Org1', 'School1');
        [$org2, $school2] = [$org1, $school1];
        $school2 = School::factory()->create(['organization_id' => $org1->id, 'name' => 'School2']);

        $this->actingAs($coordinator1)
            ->post(route('admin.schedule.setup.subjects.store', $school2->id), [
                'code' => 'TEST',
                'name_en' => 'Test',
                'name_ar' => 'اختبار',
            ])
            ->assertForbidden();
    }

    public function test_store_subject_validates_required_fields(): void
    {
        [$org, $school, $coordinator] = $this->setupOrganizationWithSchool();

        $this->actingAs($coordinator)
            ->post(route('admin.schedule.setup.subjects.store', $school->id), [
                'code' => '',
                'name_en' => '',
            ])
            ->assertRedirect();

        $this->assertSame(0, Subject::query()->count());
    }
}
