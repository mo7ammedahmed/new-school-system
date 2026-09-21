<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * How schedule conflicts reach a client.
 *
 * Conflicts are machine codes, never display strings: a JSON client gets them in
 * a 422 body, and an Inertia form gets them flashed so the page can translate
 * them for Arabic and English. Both schedule controllers report conflicts, and
 * this is the one place that decides how.
 */
final class ScheduleConflictResponse
{
    /**
     * @param  list<array{code: string, severity: string, params: array<string, mixed>}>  $conflicts
     */
    public static function make(Request $request, array $conflicts, string $message): JsonResponse|RedirectResponse
    {
        if ($request->expectsJson()) {
            return response()->json(['message' => $message, 'conflicts' => $conflicts], 422);
        }

        return back()
            ->withErrors(['conflicts' => $message])
            ->with('conflicts', $conflicts);
    }
}
