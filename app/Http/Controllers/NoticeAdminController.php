<?php

namespace App\Http\Controllers;

use App\Jobs\DeliverInAppNotification;
use App\Models\Guardian;
use App\Models\Notice;
use App\Models\School;
use App\Models\Student;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class NoticeAdminController
{
    public function index(int $school): Response
    {
        $schoolModel = School::query()->findOrFail($school);
        Gate::authorize('manage-content', $schoolModel);

        return Inertia::render('admin/notices/index', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'notices' => Notice::query()->where('school_id', $schoolModel->id)->withCount('students')->latest()->get(),
        ]);
    }

    public function store(Request $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = School::query()->findOrFail($school);
        Gate::authorize('manage-content', $schoolModel);
        $data = $request->validate(['title' => ['required', 'string', 'max:255'], 'body' => ['required', 'string'], 'student_ids' => ['sometimes', 'array'], 'student_ids.*' => ['integer']]);
        $notice = $schoolModel->notices()->create(['organization_id' => $schoolModel->organization_id, 'title' => $data['title'], 'body' => $data['body'], 'status' => 'draft']);
        /** @var array<int> $studentIds */
        $studentIds = $data['student_ids'] ?? [];
        $students = collect($studentIds)->map(fn (int $id) => $schoolModel->students()->findOrFail($id));
        $notice->students()->sync($students->mapWithKeys(fn (Student $student) => [$student->id => ['organization_id' => $schoolModel->organization_id]])->all());
        $audit->record('notice.created', $notice, after: ['school_id' => $schoolModel->id, 'target_count' => $students->count()]);

        return back();
    }

    public function publish(int $school, int $notice, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = School::query()->findOrFail($school);
        Gate::authorize('manage-content', $schoolModel);
        $record = $schoolModel->notices()->findOrFail($notice);
        $record->update(['status' => 'published', 'published_at' => now()]);
        $audit->record('notice.published', $record, after: ['status' => 'published']);
        Guardian::query()->where('organization_id', $schoolModel->organization_id)->whereHas('students', fn ($students) => $students->where('students.school_id', $schoolModel->id)->when($record->students()->exists(), fn ($query) => $query->whereIn('students.id', $record->students()->pluck('students.id'))))->with('user')->get()->each(function ($guardian) use ($record): void {
            if ($guardian->user) {
                DeliverInAppNotification::dispatch($record->organization_id, $guardian->user->id, 'notice.published', $record->title, $record->body, ['notice_id' => $record->id], 'notice:'.$record->id);
            }
        });
        User::query()->where('organization_id', $schoolModel->organization_id)->whereIn('role', ['organization_admin', 'school_admin'])->get()->each(fn ($user) => DeliverInAppNotification::dispatch($record->organization_id, $user->id, 'notice.published', $record->title, $record->body, ['notice_id' => $record->id], 'notice:'.$record->id));

        return back();
    }
}
