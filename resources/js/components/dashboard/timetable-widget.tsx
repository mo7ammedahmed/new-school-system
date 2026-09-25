import { DashboardWidget } from '@/components/dashboard/dashboard-widget';
import { Empty } from '@/components/dashboard/empty';
import type { TimetableEntry, TranslateFn } from '@/components/dashboard/types';

type SubjectNamer = (entry: {
    subject_name_en: string | null;
    subject_name_ar: string | null;
}) => string | null;

export function TimetableWidget({
    entries,
    subjectName,
    t,
}: {
    entries: TimetableEntry[];
    subjectName: SubjectNamer;
    t: TranslateFn;
}) {
    return (
        <DashboardWidget title={t('dashboard.todaysTimetable')} refreshable>
            {entries.length === 0 ? (
                <Empty>{t('dashboard.noTimetable')}</Empty>
            ) : (
                <ol className="space-y-3">
                    {entries.slice(0, 6).map((entry) => (
                        <li
                            key={entry.id}
                            className="border-border flex items-center justify-between gap-3 rounded-lg border p-3"
                        >
                            <span
                                className="min-w-0 border-s-4 ps-3"
                                style={{
                                    borderColor:
                                        entry.subject_color ?? 'var(--border)',
                                }}
                            >
                                <strong className="text-foreground block truncate text-sm font-semibold">
                                    {subjectName(entry)}
                                </strong>
                                <small className="text-muted-foreground mt-1 block">
                                    {entry.class_name} · {entry.section_name}
                                    {entry.teacher_name
                                        ? ` · ${entry.teacher_name}`
                                        : ''}
                                </small>
                            </span>
                            <span className="text-brand-600 shrink-0 text-end text-xs font-bold">
                                {t('portal.period')} {entry.period}
                                {entry.starts_at ? (
                                    <span className="block">
                                        {entry.starts_at}
                                    </span>
                                ) : null}
                            </span>
                        </li>
                    ))}
                </ol>
            )}
        </DashboardWidget>
    );
}
