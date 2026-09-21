<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\ExamPaper;
use App\Models\ExamSchedule;
use App\Models\School;
use App\Services\Portal\PortalDashboardService;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\School;
use App\Models\Student;
use App\Models\User;
use App\Models\AcademicClass;
use App\Models\Application;
use App\Models\Invoice;
use App\Models\PaymentIntent;
use App\Models\Notice;
use App\Models\Notification;
use App\Models\NotificationDelivery;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use Carbon\Carbon;
use App\Enums\UserRole;

class DashboardController extends Controller
{
    public function __invoke(Request $request, PortalDashboardService $portal): Response
    {
<<<<<<< HEAD
        $organization = $request->user()?->organization;
        $school = $organization?->schools()->first();

        if (!$school) {
            return Inertia::render('dashboard', [
                'school' => null,
                'metrics' => [],
                'widgets' => [],
            ]);
        }

        // Check if user has permission to view dashboard
        // Gate::authorize('view-dashboard', $school); // Temporarily commented out as policy doesn't exist yet

        // Cache key for dashboard data
        $cacheKey = "dashboard_school_{$school->id}";

        // Try to get cached data (cache for 5 minutes)
        $dashboardData = Cache::get($cacheKey);

        if (!$dashboardData) {
            // Fetch fresh data
            $dashboardData = $this->fetchDashboardData($school);

            // Cache for 5 minutes
            Cache::put($cacheKey, $dashboardData, 5);
        }

        return Inertia::render('dashboard', [
            'school' => $school?->only(['id', 'name']),
            'metrics' => $dashboardData['metrics'],
            'widgets' => $dashboardData['widgets'],
=======
        $user = $request->user();

        // Teachers, guardians and students never see the administration
        // dashboard: each role gets only its own records.
        if ($user !== null) {
            if ($user->hasRole(UserRole::Teacher)) {
                return Inertia::render('dashboard/teacher', $portal->teacher($user));
            }

            if ($user->hasRole(UserRole::Guardian)) {
                return Inertia::render('dashboard/guardian', $portal->guardian($user));
            }

            if ($user->hasRole(UserRole::Student)) {
                return Inertia::render('dashboard/student', $portal->student($user));
            }
        }

        $schools = ($user?->accessibleSchools() ?? new Collection)
            ->loadCount(['students', 'applications', 'notices']);

        $requested = $request->integer('school');
        $primary = $schools->firstWhere('id', $requested) ?? $schools->first();

        /** @var list<int> $schoolIds */
        $schoolIds = array_values(array_map('intval', $schools->pluck('id')->all()));
        $today = CarbonImmutable::now();
        $weekday = $today->dayOfWeek;

        return Inertia::render('dashboard', [
            'school' => $primary?->only(['id', 'name']),
            'schools' => $schools->map(fn (School $school): array => [
                'id' => $school->id,
                'name' => $school->name,
                'students_count' => $school->students_count,
            ])->values(),
            'metrics' => [
                'students' => (int) $schools->sum('students_count'),
                'applications' => (int) $schools->sum('applications_count'),
                'notices' => (int) $schools->sum('notices_count'),
                'schools' => $schools->count(),
            ],
            'todayExams' => $this->todayExams($primary, $today->toDateString()),
            'upcomingExamPeriods' => $this->upcomingExamPeriods($schoolIds, $today->toDateString()),
            // Staff never have per-teacher classes: a teacher is dispatched to
            // `dashboard/teacher` above, which owns that view.
            'todayClasses' => [],
            'today' => [
                'iso' => $today->toDateString(),
                'weekday' => $weekday,
            ],
>>>>>>> origin/main
        ]);
    }

    /**
<<<<<<< HEAD
     * Fetch all dashboard data for a school
     */
    protected function fetchDashboardData(School $school)
    {
        $today = Carbon::today();
        $startOfDay = $today->startOfDay();
        $endOfDay = $today->endOfDay();

        // Students metrics
        $totalStudents = $school->students()->count();
        $activeStudents = $school->students()->where('status', 'active')->count();
        $inactiveStudents = $totalStudents - $activeStudents;

        // Teachers metrics (users with Teacher role in this school)
        $totalTeachers = $school->users()->where('role', UserRole::Teacher->value)->count();
        $activeTeachers = $school->users()->where('role', UserRole::Teacher->value)->where('status', 'active')->count();
        $teachersOnLeave = $school->users()->where('role', UserRole::Teacher->value)->where('status', 'on_leave')->count();

        // Attendance today
        $attendanceToday = $school->attendanceRecords()
            ->whereDate('date', $today)
            ->get();

        $totalAttendanceToday = $attendanceToday->count();
        $presentToday = $attendanceToday->where('status', 'present')->count();
        $absentToday = $attendanceToday->where('status', 'absent')->count();
        $lateToday = $attendanceToday->where('status', 'late')->count();
        $excusedToday = $attendanceToday->where('status', 'excused')->count();

        $attendancePercentages = $totalAttendanceToday > 0 ? [
            'present' => round(($presentToday / $totalAttendanceToday) * 100, 1),
            'absent' => round(($absentToday / $totalAttendanceToday) * 100, 1),
            'late' => round(($lateToday / $totalAttendanceToday) * 100, 1),
            'excused' => round(($excusedToday / $totalAttendanceToday) * 100, 1),
        ] : [
            'present' => 0,
            'absent' => 0,
            'late' => 0,
            'excused' => 0,
        ];

        // Active classes count (classes with active enrollments)
        $activeClassesCount = $school->academicClasses()
            ->whereHas('enrollments', function ($query) {
                $query->where('status', 'active');
            })
            ->count();

        // Pending admissions count
        $pendingAdmissionsCount = $school->applications()
            ->where('status', 'pending')
            ->count();

        // Outstanding balances amount
        $outstandingBalancesAmount = $school->invoices()
            ->where('status', '!=', 'paid')
            ->where('due_date', '<', $today->endOfDay())
            ->sum('amount_due');

        // Payments today
        $paymentsToday = $school->paymentIntents()
            ->whereBetween('created_at', [$startOfDay, $endOfDay])
            ->where('status', 'succeeded')
            ->get();

        $paymentsTodayAmount = $paymentsToday->sum('amount');
        $paymentsTodayCount = $paymentsToday->count();

        // For now, we'll use placeholder data for exams since there's no exam model
        // In a real implementation, this would come from an exam/schedule system
        $upcomingExams = collect([
            [
                'id' => 1,
                'title' => 'Midterm Mathematics',
                'date' => $today->addDays(2)->format('Y-m-d'),
                'subject' => 'Mathematics',
                'class' => 'Grade 10A',
            ],
            [
                'id' => 2,
                'title' => 'Science Quiz',
                'date' => $today->addDays(5)->format('Y-m-d'),
                'subject' => 'Science',
                'class' => 'Grade 8B',
            ],
            [
                'id' => 3,
                'title' => 'English Literature',
                'date' => $today->addDays(7)->format('Y-m-d'),
                'subject' => 'English',
                'class' => 'Grade 9A',
            ],
        ]);

        // Prepare metrics
        $metrics = [
            'students' => [
                'total' => $totalStudents,
                'active' => $activeStudents,
                'inactive' => $inactiveStudents,
                'trend' => '+6.4%', // This would be calculated from historical data
            ],
            'teachers' => [
                'total' => $totalTeachers,
                'active' => $activeTeachers,
                'onLeave' => $teachersOnLeave,
                'trend' => '+3.2%', // This would be calculated from historical data
            ],
            'attendanceToday' => [
                'present' => $presentToday,
                'absent' => $absentToday,
                'late' => $lateToday,
                'excused' => $excusedToday,
                'presentPercentage' => $attendancePercentages['present'],
                'absentPercentage' => $attendancePercentages['absent'],
                'latePercentage' => $attendancePercentages['late'],
                'excusedPercentage' => $attendancePercentages['excused'],
            ],
            'activeClasses' => $activeClassesCount,
            'pendingAdmissions' => $pendingAdmissionsCount,
            'outstandingBalances' => [
                'amount' => $outstandingBalancesAmount,
                'formatted' => number_format($outstandingBalancesAmount, 2),
            ],
            'paymentsToday' => [
                'amount' => $paymentsTodayAmount,
                'count' => $paymentsTodayCount,
                'formattedAmount' => number_format($paymentsTodayAmount, 2),
            ],
            'upcomingExams' => $upcomingExams,
        ];

        // Prepare widgets data
        $widgets = [
            'attendanceOverview' => [
                'today' => [
                    'present' => $presentToday,
                    'absent' => $absentToday,
                    'late' => $lateToday,
                    'excused' => $excusedToday,
                ],
                'weekly' => [ // This would be calculated from historical data
                    'present' => 85,
                    'absent' => 10,
                    'late' => 3,
                    'excused' => 2,
                ],
            ],
            'admissionsPipeline' => [
                'new' => $school->applications()->where('status', 'new')->count(),
                'pending' => $pendingAdmissionsCount,
                'accepted' => $school->applications()->where('status', 'accepted')->count(),
                'enrolled' => $school->applications()->where('status', 'enrolled')->count(),
                'rejected' => $school->applications()->where('status', 'rejected')->count(),
            ],
            'financeSummary' => [
                'income' => [
                    'today' => $paymentsTodayAmount,
                    'month' => $school->paymentIntents()
                        ->whereMonth('created_at', '=', $today->month)
                        ->whereYear('created_at', '=', $today->year)
                        ->where('status', 'succeeded')
                        ->sum('amount'),
                ],
                'expenses' => [
                    'today' => 0, // This would come from expense tracking
                    'month' => 0,
                ],
                'balance' => $outstandingBalancesAmount,
            ],
            'upcomingExamsList' => $upcomingExams->take(3), // Show top 3 upcoming exams
            'todaysTimetable' => [ // Placeholder data - would come from timetable system
                [
                    'time' => '08:00 - 09:00',
                    'subject' => 'Mathematics',
                    'teacher' => 'Mr. Ahmed',
                    'room' => 'Room 101',
                ],
                [
                    'time' => '09:00 - 10:00',
                    'subject' => 'Science',
                    'teacher' => 'Ms. Fatima',
                    'room' => 'Lab 2',
                ],
                [
                    'time' => '10:00 - 11:00',
                    'subject' => 'English',
                    'teacher' => 'Ms. Noura',
                    'room' => 'Room 105',
                ],
            ],
            'recentActivity' => [ // This would come from activity logs
                [
                    'type' => 'student_enrolled',
                    'description' => 'New student enrolled in Grade 5',
                    'time' => '2 hours ago',
                ],
                [
                    'type' => 'payment_received',
                    'description' => 'Payment received for Invoice #INV-00123',
                    'time' => '5 hours ago',
                ],
                [
                    'type' => 'assessment_recorded',
                    'description' => 'Assessment recorded for Section 8B',
                    'time' => '1 hour ago',
                ],
            ],
            'recentNotices' => $school->notices()
                ->where('is_published', true)
                ->orderByDesc('created_at')
                ->take(5)
                ->get()
                ->map(function ($notice) {
                    return [
                        'id' => $notice->id,
                        'title' => $notice->title,
                        'created_at' => $notice->created_at->diffForHumans(),
                    ];
                }),
            'paymentStatus' => [
                'successful' => $paymentsTodayCount,
                'failed' => $school->paymentIntents()
                    ->whereBetween('created_at', [$startOfDay, $endOfDay])
                    ->where('status', 'failed')
                    ->count(),
                'pending' => $school->paymentIntents()
                    ->whereBetween('created_at', [$startOfDay, $endOfDay])
                    ->where('status', 'pending')
                    ->count(),
            ],
            'outstandingInvoices' => $school->invoices()
                ->where('status', '!=', 'paid')
                ->orderBy('due_date')
                ->take(10)
                ->get()
                ->map(function ($invoice) {
                    return [
                        'id' => $invoice->id,
                        'number' => $invoice->invoice_number,
                        'student' => $invoice->student?->name ?? 'Unknown',
                        'amount' => $invoice->amount_due,
                        'due_date' => $invoice->due_date->format('Y-m-d'),
                        'status' => $invoice->status,
                    ];
                }),
            'notificationActivity' => [
                'sentToday' => $school->notifications()
                    ->whereBetween('created_at', [$startOfDay, $endOfDay])
                    ->count(),
                'readToday' => $school->notifications()
                    ->whereBetween('created_at', [$startOfDay, $endOfDay])
                    ->where('is_read', true)
                    ->count(),
                'deliveredToday' => $school->notificationDeliveries()
                    ->whereBetween('created_at', [$startOfDay, $endOfDay])
                    ->where('status', 'delivered')
                    ->count(),
            ],
            'quickActions' => [
                [
                    'title' => 'Take Attendance',
                    'href' => route('admin.reports.attendance', ['school' => $school->id]),
                    'icon' => 'ClipboardList',
                ],
                [
                    'title' => 'View Applications',
                    'href' => route('admin.admissions.index', ['school' => $school->id]),
                    'icon' => 'Users',
                ],
                [
                    'title' => 'Create Invoice',
                    'href' => route('admin.finance.invoices.store', ['school' => $school->id]),
                    'icon' => 'CreditCard',
                ],
                [
                    'title' => 'Send Notice',
                    'href' => route('admin.notices.store', ['school' => $school->id]),
                    'icon' => 'Megaphone',
                ],
            ],
        ];

        return [
            'metrics' => $metrics,
            'widgets' => $widgets,
        ];
    }
}
=======
     * @return array<int, array<string, mixed>>
     */
    private function todayExams(?School $school, string $date): array
    {
        if ($school === null) {
            return [];
        }

        return ExamPaper::query()
            ->where('school_id', $school->id)
            ->whereDate('exam_date', $date)
            ->inPublishedPeriod()
            ->with(['section:id,name', 'academicClass:id,name', 'subject:id,name_en,name_ar,color'])
            ->orderBy('starts_at')
            ->limit(12)
            ->get()
            ->map(fn (ExamPaper $paper): array => [
                'id' => $paper->id,
                'class_name' => $paper->academicClass?->name,
                'section_name' => $paper->section?->name,
                'subject_name_en' => $paper->subject?->name_en,
                'subject_name_ar' => $paper->subject?->name_ar,
                'starts_at' => substr((string) $paper->starts_at, 0, 5),
                'ends_at' => substr((string) $paper->ends_at, 0, 5),
                'room' => $paper->room,
            ])
            ->all();
    }

    /**
     * @param  list<int>  $schoolIds
     * @return array<int, array<string, mixed>>
     */
    private function upcomingExamPeriods(array $schoolIds, string $date): array
    {
        if ($schoolIds === []) {
            return [];
        }

        return ExamSchedule::query()
            ->whereIn('school_id', $schoolIds)
            ->published()
            ->whereDate('ends_on', '>=', $date)
            ->withCount('papers')
            ->with('school:id,name')
            ->orderBy('starts_on')
            ->limit(5)
            ->get()
            ->map(fn (ExamSchedule $schedule): array => [
                'id' => $schedule->id,
                'school_id' => $schedule->school_id,
                'school_name' => $schedule->school?->name,
                'title' => $schedule->title,
                'title_ar' => $schedule->title_ar,
                'starts_on' => $schedule->starts_on->toDateString(),
                'ends_on' => $schedule->ends_on->toDateString(),
                'papers_count' => $schedule->papers_count,
            ])
            ->all();
    }
}
>>>>>>> origin/main
