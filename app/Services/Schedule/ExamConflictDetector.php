<?php

namespace App\Services\Schedule;

use App\Enums\UserRole;
use App\Models\BellPeriod;
use App\Models\ClassSubject;
use App\Models\ExamPaper;
use App\Models\ExamSchedule;
use App\Models\SchoolScheduleSetting;
use App\Models\Section;
use App\Models\TimetableEntry;
use App\Models\TimetableVersion;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

/**
 * Pure-ish validator for exam papers.
 *
 * The detector returns machine codes with parameters, never display strings,
 * so the client can translate them for both Arabic and English.
 */
class ExamConflictDetector
{
    public const ERROR = 'error';

    public const WARNING = 'warning';

    /**
     * @param  array{exam_date: string, starts_at: string, ends_at: string, class_id: int, section_id: int, subject_id: int, room?: string|null}  $paper
     * @param  list<int>  $invigilatorIds
     * @return list<array{code: string, severity: string, params: array<string, mixed>}>
     */
    public function detect(ExamSchedule $schedule, array $paper, array $invigilatorIds = [], ?int $excludePaperId = null): array
    {
        $conflicts = [];

        $date = CarbonImmutable::parse($paper['exam_date']);
        $startsAt = $paper['starts_at'];
        $endsAt = $paper['ends_at'];

        if ($date->lt($schedule->starts_on) || $date->gt($schedule->ends_on)) {
            $conflicts[] = $this->error('EXAM_OUTSIDE_WINDOW', [
                'date' => $date->toDateString(),
                'startsOn' => $schedule->starts_on->toDateString(),
                'endsOn' => $schedule->ends_on->toDateString(),
            ]);
        }

        $settings = SchoolScheduleSetting::forSchool($schedule->school);
        $workingDays = $settings->working_days;

        if (! in_array($date->dayOfWeek, $workingDays, true)) {
            $conflicts[] = $this->error('EXAM_NON_WORKING_DAY', [
                'date' => $date->toDateString(),
                'weekday' => $date->dayOfWeek,
            ]);
        }

        $sameDay = ExamPaper::query()
            ->where('school_id', $schedule->school_id)
            ->whereDate('exam_date', $date->toDateString())
            ->when($excludePaperId !== null, fn ($query) => $query->whereKeyNot($excludePaperId))
            ->get();

        $sectionPapers = $sameDay->where('section_id', $paper['section_id']);
        $maxPerDay = $settings->max_exams_per_day_per_section;

        if ($sectionPapers->count() + 1 > $maxPerDay) {
            $conflicts[] = $this->error('SECTION_TOO_MANY_PAPERS_PER_DAY', [
                'sectionId' => $paper['section_id'],
                'date' => $date->toDateString(),
                'max' => $maxPerDay,
                'count' => $sectionPapers->count() + 1,
            ]);
        }

        foreach ($sectionPapers as $existing) {
            if ($this->overlaps($startsAt, $endsAt, $existing->starts_at, $existing->ends_at)) {
                $conflicts[] = $this->error('SECTION_TIME_OVERLAP', [
                    'sectionId' => $paper['section_id'],
                    'paperId' => $existing->id,
                    'subjectId' => $existing->subject_id,
                ]);
                break;
            }
        }

        $room = $paper['room'] ?? null;

        if ($room !== null && $room !== '') {
            $roomClash = $sameDay->first(
                fn (ExamPaper $existing): bool => $existing->room === $room
                    && $this->overlaps($startsAt, $endsAt, $existing->starts_at, $existing->ends_at),
            );

            if ($roomClash !== null) {
                $conflicts[] = $this->error('ROOM_DOUBLE_BOOKED', [
                    'room' => $room,
                    'date' => $date->toDateString(),
                    'paperId' => $roomClash->id,
                ]);
            }
        }

        if ($invigilatorIds !== []) {
            $conflicts = array_merge($conflicts, $this->invigilatorConflicts(
                $schedule,
                $invigilatorIds,
                $date,
                $startsAt,
                $endsAt,
                $sameDay,
            ));
        }

        if (! ClassSubject::query()
            ->where('class_id', $paper['class_id'])
            ->where('subject_id', $paper['subject_id'])
            ->exists()) {
            $conflicts[] = $this->warning('SUBJECT_NOT_IN_CLASS', [
                'classId' => $paper['class_id'],
                'subjectId' => $paper['subject_id'],
            ]);
        }

        return $conflicts;
    }

    /**
     * The detector's input shape, built from a stored paper.
     *
     * @return array{exam_date: string, starts_at: string, ends_at: string, class_id: int, section_id: int, subject_id: int, room: string|null}
     */
    public static function inputFor(ExamPaper $paper): array
    {
        return [
            'exam_date' => $paper->exam_date->toDateString(),
            'starts_at' => $paper->starts_at,
            'ends_at' => $paper->ends_at,
            'class_id' => $paper->class_id,
            'section_id' => $paper->section_id,
            'subject_id' => $paper->subject_id,
            'room' => $paper->room,
        ];
    }

    /**
     * Split a conflict list into what blocks a save and what only warns, so no
     * caller has to know that severity is the discriminator.
     *
     * @param  list<array{code: string, severity: string, params: array<string, mixed>}>  $conflicts
     * @return array{errors: list<array{code: string, severity: string, params: array<string, mixed>}>, warnings: list<array{code: string, severity: string, params: array<string, mixed>}>}
     */
    public function partition(array $conflicts): array
    {
        $errors = [];
        $warnings = [];

        foreach ($conflicts as $conflict) {
            if ($conflict['severity'] === self::ERROR) {
                $errors[] = $conflict;

                continue;
            }

            $warnings[] = $conflict;
        }

        return ['errors' => $errors, 'warnings' => $warnings];
    }

