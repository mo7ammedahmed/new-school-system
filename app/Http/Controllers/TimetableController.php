<?php

namespace App\Http\Controllers;

use App\Concerns\ResolvesScheduleSchool;
use App\Models\TimetableEntry;
use App\Models\TimetableVersion;
use App\Services\AuditLogger;
use App\Services\Schedule\SchoolOptions;
use App\Services\Schedule\TimetableEditorPayload;
use App\Services\Schedule\TimetableEngine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The actions behind a timetable version. The editor's props belong to
 * {@see TimetableEditorPayload}; placement rules to {@see TimetableEngine}.
 */
class TimetableController extends Controller
{
    use ResolvesScheduleSchool;

    public function index(Request $request, int $school): Response
    {
        $schoolModel = $this->scheduleSchool($school);

        $versions = TimetableVersion::query()
            ->where('school_id', $schoolModel->id)
            ->with('bellSchedule')
            ->latest()
            ->get();

        return Inertia::render('admin/schedule/timetable/index', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'versions' => $versions,
        ]);
    }

    public function create(int $school, SchoolOptions $options): Response
    {
        $schoolModel = $this->scheduleSchool($school);

        return Inertia::render('admin/schedule/timetable/create', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'academicYears' => $options->academicYears($schoolModel),
            'bellSchedules' => $options->bellSchedules($schoolModel),
        ]);
    }

    public function store(Request $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->scheduleSchool($school);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'academic_year_id' => ['required', 'integer', 'exists:academic_years,id'],
            'bell_schedule_id' => ['required', 'integer', 'exists:bell_schedules,id'],
            'effective_from' => ['nullable', 'date'],
            'effective_to' => ['nullable', 'date', 'after:effective_from'],
        ]);

        $version = TimetableVersion::create([
            'organization_id' => $schoolModel->organization_id,
            'school_id' => $schoolModel->id,
            'academic_year_id' => $data['academic_year_id'],
            'name' => $data['name'],
            'bell_schedule_id' => $data['bell_schedule_id'],
            'effective_from' => $data['effective_from'],
            'effective_to' => $data['effective_to'],
            'created_by' => $request->user()->id,
        ]);

        $audit->record('schedule.timetable_created', $version);

        return redirect()->route('admin.schedule.timetable.entries', [$schoolModel->id, $version->id]);
    }

    public function edit(int $school, TimetableVersion $version, TimetableEditorPayload $payload): Response
    {
        $schoolModel = $this->scheduleSchool($school);
        $this->ensureSameSchool($schoolModel->id, $version->school_id);

        return Inertia::render('admin/schedule/timetable/edit', $payload->editor($schoolModel, $version));
    }

    public function updateEntries(Request $request, int $school, TimetableVersion $version): RedirectResponse
    {
        $schoolModel = $this->scheduleSchool($school);
        $this->ensureSameSchool($schoolModel->id, $version->school_id);

        if ($version->isPublished()) {
            abort(403, 'Published timetable versions are immutable. Clone it into a new draft first.');
        }

        $engine = new TimetableEngine($version);

        $validated = $request->validate([
            'entries' => ['required', 'array'],
            'entries.*.section_id' => ['required', 'integer'],
            'entries.*.subject_id' => ['required', 'integer'],
            'entries.*.teacher_id' => ['nullable', 'integer'],
            'entries.*.day_of_week' => ['required', 'integer', 'min:0', 'max:6'],
            'entries.*.period_number' => ['required', 'integer', 'min:1'],
            'entries.*.lesson_type' => ['required', 'string'],
        ]);

        DB::transaction(function () use ($engine, $validated, $version) {
            TimetableEntry::where('timetable_version_id', $version->id)->delete();

            foreach ($validated['entries'] as $entry) {
                $engine->validateEntry(
                    $entry['section_id'],
                    $entry['subject_id'],
                    $entry['teacher_id'],
                    $entry['day_of_week'],
                    $entry['period_number'],
                );

                TimetableEntry::create(array_merge(
                    $entry,
                    [
                        'organization_id' => $version->organization_id,
                        'school_id' => $version->school_id,
                        'timetable_version_id' => $version->id,
                    ],
                ));
            }
        });

        return back()->with('success', 'Timetable updated.');
    }

    public function publish(int $school, TimetableVersion $version): RedirectResponse
    {
        $schoolModel = $this->scheduleSchool($school, 'publish-schedule');
        $this->ensureSameSchool($schoolModel->id, $version->school_id);

        $engine = new TimetableEngine($version);
        $conflicts = $engine->getConflicts();

        if (! empty($conflicts['teacher']) || ! empty($conflicts['section'])) {
            return back()->with('error', 'Cannot publish: resolve conflicts first.');
        }

        $engine->publish();

        return back()->with('success', 'Timetable published.');
    }

    public function destroy(int $school, TimetableVersion $version): RedirectResponse
    {
        $schoolModel = $this->scheduleSchool($school, 'delete-schedule');
        $this->ensureSameSchool($schoolModel->id, $version->school_id);

        $version->delete();

        return redirect()->route('admin.schedule.timetable.index', $schoolModel->id)
            ->with('success', 'Timetable version deleted.');
    }
}
