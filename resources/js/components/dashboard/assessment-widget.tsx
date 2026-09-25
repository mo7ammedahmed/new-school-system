import { DashboardWidget } from '@/components/dashboard/dashboard-widget';
import { Empty } from '@/components/dashboard/empty';
import type {
    AssessmentStats,
    TranslateFn,
} from '@/components/dashboard/types';

export function AssessmentWidget({
    stats,
    t,
}: {
    stats: AssessmentStats;
    t: TranslateFn;
}) {
    return (
        <DashboardWidget title={t('dashboard.assessmentTitle')}>
            {stats.total === 0 ? (
                <Empty>{t('portal.noAssessments')}</Empty>
            ) : (
                <div className="space-y-4">
                    <dl className="grid grid-cols-2 gap-3">
                        <div className="border-border rounded-lg border p-3">
                            <dt className="text-muted-foreground text-xs font-bold">
                                {t('dashboard.assessmentAverage')}
                            </dt>
                            <dd className="text-foreground mt-1 text-lg font-semibold">
                                {stats.averagePercent}%
                            </dd>
                        </div>
                        <div className="border-border rounded-lg border p-3">
                            <dt className="text-muted-foreground text-xs font-bold">
                                {t('dashboard.assessmentPassRate')}
                            </dt>
                            <dd className="text-foreground mt-1 text-lg font-semibold">
                                {stats.passRate}%
                            </dd>
                        </div>
                    </dl>
                    <p className="text-muted-foreground text-xs">
                        {t('dashboard.assessmentCount', { count: stats.total })}
                    </p>
                    <ul className="space-y-2">
                        {stats.recent.map((assessment) => (
                            <li
                                key={assessment.id}
                                className="border-border rounded-lg border p-3"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <strong className="text-foreground truncate text-sm font-semibold">
                                        {assessment.title}
                                    </strong>
                                    <span
                                        dir="ltr"
                                        className="text-brand-600 shrink-0 text-xs font-bold"
                                    >
                                        {assessment.score}/{assessment.maxScore}
                                    </span>
                                </div>
                                <small className="text-muted-foreground mt-1 block">
                                    {assessment.student}
                                    {assessment.sectionName
                                        ? ` · ${assessment.sectionName}`
                                        : ''}
                                </small>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </DashboardWidget>
    );
}
