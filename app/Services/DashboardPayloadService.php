<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\Assessment;
use App\Models\AttendanceRecord;
use App\Models\AuditLog;
use App\Models\BellPeriod;
use App\Models\ExamPaper;
use App\Models\Installment;
use App\Models\Notification;
use App\Models\NotificationDelivery;
use App\Models\PaymentIntent;
use App\Models\Receipt;
use App\Models\School;
use App\Models\TeacherAssignment;
use App\Models\TimetableEntry;
use App\Models\TimetableVersion;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class DashboardPayloadService
{
    /**
     * Get the dashboard payload for an admin user.
     *
     * @return array{metrics: array<string, mixed>, widgets: array<string, mixed>}
     */
    public function getAdminPayload(School $school): array
    {
        $today = CarbonImmutable::today();
        $windowStart = $today->startOfDay();
        $windowEnd = $today->endOfDay();
        $monthStart = $today->startOfMonth();
        $assessmentSince = $today->subDays(30);

        $totalStudents = $school->students()->count();
        $activeStudents = $school->students()->where('status', 'active')->count();

        // Teachers belong to the organization, which is how every other
        // teacher lookup in the app resolves them.
        $totalTeachers = User::query()
            ->where('organization_id', $school->organization_id)
            ->where('role', UserRole::Teacher)
            ->count();

        $assignedTeachers = TeacherAssignment::query()
            ->where('school_id', $school->id)
            ->distinct('teacher_id')
            ->count('teacher_id');

        $attendanceCounts = AttendanceRecord::query()
            ->whereHas('session', fn ($query) => $query->where('school_id', $school->id)->whereDate('attendance_date', $today))
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $activeClasses = $school->academicClasses()
            ->whereHas('enrollments', fn ($query) => $query->where('status', 'active'))
            ->count();

        $pipeline = $school->applications()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $outstandingMinor = (int) Installment::query()
            ->where('school_id', $school->id)
            ->whereColumn('paid_minor', '<', 'amount_minor')
            ->selectRaw('COALESCE(SUM(amount_minor - paid_minor), 0) as total')
            ->value('total');

        $paymentsToday = PaymentIntent::query()
            ->where('school_id', $school->id)
            ->whereBetween('created_at', [$windowStart, $windowEnd]);

        $paymentsTodaySucceeded = (clone $paymentsToday)->where('status', 'succeeded')->get(['amount_minor']);
        $paymentsTodayCount = $paymentsTodaySucceeded->count();
        $paymentsTodayMinor = (int) $paymentsTodaySucceeded->sum('amount_minor');

        $paymentCounts = (clone $paymentsToday)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $incomeTodayMinor = (int) Receipt::query()
            ->where('school_id', $school->id)
            ->whereBetween('issued_at', [$windowStart, $windowEnd])
            ->sum('amount_minor');

        $incomeMonthMinor = (int) Receipt::query()
            ->where('school_id', $school->id)
            ->where('issued_at', '>=', $monthStart)
            ->sum('amount_minor');

        $upcomingExams = ExamPaper::query()
            ->where('school_id', $school->id)
            ->whereDate('exam_date', '>=', $today)
            ->inPublishedPeriod()
            ->with(['section:id,name', 'section.academicClass:id,name', 'subject:id,name_en,name_ar'])
            ->orderBy('exam_date')
            ->orderBy('starts_at')
            ->limit(8)
            ->get()
            ->map(fn (ExamPaper $paper): array => [
                'id' => $paper->id,
                'exam_date' => $paper->exam_date->toDateString(),
                'starts_at' => substr((string) $paper->starts_at, 0, 5),
                'ends_at' => substr((string) $paper->ends_at, 0, 5),
                'room' => $paper->room,
                'class_name' => $paper->section?->academicClass?->name,
                'section_name' => $paper->section?->name,
                'subject_name_en' => $paper->subject?->name_en,
                'subject_name_ar' => $paper->subject?->name_ar,
            ])
            ->values()
            ->all();

        $outstandingInvoices = Installment::query()
            ->where('school_id', $school->id)
            ->whereColumn('paid_minor', '<', 'amount_minor')
            ->with(['invoice.student:id,first_name,last_name,student_number'])
            ->orderBy('due_on')
            ->limit(8)
            ->get()
            ->map(fn (Installment $installment): array => [
                'id' => $installment->id,
                'number' => $installment->invoice?->number,
                'student' => trim((string) $installment->invoice?->student?->first_name.' '.(string) $installment->invoice?->student?->last_name),
                'studentNumber' => $installment->invoice?->student?->student_number,
                'sequence' => $installment->sequence,
                'amountMinor' => $installment->amount_minor,
                'paidMinor' => $installment->paid_minor,
                'outstandingMinor' => $installment->amount_minor - $installment->paid_minor,
                'currency' => (string) $installment->invoice?->currency,
                'dueOn' => $installment->due_on?->toDateString(),
                'status' => $installment->status,
            ])
            ->values()
            ->all();

        $notificationQuery = Notification::query()
            ->where('organization_id', $school->organization_id)
            ->whereBetween('created_at', [$windowStart, $windowEnd]);

        $notificationActivity = [
            'sentToday' => (clone $notificationQuery)->count(),
            'readToday' => (clone $notificationQuery)->whereNotNull('read_at')->count(),
            'deliveredToday' => NotificationDelivery::query()
                ->where('organization_id', $school->organization_id)
                ->whereBetween('created_at', [$windowStart, $windowEnd])
                ->whereNotNull('sent_at')
                ->count(),
        ];

        $recentActivity = AuditLog::query()
            ->where('organization_id', $school->organization_id)
            ->with('user:id,name')
            ->latest('created_at')
            ->limit(8)
            ->get()
            ->map(fn (AuditLog $log): array => [
                'id' => $log->id,
                'action' => $log->action,
                'actor' => $log->user?->name,
                'at' => $log->created_at->toIso8601String(),
            ])
            ->values()
            ->all();

        return [
            'metrics' => [
                'students' => [
                    'total' => $totalStudents,
                    'active' => $activeStudents,
                    'inactive' => $totalStudents - $activeStudents,
                ],
                'teachers' => [
                    'total' => $totalTeachers,
                    'assigned' => $assignedTeachers,
                ],
                'attendanceToday' => $this->attendanceTotals($attendanceCounts),
                'activeClasses' => $activeClasses,
                'pendingAdmissions' => (int) ($pipeline['pending'] ?? 0),
                'outstandingBalances' => [
                    'amountMinor' => $outstandingMinor,
                    'formatted' => number_format($outstandingMinor / 100, 2),
                ],
                'paymentsToday' => [
                    'amountMinor' => $paymentsTodayMinor,
                    'count' => $paymentsTodayCount,
                    'formattedAmount' => number_format($paymentsTodayMinor / 100, 2),
                ],
                'upcomingExams' => $upcomingExams,
                'assessmentStats' => $this->assessmentStats($school, $assessmentSince),
            ],
            'widgets' => [
                'attendanceOverview' => ['today' => $this->attendanceTotals($attendanceCounts)],
                'admissionsPipeline' => [
                    'pending' => (int) ($pipeline['pending'] ?? 0),
                    'reviewing' => (int) ($pipeline['reviewing'] ?? 0),
                    'accepted' => (int) ($pipeline['accepted'] ?? 0),
                    'rejected' => (int) ($pipeline['rejected'] ?? 0),
                    'withdrawn' => (int) ($pipeline['withdrawn'] ?? 0),
                ],
                'financeSummary' => [
                    'income' => ['today' => $incomeTodayMinor, 'month' => $incomeMonthMinor],
                    'outstandingMinor' => $outstandingMinor,
                    'currency' => 'SAR',
                ],
                'todaysTimetable' => $this->timetableForDay($school, $today->dayOfWeek),
                'recentNotices' => $school->notices()
                    ->published()
                    ->latest('published_at')
                    ->limit(5)
                    ->get(['id', 'title', 'published_at'])
                    ->map(fn ($notice): array => [
                        'id' => $notice->id,
                        'title' => $notice->title,
                        'publishedAt' => $notice->published_at?->toIso8601String(),
                    ])
                    ->values()
                    ->all(),
                'paymentStatus' => [
                    'successful' => (int) ($paymentCounts['succeeded'] ?? 0),
                    'failed' => (int) ($paymentCounts['failed'] ?? 0) + (int) ($paymentCounts['amount_mismatch'] ?? 0),
                    'pending' => (int) ($paymentCounts['created'] ?? 0) + (int) ($paymentCounts['requires_action'] ?? 0),
                ],
                'outstandingInvoices' => $outstandingInvoices,
                'notificationActivity' => $notificationActivity,
                'recentActivity' => $recentActivity,
                'quickActions' => $this->quickActions($school),
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

    /**
     * @return array<string, mixed>
     */
    private function assessmentStats(School $school, CarbonImmutable $since): array
    {
        $aggregate = Assessment::query()
            ->where('school_id', $school->id)
            ->whereDate('assessed_on', '>=', $since)
            ->selectRaw('COUNT(*) as total')
            ->selectRaw('AVG(score / NULLIF(max_score, 0) * 100) as average_percent')
            ->selectRaw('SUM(CASE WHEN score / NULLIF(max_score, 0) >= 0.6 THEN 1 ELSE 0 END) as passing')
            ->first();

        $total = (int) $aggregate->getAttribute('total');

        if ($total === 0) {
            return $this->emptyAssessmentStats();
        }

        return [
            'total' => $total,
            'averagePercent' => round((float) $aggregate->getAttribute('average_percent'), 1),
            'passRate' => round((int) $aggregate->getAttribute('passing') / $total * 100, 1),
            'recent' => Assessment::query()
                ->where('school_id', $school->id)
                ->whereDate('assessed_on', '>=', $since)
                ->with(['section:id,name', 'student:id,first_name,last_name'])
                ->latest('assessed_on')
                ->limit(5)
                ->get()
                ->map(fn (Assessment $assessment): array => [
                    'id' => $assessment->id,
                    'title' => $assessment->title,
                    'assessedOn' => $assessment->assessed_on?->toDateString(),
                    'sectionName' => $assessment->section?->name,
                    'student' => trim((string) $assessment->student?->first_name.' '.(string) $assessment->student?->last_name),
                    'score' => (float) $assessment->score,
                    'maxScore' => (float) $assessment->max_score,
                ])
                ->values()
                ->all(),
        ];
    }

    /**
     * Published timetable entries for one weekday, resolved against the bell
     * schedule that gives each period its time.
     *
     * @return array<int, array<string, mixed>>
     */
    private function timetableForDay(School $school, int $dayOfWeek): array
    {
        $version = TimetableVersion::query()
            ->where('school_id', $school->id)
            ->published()
            ->latest('published_at')
            ->first();

        if ($version === null) {
            return [];
        }

        $startsByPeriod = [];

        foreach (BellPeriod::query()->where('bell_schedule_id', $version->bell_schedule_id)->get(['number', 'starts_at', 'ends_at']) as $period) {
            $startsByPeriod[(string) $period->number] = [
                'starts_at' => substr((string) $period->starts_at, 0, 5),
                'ends_at' => substr((string) $period->ends_at, 0, 5),
            ];
        }

        return TimetableEntry::query()
            ->where('timetable_version_id', $version->id)
            ->where('day_of_week', $dayOfWeek)
            ->with([
                'section:id,name',
                'section.academicClass:id,name',
                'subject:id,name_en,name_ar,color',
                'teacher:id,name',
            ])
            ->orderBy('period_number')
            ->get()
            ->map(fn (TimetableEntry $entry): array => [
                'id' => $entry->id,
                'period' => $entry->period_number,
                'starts_at' => $startsByPeriod[(string) $entry->period_number]['starts_at'] ?? null,
                'ends_at' => $startsByPeriod[(string) $entry->period_number]['ends_at'] ?? null,
                'class_name' => $entry->section?->academicClass?->name,
                'section_name' => $entry->section?->name,
                'subject_name_en' => $entry->subject?->name_en,
                'subject_name_ar' => $entry->subject?->name_ar,
                'subject_color' => $entry->subject?->color,
                'teacher_name' => $entry->teacher?->name,
            ])
            ->values()
            ->all();
    }

    /**
     * Only links this school's administration can actually reach.
     *
     * @return array<int, array{key: string, href: string}>
     */
    private function quickActions(School $school): array
    {
        $user = auth()->user();

        $actions = [
            ['key' => 'take_attendance', 'ability' => 'view-attendance-report', 'href' => route('admin.reports.attendance', $school->id)],
            ['key' => 'view_applications', 'ability' => 'manage-admissions', 'href' => route('admin.admissions.index', $school->id)],
            ['key' => 'manage_finance', 'ability' => 'manage-finance', 'href' => route('admin.finance.index', $school->id)],
            ['key' => 'manage_timetable', 'ability' => 'manage-schedule', 'href' => route('admin.schedule.timetable.index', $school->id)],
            ['key' => 'manage_exams', 'ability' => 'manage-schedule', 'href' => route('admin.schedule.exams.index', $school->id)],
            ['key' => 'manage_academics', 'ability' => 'manage-enrollment', 'href' => route('admin.academics.index', $school->id)],
        ];

        return collect($actions)
            ->filter(fn (array $action): bool => $user !== null && $user->can($action['ability'], $school))
            ->map(fn (array $action): array => ['key' => $action['key'], 'href' => $action['href']])
            ->values()
            ->all();
    }
}
