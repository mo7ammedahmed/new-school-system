<?php

namespace App\Http\Controllers;

use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\Section;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class AttendanceController
{
    public function store(Request $request, int $section, AuditLogger $audit): RedirectResponse
    {
        $sectionModel = Section::query()->findOrFail($section);
        Gate::authorize('record-section-attendance', $sectionModel);
        $data = $request->validate([
            'attendance_date' => ['required', 'date'],
            'records' => ['required', 'array', 'min:1'],
            'records.*.student_id' => ['required', 'integer'],
            'records.*.status' => ['required', 'in:present,absent,late,excused'],
            'records.*.note' => ['nullable', 'string', 'max:1000'],
        ]);

        $session = DB::transaction(function () use ($data, $sectionModel): AttendanceSession {
            $session = AttendanceSession::firstOrCreate(
                [
                    'organization_id' => $sectionModel->organization_id,
                    'section_id' => $sectionModel->id,
                    'attendance_date' => $data['attendance_date'],
                ],
                ['school_id' => $sectionModel->school_id, 'recorded_by' => auth()->id()],
            );

            foreach ($data['records'] as $record) {
                abort_unless($sectionModel->enrollments()->where('student_id', $record['student_id'])->where('status', 'active')->exists(), 422, 'Student is not enrolled in this section.');
                $session->records()->updateOrCreate(
                    ['organization_id' => $sectionModel->organization_id, 'student_id' => $record['student_id']],
                    ['status' => $record['status'], 'note' => $record['note'] ?? null],
                );
            }

            return $session;
        });

        $audit->record('attendance.recorded', $session, after: ['section_id' => $sectionModel->id, 'attendance_date' => $session->attendance_date->toDateString(), 'record_count' => count($data['records'])]);

        return back()->with('success', 'Attendance recorded.');
    }

    public function update(Request $request, int $record, AuditLogger $audit): RedirectResponse
    {
        $attendance = AttendanceRecord::query()->with('session.section')->findOrFail($record);
        $section = $attendance->session->section;
        Gate::authorize('record-section-attendance', $section);
        $data = $request->validate(['status' => ['required', 'in:present,absent,late,excused'], 'note' => ['nullable', 'string', 'max:1000']]);
        $before = $attendance->only(['status', 'note']);
        $attendance->update($data);
        $audit->record('attendance.corrected', $attendance, before: $before, after: $attendance->only(['status', 'note']), metadata: ['section_id' => $section->id]);

        return back()->with('success', 'Attendance corrected.');
    }
}
