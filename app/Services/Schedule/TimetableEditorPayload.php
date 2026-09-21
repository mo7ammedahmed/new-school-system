<?php

namespace App\Services\Schedule;

use App\Models\BellPeriod;
use App\Models\School;
use App\Models\TimetableEntry;
use App\Models\TimetableVersion;

/**
 * The props the timetable editor page consumes.
 *
 * The page renders every section of the school as a row and saves the grid as a
 * whole, and `TimetableController::updateEntries` replaces the version
 * wholesale — so the payload must carry *every* entry of the version. Sending
 * one section's entries would silently delete the others on save.
 */
class TimetableEditorPayload
{
    public function __construct(private readonly SchoolOptions $options) {}

    /**
     * @return array<string, mixed>
     */
    public function editor(School $school, TimetableVersion $version): array
    {
        $version->load('bellSchedule.bellPeriods');

        return [
            'school' => ['id' => $school->id, 'name' => $school->name],
            'version' => $this->version($version),
            'sections' => $this->options->sections($school),
            'subjects' => $this->options->subjects($school),
            'teachers' => $this->options->teachers($school),
            'workingDays' => $this->options->workingDays($school),
            'entries' => (new TimetableEngine($version))
                ->getEntries()
                ->map(fn (TimetableEntry $entry): array => $this->entry($entry))
                ->values()
                ->all(),
        ];
    }

    /**
     * Named fields only: serializing the model would both leak columns and hand
     * the page the wrong key (Eloquent sends `bell_schedule`, the page reads
     * `bellSchedule`).
     *
     * @return array<string, mixed>
     */
    private function version(TimetableVersion $version): array
    {
        $bellSchedule = $version->bellSchedule;

        return [
            'id' => $version->id,
            'name' => $version->name,
            'status' => $version->status,
            'bellSchedule' => $bellSchedule === null ? null : [
                'id' => $bellSchedule->id,
                'name' => $bellSchedule->name,
                'bell_periods' => $bellSchedule->bellPeriods
                    ->map(fn (BellPeriod $period): array => [
                        'id' => $period->id,
                        'number' => $period->number,
                        'label_en' => $period->label_en,
                        'label_ar' => $period->label_ar,
                        'starts_at' => $period->starts_at,
                        'ends_at' => $period->ends_at,
                        'is_break' => $period->is_break,
                    ])
                    ->values()
                    ->all(),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function entry(TimetableEntry $entry): array
    {
        return [
            'id' => $entry->id,
            'section_id' => $entry->section_id,
            'subject_id' => $entry->subject_id,
            'teacher_id' => $entry->teacher_id,
            'day_of_week' => $entry->day_of_week,
            'period_number' => $entry->period_number,
            'lesson_type' => $entry->lesson_type,
        ];
    }
}
