<?php

namespace App\Http\Controllers;

use App\Http\Requests\Schedule\SubjectFormRequest;
use App\Models\BellSchedule;
use App\Models\School;
use App\Models\SchoolScheduleSetting;
use App\Models\Subject;
use App\Models\TeachingAssignment;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleSetupController extends Controller
{
    public function index(Request $request, int $school): Response
    {
        $schoolModel = School::query()->findOrFail($school);
        Gate::authorize('manage-schedule', $schoolModel);

        return Inertia::render('admin/schedule/setup', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'subjects' => Subject::where('school_id', $schoolModel->id)
                ->when($request->boolean('active', true), fn ($q) => $q->where('is_active', true))
                ->get(),
            'teachingAssignments' => TeachingAssignment::where('school_id', $schoolModel->id)
                ->with(['section', 'subject', 'teacher', 'academicYear'])
                ->get(),
            'bellSchedules' => BellSchedule::where('school_id', $schoolModel->id)
                ->with('bellPeriods')
                ->get(),
            'settings' => SchoolScheduleSetting::where('school_id', $schoolModel->id)->first(),
        ]);
    }

    public function storeSubject(SubjectFormRequest $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = School::query()->findOrFail($school);
        Gate::authorize('manage-schedule', $schoolModel);

        $subject = Subject::create([
            'organization_id' => $schoolModel->organization_id,
            'school_id' => $schoolModel->id,
            'code' => $request->input('code'),
            'name_en' => $request->input('name_en'),
            'name_ar' => $request->input('name_ar'),
            'color' => $request->input('color'),
            'is_active' => $request->boolean('is_active', true),
        ]);

        $audit->record('schedule.subject_created', $subject, after: [
            'code' => $subject->code,
            'name_en' => $subject->name_en,
            'name_ar' => $subject->name_ar,
        ]);

        return back()->with('success', 'Subject created.');
    }

    public function updateSubject(SubjectFormRequest $request, int $school, Subject $subject, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = School::query()->findOrFail($school);
        Gate::authorize('manage-schedule', $schoolModel);

        $subject->update([
            'code' => $request->input('code'),
            'name_en' => $request->input('name_en'),
            'name_ar' => $request->input('name_ar'),
            'color' => $request->input('color'),
            'is_active' => $request->boolean('is_active', true),
        ]);

        $audit->record('schedule.subject_updated', $subject);

        return back()->with('success', 'Subject updated.');
    }

    public function deactivateSubject(int $school, Subject $subject, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = School::query()->findOrFail($school);
        Gate::authorize('manage-schedule', $schoolModel);

        // Prevent deactivation if used in a published timetable (D2 tables may not exist yet)
        $hasPublishedEntries = Schema::hasTable('timetable_versions') && DB::table('timetable_versions')
            ->join('timetable_entries', 'timetable_entries.timetable_version_id', '=', 'timetable_versions.id')
            ->where('timetable_versions.school_id', $schoolModel->id)
            ->where('timetable_versions.status', 'published')
            ->where('timetable_entries.subject_id', $subject->id)
            ->exists();

        if ($hasPublishedEntries) {
            return back()->with('error', 'Cannot deactivate a subject used in a published timetable.');
        }

        $subject->update(['is_active' => false]);

        $audit->record('schedule.subject_deactivated', $subject);

        return back()->with('success', 'Subject deactivated.');
    }
}
