<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\AcademicClass;
use App\Models\AcademicYear;
use App\Models\Application;
use App\Models\Assessment;
use App\Models\AttendanceSession;
use App\Models\BellPeriod;
use App\Models\BellSchedule;
use App\Models\Enrollment;
use App\Models\ExamPaper;
use App\Models\ExamSchedule;
use App\Models\Guardian;
use App\Models\Installment;
use App\Models\Invoice;
use App\Models\Notice;
use App\Models\Organization;
use App\Models\Page;
use App\Models\PaymentIntent;
use App\Models\Receipt;
use App\Models\ReportCardSnapshot;
use App\Models\School;
use App\Models\SchoolMembership;
use App\Models\Section;
use App\Models\Student;
use App\Models\Subject;
use App\Models\TimetableEntry;
use App\Models\TimetableVersion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Routing\Route as RoutingRoute;
use Illuminate\Support\Facades\Route;
use Illuminate\View\View;
use Tests\TestCase;

/**
 * Walks every registered GET route as every role and asserts the page layer is
 * intact: no 5xx, every Inertia component a page names exists on disk, and the
 * school admin can reach every admin page it owns.
 */
class RouteSweepTest extends TestCase
{
    use RefreshDatabase;

    /** @var array<string, int|string> */
    private array $ids = [];

    /** @var array<string, User> */
    private array $users = [];

    /** @var list<string> */
    private array $missingComponents = [];

    private int $pagesChecked = 0;

