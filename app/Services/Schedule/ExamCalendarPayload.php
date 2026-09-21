<?php

namespace App\Services\Schedule;

use App\Models\ExamPaper;
use App\Models\ExamSchedule;
use App\Models\School;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;

/**
 * The props the exam calendar page consumes.
 *
 * The page is rendered by two actions: `index` shows the school's exam periods
 * with no period selected, and `show` adds the selected period's papers, the
 * calendar counts and the day agenda. Both shapes live here so the shared part
 * exists once, and the page's contract has a single owner.
 */
class ExamCalendarPayload
{
    public function __construct(
        private readonly ExamConflictDetector $detector,
        private readonly SchoolOptions $options,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function index(School $school): array
    {
        return [
            'school' => $this->school($school),
            'schedules' => $this->schedules($school),
            'can' => $this->abilities($school),
            'academicYears' => $this->options->academicYears($school),
            'workingDays' => $this->options->workingDays($school),
            'selectedSchedule' => null,
            'classes' => [],
            'sections' => [],
            'subjects' => [],
            'teachers' => [],
            'classSubjects' => [],
            'papers' => [],
            'calendar' => [],
            'dayAgenda' => [],
            'selectedDate' => null,
            'coverageWarnings' => [],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function show(Request $request, School $school, ExamSchedule $schedule): array
    {
        $papers = $this->papersFor($schedule);
        $selectedDate = $this->resolveSelectedDate($request, $schedule);

        return [
            'school' => $this->school($school),
            'schedules' => $this->schedules($school),
            'can' => $this->abilities($school),
            'academicYears' => $this->options->academicYears($school),
            'workingDays' => $this->options->workingDays($school),
            'selectedSchedule' => $this->schedule($schedule),
            'classes' => $this->options->classes($school),
            'sections' => $this->options->sections($school),
            'subjects' => $this->options->subjects($school),
            'teachers' => $this->options->teachers($school),
            'classSubjects' => $this->options->classSubjects($school),
            'papers' => $papers->map(fn (ExamPaper $paper): array => $this->paper($paper))->values()->all(),
            'calendar' => $this->calendarCounts($papers),
            'selectedDate' => $selectedDate,
            'dayAgenda' => $this->dayAgenda($papers, $selectedDate),
            'coverageWarnings' => $this->detector->coverageWarnings($schedule),
        ];
    }

    /**
     * @return array{id: int, name: string}
     */
    private function school(School $school): array
    {
        return ['id' => $school->id, 'name' => $school->name];
    }

    /**
     * @return array<string, bool>
     */
    private function abilities(School $school): array
    {
        return [
            'manage' => Gate::allows('manage-schedule', $school),
            'publish' => Gate::allows('publish-schedule', $school),
            'delete' => Gate::allows('delete-schedule', $school),
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function schedules(School $school): array
    {
        return array_values(ExamSchedule::query()
            ->where('school_id', $school->id)
            ->withCount('papers')
            ->with('academicYear:id,name')
            ->latest('starts_on')
            ->get()
            ->map(fn (ExamSchedule $schedule): array => $this->schedule($schedule))
            ->all());
    }

    /**
     * @return Collection<int, ExamPaper>
     */
    private function papersFor(ExamSchedule $schedule): Collection
    {
        return ExamPaper::query()
            ->where('exam_schedule_id', $schedule->id)
            ->with([
                'section:id,name,class_id',
                'academicClass:id,name',
                'subject:id,code,name_en,name_ar',
                'invigilators.teacher:id,name',
            ])
            ->orderBy('exam_date')
            ->orderBy('starts_at')
            ->get();
    }

    /**
     * @return array<string, mixed>
     */
    private function paper(ExamPaper $paper): array
    {
        return [
            'id' => $paper->id,
            'class_id' => $paper->class_id,
            'class_name' => $paper->academicClass?->name,
            'section_id' => $paper->section_id,
            'section_name' => $paper->section?->name,
            'subject_id' => $paper->subject_id,
            'subject_name_en' => $paper->subject?->name_en,
            'subject_name_ar' => $paper->subject?->name_ar,
            'subject_color' => $paper->subject?->color,
            'exam_date' => $paper->exam_date->toDateString(),
            'starts_at' => substr((string) $paper->starts_at, 0, 5),
            'ends_at' => substr((string) $paper->ends_at, 0, 5),
            'room' => $paper->room,
            'max_score' => $paper->max_score,
            'instructions' => $paper->instructions,
            'invigilators' => $paper->relationLoaded('invigilators')
                ? $paper->invigilators->map(fn ($invigilator): array => [
                    'id' => $invigilator->teacher_id,
                    'name' => (string) $invigilator->teacher?->name,
                    'role' => $invigilator->role,
                ])->values()->all()
                : [],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function schedule(ExamSchedule $schedule): array
    {
        return [
            'id' => $schedule->id,
            'title' => $schedule->title,
            'title_ar' => $schedule->title_ar,
            'term' => $schedule->term,
            'status' => $schedule->status,
            'starts_on' => $schedule->starts_on->toDateString(),
            'ends_on' => $schedule->ends_on->toDateString(),
            'academic_year_id' => $schedule->academic_year_id,
            'academic_year' => $schedule->relationLoaded('academicYear') ? $schedule->academicYear?->name : null,
            'papers_count' => $schedule->papers_count ?? null,
            'published_at' => $schedule->published_at?->toIso8601String(),
            'lock_version' => $schedule->lock_version,
        ];
    }

    /**
     * Papers per day, keyed by date, for the month calendar's counters.
     *
     * @param  Collection<int, ExamPaper>  $papers
     * @return array<string, int>
     */
    private function calendarCounts(Collection $papers): array
    {
        $counts = [];

        foreach ($papers as $paper) {
            $key = $paper->exam_date->toDateString();
            $counts[$key] = ($counts[$key] ?? 0) + 1;
        }

        return $counts;
    }

    /**
     * The papers of one day, as the agenda strip renders them.
     *
     * @param  Collection<int, ExamPaper>  $papers
     * @return list<array<string, mixed>>
     */
    private function dayAgenda(Collection $papers, ?string $date): array
    {
        if ($date === null) {
            return [];
        }

        return array_values($papers
            ->filter(fn (ExamPaper $paper): bool => $paper->exam_date->toDateString() === $date)
            ->map(fn (ExamPaper $paper): array => [
                'id' => $paper->id,
                'class_name' => $paper->academicClass?->name,
                'section_name' => $paper->section?->name,
                'subject_name_en' => $paper->subject?->name_en,
                'subject_name_ar' => $paper->subject?->name_ar,
                'starts_at' => substr((string) $paper->starts_at, 0, 5),
                'ends_at' => substr((string) $paper->ends_at, 0, 5),
                'room' => $paper->room,
                'invigilators' => $paper->invigilators
                    ->map(fn ($invigilator): string => (string) $invigilator->teacher?->name)
                    ->values()
                    ->all(),
            ])
            ->all());
    }

    /**
     * The day the page opens on: the requested day when it is real, otherwise
     * the period's first paper, otherwise the period's first day.
     */
    private function resolveSelectedDate(Request $request, ExamSchedule $schedule): string
    {
        $requested = $request->query('date');

        if (is_string($requested)) {
            $normalized = $this->normalizeDate($requested);

            if ($normalized !== null) {
                return $normalized;
            }
        }

        // `value()` returns the cast value, so the first paper arrives as a date
        // object rather than a string; handling both keeps the default day on the
        // first exam instead of falling through to the period's start date.
        $firstPaper = ExamPaper::query()
            ->where('exam_schedule_id', $schedule->id)
            ->orderBy('exam_date')
            ->value('exam_date');

        if ($firstPaper instanceof \DateTimeInterface) {
            return $firstPaper->format('Y-m-d');
        }

        if (is_string($firstPaper) && $firstPaper !== '') {
            return CarbonImmutable::parse($firstPaper)->toDateString();
        }

        return $schedule->starts_on->toDateString();
    }

    /**
     * Accept only a real `Y-m-d` day; anything else falls back to the period's
     * own first day.
     */
    private function normalizeDate(string $value): ?string
    {
        if ($value === '') {
            return null;
        }

        $date = \DateTimeImmutable::createFromFormat('!Y-m-d', $value);
        $errors = \DateTimeImmutable::getLastErrors();

        if ($date === false) {
            return null;
        }

        if (is_array($errors) && ($errors['warning_count'] > 0 || $errors['error_count'] > 0)) {
            return null;
        }

        return $date->format('Y-m-d');
    }
}
