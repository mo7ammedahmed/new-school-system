import { DashboardWidget } from '@/components/dashboard/dashboard-widget';
import { Empty } from '@/components/dashboard/empty';
import type {
    AttendanceTotals,
    TranslateFn,
} from '@/components/dashboard/types';

const SEGMENT_KEYS = ['present', 'late', 'excused', 'absent'] as const;

const SEGMENT_STYLES: Record<(typeof SEGMENT_KEYS)[number], string> = {
    present: 'bg-brand-800',
    late: 'bg-warning',
    excused: 'bg-secondary',
    absent: 'bg-destructive',
};

export function AttendanceSummaryWidget({
    totals,
    t,
}: {
    totals: AttendanceTotals;
    t: TranslateFn;
}) {
    const segments = SEGMENT_KEYS.map((key) => ({
        key,
        className: SEGMENT_STYLES[key],
        value: totals[key],
    }));

    return (
        <DashboardWidget title={t('dashboard.attendanceToday')} refreshable>
            {totals.recorded === 0 ? (
                <Empty>{t('dashboard.attendanceEmptyToday')}</Empty>
            ) : (
                <div className="space-y-4">
                    <div className="bg-accent flex h-2.5 overflow-hidden rounded-full">
                        {segments.map((segment) =>
                            segment.value > 0 ? (
                                <span
                                    key={segment.key}
                                    className={segment.className}
                                    style={{
                                        width: `${(segment.value / totals.recorded) * 100}%`,
                                    }}
                                    aria-hidden="true"
                                />
                            ) : null,
                        )}
                    </div>
                    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {segments.map((segment) => (
                            <div
                                key={segment.key}
                                className="border-border rounded-lg border p-3"
                            >
                                <dt className="text-muted-foreground text-xs font-bold">
                                    {t(`portal.${segment.key}`)}
                                </dt>
                                <dd className="text-foreground mt-1 text-lg font-semibold">
                                    {segment.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                    <p className="text-muted-foreground text-xs">
                        {t('dashboard.attendanceHint', {
                            recorded: totals.recorded,
                        })}{' '}
                        · {totals.presentPercentage}%
                    </p>
                </div>
            )}
        </DashboardWidget>
    );
}