    /**
     * @return array<string, User>
     */
    private function world(): array
    {
        $org = Organization::factory()->create(['name' => 'Sweep Org', 'slug' => 'sweep-org']);
        $school = School::factory()->create(['organization_id' => $org->id, 'name' => 'Sweep School', 'slug' => 'sweep-school']);

        $admin = User::factory()->create(['organization_id' => $org->id, 'role' => UserRole::SchoolAdmin]);
        SchoolMembership::create(['organization_id' => $org->id, 'school_id' => $school->id, 'user_id' => $admin->id]);

        $coordinator = User::factory()->create(['organization_id' => $org->id, 'role' => UserRole::AcademicCoordinator]);
        SchoolMembership::create(['organization_id' => $org->id, 'school_id' => $school->id, 'user_id' => $coordinator->id]);

        $teacher = User::factory()->create(['organization_id' => $org->id, 'role' => UserRole::Teacher, 'name' => 'Sweep Teacher']);

        $year = AcademicYear::create([
            'organization_id' => $org->id, 'school_id' => $school->id, 'name' => '2026-2027',
            'starts_on' => '2026-08-30', 'ends_on' => '2027-06-30', 'is_current' => true,
        ]);

        $class = AcademicClass::create(['organization_id' => $org->id, 'school_id' => $school->id, 'name' => 'Grade 6']);
        $section = Section::create(['organization_id' => $org->id, 'school_id' => $school->id, 'class_id' => $class->id, 'name' => 'A']);
        $subject = Subject::create([
            'organization_id' => $org->id, 'school_id' => $school->id,
            'code' => 'MATH', 'name_en' => 'Mathematics', 'name_ar' => 'الرياضيات',
        ]);

        $bell = BellSchedule::create(['organization_id' => $org->id, 'school_id' => $school->id, 'name' => 'Regular', 'is_default' => true]);
        BellPeriod::create([
            'organization_id' => $org->id, 'school_id' => $school->id, 'bell_schedule_id' => $bell->id,
            'number' => 1, 'label_en' => 'P1', 'label_ar' => 'ح١', 'starts_at' => '07:30', 'ends_at' => '08:15', 'is_break' => false,
        ]);

        $version = TimetableVersion::create([
            'organization_id' => $org->id, 'school_id' => $school->id, 'academic_year_id' => $year->id,
            'name' => 'Term 1', 'bell_schedule_id' => $bell->id, 'created_by' => $admin->id, 'status' => 'published',
            'published_at' => now(),
        ]);

        TimetableEntry::create([
            'organization_id' => $org->id, 'school_id' => $school->id, 'timetable_version_id' => $version->id,
            'section_id' => $section->id, 'subject_id' => $subject->id, 'teacher_id' => $teacher->id,
            'day_of_week' => 0, 'period_number' => 1, 'lesson_type' => 'lesson',
        ]);

        $exam = ExamSchedule::create([
            'organization_id' => $org->id, 'school_id' => $school->id, 'academic_year_id' => $year->id,
            'title' => 'Midterms', 'title_ar' => 'منتصف الفصل',
            'starts_on' => '2026-10-04', 'ends_on' => '2026-10-15',
            'status' => 'published', 'created_by' => $admin->id, 'published_at' => now(),
        ]);

        $paper = ExamPaper::create([
            'organization_id' => $org->id, 'school_id' => $school->id, 'exam_schedule_id' => $exam->id,
            'class_id' => $class->id, 'section_id' => $section->id, 'subject_id' => $subject->id,
            'exam_date' => '2026-10-05', 'starts_at' => '08:00:00', 'ends_at' => '09:30:00', 'room' => 'Hall 1',
        ]);

        $student = Student::create([
            'organization_id' => $org->id, 'school_id' => $school->id, 'student_number' => 'S-1',
            'first_name' => 'Sweep', 'last_name' => 'Student', 'status' => 'active',
        ]);

        Enrollment::create([
            'organization_id' => $org->id, 'school_id' => $school->id, 'student_id' => $student->id,
            'academic_year_id' => $year->id, 'class_id' => $class->id, 'section_id' => $section->id,
            'enrolled_on' => '2026-09-01', 'status' => 'active',
        ]);

        $studentUser = User::factory()->create(['organization_id' => $org->id, 'role' => UserRole::Student]);
        $student->update(['user_id' => $studentUser->id]);

        $guardianUser = User::factory()->create(['organization_id' => $org->id, 'role' => UserRole::Guardian]);
        $guardian = Guardian::create([
            'organization_id' => $org->id, 'user_id' => $guardianUser->id,
            'name' => 'Sweep Guardian', 'email' => $guardianUser->email,
        ]);
        $guardian->students()->attach($student->id, ['organization_id' => $org->id]);

        $session = AttendanceSession::create([
            'organization_id' => $org->id, 'school_id' => $school->id,
            'section_id' => $section->id, 'attendance_date' => now()->toDateString(),
        ]);
        Assessment::create([
            'organization_id' => $org->id, 'school_id' => $school->id, 'section_id' => $section->id,
            'student_id' => $student->id, 'teacher_id' => $teacher->id, 'title' => 'Quiz 1',
            'score' => 9, 'max_score' => 10, 'assessed_on' => now()->toDateString(),
        ]);

        $invoice = Invoice::create([
            'organization_id' => $org->id, 'school_id' => $school->id, 'student_id' => $student->id,
            'number' => 'INV-1', 'issued_on' => '2026-09-01', 'due_on' => '2026-10-01',
            'subtotal_minor' => 50000, 'total_minor' => 50000, 'currency' => 'SAR', 'items' => [],
        ]);
        $installment = Installment::create([
            'organization_id' => $org->id, 'school_id' => $school->id, 'invoice_id' => $invoice->id,
            'sequence' => 1, 'due_on' => '2026-10-01', 'amount_minor' => 50000, 'paid_minor' => 20000,
        ]);
        $intent = PaymentIntent::create([
            'organization_id' => $org->id, 'school_id' => $school->id, 'installment_id' => $installment->id,
            'invoice_id' => $invoice->id, 'student_id' => $student->id, 'user_id' => $guardianUser->id,
            'provider' => 'stripe', 'provider_reference' => 'pi_sweep', 'idempotency_key' => 'sweep-key-1', 'amount_minor' => 30000,
            'currency' => 'SAR', 'status' => 'requires_action',
        ]);
        $receipt = Receipt::create([
            'organization_id' => $org->id, 'school_id' => $school->id, 'invoice_id' => $invoice->id,
            'installment_id' => $installment->id, 'payment_intent_id' => $intent->id, 'user_id' => $guardianUser->id,
            'number' => 'RCT-1', 'amount_minor' => 20000, 'currency' => 'SAR', 'provider' => 'stripe',
            'provider_reference' => 'pi_sweep', 'issued_at' => now(),
        ]);

        $notice = Notice::create([
            'organization_id' => $org->id, 'school_id' => $school->id, 'title' => 'Notice',
            'body' => 'Body', 'status' => 'published', 'published_at' => now(), 'created_by' => $admin->id,
        ]);

        $page = Page::create([
            'organization_id' => $org->id, 'school_id' => $school->id, 'slug' => 'about-us',
            'title' => ['en' => 'About', 'ar' => 'من نحن'], 'body' => ['en' => 'Body', 'ar' => 'النص'],
            'status' => 'published', 'published_at' => now(),
        ]);

        $application = Application::create([
            'organization_id' => $org->id, 'school_id' => $school->id, 'student_name' => 'Applicant',
            'guardian_name' => 'Applicant Guardian',
            'guardian_email' => 'g@example.test', 'guardian_phone' => '0500000000',
            'status' => 'submitted', 'submitted_at' => now(),
        ]);

        $snapshot = ReportCardSnapshot::create([
            'organization_id' => $org->id, 'school_id' => $school->id, 'student_id' => $student->id,
            'term' => 'Term 1', 'issued_by' => $admin->id, 'enrollment' => [], 'attendance' => [],
            'assessments' => [], 'issued_at' => now(),
        ]);

        $this->ids = [
            'school' => $school->id,
            'organization' => $org->slug,
            'version' => $version->id,
            'examSchedule' => $exam->id,
            'examPaper' => $paper->id,
            'student' => $student->id,
            'snapshot' => $snapshot->id,
            'notice' => $notice->id,
            'page' => 'about-us',
            'application' => $application->id,
            'installment' => $installment->id,
            'paymentIntent' => $intent->id,
            'receipt' => $receipt->id,
            'section' => $section->id,
            'teacher' => $teacher->id,
            'attendanceSession' => $session->id,
            'invoice' => $invoice->id,
        ];

        $this->users = [
            'school_admin' => $admin,
            'coordinator' => $coordinator,
            'teacher' => $teacher,
            'guardian' => $guardianUser,
            'student' => $studentUser,
        ];

        return $this->users;
    }

