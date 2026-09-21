<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\AcademicClass;
use App\Models\AcademicYear;
use App\Models\Assessment;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\BellPeriod;
use App\Models\BellSchedule;
use App\Models\Enrollment;
use App\Models\ExamPaper;
use App\Models\ExamPaperInvigilator;
use App\Models\ExamSchedule;
use App\Models\Guardian;
use App\Models\Installment;
use App\Models\Invoice;
use App\Models\Organization;
use App\Models\School;
use App\Models\SchoolMembership;
use App\Models\Section;
use App\Models\Student;
use App\Models\Subject;
use App\Models\TimetableEntry;
use App\Models\TimetableVersion;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class PortalDashboardTest extends TestCase
{
    use RefreshDatabase;

    private CarbonImmutable $sunday;

    protected function setUp(): void
    {
        parent::setUp();

        $this->sunday = CarbonImmutable::parse('2026-09-01')->next(CarbonImmutable::SUNDAY);
    }

    /**
     * @return array<string, mixed>
     */
    private function makeSchool(): array
    {
        $org = Organization::factory()->create(['name' => 'Portal Org']);
        $school = School::factory()->create(['organization_id' => $org->id, 'name' => 'Portal School']);

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
            'name' => 'Grade 6',
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

        return compact('org', 'school', 'year', 'class', 'sectionA', 'sectionB', 'math');
    }

    private function student(string $number, string $first, array $context, ?Section $section = null, ?User $user = null): Student
    {
        $student = Student::create([
            'organization_id' => $context['org']->id,
            'school_id' => $context['school']->id,
            'user_id' => $user?->id,
            'student_number' => $number,
            'first_name' => $first,
            'last_name' => 'Learner',
        ]);

        Enrollment::create([
            'organization_id' => $context['org']->id,
            'school_id' => $context['school']->id,
            'student_id' => $student->id,
            'academic_year_id' => $context['year']->id,
            'class_id' => $context['class']->id,
            'section_id' => ($section ?? $context['sectionA'])->id,
            'enrolled_on' => '2026-09-01',
        ]);

        return $student;
    }

    private function publishedTimetable(array $context, Section $section, User $teacher, int $weekday, int $period = 1): void
    {
        $bell = BellSchedule::firstOrCreate(
            [
                'organization_id' => $context['org']->id,
                'school_id' => $context['school']->id,
                'name' => 'Regular',
            ],
            ['is_default' => true],
        );

        BellPeriod::firstOrCreate(
            ['bell_schedule_id' => $bell->id, 'number' => $period],
            [
                'organization_id' => $context['org']->id,
                'school_id' => $context['school']->id,
                'label_en' => 'Period '.$period,
                'label_ar' => 'الحصة '.$period,
                'starts_at' => $period === 1 ? '07:30' : '08:20',
                'ends_at' => $period === 1 ? '08:15' : '09:05',
                'is_break' => false,
            ],
        );

        $version = TimetableVersion::create([
            'organization_id' => $context['org']->id,
            'school_id' => $context['school']->id,
            'academic_year_id' => $context['year']->id,
            'name' => 'Term 1 '.$section->name,
            'bell_schedule_id' => $bell->id,
            'status' => 'published',
            'created_by' => $teacher->id,
            'published_at' => now(),
        ]);

        TimetableEntry::create([
            'organization_id' => $context['org']->id,
            'school_id' => $context['school']->id,
            'timetable_version_id' => $version->id,
            'section_id' => $section->id,
            'subject_id' => $context['math']->id,
            'teacher_id' => $teacher->id,
            'day_of_week' => $weekday,
            'period_number' => $period,
            'lesson_type' => 'lesson',
        ]);
    }

    public function test_teacher_dashboard_shows_only_their_own_classes_and_duties(): void
    {
        $context = $this->makeSchool();
        $today = CarbonImmutable::now()->dayOfWeek;

        $teacher = User::factory()->create([
            'organization_id' => $context['org']->id,
            'role' => UserRole::Teacher,
            'name' => 'Teacher One',
        ]);
        $otherTeacher = User::factory()->create([
            'organization_id' => $context['org']->id,
            'role' => UserRole::Teacher,
            'name' => 'Teacher Two',
        ]);

        $teacher->assignedSections()->attach($context['sectionA']->id, [
            'organization_id' => $context['org']->id,
            'school_id' => $context['school']->id,
        ]);
        $otherTeacher->assignedSections()->attach($context['sectionB']->id, [
            'organization_id' => $context['org']->id,
            'school_id' => $context['school']->id,
        ]);

        $this->publishedTimetable($context, $context['sectionA'], $teacher, $today);
        $this->publishedTimetable($context, $context['sectionB'], $otherTeacher, $today, 2);

        $this->actingAs($teacher)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('dashboard/teacher')
                ->has('today_classes', 1)
                ->where('today_classes.0.section_name', 'A')
                ->where('today_classes.0.starts_at', '07:30')
                ->has('sections', 1)
                ->where('counts.sections', 1)
                ->has('invigilation_duties', 0));
    }

    public function test_teacher_dashboard_lists_only_published_invigilation_duties(): void
    {
        $context = $this->makeSchool();
        $teacher = User::factory()->create([
            'organization_id' => $context['org']->id,
            'role' => UserRole::Teacher,
        ]);

        $student = $this->student('S-001', 'First', $context);

        $published = ExamSchedule::create([
            'organization_id' => $context['org']->id,
            'school_id' => $context['school']->id,
            'academic_year_id' => $context['year']->id,
            'title' => 'Published period',
            'starts_on' => $this->sunday->toDateString(),
            'ends_on' => $this->sunday->addDays(5)->toDateString(),
            'status' => 'published',
            'created_by' => $teacher->id,
            'published_at' => now(),
        ]);

        $draft = ExamSchedule::create([
            'organization_id' => $context['org']->id,
            'school_id' => $context['school']->id,
            'academic_year_id' => $context['year']->id,
            'title' => 'Draft period',
            'starts_on' => $this->sunday->toDateString(),
            'ends_on' => $this->sunday->addDays(5)->toDateString(),
            'status' => 'draft',
            'created_by' => $teacher->id,
        ]);

        foreach ([$published, $draft] as $schedule) {
            $paper = ExamPaper::create([
                'organization_id' => $context['org']->id,
                'school_id' => $context['school']->id,
                'exam_schedule_id' => $schedule->id,
                'class_id' => $context['class']->id,
                'section_id' => $context['sectionA']->id,
                'subject_id' => $context['math']->id,
                'exam_date' => $this->sunday->addDays(30)->toDateString(),
                'starts_at' => '08:00:00',
                'ends_at' => '09:00:00',
                'room' => 'Hall 1',
            ]);

            ExamPaperInvigilator::create([
                'organization_id' => $context['org']->id,
                'school_id' => $context['school']->id,
                'exam_paper_id' => $paper->id,
                'teacher_id' => $teacher->id,
                'role' => 'invigilator',
            ]);
        }

        $this->assertNotNull($student);

        $this->actingAs($teacher)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('dashboard/teacher')
                ->has('invigilation_duties', 1)
                ->where('invigilation_duties.0.schedule_title', 'Published period'));
    }

    public function test_guardian_dashboard_shows_only_linked_children_and_their_balance(): void
    {
        $context = $this->makeSchool();

        $linked = $this->student('S-001', 'Linked', $context);
        $hidden = $this->student('S-002', 'Hidden', $context);

        $user = User::factory()->create([
            'organization_id' => $context['org']->id,
            'role' => UserRole::Guardian,
        ]);

        $guardian = Guardian::create([
            'organization_id' => $context['org']->id,
            'user_id' => $user->id,
            'name' => 'Guardian',
            'email' => $user->email,
        ]);
        $guardian->students()->attach($linked->id, ['organization_id' => $context['org']->id]);

        $invoice = Invoice::create([
            'organization_id' => $context['org']->id,
            'school_id' => $context['school']->id,
            'student_id' => $linked->id,
            'number' => 'INV-001',
            'issued_on' => '2026-09-01',
            'due_on' => '2026-10-01',
            'subtotal_minor' => 50000,
            'total_minor' => 50000,
            'currency' => 'SAR',
            'items' => [],
        ]);

        $hiddenInvoice = Invoice::create([
            'organization_id' => $context['org']->id,
            'school_id' => $context['school']->id,
            'student_id' => $hidden->id,
            'number' => 'INV-002',
            'issued_on' => '2026-09-01',
            'due_on' => '2026-10-01',
            'subtotal_minor' => 90000,
            'total_minor' => 90000,
            'currency' => 'SAR',
            'items' => [],
        ]);

        Installment::create([
            'organization_id' => $context['org']->id,
            'school_id' => $context['school']->id,
            'invoice_id' => $invoice->id,
            'sequence' => 1,
            'due_on' => '2026-10-01',
            'amount_minor' => 50000,
            'paid_minor' => 20000,
        ]);

        Installment::create([
            'organization_id' => $context['org']->id,
            'school_id' => $context['school']->id,
            'invoice_id' => $hiddenInvoice->id,
            'sequence' => 1,
            'due_on' => '2026-10-01',
            'amount_minor' => 90000,
            'paid_minor' => 0,
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('dashboard/guardian')
                ->has('children', 1)
                ->where('children.0.name', 'Linked Learner')
                // Only the linked child's outstanding balance is counted.
                ->where('outstanding.total_minor', 30000)
                ->has('outstanding.by_child', 1));
    }

    public function test_guardian_without_a_profile_still_gets_a_safe_empty_dashboard(): void
    {
        $context = $this->makeSchool();
        $user = User::factory()->create([
            'organization_id' => $context['org']->id,
            'role' => UserRole::Guardian,
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('dashboard/guardian')
                ->has('children', 0));
    }

    public function test_student_dashboard_shows_only_their_own_section(): void
    {
        $context = $this->makeSchool();
        $today = CarbonImmutable::now()->dayOfWeek;

        $teacher = User::factory()->create([
            'organization_id' => $context['org']->id,
            'role' => UserRole::Teacher,
        ]);

        $user = User::factory()->create([
            'organization_id' => $context['org']->id,
            'role' => UserRole::Student,
        ]);

        $student = $this->student('S-010', 'Own', $context, $context['sectionA'], $user);

        // The other section has a class today; the student must not see it.
        $this->publishedTimetable($context, $context['sectionB'], $teacher, $today, 2);

        $session = AttendanceSession::create([
            'organization_id' => $context['org']->id,
            'school_id' => $context['school']->id,
            'section_id' => $context['sectionA']->id,
            'attendance_date' => '2026-09-14',
        ]);

        AttendanceRecord::create([
            'organization_id' => $context['org']->id,
            'attendance_session_id' => $session->id,
            'student_id' => $student->id,
            'status' => 'late',
        ]);

        Assessment::create([
            'organization_id' => $context['org']->id,
            'school_id' => $context['school']->id,
            'section_id' => $context['sectionA']->id,
            'student_id' => $student->id,
            'teacher_id' => $teacher->id,
            'title' => 'Quiz 1',
            'score' => 9,
            'max_score' => 10,
            'assessed_on' => '2026-09-14',
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('dashboard/student')
                ->where('student.name', 'Own Learner')
                ->where('student.section_name', 'A')
                ->has('today_classes', 0)
                ->where('attendance.late', 1)
                ->where('attendance.absent', 0)
                ->has('recent_assessments', 1)
                ->where('recent_assessments.0.title', 'Quiz 1'));
    }

    public function test_student_dashboard_lists_upcoming_exams_for_their_section_only(): void
    {
        $context = $this->makeSchool();

        $teacher = User::factory()->create([
            'organization_id' => $context['org']->id,
            'role' => UserRole::Teacher,
        ]);

        $user = User::factory()->create([
            'organization_id' => $context['org']->id,
            'role' => UserRole::Student,
        ]);

        $this->student('S-011', 'Own', $context, $context['sectionA'], $user);

        $schedule = ExamSchedule::create([
            'organization_id' => $context['org']->id,
            'school_id' => $context['school']->id,
            'academic_year_id' => $context['year']->id,
            'title' => 'Midterms',
            'starts_on' => $this->sunday->toDateString(),
            'ends_on' => $this->sunday->addDays(10)->toDateString(),
            'status' => 'published',
            'created_by' => $teacher->id,
            'published_at' => now(),
        ]);

        foreach ([$context['sectionA'], $context['sectionB']] as $index => $section) {
            ExamPaper::create([
                'organization_id' => $context['org']->id,
                'school_id' => $context['school']->id,
                'exam_schedule_id' => $schedule->id,
                'class_id' => $context['class']->id,
                'section_id' => $section->id,
                'subject_id' => $context['math']->id,
                'exam_date' => $this->sunday->addDays(30 + $index)->toDateString(),
                'starts_at' => '08:00:00',
                'ends_at' => '09:30:00',
                'room' => 'Hall '.($index + 1),
            ]);
        }

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('dashboard/student')
                ->has('upcoming_exams', 1)
                ->where('upcoming_exams.0.section_name', 'A'));
    }

    public function test_students_and_guardians_never_see_the_administration_dashboard(): void
    {
        $context = $this->makeSchool();

        $schoolAdmin = User::factory()->create([
            'organization_id' => $context['org']->id,
            'role' => UserRole::SchoolAdmin,
        ]);
        SchoolMembership::create([
            'organization_id' => $context['org']->id,
            'school_id' => $context['school']->id,
            'user_id' => $schoolAdmin->id,
        ]);

        $guardian = User::factory()->create([
            'organization_id' => $context['org']->id,
            'role' => UserRole::Guardian,
        ]);

        $studentUser = User::factory()->create([
            'organization_id' => $context['org']->id,
            'role' => UserRole::Student,
        ]);

        $this->actingAs($schoolAdmin)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('dashboard'));

        $this->actingAs($guardian)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('dashboard/guardian'));

        $this->actingAs($studentUser)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('dashboard/student'));
    }

    public function test_student_can_view_their_own_record_but_not_another_student(): void
    {
        $context = $this->makeSchool();

        $user = User::factory()->create([
            'organization_id' => $context['org']->id,
            'role' => UserRole::Student,
        ]);

        $own = $this->student('S-020', 'Own', $context, $context['sectionA'], $user);
        $other = $this->student('S-021', 'Other', $context, $context['sectionB']);

        $this->actingAs($user)->get(route('students.show', $own->id))->assertOk();
        $this->actingAs($user)->get(route('students.show', $other->id))->assertForbidden();
    }
}
