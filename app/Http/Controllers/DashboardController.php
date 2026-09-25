<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Services\DashboardPayloadService;
use App\Services\Portal\PortalDashboardService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The single authenticated landing page.
 *
 * The payload is chosen by the signed-in user's role: teachers, guardians and
 * students get their purpose-built portal dashboard from the portal service,
 * while administration roles get a school command centre built exclusively
 * from live records — never placeholder numbers.
 */
class DashboardController extends Controller
{
    private const CACHE_TTL_SECONDS = 900;

    public function __construct(private DashboardPayloadService $dashboardPayloadService) {}

    public function __invoke(Request $request, PortalDashboardService $portal): Response
    {
        $user = $request->user();

        if ($user === null) {
            abort(401);
        }

        if ($user->hasRole(UserRole::Teacher)) {
            return Inertia::render('dashboard/teacher', $portal->teacher($user));
        }

        if ($user->hasRole(UserRole::Guardian)) {
            return Inertia::render('dashboard/guardian', $portal->guardian($user));
        }

        if ($user->hasRole(UserRole::Student)) {
            return Inertia::render('dashboard/student', $portal->student($user));
        }

        $school = $user->accessibleSchools()->first();

        if ($school === null) {
            return Inertia::render('dashboard', $this->emptyPayload());
        }

        $payload = Cache::remember(
            "dashboard.school.{$school->id}",
            self::CACHE_TTL_SECONDS,
            fn (): array => $this->dashboardPayloadService->getAdminPayload($school),
        );

        return Inertia::render('dashboard', [
            'school' => ['id' => $school->id, 'name' => $school->name],
            ...$payload,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function emptyPayload(): array
    {
        return [
            'school' => null,
            'metrics' => [
                'students' => ['total' => 0, 'active' => 0, 'inactive' => 0],
                'teachers' => ['total' => 0, 'assigned' => 0],
                'attendanceToday' => $this->attendanceTotals(collect()),
                'activeClasses' => 0,
                'pendingAdmissions' => 0,
                'outstandingBalances' => ['amountMinor' => 0, 'formatted' => '0.00'],
                'paymentsToday' => ['amountMinor' => 0, 'count' => 0, 'formattedAmount' => '0.00'],
                'upcomingExams' => [],
                'assessmentStats' => $this->emptyAssessmentStats(),
            ],
            'widgets' => [
                'attendanceOverview' => ['today' => $this->attendanceTotals(collect())],
                'admissionsPipeline' => [
                    'pending' => 0,
                    'reviewing' => 0,
                    'accepted' => 0,
                    'rejected' => 0,
                    'withdrawn' => 0,
                ],
                'financeSummary' => ['income' => ['today' => 0, 'month' => 0], 'outstandingMinor' => 0, 'currency' => 'SAR'],
                'todaysTimetable' => [],
                'recentNotices' => [],
                'paymentStatus' => ['successful' => 0, 'failed' => 0, 'pending' => 0],
                'outstandingInvoices' => [],
                'notificationActivity' => ['sentToday' => 0, 'readToday' => 0, 'deliveredToday' => 0],
                'recentActivity' => [],
                'quickActions' => [],
            ],
        ];
    }

    /**
     * @param  Collection<int|string, mixed>  $counts
     * @return array<string, int|float>
     */
    private function attendanceTotals(Collection $counts): array
    {
        $present = (int) $counts->get('present', 0);
        $absent = (int) $counts->get('absent', 0);
        $late = (int) $counts->get('late', 0);
        $excused = (int) $counts->get('excused', 0);
        $recorded = $present + $absent + $late + $excused;

        return [
            'present' => $present,
            'absent' => $absent,
            'late' => $late,
            'excused' => $excused,
            'recorded' => $recorded,
            'presentPercentage' => $recorded > 0 ? round($present / $recorded * 100, 1) : 0.0,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function emptyAssessmentStats(): array
    {
        return ['total' => 0, 'averagePercent' => 0.0, 'passRate' => 0.0, 'recent' => []];
    }
}
