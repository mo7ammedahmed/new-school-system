<?php

namespace App\Http\Controllers;

use App\Concerns\ResolvesScheduleSchool;
use App\Http\Requests\Schedule\ExamScheduleFormRequest;
use App\Http\Responses\ScheduleConflictResponse;
use App\Models\ExamSchedule;
use App\Services\AuditLogger;
use App\Services\Schedule\ExamCalendarPayload;
use App\Services\Schedule\ExamConflictDetector;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The actions behind the exam calendar. Page props belong to
 * {@see ExamCalendarPayload}; conflict policy to {@see ExamConflictDetector}.
 */
class ExamScheduleController extends Controller
{
    use ResolvesScheduleSchool;

    public function index(int $school, ExamCalendarPayload $payload): Response
    {
        return Inertia::render('admin/schedule/exams/index', $payload->index($this->scheduleSchool($school)));
    }

    public function show(Request $request, int $school, ExamSchedule $examSchedule, ExamCalendarPayload $payload): Response
    {
        $schoolModel = $this->scheduleSchool($school);
        $this->ensureSameSchool($schoolModel->id, $examSchedule->school_id);

        return Inertia::render('admin/schedule/exams/index', $payload->show($request, $schoolModel, $examSchedule));
    }

    public function store(ExamScheduleFormRequest $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->scheduleSchool($school);

        $schedule = ExamSchedule::create([
            'organization_id' => $schoolModel->organization_id,
            'school_id' => $schoolModel->id,
            'academic_year_id' => $request->integer('academic_year_id'),
            'term' => $request->input('term'),
            'title' => $request->string('title')->toString(),
            'title_ar' => $request->input('title_ar'),
            'starts_on' => $request->string('starts_on')->toString(),
            'ends_on' => $request->string('ends_on')->toString(),
            'created_by' => $request->user()->id,
        ]);

        $audit->record('exam.schedule_created', $schedule, after: [
            'title' => $schedule->title,
            'starts_on' => $schedule->starts_on->toDateString(),
            'ends_on' => $schedule->ends_on->toDateString(),
        ]);

        return redirect()
            ->route('admin.schedule.exams.show', [$schoolModel->id, $schedule->id])
            ->with('success', 'Exam period created.');
    }

    public function update(ExamScheduleFormRequest $request, int $school, ExamSchedule $examSchedule, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->scheduleSchool($school);
        $this->ensureSameSchool($schoolModel->id, $examSchedule->school_id);

        if ($examSchedule->isPublished()) {
            return back()->with('error', 'Published exam periods are read-only. Archive it or create a new one.');
        }

        $before = [
            'title' => $examSchedule->title,
            'starts_on' => $examSchedule->starts_on->toDateString(),
            'ends_on' => $examSchedule->ends_on->toDateString(),
        ];

        $examSchedule->update([
            'academic_year_id' => $request->integer('academic_year_id'),
            'term' => $request->input('term'),
            'title' => $request->string('title')->toString(),
            'title_ar' => $request->input('title_ar'),
            'starts_on' => $request->string('starts_on')->toString(),
            'ends_on' => $request->string('ends_on')->toString(),
        ]);

        $audit->record('exam.schedule_updated', $examSchedule, before: $before, after: [
            'title' => $examSchedule->title,
            'starts_on' => $examSchedule->starts_on->toDateString(),
            'ends_on' => $examSchedule->ends_on->toDateString(),
        ]);

        return back()->with('success', 'Exam period updated.');
    }

    public function destroy(int $school, ExamSchedule $examSchedule, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->scheduleSchool($school, 'delete-schedule');
        $this->ensureSameSchool($schoolModel->id, $examSchedule->school_id);

        $audit->record('exam.schedule_deleted', $examSchedule, before: ['title' => $examSchedule->title]);

        $examSchedule->delete();

        return redirect()
            ->route('admin.schedule.exams.index', $schoolModel->id)
            ->with('success', 'Exam period deleted.');
    }

    public function publish(Request $request, int $school, ExamSchedule $examSchedule, ExamConflictDetector $detector, AuditLogger $audit): RedirectResponse|JsonResponse
    {
        $schoolModel = $this->scheduleSchool($school, 'publish-schedule');
        $this->ensureSameSchool($schoolModel->id, $examSchedule->school_id);

        $request->validate(['acknowledge_warnings' => ['nullable', 'boolean']]);

        if ($examSchedule->isPublished()) {
            return back()->with('error', 'This exam period is already published.');
        }

        // Coverage gaps only warn; the detected conflicts decide whether this can
        // publish at all. Both are severity-split by the detector.
        $conflicts = $detector->coverageWarnings($examSchedule);

        foreach ($examSchedule->papers()->with('invigilators')->get() as $paper) {
            foreach ($detector->detect(
                $examSchedule,
                ExamConflictDetector::inputFor($paper),
                array_values(array_map('intval', $paper->invigilators->pluck('teacher_id')->all())),
                $paper->id,
            ) as $conflict) {
                $conflict['params']['paperId'] = $paper->id;
                $conflicts[] = $conflict;
            }
        }

        $partitioned = $detector->partition($conflicts);

        if ($partitioned['errors'] !== []) {
            return ScheduleConflictResponse::make($request, $partitioned['errors'], 'Cannot publish: resolve the conflicts first.');
        }

        if ($partitioned['warnings'] !== [] && ! $request->boolean('acknowledge_warnings')) {
            return ScheduleConflictResponse::make($request, $partitioned['warnings'], 'Warnings need an explicit acknowledgement before publishing.');
        }

        DB::transaction(function () use ($examSchedule, $request): void {
            ExamSchedule::query()
                ->where('school_id', $examSchedule->school_id)
                ->where('academic_year_id', $examSchedule->academic_year_id)
                ->whereKeyNot($examSchedule->id)
                ->published()
                ->lockForUpdate()
                ->update(['status' => 'archived']);

            $locked = ExamSchedule::query()->whereKey($examSchedule->id)->lockForUpdate()->firstOrFail();

            $locked->update([
                'status' => 'published',
                'published_by' => $request->user()->id,
                'published_at' => now(),
                'lock_version' => $locked->lock_version + 1,
            ]);
        });

        $audit->record('exam.schedule_published', $examSchedule, metadata: [
            'warnings' => count($partitioned['warnings']),
            'acknowledged' => $partitioned['warnings'] !== [],
        ]);

        return back()->with('success', 'Exam period published.');
    }

    public function archive(int $school, ExamSchedule $examSchedule, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->scheduleSchool($school, 'delete-schedule');
        $this->ensureSameSchool($schoolModel->id, $examSchedule->school_id);

        $examSchedule->update(['status' => 'archived']);

        $audit->record('exam.schedule_archived', $examSchedule);

        return back()->with('success', 'Exam period archived.');
    }
}
