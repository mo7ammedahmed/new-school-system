<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\Enrollment;
use App\Models\Section;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TeacherPortalController
{
    public function index(): Response
    {
        $teacher = Auth::user();
        abort_unless($teacher?->hasRole(UserRole::Teacher), 403);
        $sections = $teacher->assignedSections()
            ->with(['school', 'academicClass', 'enrollments' => fn ($query) => $query->where('status', 'active')->with('student'), 'attendanceSessions' => fn ($query) => $query->latest('attendance_date')->limit(10)->with('records.student')])
            ->orderBy('name')->get();

        return Inertia::render('teacher/portal', [
            'teacher' => ['name' => $teacher->name],
            'sections' => $sections->map(fn (Section $section): array => [
                'id' => $section->id,
                'name' => $section->academicClass->name.' — '.$section->name,
                'school' => $section->school->name,
                'students' => $section->enrollments->map(fn (Enrollment $enrollment): array => [
                    'id' => $enrollment->student->id,
                    'name' => trim($enrollment->student->first_name.' '.$enrollment->student->last_name),
                ])->values(),
                'sessions' => $section->attendanceSessions->map(fn (AttendanceSession $session): array => [
                    'id' => $session->id,
                    'date' => $session->attendance_date !== null ? $session->attendance_date->toDateString() : null,
                    'records' => $session->records->map(fn (AttendanceRecord $record): array => ['id' => $record->id, 'student' => trim($record->student->first_name.' '.$record->student->last_name), 'status' => $record->status, 'note' => $record->note])->values(),
                ])->values(),
            ])->values(),
        ]);
    }
}
