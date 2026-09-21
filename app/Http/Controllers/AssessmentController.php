<?php

namespace App\Http\Controllers;

use App\Jobs\DeliverInAppNotification;
use App\Models\Assessment;
use App\Models\Guardian;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AssessmentController
{
    public function store(Request $request, int $section, AuditLogger $audit): RedirectResponse
    {
        $sectionModel = Section::query()->findOrFail($section);
        Gate::authorize('record-assessment', $sectionModel);
        $data = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'assessed_on' => ['required', 'date'],
            'max_score' => ['required', 'numeric', 'gt:0'],
            'records' => ['required', 'array', 'min:1'],
            'records.*.student_id' => ['required', 'integer'],
            'records.*.score' => ['required', 'numeric', 'gte:0'],
            'records.*.comment' => ['nullable', 'string', 'max:1000'],
        ]);
        foreach ($data['records'] as $record) {
            abort_unless($sectionModel->enrollments()->where('student_id', $record['student_id'])->where('status', 'active')->exists(), 422, 'Student is not enrolled in this section.');
            abort_if((float) $record['score'] > (float) $data['max_score'], 422, 'Score cannot exceed maximum score.');
            Assessment::updateOrCreate(
                ['organization_id' => $sectionModel->organization_id, 'section_id' => $sectionModel->id, 'student_id' => $record['student_id'], 'title' => $data['title'], 'assessed_on' => $data['assessed_on']],
                ['school_id' => $sectionModel->school_id, 'teacher_id' => auth()->id(), 'score' => $record['score'], 'max_score' => $data['max_score'], 'comment' => $record['comment'] ?? null],
            );
            Student::query()->with('guardians.user')->findOrFail((int) $record['student_id'])->guardians->each(function (Guardian $guardian) use ($sectionModel, $data, $record): void {
                if ($guardian->user) {
                    DeliverInAppNotification::dispatch($sectionModel->organization_id, $guardian->user->id, 'assessment.recorded', 'Assessment recorded', "A new assessment, {$data['title']}, has been recorded.", ['student_id' => $record['student_id'], 'section_id' => $sectionModel->id, 'assessed_on' => $data['assessed_on']], 'assessment:'.$sectionModel->id.':'.$record['student_id'].':'.$data['title'].':'.$data['assessed_on']);
                }
            });
        }
        User::query()->where('organization_id', $sectionModel->organization_id)->whereIn('role', ['organization_admin', 'school_admin'])->get()->each(fn ($user) => DeliverInAppNotification::dispatch($sectionModel->organization_id, $user->id, 'assessment.recorded', 'Assessment recorded', "A new assessment, {$data['title']}, has been recorded.", ['section_id' => $sectionModel->id, 'assessed_on' => $data['assessed_on']], 'assessment:'.$sectionModel->id.':'.$data['title'].':'.$data['assessed_on']));
        $audit->record('assessment.recorded', $sectionModel, after: ['section_id' => $sectionModel->id, 'title' => $data['title'], 'record_count' => count($data['records'])]);

        return back()->with('success', 'Assessment recorded.');
    }
}
