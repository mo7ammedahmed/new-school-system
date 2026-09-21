<?php

namespace App\Http\Controllers;

use App\Models\ReportCardSnapshot;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportCardDownloadController
{
    public function __invoke(Request $request, int $snapshot, AuditLogger $audit): StreamedResponse
    {
        $record = ReportCardSnapshot::query()->with('student.school')->findOrFail($snapshot);
        Gate::authorize('view-report-card-snapshot', $record);
        $audit->record('report_card.downloaded', $record, metadata: ['term' => $record->term, 'student_id' => $record->student_id]);

        return response()->streamDownload(function () use ($record): void {
            echo '<!doctype html><html><head><meta charset="utf-8"><title>Report card - '.e($record->student->first_name.' '.$record->student->last_name).' - '.e($record->term).'</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;color:#222}h1{margin-bottom:4px}section{border:1px solid #ddd;padding:16px;margin:16px 0}table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #ddd;padding:8px;text-align:left}</style></head><body>';
            echo '<h1>'.e($record->student->first_name.' '.$record->student->last_name).'</h1><p>'.e($record->student->school->name).' · Term: '.e($record->term).'</p>';
            echo '<section><h2>Enrollment</h2>'.collect($record->enrollment ?? [])->map(fn ($row) => '<p>'.e($row['year'].' · '.$row['class'].($row['section'] ? ' · '.$row['section'] : '')).'</p>')->implode('').'</section>';
            echo '<section><h2>Attendance</h2><p>'.collect($record->attendance ?? [])->map(fn ($count, $status) => e(ucfirst($status).': '.$count))->implode(' · ').'</p></section>';
            echo '<section><h2>Assessments</h2><table><tr><th>Assessment</th><th>Score</th><th>Date</th><th>Comment</th></tr>'.collect($record->assessments ?? [])->map(fn ($row) => '<tr><td>'.e($row['title']).'</td><td>'.e($row['score'].'/'.$row['maxScore']).'</td><td>'.e($row['date'] ?? '').'</td><td>'.e($row['comment'] ?? '').'</td></tr>')->implode('').'</table></section>';
            echo '<p>Issued: '.e($record->issued_at?->toDateString()).'</p></body></html>';
        }, 'report-card-'.$record->student_id.'-'.$record->term.'.html', ['Content-Type' => 'text/html; charset=UTF-8']);
    }
}