    /**
     * Public routes bind the school by slug, admin routes by id.
     */
    private function urlFor(RoutingRoute $route): string
    {
        $uri = $route->uri();
        $public = str_starts_with((string) $route->getName(), 'public.');

        foreach ($route->parameterNames() as $name) {
            $value = $name === 'school' && $public
                ? 'sweep-school'
                : ($this->ids[$name] ?? 1);

            $uri = preg_replace('#\{'.$name.'\??\}#', (string) $value, $uri) ?? $uri;
        }

        return '/'.ltrim($uri, '/');
    }

    /**
     * @return array<string, array<string, int>>
     */
    private function sweep(): array
    {
        $this->world();

        $statuses = [];

        foreach (Route::getRoutes() as $route) {
            if (! in_array('GET', $route->methods(), true)) {
                continue;
            }

            $url = $this->urlFor($route);

            if (preg_match('#\{[^}]+\}#', $url)) {
                continue;
            }

            foreach ([null] + $this->users as $role => $user) {
                $role = $role === 0 ? 'guest' : $role;

                if (str_starts_with($url, '/_inertia/devtools')) {
                    continue;
                }

                $response = $user === null ? $this->get($url) : $this->actingAs($user)->get($url);
                $status = $response->getStatusCode();
                $statuses[$role][$url] = $status;

                $base = $response->baseResponse;

                if ($status === 200 && $base instanceof HttpResponse && $base->original instanceof View) {
                    $data = $base->original->getData();
                    $page = is_array($data) ? ($data['page'] ?? null) : null;
                    $component = is_array($page) ? ($page['component'] ?? null) : null;

                    if (is_string($component)) {
                        $this->pagesChecked++;

                        if (! file_exists(resource_path('js/pages/'.$component.'.tsx'))) {
                            $this->missingComponents[] = $component.' (from '.$url.' as '.$role.')';
                        }
                    }
                }
            }
        }

        return $statuses ?? [];
    }

    public function test_every_get_route_survives_every_role(): void
    {
        $statuses = $this->sweep();

        $offenders = [];

        foreach ($statuses as $role => $routes) {
            foreach ($routes as $url => $status) {
                if ($status >= 500) {
                    $offenders[] = $role.' '.$url.' -> '.$status;
                }
            }
        }

        $this->assertSame([], array_unique($offenders), 'A GET route returned 5xx.');
        $this->assertSame([], array_unique($this->missingComponents), 'An Inertia page names a component that does not exist.');
        $this->assertGreaterThan(50, $this->pagesChecked, 'The sweep stopped rendering pages.');
    }

    public function test_the_school_admin_can_reach_every_admin_page(): void
    {
        $statuses = $this->sweep();
        $blocked = [];

        foreach ($statuses['school_admin'] as $url => $status) {
            if (! str_starts_with($url, '/admin/')) {
                continue;
            }

            // Platform-operator surfaces are not part of a school admin's reach.
            if (str_starts_with($url, '/admin/site-content')) {
                continue;
            }

            if ($status !== 200) {
                $blocked[$url] = $status;
            }
        }

        $this->assertSame([], $blocked, 'A school admin was refused an admin page.');
    }
}
