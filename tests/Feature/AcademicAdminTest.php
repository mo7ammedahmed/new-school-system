<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\AcademicClass;
use App\Models\AcademicYear;
use App\Models\AuditLog;
use App\Models\Enrollment;
use App\Models\Organization;
use App\Models\School;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class AcademicAdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_school_admin_can_create_academic_structure_and_assign_a_teacher(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $admin = User::factory()->create();
        $admin->organization_id = $organization->id;
        $admin->role = UserRole::SchoolAdmin;
        $admin->save();
        $teacher = User::factory()->create();
        $teacher->organization_id = $organization->id;
        $teacher->role = UserRole::Teacher;
        $teacher->save();

        $this->actingAs($admin);
        $this->post(route('admin.academics.years.store', $school->id), ['name' => '2026–2027', 'starts_on' => '2026-09-01', 'ends_on' => '2027-06-30'])->assertRedirect();
        $this->post(route('admin.academics.classes.store', $school->id), ['name' => 'Grade 1'])->assertRedirect();
        $class = AcademicClass::query()->firstOrFail();
        $this->post(route('admin.academics.sections.store', $school->id), ['class_id' => $class->id, 'name' => 'A'])->assertRedirect();
        $section = Section::query()->firstOrFail();
        $this->post(route('admin.academics.teacher-assignments.store', $school->id), ['teacher_id' => $teacher->id, 'section_id' => $section->id])->assertRedirect();

        $this->assertDatabaseHas('teacher_assignments', ['teacher_id' => $teacher->id, 'section_id' => $section->id]);
        $this->assertSame(4, AuditLog::query()->count());
        $this->assertDatabaseHas('academic_years', ['school_id' => $school->id]);
    }

    public function test_teacher_cannot_use_the_academic_administration_routes(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $teacher = User::factory()->create();
        $teacher->organization_id = $organization->id;
        $teacher->role = UserRole::Teacher;
        $teacher->save();

        $this->actingAs($teacher)->get(route('admin.academics.index', $school->id))->assertForbidden();
    }

    public function test_linking_a_student_account_through_the_admin_page_gives_the_student_their_own_dashboard(): void
    {
        $context = $this->schoolWithOneSection();

        $student = Student::create([
            'organization_id' => $context['organization']->id,
            'school_id' => $context['school']->id,
            'student_number' => 'S-001',
            'first_name' => 'Pupil',
            'last_name' => 'One',
        ]);

        Enrollment::create([
            'organization_id' => $context['organization']->id,
            'school_id' => $context['school']->id,
            'student_id' => $student->id,
            'academic_year_id' => $context['year']->id,
            'class_id' => $context['class']->id,
            'section_id' => $context['section']->id,
            'enrolled_on' => '2026-09-01',
            'status' => 'active',
        ]);

        $account = User::factory()->create([
            'organization_id' => $context['organization']->id,
            'role' => UserRole::Student,
            'name' => 'Pupil Login',
        ]);

        // The existing admin surface offers the unlinked login and shows that
        // the record is not bound yet.
        $this->actingAs($context['admin'])
            ->get(route('admin.academics.index', $context['school']->id))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('studentAccounts', 1)
                ->where('studentAccounts.0.id', $account->id)
                ->has('students', 1)
                ->where('students.0.user_id', null));

        $this->actingAs($context['admin'])
            ->post(route('admin.academics.student-accounts.store', $context['school']->id), [
                'student_id' => $student->id,
                'user_id' => $account->id,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('students', ['id' => $student->id, 'user_id' => $account->id]);
        $this->assertDatabaseHas('audit_logs', ['action' => 'student.account_linked']);

        // Reached only through the product: the student now sees their own record.
        $this->actingAs($account)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('dashboard/student')
                ->where('student.name', 'Pupil One')
                ->where('student.class_name', 'Grade 1')
                ->where('student.section_name', 'A'));

        // And only their own record.
        $this->actingAs($account)->get(route('students.show', $student->id))->assertOk();
    }

    public function test_linking_the_same_account_again_is_a_no_op(): void
    {
        $context = $this->schoolWithOneSection();

        $student = $this->studentRecord($context);
        $account = $this->studentAccount($context);

        foreach (range(1, 2) as $attempt) {
            $this->actingAs($context['admin'])
                ->post(route('admin.academics.student-accounts.store', $context['school']->id), [
                    'student_id' => $student->id,
                    'user_id' => $account->id,
                ])
                ->assertRedirect();
        }

        $this->assertSame(1, AuditLog::query()->where('action', 'student.account_linked')->count());
        $this->assertSame($account->id, $student->fresh()?->user_id);

        // The surface stops offering an account once it is bound.
        $this->actingAs($context['admin'])
            ->get(route('admin.academics.index', $context['school']->id))
            ->assertInertia(fn (AssertableInertia $page) => $page->has('studentAccounts', 0));
    }

    public function test_an_account_cannot_be_bound_to_two_student_records(): void
    {
        $context = $this->schoolWithOneSection();

        $first = $this->studentRecord($context, 'S-001', 'First');
        $second = $this->studentRecord($context, 'S-002', 'Second');
        $account = $this->studentAccount($context);

        $this->actingAs($context['admin'])
            ->post(route('admin.academics.student-accounts.store', $context['school']->id), [
                'student_id' => $first->id,
                'user_id' => $account->id,
            ])
            ->assertRedirect();

        $this->actingAs($context['admin'])
            ->post(route('admin.academics.student-accounts.store', $context['school']->id), [
                'student_id' => $second->id,
                'user_id' => $account->id,
            ])
            ->assertSessionHasErrors('user_id');

        $this->assertNull($second->fresh()?->user_id);
        $this->assertDatabaseCount('students', 2);
    }

    public function test_another_schools_user_cannot_link_accounts_or_read_the_student(): void
    {
        $context = $this->schoolWithOneSection();
        $student = $this->studentRecord($context);

        $outsiderOrganization = Organization::create(['name' => 'Other Org', 'slug' => 'other-org']);
        $outsiderSchool = School::create(['organization_id' => $outsiderOrganization->id, 'name' => 'Other School', 'slug' => 'other-school']);
        $outsiderAdmin = User::factory()->create([
            'organization_id' => $outsiderOrganization->id,
            'role' => UserRole::SchoolAdmin,
        ]);
        $outsiderAccount = User::factory()->create([
            'organization_id' => $outsiderOrganization->id,
            'role' => UserRole::Student,
        ]);

        // Cannot act on the other school's surface at all.
        $this->actingAs($outsiderAdmin)
            ->post(route('admin.academics.student-accounts.store', $context['school']->id), [
                'student_id' => $student->id,
                'user_id' => $outsiderAccount->id,
            ])
            ->assertForbidden();

        // Authorization refuses the mutation outright (403), while the existing
        // academics page resolves the school through the tenant scope and so
        // reports the other tenant's school as missing (404), per DECISIONS.md.
        $this->actingAs($outsiderAdmin)
            ->get(route('admin.academics.index', $context['school']->id))
            ->assertNotFound();

        // Cannot read the record either.
        $this->actingAs($outsiderAdmin)
            ->get(route('students.show', $student->id))
            ->assertNotFound();

        $this->assertNull($student->fresh()?->user_id);

        // And the school's own admin cannot reach across tenants for an account.
        $this->actingAs($context['admin'])
            ->post(route('admin.academics.student-accounts.store', $context['school']->id), [
                'student_id' => $student->id,
                'user_id' => $outsiderAccount->id,
            ])
            ->assertSessionHasErrors('user_id');

        $this->assertNull($student->fresh()?->user_id);
        $this->assertSame('Other School', $outsiderSchool->name);
    }

    /**
     * @return array{organization: Organization, school: School, admin: User, year: AcademicYear, class: AcademicClass, section: Section}
     */
    private function schoolWithOneSection(): array
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'School', 'slug' => 'school']);
        $admin = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => UserRole::SchoolAdmin,
        ]);

        $year = AcademicYear::create([
            'organization_id' => $organization->id,
            'school_id' => $school->id,
            'name' => '2026–2027',
            'starts_on' => '2026-08-30',
            'ends_on' => '2027-06-30',
            'is_current' => true,
        ]);

        $class = AcademicClass::create([
            'organization_id' => $organization->id,
            'school_id' => $school->id,
            'name' => 'Grade 1',
        ]);

        $section = Section::create([
            'organization_id' => $organization->id,
            'school_id' => $school->id,
            'class_id' => $class->id,
            'name' => 'A',
        ]);

        return compact('organization', 'school', 'admin', 'year', 'class', 'section');
    }

    /**
     * @param  array{organization: Organization, school: School, year: AcademicYear, class: AcademicClass, section: Section}  $context
     */
    private function studentRecord(array $context, string $number = 'S-001', string $first = 'Pupil'): Student
    {
        $student = Student::create([
            'organization_id' => $context['organization']->id,
            'school_id' => $context['school']->id,
            'student_number' => $number,
            'first_name' => $first,
            'last_name' => 'One',
        ]);

        Enrollment::create([
            'organization_id' => $context['organization']->id,
            'school_id' => $context['school']->id,
            'student_id' => $student->id,
            'academic_year_id' => $context['year']->id,
            'class_id' => $context['class']->id,
            'section_id' => $context['section']->id,
            'enrolled_on' => '2026-09-01',
            'status' => 'active',
        ]);

        return $student;
    }

    /**
     * @param  array{organization: Organization}  $context
     */
    private function studentAccount(array $context): User
    {
        return User::factory()->create([
            'organization_id' => $context['organization']->id,
            'role' => UserRole::Student,
        ]);
    }
}
