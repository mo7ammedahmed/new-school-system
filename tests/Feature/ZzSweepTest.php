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
use Illuminate\Routing\Route as RoutingRoute;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class ZzSweepTest extends TestCase
{
    use RefreshDatabase;

    /** @var array<string, int|string> */
    private array $ids = [];

    private int $pagesChecked = 0;

    /** @return array<string, User> */
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

        $notice = Notice::create([
            'organization_id' => $org->id, 'school_id' => $school->id, 'title' => 'Notice',
            'body' => 'Body', 'status' => 'published', 'published_at' => now(), 'created_by' => $admin->id,
        ]);

        $page = Page::create([
            'organization_id' => $org->id, 'school_id' => $school->id, 'slug' => 'about-us',
            'title' => 'About', 'body' => 'Body', 'status' => 'draft',
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
            'page' => $page->id,
            'application' => $application->id,
            'installment' => $installment->id,
            'paymentIntent' => $intent->id,
            'section' => $section->id,
            'teacher' => $teacher->id,
            'attendanceSession' => $session->id,
        ];

        return [
            'admin' => $admin,
            'coordinator' => $coordinator,
            'teacher' => $teacher,
            'guardian' => $guardianUser,
            'student' => $studentUser,
            'guest' => User::factory()->create(['organization_id' => null, 'role' => UserRole::Guardian]),
        ];
    }

    private function urlFor(RoutingRoute $route): string
    {
        $uri = $route->uri();

        foreach ($route->parameterNames() as $name) {
            $value = $this->ids[$name] ?? 1;
            $uri = preg_replace('#\{'.$name.'\??\}#', (string) $value, $uri) ?? $uri;
        }

        return '/'.ltrim($uri, '/');
    }

    public function test_sweep_every_get_route_for_every_role(): void
    {
        $users = $this->world();
        $offenders = [];
        $missing = [];
        $seen = [];
        $notFound = [];

        foreach (Route::getRoutes() as $route) {
            if (! in_array('GET', $route->methods(), true)) {
                continue;
            }

            $uri = $route->uri();

            if (str_contains($uri, '{') && preg_match('#\{[^}]+\}#', $this->urlFor($route))) {
                continue;
            }

            foreach ($users as $role => $user) {
                $url = $this->urlFor($route);

                $response = $user === null
                    ? $this->get($url)
                    : $this->actingAs($user)->get($url);

                $status = $response->getStatusCode();
                $seen[$status] = ($seen[$status] ?? 0) + 1;

                if ($status >= 500) {
                    $offenders[] = sprintf('%s %s as %s -> %d', 'GET', $url, $role, $status);
                }

                if (in_array($role, ['admin', 'coordinator', 'teacher', 'guardian', 'student'], true)
                    && in_array($status, [404, 419, 500], true)) {
                    $notFound[$role][] = $status.' '.$url;
                }

                // Plain and streamed responses (robots.txt, sitemap, CSV exports)
                // carry no view, so only Inertia-rendered pages are inspected.
                $base = $response->baseResponse;

                if ($status === 200 && $base instanceof \Illuminate\Http\Response && $base->original instanceof \Illuminate\View\View) {
                    $data = $base->original->getData();
                    $page = is_array($data) ? ($data['page'] ?? null) : null;
                    $component = is_array($page) ? ($page['component'] ?? null) : null;

                    if (is_string($component)) {
                        $file = resource_path('js/pages/'.$component.'.tsx');
                        $this->pagesChecked++;

                        if (! file_exists($file)) {
                            $missing[] = $component.' (from '.$url.')';
                        }
                    }
                }
            }
        }

        dump('[status histogram] '.json_encode($seen));
        dump('[pages checked] '.$this->pagesChecked);

        foreach ($notFound as $role => $urls) {
            dump('[404/419 for '.$role.'] '.count($urls));
            foreach (array_unique($urls) as $line) {
                dump('  '.$line);
            }
        }

        if ($offenders !== []) {
            dump('[5xx offenders]');
            foreach (array_slice(array_unique($offenders), 0, 40) as $line) {
                dump('  '.$line);
            }
        }

        if ($missing !== []) {
            dump('[MISSING COMPONENT FILES]');
            foreach (array_unique($missing) as $line) {
                dump('  '.$line);
            }
        }

        $this->assertTrue(true);
    }
}
