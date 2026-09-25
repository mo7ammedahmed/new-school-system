<?php

namespace App\Exceptions;

use App\Http\Responses\ScheduleConflictResponse;
use InvalidArgumentException;

/**
 * A placement rule the timetable engine refused.
 *
 * It carries a machine code and its parameters rather than only a display
 * string, so the timetable reports violations the way the exam schedule
 * already does: {@see ScheduleConflictResponse} hands the
 * codes to the client, which translates them for Arabic and English.
 *
 * Extends InvalidArgumentException so callers that catch it keep working.
 */
final class ScheduleRuleViolation extends InvalidArgumentException
{
    /**
     * @param  array<string, mixed>  $params
     */
    public function __construct(
        private readonly string $conflictCode,
        string $message,
        private readonly array $params = [],
        private readonly string $severity = 'error',
    ) {
        parent::__construct($message);
    }

    public function conflictCode(): string
    {
        return $this->conflictCode;
    }

    /**
     * @return array{code: string, severity: string, params: array<string, mixed>}
     */
    public function conflict(): array
    {
        return [
            'code' => $this->conflictCode,
            'severity' => $this->severity,
            'params' => $this->params,
        ];
    }
}
