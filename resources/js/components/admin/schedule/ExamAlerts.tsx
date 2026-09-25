import { TriangleAlert } from 'lucide-react';
import type { Conflict, TranslateFn } from './types';
import { conflictKeys } from './types';

type ExamAlertsProps = {
    hasCoverageWarnings: boolean;
    conflicting: string | null;
    conflicts: Conflict[];
    t: TranslateFn;
};

export function ExamCoverageWarning({
    hasCoverageWarnings,
    t,
}: Pick<ExamAlertsProps, 'hasCoverageWarnings' | 't'>) {
    if (!hasCoverageWarnings) {
        return null;
    }

    return (
        <p className="bg-warning-container text-warning-foreground rounded-xl px-4 py-3 text-sm font-bold">
            <TriangleAlert size={16} className="inline" aria-hidden="true" />{' '}
            {t('exams.coverage')}: {t('exams.coverageHint')}
        </p>
    );
}

export function ExamConflictAlert({
    conflicting,
    conflicts,
    t,
}: Omit<ExamAlertsProps, 'hasCoverageWarnings'>) {
    if (!conflicting) {
        return null;
    }

    return (
        <div
            role="alert"
            className="bg-warning-container text-warning-foreground rounded-xl px-4 py-3 font-bold"
        >
            <p>{conflicting}</p>
            {conflicts.length > 0 ? (
                <ul className="mt-2 list-inside list-disc text-sm font-normal">
                    {conflicts.map((conflict, index) => (
                        <li key={`${conflict.code}-${index}`}>
                            {t(
                                conflictKeys[conflict.code] ??
                                    'timetable.conflict',
                            )}
                            {conflict.severity === 'warning'
                                ? ` (${t('exams.warnings')})`
                                : ''}
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
}
