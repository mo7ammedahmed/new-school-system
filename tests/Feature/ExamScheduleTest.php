<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\AcademicClass;
use App\Models\AcademicYear;
use App\Models\AuditLog;
use App\Models\BellPeriod;
use App\Models\BellSchedule;
use App\Models\ExamPaper;
use App\Models\ExamSchedule;
use App\Models\Organization;
use App\Models\School;
use App\Models\SchoolMembership;
use App\Models\Section;
use App\Models\Subject;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class ExamScheduleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, mixed>
     */
    private function makeSchool(): array
    {
        $org = Organization::factory()->create(['name' => 'Exam Org']);
        $school = School::factory()->create(['organization_id' => $org->id, 'name' => 'Exam School']);

        $admin = User::factory()->create([
            'organization_id' => $org->id,
            'role' => UserRole::SchoolAdmin,
        ]);
        SchoolMembership::create([
            'organization_id' => $org->id,
            'school_id' => $school->id,
            'user_id' => $admin->id,
        ]);

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

        $otherTeacher = User::factory()->create([
            'organization_id' => $org->id,
            'role' => UserRole::Teacher,
        ]);

        $year = AcademicYear::create([
            'organization_id' => $org->id,
            'school_id' => $school->id,
            'name' => '2026-2027',
            'starts_on' => '2026-08-30',
            'ends_on' => '2027-06-30',
            'is_current' => true,
        ]);

        $class = AcademicClass::create([
            'organization_id' => $org->id,
            'school_id' => $school->id,
            'name' => 'Grade 4',
        ]);

        $sectionA = Section::create([
            'organization_id' => $org->id,
            'school_id' => $school->id,
            'class_id' => $class->id,
            'name' => 'A',
        ]);

        $sectionB = Section::create([
            'organization_id' => $org->id,
            'school_id' => $school->id,
            'class_id' => $class->id,
            'name' => 'B',
        ]);

        $math = Subject::create([
            'organization_id' => $org->id,
            'school_id' => $school->id,
            'code' => 'MATH',
            'name_en' => 'Mathematics',
            'name_ar' => 'الرياضيات',
        ]);

        $science = Subject::create([
            'organization_id' => $org->id,
            'school_id' => $school->id,
            'code' => 'SCI',
            'name_en' => 'Science',
            'name_ar' => 'العلوم',
        ]);

        $sunday = CarbonImmutable::parse('2026-09-01')->next(CarbonImmutable::SUNDAY);

        $schedule = ExamSchedule::create([
            'organization_id' => $org->id,
            'school_id' => $school->id,
            'academic_year_id' => $year->id,
            'title' => 'First Term Midterms',
            'title_ar' => 'اختبارات منتصف الفصل الأول',
            'starts_on' => $sunday->toDateString(),
            'ends_on' => $sunday->addDays(20)->toDateString(),
            'created_by' => $admin->id,
        ]);

        return [
            'org' => $org,
            'school' => $school,
            'admin' => $admin,
            'coordinator' => $coordinator,
            'teacher' => $teacher,
            'otherTeacher' => $otherTeacher,
            'year' => $year,
            'class' => $class,
            'sectionA' => $sectionA,
            'sectionB' => $sectionB,
            'math' => $math,
            'science' => $science,
            'schedule' => $schedule,
            'sunday' => $sunday->toDateString(),
            'monday' => $sunday->addDay()->toDateString(),
            'friday' => $sunday->next(CarbonImmutable::FRIDAY)->toDateString(),
        ];
    }

    /**
     * @param  array<string, mixed>  $context
     * @return array<string, mixed>
     */
    private function paperPayload(array $context, array $overrides = []): array
    {
        return array_merge([
            'class_id' => $context['class']->id,
            'section_id' => $context['sectionA']->id,
            'subject_id' => $context['math']->id,
            'exam_date' => $context['sunday'],
            'starts_at' => '08:00',
            'ends_at' => '09:00',
            'room' => 'Hall 1',
        ], $overrides);
    }

    public function test_bell_periods_round_trip_without_an_invalid_cast(): void
    {
        $context = $this->makeSchool();

        $bell = BellSchedule::create([
            'organization_id' => $context['org']->id,
            'school_id' => $context['school']->id,
            'name' => 'Regular day',
            'is_default' => true,
        ]);

        BellPeriod::create([
            'organization_id' => $context['org']->id,
            'school_id' => $context['school']->id,
            'bell_schedule_id' => $bell->id,
            'number' => 1,
            'label_en' => 'Period 1',
            'label_ar' => 'الحصة 1',
            'starts_at' => '07:30',
            'ends_at' => '08:15',
            'is_break' => false,
        ]);

        $period = $bell->bellPeriods()->firstOrFail();

        $this->assertSame('07:30', substr($period->starts_at, 0, 5));
        $this->assertSame('08:15', substr($period->ends_at, 0, 5));
        $this->assertFalse($period->is_break);
    }

    public function test_coordinator_can_open_exams_page(): void
    {
        $context = $this->makeSchool();

        $this->actingAs($context['coordinator'])
            ->get(route('admin.schedule.exams.index', $context['school']->id))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('admin/schedule/exams/index')
                ->has('school')
                ->has('academicYears'));
    }

    public function test_coordinator_can_create_exam_period(): void
    {
        $context = $this->makeSchool();

        $this->actingAs($context['coordinator'])
            ->post(route('admin.schedule.exams.store', $context['school']->id), [
                'academic_year_id' => $context['year']->id,
                'title' => 'Second Term Finals',
                'title_ar' => 'اختبارات الفصل الثاني',
                'term' => 'T2',
                'starts_on' => $context['sunday'],
                'ends_on' => $context['monday'],
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('exam_schedules', [
            'school_id' => $context['school']->id,
            'title' => 'Second Term Finals',
            'status' => 'draft',
        ]);

        $this->assertSame(1, AuditLog::query()->where('action', 'exam.schedule_created')->count());
    }

    public function test_teacher_cannot_open_or_write_exam_admin(): void
    {
        $context = $this->makeSchool();

        $this->actingAs($context['teacher'])
            ->get(route('admin.schedule.exams.index', $context['school']->id))
            ->assertForbidden();

        $this->actingAs($context['teacher'])
            ->post(route('admin.schedule.exams.papers.store', [
                $context['school']->id,
                $context['schedule']->id,
            ]), $this->paperPayload($context))
            ->assertForbidden();

        $this->assertSame(0, ExamPaper::query()->count());
    }

    public function test_user_from_another_organization_cannot_reach_exam_period(): void
    {
        $context = $this->makeSchool();

        $otherOrg = Organization::factory()->create();
        $outsider = User::factory()->create([
            'organization_id' => $otherOrg->id,
            'role' => UserRole::SchoolAdmin,
        ]);

        // Cross-tenant lookups return 404 rather than 403 so the existence of
        // another organization's records is never disclosed.
        $this->actingAs($outsider)
            ->get(route('admin.schedule.exams.show', [$context['school']->id, $context['schedule']->id]))
            ->assertNotFound();
    }

    public function test_paper_outside_the_exam_window_is_rejected(): void
    {
        $context = $this->makeSchool();

        $response = $this->actingAs($context['coordinator'])
            ->postJson(route('admin.schedule.exams.papers.store', [
                $context['school']->id,
                $context['schedule']->id,
            ]), $this->paperPayload($context, [
                'exam_date' => CarbonImmutable::parse($context['sunday'])->subWeek()->toDateString(),
            ]));

        $response->assertStatus(422);
        $this->assertSame('EXAM_OUTSIDE_WINDOW', $response->json('conflicts.0.code'));
        $this->assertSame(0, ExamPaper::query()->count());
    }

    public function test_inertia_form_gets_translatable_conflict_codes_in_the_session(): void
    {
        $context = $this->makeSchool();

        $this->actingAs($context['coordinator'])
            ->post(route('admin.schedule.exams.papers.store', [
                $context['school']->id,
                $context['schedule']->id,
            ]), $this->paperPayload($context, ['exam_date' => $context['friday']]))
            ->assertRedirect()
            ->assertSessionHasErrors('conflicts')
            ->assertSessionHas('conflicts', fn ($conflicts): bool => is_array($conflicts)
                && ($conflicts[0]['code'] ?? null) === 'EXAM_NON_WORKING_DAY');

        $this->assertSame(0, ExamPaper::query()->count());
    }

    public function test_paper_on_a_non_working_day_is_rejected(): void
    {
        $context = $this->makeSchool();

        $response = $this->actingAs($context['coordinator'])
            ->postJson(route('admin.schedule.exams.papers.store', [
                $context['school']->id,
                $context['schedule']->id,
            ]), $this->paperPayload($context, ['exam_date' => $context['friday']]));

        $response->assertStatus(422);
        $this->assertSame('EXAM_NON_WORKING_DAY', $response->json('conflicts.0.code'));
    }

    public function test_a_section_cannot_sit_two_papers_on_the_same_day(): void
    {
        $context = $this->makeSchool();

        $this->actingAs($context['coordinator'])
            ->post(route('admin.schedule.exams.papers.store', [
                $context['school']->id,
                $context['schedule']->id,
            ]), $this->paperPayload($context))
            ->assertRedirect();

        $response = $this->actingAs($context['coordinator'])
            ->postJson(route('admin.schedule.exams.papers.store', [
                $context['school']->id,
                $context['schedule']->id,
            ]), $this->paperPayload($context, [
                'subject_id' => $context['science']->id,
                'starts_at' => '10:00',
                'ends_at' => '11:00',
            ]));

        $response->assertStatus(422);
        $this->assertSame('SECTION_TOO_MANY_PAPERS_PER_DAY', $response->json('conflicts.0.code'));
        $this->assertSame(1, ExamPaper::query()->count());
    }

    public function test_section_time_overlap_is_rejected(): void
    {
        $context = $this->makeSchool();
        config()->set('schedule.max_exams_per_day_per_section', 3);

        $this->actingAs($context['coordinator'])
            ->post(route('admin.schedule.exams.papers.store', [
                $context['school']->id,
                $context['schedule']->id,
            ]), $this->paperPayload($context, ['room' => null]))
            ->assertRedirect();

        $response = $this->actingAs($context['coordinator'])
            ->postJson(route('admin.schedule.exams.papers.store', [
                $context['school']->id,
                $context['schedule']->id,
            ]), $this->paperPayload($context, [
                'subject_id' => $context['science']->id,
                'starts_at' => '08:30',
                'ends_at' => '09:30',
                'room' => null,
            ]));

        $response->assertStatus(422);
        $this->assertContains('SECTION_TIME_OVERLAP', array_column($response->json('conflicts'), 'code'));
    }

    public function test_invigilator_double_booking_is_rejected(): void
    {
        $context = $this->makeSchool();

        $this->actingAs($context['coordinator'])
            ->post(route('admin.schedule.exams.papers.store', [
                $context['school']->id,
                $context['schedule']->id,
            ]), $this->paperPayload($context, [
                'invigilator_ids' => [$context['teacher']->id],
                'room' => 'Hall 1',
            ]))
            ->assertRedirect();

        $response = $this->actingAs($context['coordinator'])
            ->postJson(route('admin.schedule.exams.papers.store', [
                $context['school']->id,
                $context['schedule']->id,
            ]), $this->paperPayload($context, [
                'section_id' => $context['sectionB']->id,
                'subject_id' => $context['science']->id,
                'room' => 'Hall 2',
                'invigilator_ids' => [$context['teacher']->id],
            ]));

        $response->assertStatus(422);
        $this->assertContains('INVIGILATOR_DOUBLE_BOOKED', array_column($response->json('conflicts'), 'code'));
    }

    public function test_room_double_booking_is_rejected(): void
    {
        $context = $this->makeSchool();

        $this->actingAs($context['coordinator'])
            ->post(route('admin.schedule.exams.papers.store', [
                $context['school']->id,
                $context['schedule']->id,
            ]), $this->paperPayload($context, ['room' => 'Hall 9']))
            ->assertRedirect();

        $response = $this->actingAs($context['coordinator'])
            ->postJson(route('admin.schedule.exams.papers.store', [
                $context['school']->id,
                $context['schedule']->id,
            ]), $this->paperPayload($context, [
                'section_id' => $context['sectionB']->id,
                'subject_id' => $context['science']->id,
                'room' => 'Hall 9',
            ]));

        $response->assertStatus(422);
        $this->assertContains('ROOM_DOUBLE_BOOKED', array_column($response->json('conflicts'), 'code'));
    }

    public function test_duplicate_section_subject_paper_is_a_validation_error_not_a_crash(): void
    {
        $context = $this->makeSchool();

        $this->actingAs($context['coordinator'])
            ->post(route('admin.schedule.exams.papers.store', [
                $context['school']->id,
                $context['schedule']->id,
            ]), $this->paperPayload($context))
            ->assertRedirect();

        $this->actingAs($context['coordinator'])
            ->postJson(route('admin.schedule.exams.papers.store', [
                $context['school']->id,
                $context['schedule']->id,
            ]), $this->paperPayload($context))
            ->assertStatus(422)
            ->assertJsonValidationErrors('subject_id');

        $this->assertSame(1, ExamPaper::query()->count());
    }

    public function test_bulk_creation_adds_a_paper_for_every_section_of_the_class(): void
    {
        $context = $this->makeSchool();

        $this->actingAs($context['coordinator'])
            ->post(route('admin.schedule.exams.papers.bulk', [
                $context['school']->id,
                $context['schedule']->id,
            ]), $this->paperPayload($context))
            ->assertRedirect();

        $this->assertSame(2, ExamPaper::query()->count());
        $this->assertSame(1, ExamPaper::query()->distinct()->count('batch_uuid'));
    }

    public function test_publish_requires_conflicts_to_be_resolved(): void
    {
        $context = $this->makeSchool();

        // Bypass the HTTP guard to plant a conflicting paper (Friday, outside working days).
        ExamPaper::create([
            'organization_id' => $context['org']->id,
            'school_id' => $context['school']->id,
            'exam_schedule_id' => $context['schedule']->id,
            'class_id' => $context['class']->id,
            'section_id' => $context['sectionA']->id,
            'subject_id' => $context['math']->id,
            'exam_date' => $context['friday'],
            'starts_at' => '08:00:00',
            'ends_at' => '09:00:00',
        ]);

        $this->actingAs($context['admin'])
            ->postJson(route('admin.schedule.exams.publish', [
                $context['school']->id,
                $context['schedule']->id,
            ]))
            ->assertStatus(422);

        $this->assertSame('draft', $context['schedule']->fresh()->status);
    }

    public function test_school_admin_can_publish_and_previously_published_period_is_archived(): void
    {
        $context = $this->makeSchool();

        ExamPaper::create([
            'organization_id' => $context['org']->id,
            'school_id' => $context['school']->id,
            'exam_schedule_id' => $context['schedule']->id,
            'class_id' => $context['class']->id,
            'section_id' => $context['sectionA']->id,
            'subject_id' => $context['math']->id,
            'exam_date' => $context['sunday'],
            'starts_at' => '08:00:00',
            'ends_at' => '09:00:00',
        ]);

        $this->actingAs($context['admin'])
            ->post(route('admin.schedule.exams.publish', [
                $context['school']->id,
                $context['schedule']->id,
            ]), ['acknowledge_warnings' => true])
            ->assertRedirect();

        $this->assertSame('published', $context['schedule']->fresh()->status);
    }

    public function test_published_period_is_read_only(): void
    {
        $context = $this->makeSchool();
        $context['schedule']->update(['status' => 'published']);

        $this->actingAs($context['admin'])
            ->post(route('admin.schedule.exams.papers.store', [
                $context['school']->id,
                $context['schedule']->id,
            ]), $this->paperPayload($context))
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertSame(0, ExamPaper::query()->count());
    }

    public function test_day_agenda_lists_the_subjects_examined_on_a_date(): void
    {
        $context = $this->makeSchool();

        ExamPaper::create([
            'organization_id' => $context['org']->id,
            'school_id' => $context['school']->id,
            'exam_schedule_id' => $context['schedule']->id,
            'class_id' => $context['class']->id,
            'section_id' => $context['sectionA']->id,
            'subject_id' => $context['math']->id,
            'exam_date' => $context['sunday'],
            'starts_at' => '08:00:00',
            'ends_at' => '09:00:00',
            'room' => 'Hall 1',
        ]);

        ExamPaper::create([
            'organization_id' => $context['org']->id,
            'school_id' => $context['school']->id,
            'exam_schedule_id' => $context['schedule']->id,
            'class_id' => $context['class']->id,
            'section_id' => $context['sectionB']->id,
            'subject_id' => $context['math']->id,
            'exam_date' => $context['monday'],
            'starts_at' => '08:00:00',
            'ends_at' => '09:00:00',
        ]);

        $this->actingAs($context['admin'])
            ->get(route('admin.schedule.exams.show', [
                $context['school']->id,
                $context['schedule']->id,
            ]).'?date='.$context['sunday'])
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('admin/schedule/exams/index')
                ->where('selectedDate', $context['sunday'])
                ->has('dayAgenda', 1)
                ->where('dayAgenda.0.subject_name_en', 'Mathematics')
                ->where('dayAgenda.0.section_name', 'A')
                ->where('dayAgenda.0.room', 'Hall 1')
                ->where('calendar.'.$context['sunday'], 1)
                ->where('calendar.'.$context['monday'], 1));
    }

    public function test_deleting_a_paper_is_audited(): void
    {
        $context = $this->makeSchool();

        $paper = ExamPaper::create([
            'organization_id' => $context['org']->id,
            'school_id' => $context['school']->id,
            'exam_schedule_id' => $context['schedule']->id,
            'class_id' => $context['class']->id,
            'section_id' => $context['sectionA']->id,
            'subject_id' => $context['math']->id,
            'exam_date' => $context['sunday'],
            'starts_at' => '08:00:00',
            'ends_at' => '09:00:00',
        ]);

        $this->actingAs($context['admin'])
            ->delete(route('admin.schedule.exam-papers.destroy', [$context['school']->id, $paper->id]))
            ->assertRedirect();

        $this->assertDatabaseMissing('exam_papers', ['id' => $paper->id]);
        $this->assertSame(1, AuditLog::query()->where('action', 'exam.paper_deleted')->count());
    }
}