    /**
     * Sections × subjects that the class curriculum requires but that have no paper yet.
     *
     * @return list<array{code: string, severity: string, params: array<string, mixed>}>
     */
    public function coverageWarnings(ExamSchedule $schedule): array
    {
        $requirements = ClassSubject::query()
            ->where('school_id', $schedule->school_id)
            ->get(['id', 'class_id', 'subject_id']);

        if ($requirements->isEmpty()) {
            return [];
        }

        $sectionsByClass = Section::query()
            ->where('school_id', $schedule->school_id)
            ->get(['id', 'class_id'])
            ->groupBy('class_id');

        $papersByClass = ExamPaper::query()
            ->where('exam_schedule_id', $schedule->id)
            ->get(['id', 'class_id', 'section_id', 'subject_id'])
            ->groupBy('class_id');

        $warnings = [];

        foreach ($requirements as $requirement) {
            $sections = $sectionsByClass->get($requirement->class_id);

            if ($sections === null) {
                continue;
            }

            $papers = $papersByClass->get($requirement->class_id) ?? collect();
            $coveredSectionIds = $papers
                ->where('subject_id', $requirement->subject_id)
                ->pluck('section_id')
                ->all();

            foreach ($sections as $section) {
                if (! in_array($section->id, $coveredSectionIds, true)) {
                    $warnings[] = $this->warning('MISSING_PAPERS', [
                        'classId' => $requirement->class_id,
                        'sectionId' => $section->id,
                        'subjectId' => $requirement->subject_id,
                    ]);
                }
            }
        }

        return $warnings;
    }

    /**
     * @param  list<int>  $invigilatorIds
     * @param  Collection<int, ExamPaper>  $sameDay
     * @return list<array{code: string, severity: string, params: array<string, mixed>}>
     */
    private function invigilatorConflicts(
        ExamSchedule $schedule,
        array $invigilatorIds,
        CarbonImmutable $date,
        string $startsAt,
        string $endsAt,
        $sameDay,
    ): array {
        $conflicts = [];

        $teachers = User::query()->whereIn('id', $invigilatorIds)->get()->keyBy('id');

        foreach ($invigilatorIds as $teacherId) {
            $teacher = $teachers->get($teacherId);

            if ($teacher === null
                || ! $teacher->hasRole(UserRole::Teacher)
                || $teacher->organization_id !== $schedule->organization_id) {
                $conflicts[] = $this->error('INVIGILATOR_NOT_A_TEACHER_OF_SCHOOL', [
                    'teacherId' => $teacherId,
                ]);

                continue;
            }

            $clash = ExamPaper::query()
                ->where('school_id', $schedule->school_id)
                ->whereDate('exam_date', $date->toDateString())
                ->whereHas('invigilators', fn ($query) => $query->where('teacher_id', $teacherId))
                ->get()
                ->first(fn (ExamPaper $existing): bool => $this->overlaps($startsAt, $endsAt, $existing->starts_at, $existing->ends_at));

            if ($clash !== null) {
                $conflicts[] = $this->error('INVIGILATOR_DOUBLE_BOOKED', [
                    'teacherId' => $teacherId,
                    'date' => $date->toDateString(),
                    'paperId' => $clash->id,
                ]);
            }

            if ($this->teacherHasClass($schedule, $teacherId, $date->dayOfWeek, $startsAt, $endsAt)) {
                $conflicts[] = $this->warning('INVIGILATOR_HAS_CLASS', [
                    'teacherId' => $teacherId,
                    'date' => $date->toDateString(),
                ]);
            }
        }

        return $conflicts;
    }

    private function teacherHasClass(
        ExamSchedule $schedule,
        int $teacherId,
        int $weekday,
        string $startsAt,
        string $endsAt,
    ): bool {
        $versions = TimetableVersion::query()
            ->where('school_id', $schedule->school_id)
            ->where('status', 'published')
            ->get(['id', 'bell_schedule_id']);

        foreach ($versions as $version) {
            $periodNumbers = TimetableEntry::query()
                ->where('timetable_version_id', $version->id)
                ->where('teacher_id', $teacherId)
                ->where('day_of_week', $weekday)
                ->pluck('period_number');

            if ($periodNumbers->isEmpty()) {
                continue;
            }

            $periods = BellPeriod::query()
                ->where('bell_schedule_id', $version->bell_schedule_id)
                ->whereIn('number', $periodNumbers->all())
                ->get();

            foreach ($periods as $period) {
                if ($this->overlaps($startsAt, $endsAt, $period->starts_at, $period->ends_at)) {
                    return true;
                }
            }
        }

        return false;
    }

    private function overlaps(string $startA, string $endA, string $startB, string $endB): bool
    {
        return $this->minutes($startA) < $this->minutes($endB)
            && $this->minutes($startB) < $this->minutes($endA);
    }

    private function minutes(string $time): int
    {
        $parts = explode(':', $time);

        return ((int) $parts[0]) * 60 + ((int) ($parts[1] ?? 0));
    }

    /**
     * @param  array<string, mixed>  $params
     * @return array{code: string, severity: string, params: array<string, mixed>}
     */
    private function error(string $code, array $params = []): array
    {
        return ['code' => $code, 'severity' => self::ERROR, 'params' => $params];
    }

    /**
     * @param  array<string, mixed>  $params
     * @return array{code: string, severity: string, params: array<string, mixed>}
     */
    private function warning(string $code, array $params = []): array
    {
        return ['code' => $code, 'severity' => self::WARNING, 'params' => $params];
    }
}
