<?php

namespace App\Services\Portal;

use App\Models\Assessment;
use App\Models\BellPeriod;
use App\Models\ExamPaper;
use App\Models\ExamPaperInvigilator;
use App\Models\Guardian;
use App\Models\Installment;
use App\Models\Section;
use App\Models\Student;
use App\Models\TimetableEntry;
use App\Models\TimetableVersion;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

/**
 * Builds the payload for the role dashboards.
 *
 * Every query is scoped by what the signed-in user may see: a teacher only
 * their own sections and duties, a guardian only their linked children, a
 * student only their own record. Draft timetables and unpublished exam
 * periods are never included.
 */
class PortalDashboardService
{
    /**
     * @return array<string, mixed>
     */
    public function teacher(User $teacher): array
    {
        $today = CarbonImmutable::now();

        $sections = $teacher->assignedSections()
            ->with(['school:id,name', 'academicClass:id,name'])
            ->withCount(['enrollments as active_students_count' => fn ($query) => $query->where('status', 'active')])
            ->orderBy('name')
            ->get();

        /** @var array<int, array<string, mixed>> $sectionRows */
        $sectionRows = [];
        $studentTotal = 0;

        foreach ($sections as $section) {
            $studentsCount = (int) $section->getAttribute('active_students_count');
            $studentTotal += $studentsCount;

            $sectionRows[] = [
                'id' => $section->id,
                'name' => $section->name,
                'class_name' => $section->academicClass?->name,
                'school_name' => $section->school?->name,
                'students_count' => $studentsCount,
            ];
        }

        return [
            'role' => 'teacher',
            'today' => $this->today($today),
            'sections' => $sectionRows,
            'today_classes' => $this->teacherDay($teacher, $today),
            'invigilation_duties' => $this->invigilationDuties($teacher, $today),
            'counts' => [
                'sections' => count($sectionRows),
                'students' => $studentTotal,
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function guardian(User $user): array
    {
        $today = CarbonImmutable::now();
        $guardian = Guardian::query()->where('user_id', $user->id)->first();

        if ($guardian === null) {
            return [
                'role' => 'guardian',
                'today' => $this->today($today),
                'guardian' => ['name' => $user->name],
                'children' => [],
                'upcoming_exams' => [],
                'outstanding' => ['total_minor' => 0, 'currency' => null, 'by_child' => []],
                'counts' => ['children' => 0, 'exams' => 0],
            ];
        }

        $children = $guardian->students()
            ->with([
                'school:id,name',
                'enrollments' => fn ($query) => $query->where('status', 'active')
                    ->with(['section:id,name,class_id', 'academicClass:id,name']),
            ])
            ->orderBy('last_name')
            ->get();

        /** @var list<int> $childIds */
        $childIds = array_values(array_map('intval', $children->modelKeys()));

        $upcomingExams = $this->upcomingExamsForChildren($childIds, $today, $children);

        return [
            'role' => 'guardian',
            'today' => $this->today($today),
            'guardian' => ['name' => $guardian->name],
            'children' => $children->map(function (Student $child): array {
                $enrollment = $child->enrollments->first();

                return [
                    'id' => $child->id,
                    'name' => trim($child->first_name.' '.$child->last_name),
                    'student_number' => $child->student_number,
                    'school_name' => $child->school?->name,
                    'class_name' => $enrollment?->academicClass?->name,
                    'section_name' => $enrollment?->section?->name,
                ];
            })->values()->all(),
            'upcoming_exams' => $upcomingExams,
            'outstanding' => $this->outstanding($childIds),
            'counts' => [
                'children' => $children->count(),
                'exams' => count($upcomingExams),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function student(User $user): array
    {
        $today = CarbonImmutable::now();
        $student = Student::query()->with('school:id,name')->where('user_id', $user->id)->first();

        if ($student === null) {
            return [
                'role' => 'student',
                'today' => $this->today($today),
                'student' => null,
                'today_classes' => [],
                'upcoming_exams' => [],
                'attendance' => ['present' => 0, 'absent' => 0, 'late' => 0, 'excused' => 0],
                'recent_assessments' => [],
            ];
        }

        $enrollment = $student->enrollments()
            ->where('status', 'active')
            ->with(['section:id,name,class_id,school_id', 'academicClass:id,name'])
            ->latest('enrolled_on')
            ->first();

        $section = $enrollment?->section;
        $attendanceTotals = $student->attendanceRecords()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return [
            'role' => 'student',
            'today' => $this->today($today),
            'student' => [
                'id' => $student->id,
                'name' => trim($student->first_name.' '.$student->last_name),
                'student_number' => $student->student_number,
                'school_name' => $student->school?->name,
                'class_name' => $enrollment?->academicClass?->name,
                'section_name' => $section?->name,
            ],
            'today_classes' => $section instanceof Section ? $this->sectionDay($section, $today) : [],
            'upcoming_exams' => $section instanceof Section ? $this->upcomingExamsForSection($section->id, $today, 10) : [],
            'attendance' => [
                'present' => (int) ($attendanceTotals['present'] ?? 0),
                'absent' => (int) ($attendanceTotals['absent'] ?? 0),
                'late' => (int) ($attendanceTotals['late'] ?? 0),
                'excused' => (int) ($attendanceTotals['excused'] ?? 0),
            ],
            'recent_assessments' => $student->assessments()
                ->latest('assessed_on')
                ->limit(8)
                ->get(['id', 'title', 'score', 'max_score', 'assessed_on'])
                ->map(fn (Assessment $assessment): array => [
                    'id' => $assessment->id,
                    'title' => $assessment->title,
                    'score' => (float) $assessment->score,
                    'max_score' => (float) $assessment->max_score,
                    'assessed_on' => $assessment->assessed_on?->toDateString(),
                ])->values()->all(),
        ];
    }

    /**
     * @return array{iso: string, weekday: int}
     */
    private function today(CarbonImmutable $today): array
    {
        return [
            'iso' => $today->toDateString(),
            'weekday' => $today->dayOfWeek,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function teacherDay(User $teacher, CarbonImmutable $today): array
    {
        $versionIds = $this->publishedVersionIdsForOrganization($teacher->organization_id);

        if ($versionIds === []) {
            return [];
        }

        $periods = $this->periodLookup($versionIds);

        return TimetableEntry::query()
            ->whereIn('timetable_version_id', $versionIds)
            ->where('teacher_id', $teacher->id)
            ->where('day_of_week', $today->dayOfWeek)
            ->with([
                'section:id,name,class_id',
                'section.academicClass:id,name',
                'subject:id,name_en,name_ar,color',
            ])
            ->orderBy('period_number')
            ->get()
            ->map(fn (TimetableEntry $entry): array => $this->entryPayload($entry, $periods))
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function sectionDay(Section $section, CarbonImmutable $today): array
    {
        $version = TimetableVersion::query()
            ->where('school_id', $section->school_id)
            ->published()
            ->latest('published_at')
            ->first();

        if ($version === null) {
            return [];
        }

        $periods = $this->periodLookup([$version->id]);

        return TimetableEntry::query()
            ->where('timetable_version_id', $version->id)
            ->where('section_id', $section->id)
            ->where('day_of_week', $today->dayOfWeek)
            ->with(['subject:id,name_en,name_ar,color', 'teacher:id,name'])
            ->orderBy('period_number')
            ->get()
            ->map(fn (TimetableEntry $entry): array => $this->entryPayload($entry, $periods))
            ->values()
            ->all();
    }

    /**
     * @param  Collection<int|string, string>  $periods  bell period number => starts_at
     * @return array<string, mixed>
     */
    private function entryPayload(TimetableEntry $entry, Collection $periods): array
    {
        $startsAt = $periods->get((string) $entry->period_number);

        return [
            'id' => $entry->id,
            'period_number' => $entry->period_number,
            'starts_at' => is_string($startsAt) ? substr($startsAt, 0, 5) : null,
            'section_id' => $entry->section_id,
            'section_name' => $entry->section->name,
            'class_name' => $entry->section->academicClass?->name,
            'subject_name_en' => $entry->subject?->name_en,
            'subject_name_ar' => $entry->subject?->name_ar,
            'subject_color' => $entry->subject?->color,
            'teacher_name' => $entry->teacher?->name,
        ];
    }

    /**
     * @param  list<int>  $versionIds
     * @return Collection<int|string, string>
     */
    private function periodLookup(array $versionIds): Collection
    {
        $scheduleIds = TimetableVersion::query()
            ->whereIn('id', $versionIds)
            ->pluck('bell_schedule_id')
            ->all();

        /** @var array<string, string> $byNumber */
        $byNumber = [];

        foreach (BellPeriod::query()->whereIn('bell_schedule_id', $scheduleIds)->get(['number', 'starts_at']) as $period) {
            $byNumber[(string) $period->number] = (string) $period->starts_at;
        }

        return new Collection($byNumber);
    }

    /**
     * @return list<int>
     */
    private function publishedVersionIdsForOrganization(?int $organizationId): array
    {
        if ($organizationId === null) {
            return [];
        }

        $ids = TimetableVersion::query()
            ->where('organization_id', $organizationId)
            ->published()
            ->pluck('id')
            ->all();

        return array_values(array_map('intval', $ids));
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function invigilationDuties(User $teacher, CarbonImmutable $today): array
    {
        return ExamPaperInvigilator::query()
            ->where('teacher_id', $teacher->id)
            ->whereHas('examPaper', fn ($query) => $query
                ->whereDate('exam_date', '>=', $today->toDateString())
                ->whereHas('examSchedule', fn (Builder $schedule): Builder => $schedule->published()))
            ->with([
                'examPaper:id,exam_date,starts_at,ends_at,room,section_id,subject_id,exam_schedule_id',
                'examPaper.section:id,name,class_id',
                'examPaper.section.academicClass:id,name',
                'examPaper.subject:id,name_en,name_ar',
                'examPaper.examSchedule:id,title,title_ar',
            ])
            ->get()
            ->map(function (ExamPaperInvigilator $duty): array {
                $paper = $duty->examPaper;
                $section = $paper->section;

                return [
                    'id' => $paper->id,
                    'exam_date' => $paper->exam_date->toDateString(),
                    'starts_at' => substr((string) $paper->starts_at, 0, 5),
                    'ends_at' => substr((string) $paper->ends_at, 0, 5),
                    'room' => $paper->room,
                    'section_name' => $section?->name,
                    'class_name' => $section?->academicClass?->name,
                    'subject_name_en' => $paper->subject?->name_en,
                    'subject_name_ar' => $paper->subject?->name_ar,
                    'schedule_title' => $paper->examSchedule?->title,
                    'schedule_title_ar' => $paper->examSchedule?->title_ar,
                ];
            })
            ->sortBy('exam_date')
            ->values()
            ->all();
    }

    /**
     * @param  list<int>  $childIds
     * @param  Collection<int, Student>  $children
     * @return array<int, array<string, mixed>>
     */
    private function upcomingExamsForChildren(array $childIds, CarbonImmutable $today, Collection $children): array
    {
        if ($childIds === []) {
            return [];
        }

        $childNameBySection = [];

        foreach ($children as $child) {
            $enrollment = $child->enrollments->first();

            if ($enrollment?->section !== null) {
                $childNameBySection[$enrollment->section->id] = trim($child->first_name.' '.$child->last_name);
            }
        }

        $sectionIds = array_map('intval', array_keys($childNameBySection));

        if ($sectionIds === []) {
            return [];
        }

        return ExamPaper::query()
            ->whereIn('section_id', $sectionIds)
            ->whereDate('exam_date', '>=', $today->toDateString())
            ->inPublishedPeriod()
            ->with([
                'section:id,name,class_id',
                'section.academicClass:id,name',
                'subject:id,name_en,name_ar',
            ])
            ->orderBy('exam_date')
            ->orderBy('starts_at')
            ->limit(20)
            ->get()
            ->map(fn (ExamPaper $paper): array => [
                'id' => $paper->id,
                'child_name' => $childNameBySection[$paper->section_id] ?? null,
                'exam_date' => $paper->exam_date->toDateString(),
                'starts_at' => substr((string) $paper->starts_at, 0, 5),
                'ends_at' => substr((string) $paper->ends_at, 0, 5),
                'room' => $paper->room,
                'section_name' => $paper->section?->name,
                'class_name' => $paper->section?->academicClass?->name,
                'subject_name_en' => $paper->subject?->name_en,
                'subject_name_ar' => $paper->subject?->name_ar,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function upcomingExamsForSection(int $sectionId, CarbonImmutable $today, int $limit): array
    {
        return ExamPaper::query()
            ->where('section_id', $sectionId)
            ->whereDate('exam_date', '>=', $today->toDateString())
            ->inPublishedPeriod()
            ->with(['subject:id,name_en,name_ar', 'section:id,name'])
            ->orderBy('exam_date')
            ->orderBy('starts_at')
            ->limit($limit)
            ->get()
            ->map(fn (ExamPaper $paper): array => [
                'id' => $paper->id,
                'exam_date' => $paper->exam_date->toDateString(),
                'starts_at' => substr((string) $paper->starts_at, 0, 5),
                'ends_at' => substr((string) $paper->ends_at, 0, 5),
                'room' => $paper->room,
                'section_name' => $paper->section?->name,
                'subject_name_en' => $paper->subject?->name_en,
                'subject_name_ar' => $paper->subject?->name_ar,
            ])
            ->values()
            ->all();
    }

    /**
     * @param  list<int>  $childIds
     * @return array{total_minor: int, currency: string|null, by_child: array<int, array<string, mixed>>}
     */
    private function outstanding(array $childIds): array
    {
        if ($childIds === []) {
            return ['total_minor' => 0, 'currency' => null, 'by_child' => []];
        }

        $rows = Installment::query()
            ->join('invoices', 'invoices.id', '=', 'installments.invoice_id')
            ->whereIn('invoices.student_id', $childIds)
            ->whereColumn('installments.paid_minor', '<', 'installments.amount_minor')
            ->groupBy('invoices.student_id', 'invoices.currency')
            ->selectRaw('invoices.student_id as student_id, invoices.currency as currency, sum(installments.amount_minor - installments.paid_minor) as outstanding')
            ->get();

        $total = 0;
        $currency = null;
        $byChild = [];

        foreach ($rows as $row) {
            $amount = (int) $row->getAttribute('outstanding');
            $rowCurrency = $row->getAttribute('currency');
            $rowCurrency = is_string($rowCurrency) ? $rowCurrency : null;

            $total += $amount;
            $currency ??= $rowCurrency;
            $byChild[] = [
                'student_id' => (int) $row->getAttribute('student_id'),
                'amount_minor' => $amount,
                'currency' => $rowCurrency,
            ];
        }

        return ['total_minor' => $total, 'currency' => $currency, 'by_child' => $byChild];
    }
}
