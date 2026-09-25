<?php

namespace App\Http\Controllers;

use App\Concerns\ResolvesSchool;
use App\Enums\UserRole;
use App\Models\AttendanceRecord;
use App\Models\School;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceReportController
{
    use ResolvesSchool;

    public function index(Request $request, int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('view-attendance-report', $schoolModel);
        $rows = $this->rows($request, $schoolModel);

        return Inertia::render('admin/reports/attendance', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'filters' => $request->only(['section_id', 'from', 'to']),
            'rows' => $rows,
        ]);
    }

    public function export(Request $request, int $school, AuditLogger $audit): \Illuminate\Http\Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('view-attendance-report', $schoolModel);
        $rows = $this->rows($request, $schoolModel);
        $audit->record('attendance.report_exported', $schoolModel, metadata: ['filters' => $request->only(['section_id', 'from', 'to']), 'row_count' => count($rows)]);

        Log::debug('Generating CSV content');

        $callback = function () use ($rows): string {
            Log::debug('Starting CSV export');
            $output = fopen('php://temp', 'wb');

            if ($output === false) {
                throw new \RuntimeException('Failed to open CSV stream.');
            }

            fputcsv($output, array_map([$this, 'csvEscape'], ['Student', 'Student number', 'Section', 'Present', 'Absent', 'Late', 'Excused', 'Total']));
            foreach ($rows as $row) {
                fputcsv($output, array_map([$this, 'csvEscape'], [$row['student'], $row['studentNumber'], $row['section'], $row['present'], $row['absent'], $row['late'], $row['excused'], $row['total']]));
            }
            rewind($output);
            $csv = stream_get_contents($output);
            fclose($output);
            Log::debug('Finished CSV export');

            return $csv;
        };

        $content = $callback();

        return response($content)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="attendance-report.csv"');
    }

    /**
     * @return array<int, array{student: string, studentNumber: string, section: string, present: int, absent: int, late: int, excused: int, total: int}>
     */
    private function rows(Request $request, School $school): array
    {
        $query = AttendanceRecord::query()->with(['student', 'session.section'])
            ->whereHas('session', function ($sessions) use ($school, $request): void {
                $sessions->where('school_id', $school->id)
                    ->when($request->integer('section_id'), fn ($query, $section) => $query->where('section_id', $section))
                    ->when($request->filled('from'), fn ($query) => $query->whereDate('attendance_date', '>=', $request->input('from')))
                    ->when($request->filled('to'), fn ($query) => $query->whereDate('attendance_date', '<=', $request->input('to')));
            });
        if (auth()->user()->hasRole(UserRole::Teacher)) {
            $query->whereHas('session.section.teachers', fn ($teachers) => $teachers->whereKey(auth()->id()));
        }
        $grouped = $query->get()->groupBy('student_id');

        return $grouped->map(function ($records): array {
            $student = $records->first()->student;
            $counts = $records->countBy('status');

            return ['student' => trim($student->first_name.' '.$student->last_name), 'studentNumber' => $student->student_number, 'section' => $records->first()->session->section->name, 'present' => $counts->get('present', 0), 'absent' => $counts->get('absent', 0), 'late' => $counts->get('late', 0), 'excused' => $counts->get('excused', 0), 'total' => $records->count()];
        })->values()->all();
    }

    private function csvEscape(mixed $value): string
    {
        $value = (string) $value;
        if (preg_match('/^[=\+\-\@\t\r]/', $value)) {
            return '\''.$value;
        }

        return $value;
    }
}
