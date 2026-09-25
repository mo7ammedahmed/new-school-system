import { DashboardWidget } from '@/components/dashboard/dashboard-widget';
import { Empty } from '@/components/dashboard/empty';
import type { TranslateFn, UpcomingExam } from '@/components/dashboard/types';

type SubjectNamer = (exam: {
    subject_name_en: string | null;
    subject_name_ar: string | null;
}) => string | null;

export function UpcomingExamsWidget({
    exams,
    subjectName,
    t,
}: {
    exams: UpcomingExam[];
    subjectName: SubjectNamer;
    t: TranslateFn;
}) {
    return (
        <DashboardWidget title={t('dashboard.upcomingExams')}>
            {exams.length === 0 ? (
                <Empty>{t('portal.noUpcomingExams')}</Empty>
            ) : (
                <ol className="space-y-3">
                    {exams.slice(0, 6).map((exam) => (
                        <li
                            key={exam.id}
                            className="border-border rounded-lg border p-3"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <strong className="text-foreground truncate text-sm font-semibold">
                                    {subjectName(exam)}
                                </strong>
                                <span className="text-brand-600 shrink-0 text-xs font-bold">
                                    {exam.starts_at}
                                    {exam.ends_at ? `–${exam.ends_at}` : ''}
                                </span>
                            </div>
                            <small className="text-muted-foreground mt-1 block">
                                {exam.exam_date} · {exam.class_name} ·{' '}
                                {exam.section_name}
                                {exam.room
                                    ? ` · ${t('portal.room')} ${exam.room}`
                                    : ''}
                            </small>
                        </li>
                    ))}
                </ol>
            )}
        </DashboardWidget>
    );
}
