<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\AcademicClass;
use App\Models\AcademicYear;
use App\Models\BellPeriod;
use App\Models\BellSchedule;
use App\Models\ExamPaper;
use App\Models\ExamSchedule;
use App\Models\Organization;
use App\Models\School;
use App\Models\SchoolMembership;
use App\Models\Section;
use App\Models\Subject;
use App\Models\TimetableEntry;
use App\Models\TimetableVersion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

/**
 * The schedule pages were shipped with a payload the React components could not
 * read: the timetable editor was handed an Eloquent model (so `bell_schedule`
 * instead of `bellSchedule`) and an unvalidated `?date=` reached the exam
 * calendar. These tests pin the wire shape at the boundary the page consumes.
 */
class SchedulePageContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_timetable_editor_payload_matches_what_the_page_consumes(): void
    {
        $context = $this->school();

        $sections = collect([
            $context['section'],
            Section::create([
                'organization_id' => $context['organization']->id,
                'school_id' => $context['school']->id,
                'class_id' => $context['class']->id,
                'name' => 'B',
            ]),
        ]);

        $bell = BellSchedule::create([
            'organization_id' => $context['organization']->id,
            'school_id' => $context['school']->id,
            'name' => 'Regular day',
            'is_default' => true,
        ]);

        foreach ([
            1 => ['Period 1', 'الحصة ١', '07:30', '08:15', false],
            2 => ['First break', 'الاستراحة الأولى', '08:15', '08:35', true],
            3 => ['Period 2', 'الحصة ٢', '08:35', '09:20', false],
        ] as $number => [$labelEn, $labelAr, $start, $end, $isBreak]) {
            BellPeriod::create([
                'organization_id' => $context['organization']->id,
                'school_id' => $context['school']->id,
                'bell_schedule_id' => $bell->id,
                'number' => $number,
                'label_en' => $labelEn,
                'label_ar' => $labelAr,
                'starts_at' => $start,
                'ends_at' => $end,
                'is_break' => $isBreak,
            ]);
        }

        $version = TimetableVersion::create([
            'organization_id' => $context['organization']->id,
            'school_id' => $context['school']->id,
            'academic_year_id' => $context['year']->id,
            'name' => 'Term 1',
            'bell_schedule_id' => $bell->id,
            'created_by' => $context['admin']->id,
        ]);

        // One entry per section: the grid renders every section as a row, and a
        // save replaces the whole version, so both must be present.
        foreach ($sections as $index => $section) {
            TimetableEntry::create([
                'organization_id' => $context['organization']->id,
                'school_id' => $context['school']->id,
                'timetable_version_id' => $version->id,
                'section_id' => $section->id,
                'subject_id' => $context['subject']->id,
                'teacher_id' => $context['teacher']->id,
                'day_of_week' => 0,
                'period_number' => $index === 0 ? 1 : 3,
                'lesson_type' => 'lesson',
            ]);
        }

        $this->actingAs($context['admin'])
            ->get(route('admin.schedule.timetable.edit', [$context['school']->id, $version->id]))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('admin/schedule/timetable/edit')
                // `version.bellSchedule` is the key the component reads, and it
                // must actually carry its periods.
                ->where('version.id', $version->id)
                ->where('version.name', 'Term 1')
                ->where('version.status', 'draft')
                ->where('version.bellSchedule.id', $bell->id)
                ->where('version.bellSchedule.name', 'Regular day')
                ->has('version.bellSchedule.bell_periods', 3)
                ->where('version.bellSchedule.bell_periods.0.number', 1)
                ->where('version.bellSchedule.bell_periods.0.label_en', 'Period 1')
                ->where('version.bellSchedule.bell_periods.0.label_ar', 'الحصة ١')
                ->where('version.bellSchedule.bell_periods.0.is_break', false)
                ->where('version.bellSchedule.bell_periods.1.is_break', true)
                // No raw model serialization leaks into the page.
                ->missing('version.bell_schedule')
                ->missing('version.organization_id')
                ->missing('version.school_id')
                ->missing('version.created_by')
                ->missing('version.academic_year')
                // Named fields for every picker the page renders.
                ->has('sections', 2)
                ->where('sections.0.name', 'A')
                ->where('sections.1.name', 'B')
                ->has('subjects', 1)
                ->where('subjects.0.code', 'MATH')
                ->where('subjects.0.name_en', 'Mathematics')
                ->where('subjects.0.name_ar', 'الرياضيات')
                ->has('teachers', 1)
                ->where('teachers.0.name', 'Teacher One')
                ->where('workingDays', [0, 1, 2, 3, 4])
                // Existing rows load for every section, not just one.
                ->has('entries', 2)
                ->where('entries.0.section_id', $sections[0]->id)
                ->where('entries.0.period_number', 1)
                ->where('entries.0.lesson_type', 'lesson')
                ->where('entries.1.section_id', $sections[1]->id)
                ->where('entries.1.period_number', 3));
    }

    public function test_the_editor_hides_no_columns_when_the_bell_schedule_has_periods(): void
    {
        $context = $this->school();

        $bell = BellSchedule::create([
            'organization_id' => $context['organization']->id,
            'school_id' => $context['school']->id,
            'name' => 'Short day',
        ]);

        BellPeriod::create([
            'organization_id' => $context['organization']->id,
            'school_id' => $context['school']->id,
            'bell_schedule_id' => $bell->id,
            'number' => 1,
            'label_en' => 'Period 1',
            'label_ar' => 'الحصة ١',
            'starts_at' => '07:30',
            'ends_at' => '08:15',
            'is_break' => false,
        ]);

        $version = TimetableVersion::create([
            'organization_id' => $context['organization']->id,
            'school_id' => $context['school']->id,
            'academic_year_id' => $context['year']->id,
            'name' => 'Term 2',
            'bell_schedule_id' => $bell->id,
            'created_by' => $context['admin']->id,
        ]);

        $this->actingAs($context['admin'])
            ->get(route('admin.schedule.timetable.edit', [$context['school']->id, $version->id]))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('version.bellSchedule.bell_periods', 1)
                ->where('version.bellSchedule.bell_periods.0.label_en', 'Period 1')
                ->has('entries', 0));
    }

    public function test_a_malformed_selected_date_normalizes_to_a_real_day_instead_of_reaching_the_page(): void
    {
        $context = $this->school();

        $schedule = ExamSchedule::create([
            'organization_id' => $context['organization']->id,
            'school_id' => $context['school']->id,
            'academic_year_id' => $context['year']->id,
            'title' => 'Midterms',
            'starts_on' => '2026-10-04',
            'ends_on' => '2026-10-15',
            'status' => 'published',
            'created_by' => $context['admin']->id,
            'published_at' => now(),
        ]);

        ExamPaper::create([
            'organization_id' => $context['organization']->id,
            'school_id' => $context['school']->id,
            'exam_schedule_id' => $schedule->id,
            'class_id' => $context['class']->id,
            'section_id' => $context['section']->id,
            'subject_id' => $context['subject']->id,
            'exam_date' => '2026-10-05',
            'starts_at' => '08:00:00',
            'ends_at' => '09:30:00',
            'room' => 'Hall 1',
        ]);

        $url = route('admin.schedule.exams.show', [$context['school']->id, $schedule->id]);

        // A junk date must not be handed to the calendar or the day agenda.
        foreach (['notadate', '2026-13-45', '2026-02-30', ''] as $junk) {
            $this->actingAs($context['admin'])
                ->get($url.'?date='.urlencode($junk))
                ->assertOk()
                ->assertInertia(fn (AssertableInertia $page) => $page
                    ->component('admin/schedule/exams/index')
                    ->where('selectedDate', '2026-10-05')
                    ->has('dayAgenda', 1)
                    ->where('dayAgenda.0.subject_name_en', 'Mathematics'));
        }

        // A real day is still honoured.
        $this->actingAs($context['admin'])
            ->get($url.'?date=2026-10-05')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('selectedDate', '2026-10-05')
                ->has('dayAgenda', 1));

        // And a real day with no papers is a valid, empty day rather than junk.
        $this->actingAs($context['admin'])
            ->get($url.'?date=2026-10-06')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('selectedDate', '2026-10-06')
                ->has('dayAgenda', 0));
    }

    /**
     * @return array{organization: Organization, school: School, admin: User, year: AcademicYear, class: AcademicClass, section: Section, subject: Subject, teacher: User}
     */
    private function school(): array
    {
        $organization = Organization::create(['name' => 'Contract Org', 'slug' => 'contract-org']);
        $school = School::create(['organization_id' => $organization->id, 'name' => 'Contract School', 'slug' => 'contract-school']);

        $admin = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => UserRole::SchoolAdmin,
        ]);

        SchoolMembership::create([
            'organization_id' => $organization->id,
            'school_id' => $school->id,
            'user_id' => $admin->id,
        ]);

        $teacher = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => UserRole::Teacher,
            'name' => 'Teacher One',
        ]);

        $year = AcademicYear::create([
            'organization_id' => $organization->id,
            'school_id' => $school->id,
            'name' => '2026-2027',
            'starts_on' => '2026-08-30',
            'ends_on' => '2027-06-30',
            'is_current' => true,
        ]);

        $class = AcademicClass::create([
            'organization_id' => $organization->id,
            'school_id' => $school->id,
            'name' => 'Grade 6',
        ]);

        $section = Section::create([
            'organization_id' => $organization->id,
            'school_id' => $school->id,
            'class_id' => $class->id,
            'name' => 'A',
        ]);

        $subject = Subject::create([
            'organization_id' => $organization->id,
            'school_id' => $school->id,
            'code' => 'MATH',
            'name_en' => 'Mathematics',
            'name_ar' => 'الرياضيات',
        ]);

        return compact('organization', 'school', 'admin', 'year', 'class', 'section', 'subject', 'teacher');
    }
}
