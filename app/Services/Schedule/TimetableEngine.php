<?php

namespace App\Services\Schedule;

use App\Enums\Schedule\LessonType;
use App\Models\BellPeriod;
use App\Models\BellSchedule;
use App\Models\SchoolScheduleSetting;
use App\Models\TeachingAssignment;
use App\Models\TimetableEntry;
use App\Models\TimetableVersion;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class TimetableEngine
{
    /**
     * @return array<string, mixed>
     */
    public function __construct(
        private readonly TimetableVersion $version,
    ) {}

    public function validateEntry(
        int $sectionId,
        int $subjectId,
        ?int $teacherId,
        int $dayOfWeek,
        int $periodNumber,
    ): void {
        $schoolId = $this->version->school_id;
        $orgId = $this->version->organization_id;

        $bellPeriods = BellPeriod::query()
            ->where('bell_schedule_id', $this->version->bell_schedule_id)
            ->pluck('is_break', 'number');

        if (! $bellPeriods->has($periodNumber)) {
            throw new \InvalidArgumentException('This period is not defined in the bell schedule.');
        }

        if ($bellPeriods[$periodNumber]) {
            throw new \InvalidArgumentException('This period is a break.');
        }

        $settings = SchoolScheduleSetting::query()
            ->where('school_id', $schoolId)
            ->first();

        if ($settings && ! in_array($dayOfWeek, $settings->working_days, true)) {
            throw new \InvalidArgumentException('This day is not a working day for this school.');
        }

        $existingSection = TimetableEntry::query()
            ->where('timetable_version_id', $this->version->id)
            ->where('section_id', $sectionId)
            ->where('day_of_week', $dayOfWeek)
            ->where('period_number', $periodNumber)
            ->exists();

        if ($existingSection) {
            throw new \InvalidArgumentException('Section already has a class at this time.');
        }

        if ($teacherId !== null) {
            $existingTeacher = TimetableEntry::query()
                ->where('timetable_version_id', $this->version->id)
                ->where('teacher_id', $teacherId)
                ->where('day_of_week', $dayOfWeek)
                ->where('period_number', $periodNumber)
                ->exists();

            if ($existingTeacher) {
                throw new \InvalidArgumentException('Teacher is already assigned at this time.');
            }

            $teacherPeriodsToday = TimetableEntry::query()
                ->where('timetable_version_id', $this->version->id)
                ->where('teacher_id', $teacherId)
                ->where('day_of_week', $dayOfWeek)
                ->count();

            $maxPerDay = $settings !== null ? $settings->teacher_max_periods_per_day : null;
            if ($maxPerDay !== null && $teacherPeriodsToday + 1 > $maxPerDay) {
                throw new \InvalidArgumentException('Teacher exceeds daily period limit.');
            }

            $workingDays = $settings !== null ? $settings->working_days : [0, 1, 2, 3, 4];
            $teacherPeriodsWeek = TimetableEntry::query()
                ->where('timetable_version_id', $this->version->id)
                ->where('teacher_id', $teacherId)
                ->whereIn('day_of_week', $workingDays)
                ->count();

            $maxPerWeek = $settings !== null ? $settings->teacher_max_periods_per_week : null;
            if ($maxPerWeek !== null && $teacherPeriodsWeek + 1 > $maxPerWeek) {
                throw new \InvalidArgumentException('Teacher exceeds weekly period limit.');
            }
        }
    }

    public function addEntry(
        int $sectionId,
        int $subjectId,
        ?int $teacherId,
        int $dayOfWeek,
        int $periodNumber,
        LessonType $lessonType = LessonType::Lesson,
    ): TimetableEntry {
        $this->validateEntry($sectionId, $subjectId, $teacherId, $dayOfWeek, $periodNumber);

        return TimetableEntry::query()->create([
            'organization_id' => $this->version->organization_id,
            'school_id' => $this->version->school_id,
            'timetable_version_id' => $this->version->id,
            'section_id' => $sectionId,
            'subject_id' => $subjectId,
            'teacher_id' => $teacherId,
            'day_of_week' => $dayOfWeek,
            'period_number' => $periodNumber,
            'lesson_type' => $lessonType,
        ]);
    }

    /**
     * Every entry of the version, which is what the editor loads and what a
     * save replaces wholesale.
     *
     * @return Collection<int, TimetableEntry>
     */
    public function getEntries(): Collection
    {
        return TimetableEntry::query()
            ->where('timetable_version_id', $this->version->id)
            ->with(['subject', 'teacher'])
            ->orderBy('section_id')
            ->orderBy('day_of_week')
            ->orderBy('period_number')
            ->get();
    }

    /**
     * @return Collection<int, TimetableEntry>
     */
    public function getEntriesForSection(int $sectionId): Collection
    {
        return TimetableEntry::query()
            ->where('timetable_version_id', $this->version->id)
            ->where('section_id', $sectionId)
            ->with(['subject', 'teacher'])
            ->orderBy('day_of_week')
            ->orderBy('period_number')
            ->get();
    }

    /**
     * @return Collection<int, TimetableEntry>
     */
    public function getEntriesForTeacher(int $teacherId): Collection
    {
        return TimetableEntry::query()
            ->where('timetable_version_id', $this->version->id)
            ->where('teacher_id', $teacherId)
            ->with(['section', 'subject'])
            ->orderBy('day_of_week')
            ->orderBy('period_number')
            ->get();
    }

    /**
     * @return array<string, mixed>
     */
    public function getConflicts(): array
    {
        $conflicts = ['teacher' => [], 'section' => [], 'period' => []];

        $query = TimetableEntry::query()
            ->where('timetable_version_id', $this->version->id)
            ->get();

        foreach ($query as $entry) {
            $teacherConflict = TimetableEntry::query()
                ->where('timetable_version_id', $this->version->id)
                ->where('teacher_id', $entry->teacher_id)
                ->where('day_of_week', $entry->day_of_week)
                ->where('period_number', $entry->period_number)
                ->where('id', '!=', $entry->id)
                ->exists();

            if ($teacherConflict) {
                $conflicts['teacher'][] = $entry->id;
            }

            $sectionConflict = TimetableEntry::query()
                ->where('timetable_version_id', $this->version->id)
                ->where('section_id', $entry->section_id)
                ->where('day_of_week', $entry->day_of_week)
                ->where('period_number', $entry->period_number)
                ->where('id', '!=', $entry->id)
                ->exists();

            if ($sectionConflict) {
                $conflicts['section'][] = $entry->id;
            }
        }

        return $conflicts;
    }

    public function publish(): void
    {
        $this->version->update(['status' => 'published', 'published_at' => now()]);
    }

    public function archive(): void
    {
        $this->version->update(['status' => 'archived']);
    }

    /**
     * Generate a simple allocation based on teaching assignments.
     * Distributes periods across available days and periods.
     *
     * @return Collection<int, TimetableEntry>
     */
    public function autoAllocate(): Collection
    {
        return DB::transaction(function (): Collection {
            $entries = collect();

            $bellSchedule = BellSchedule::find($this->version->bell_schedule_id);
            $bellPeriods = $bellSchedule?->bellPeriods()
                ->where('is_break', false)
                ->orderBy('number')
                ->get() ?? collect();

            $workingDays = [0, 1, 2, 3, 4];
            $settings = SchoolScheduleSetting::query()
                ->where('school_id', $this->version->school_id)
                ->first();

            if ($settings) {
                $workingDays = $settings->working_days;
            }

            $assignments = TeachingAssignment::query()
                ->where('school_id', $this->version->school_id)
                ->where('organization_id', $this->version->organization_id)
                ->with(['section', 'subject'])
                ->get();

            $slotIndex = 0;
            $periods = $bellPeriods->pluck('number')->all();

            foreach ($assignments as $assignment) {
                $requiredPeriods = $assignment->periods_per_week ?? 1;

                for ($i = 0; $i < $requiredPeriods; $i++) {
                    $placed = false;
                    $attempts = 0;

                    while (! $placed && $attempts < 50) {
                        $dayIdx = $slotIndex % count($workingDays);
                        $day = $workingDays[$dayIdx];
                        $period = $periods[$slotIndex % count($periods)];
                        $slotIndex++;

                        try {
                            $entry = $this->addEntry(
                                $assignment->section_id,
                                $assignment->subject_id,
                                $assignment->teacher_id,
                                $day,
                                $period,
                            );
                            $entries->push($entry);
                            $placed = true;
                        } catch (\Exception $e) {
                            $attempts++;
                        }
                    }
                }
            }

            return $entries;
        });
    }
}
