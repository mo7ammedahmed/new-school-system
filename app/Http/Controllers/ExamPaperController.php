<?php

namespace App\Http\Controllers;

use App\Concerns\ResolvesScheduleSchool;
use App\Enums\UserRole;
use App\Http\Requests\Schedule\ExamPaperFormRequest;
use App\Http\Responses\ScheduleConflictResponse;
use App\Models\ExamPaper;
use App\Models\ExamPaperInvigilator;
use App\Models\ExamSchedule;
use App\Models\School;
use App\Models\Section;
use App\Models\Subject;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\Schedule\ExamConflictDetector;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ExamPaperController extends Controller
{
    use ResolvesScheduleSchool;

    public function store(
        ExamPaperFormRequest $request,
        int $school,
        ExamSchedule $examSchedule,
        ExamConflictDetector $detector,
        AuditLogger $audit,
    ): RedirectResponse|JsonResponse {
        $schoolModel = $this->scheduleSchool($school);
        $this->ensureSameSchool($schoolModel->id, $examSchedule->school_id);

        if (! $examSchedule->isEditable()) {
            return back()->with('error', 'Published exam periods are read-only.');
        }

        $data = $this->validatedPaperData($request, $schoolModel);
        $invigilatorIds = $this->invigilatorIds($request, $schoolModel);

        $this->assertNoDuplicatePaper($examSchedule, $data['section_id'], $data['subject_id']);

        $conflicts = $detector->detect($examSchedule, $data, $invigilatorIds);

        $errors = $detector->partition($conflicts)['errors'];

        if ($errors !== []) {
            return ScheduleConflictResponse::make($request, $errors, 'This paper conflicts with the current schedule.');
        }

        $paper = DB::transaction(function () use ($schoolModel, $examSchedule, $data, $invigilatorIds): ExamPaper {
            $paper = ExamPaper::create([
                ...$data,
                'organization_id' => $schoolModel->organization_id,
                'school_id' => $schoolModel->id,
                'exam_schedule_id' => $examSchedule->id,
            ]);

            $this->syncInvigilators($schoolModel, $paper, $invigilatorIds);

            return $paper;
        });

        $audit->record('exam.paper_created', $paper, after: $this->auditPayload($paper));

        return back()->with('success', 'Exam paper added.');
    }

    public function storeBulk(
        ExamPaperFormRequest $request,
        int $school,
        ExamSchedule $examSchedule,
        ExamConflictDetector $detector,
        AuditLogger $audit,
    ): RedirectResponse|JsonResponse {
        $schoolModel = $this->scheduleSchool($school);
        $this->ensureSameSchool($schoolModel->id, $examSchedule->school_id);

        if (! $examSchedule->isEditable()) {
            return back()->with('error', 'Published exam periods are read-only.');
        }

        $data = $this->validatedPaperData($request, $schoolModel);
        $invigilatorIds = $this->invigilatorIds($request, $schoolModel);

        $sections = Section::query()
            ->where('school_id', $schoolModel->id)
            ->where('class_id', $data['class_id'])
            ->orderBy('name')
            ->get();

        if ($sections->isEmpty()) {
            throw ValidationException::withMessages([
                'class_id' => 'This class has no sections yet.',
            ]);
        }

        $errors = [];
        $denormalized = [];

        foreach ($sections as $section) {
            $this->assertNoDuplicatePaper($examSchedule, $section->id, $data['subject_id']);

            $payload = [...$data, 'section_id' => $section->id];
            $conflicts = $detector->detect($examSchedule, $payload, $invigilatorIds);

            foreach ($detector->partition($conflicts)['errors'] as $conflict) {
                $conflict['params']['sectionId'] = $section->id;
                $errors[] = $conflict;
            }

            $denormalized[] = $payload;
        }

        if ($errors !== []) {
            return ScheduleConflictResponse::make($request, $errors, 'Some sections conflict; nothing was created.');
        }

        $batchUuid = (string) Str::uuid();

        DB::transaction(function () use ($schoolModel, $examSchedule, $denormalized, $invigilatorIds, $batchUuid): void {
            foreach ($denormalized as $payload) {
                $paper = ExamPaper::create([
                    ...$payload,
                    'organization_id' => $schoolModel->organization_id,
                    'school_id' => $schoolModel->id,
                    'exam_schedule_id' => $examSchedule->id,
                    'batch_uuid' => $batchUuid,
                ]);

                $this->syncInvigilators($schoolModel, $paper, $invigilatorIds);
            }
        });

        $audit->record('exam.papers_bulk_created', $examSchedule, after: [
            'class_id' => $data['class_id'],
            'subject_id' => $data['subject_id'],
            'sections' => $sections->count(),
            'batch_uuid' => $batchUuid,
        ]);

        return back()->with('success', 'Exam papers created for all sections.');
    }

    public function update(
        ExamPaperFormRequest $request,
        int $school,
        ExamPaper $examPaper,
        ExamConflictDetector $detector,
        AuditLogger $audit,
    ): RedirectResponse|JsonResponse {
        $schoolModel = $this->scheduleSchool($school);
        $this->ensureSameSchool($schoolModel->id, $examPaper->school_id);

        $examSchedule = ExamSchedule::query()->findOrFail($examPaper->exam_schedule_id);

        if (! $examSchedule->isEditable()) {
            return back()->with('error', 'Published exam periods are read-only.');
        }

        $data = $this->validatedPaperData($request, $schoolModel);
        $invigilatorIds = $this->invigilatorIds($request, $schoolModel);

        if (! $request->boolean('apply_to_batch')) {
            $this->assertNoDuplicatePaper($examSchedule, $data['section_id'], $data['subject_id'], $examPaper->id);
        }

        $targets = $request->boolean('apply_to_batch') && $examPaper->batch_uuid !== null
            ? ExamPaper::query()->where('batch_uuid', $examPaper->batch_uuid)->get()
            : collect([$examPaper]);

        $errors = [];
        $updates = [];

        foreach ($targets as $target) {
            $payload = [...$data, 'section_id' => $data['section_id']];

            if ($targets->count() > 1) {
                $payload['section_id'] = $target->section_id;
            }

            $conflicts = $detector->detect($examSchedule, $payload, $invigilatorIds, $target->id);

            foreach ($detector->partition($conflicts)['errors'] as $conflict) {
                $conflict['params']['paperId'] = $target->id;
                $errors[] = $conflict;
            }

            $updates[$target->id] = $payload;
        }

        if ($errors !== []) {
            return ScheduleConflictResponse::make($request, $errors, 'This change conflicts with the current schedule.');
        }

        $before = $this->auditPayload($examPaper);

        DB::transaction(function () use ($targets, $updates, $schoolModel, $invigilatorIds): void {
            foreach ($targets as $target) {
                $target->update($updates[$target->id]);

                if ($invigilatorIds !== []) {
                    $this->syncInvigilators($schoolModel, $target, $invigilatorIds);
                }
            }
        });

        $audit->record('exam.paper_updated', $examPaper, before: $before, after: [
            ...$this->auditPayload($examPaper->refresh()),
            'batch' => $targets->count() > 1,
        ]);

        return back()->with('success', 'Exam paper updated.');
    }

    public function destroy(int $school, ExamPaper $examPaper, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->scheduleSchool($school);
        $this->ensureSameSchool($schoolModel->id, $examPaper->school_id);

        if ($examPaper->examSchedule?->isPublished()) {
            return back()->with('error', 'Published exam periods are read-only.');
        }

        $audit->record('exam.paper_deleted', $examPaper, before: $this->auditPayload($examPaper));

        $examPaper->delete();

        return back()->with('success', 'Exam paper removed.');
    }

    public function storeInvigilator(Request $request, int $school, ExamPaper $examPaper, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->scheduleSchool($school);
        $this->ensureSameSchool($schoolModel->id, $examPaper->school_id);

        $data = $request->validate([
            'teacher_id' => ['required', 'integer'],
            'role' => ['nullable', 'in:invigilator,head'],
        ]);

        $teacherId = (int) ($data['teacher_id'] ?? 0);
        $role = (string) ($data['role'] ?? 'invigilator');

        $teacher = User::query()
            ->where('organization_id', $schoolModel->organization_id)
            ->where('role', UserRole::Teacher)
            ->whereKey($teacherId)
            ->first();

        if ($teacher === null) {
            throw ValidationException::withMessages([
                'teacher_id' => 'The selected user is not a teacher in this organization.',
            ]);
        }

        ExamPaperInvigilator::query()->updateOrCreate(
            ['exam_paper_id' => $examPaper->id, 'teacher_id' => $teacher->id],
            [
                'organization_id' => $schoolModel->organization_id,
                'school_id' => $schoolModel->id,
                'role' => $role,
            ],
        );

        $audit->record('exam.invigilator_added', $examPaper, after: [
            'teacher_id' => $teacher->id,
            'role' => $role,
        ]);

        return back()->with('success', 'Invigilator assigned.');
    }

    public function destroyInvigilator(int $school, ExamPaper $examPaper, int $teacher, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->scheduleSchool($school);
        $this->ensureSameSchool($schoolModel->id, $examPaper->school_id);

        ExamPaperInvigilator::query()
            ->where('exam_paper_id', $examPaper->id)
            ->where('teacher_id', $teacher)
            ->delete();

        $audit->record('exam.invigilator_removed', $examPaper, before: ['teacher_id' => $teacher]);

        return back()->with('success', 'Invigilator removed.');
    }

    /**
     * @return array{class_id: int, section_id: int, subject_id: int, exam_date: string, starts_at: string, ends_at: string, room: string|null, max_score: string|null, instructions: string|null}
     */
    private function validatedPaperData(ExamPaperFormRequest $request, School $school): array
    {
        $section = Section::query()
            ->where('school_id', $school->id)
            ->find($request->integer('section_id'));

        if ($section === null) {
            throw ValidationException::withMessages([
                'section_id' => 'The selected section does not belong to this school.',
            ]);
        }

        if ($section->class_id !== $request->integer('class_id')) {
            throw ValidationException::withMessages([
                'section_id' => 'The selected section does not belong to the selected class.',
            ]);
        }

        $subjectExists = Subject::query()
            ->where('school_id', $school->id)
            ->whereKey($request->integer('subject_id'))
            ->exists();

        if (! $subjectExists) {
            throw ValidationException::withMessages([
                'subject_id' => 'The selected subject does not belong to this school.',
            ]);
        }

        return [
            'class_id' => $section->class_id,
            'section_id' => $section->id,
            'subject_id' => $request->integer('subject_id'),
            'exam_date' => $request->string('exam_date')->toString(),
            'starts_at' => $this->time($request->string('starts_at')->toString()),
            'ends_at' => $this->time($request->string('ends_at')->toString()),
            'room' => $request->input('room'),
            'max_score' => $request->has('max_score') ? (string) $request->input('max_score') : null,
            'instructions' => $request->input('instructions'),
        ];
    }

    /**
     * @return list<int>
     */
    private function invigilatorIds(ExamPaperFormRequest $request, School $school): array
    {
        /** @var array<int, mixed> $raw */
        $raw = $request->input('invigilator_ids', []);

        $ids = array_values(array_unique(array_map('intval', $raw)));

        if ($ids === []) {
            return [];
        }

        $valid = User::query()
            ->where('organization_id', $school->organization_id)
            ->where('role', UserRole::Teacher)
            ->whereIn('id', $ids)
            ->pluck('id')
            ->all();

        /** @var list<int> $validIds */
        $validIds = array_values(array_map('intval', $valid));

        return $validIds;
    }

    /**
     * @param  list<int>  $teacherIds
     */
    private function syncInvigilators(School $school, ExamPaper $paper, array $teacherIds): void
    {
        ExamPaperInvigilator::query()->where('exam_paper_id', $paper->id)->delete();

        foreach ($teacherIds as $teacherId) {
            ExamPaperInvigilator::create([
                'organization_id' => $school->organization_id,
                'school_id' => $school->id,
                'exam_paper_id' => $paper->id,
                'teacher_id' => $teacherId,
                'role' => 'invigilator',
            ]);
        }
    }

    private function assertNoDuplicatePaper(ExamSchedule $schedule, int $sectionId, int $subjectId, ?int $excludeId = null): void
    {
        $exists = ExamPaper::query()
            ->where('exam_schedule_id', $schedule->id)
            ->where('section_id', $sectionId)
            ->where('subject_id', $subjectId)
            ->when($excludeId !== null, fn ($query) => $query->whereKeyNot($excludeId))
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'subject_id' => 'This section already has a paper for this subject in this exam period.',
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function auditPayload(ExamPaper $paper): array
    {
        return [
            'section_id' => $paper->section_id,
            'subject_id' => $paper->subject_id,
            'exam_date' => $paper->exam_date->toDateString(),
            'starts_at' => $paper->starts_at,
            'ends_at' => $paper->ends_at,
            'room' => $paper->room,
        ];
    }

    private function time(string $value): string
    {
        return CarbonImmutable::parse($value)->format('H:i:s');
    }
}
