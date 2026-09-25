import { DashboardWidget } from '@/components/dashboard/dashboard-widget';
import { humanizeAction } from '@/components/dashboard/format';
import { Empty } from '@/components/dashboard/empty';
import type {
    ActivityEntry,
    NoticeItem,
    TranslateFn,
} from '@/components/dashboard/types';

export function RecentNoticesWidget({
    notices,
    locale,
    t,
}: {
    notices: NoticeItem[];
    locale: string;
    t: TranslateFn;
}) {
    return (
        <DashboardWidget title={t('dashboard.recentNotices')} refreshable>
            {notices.length === 0 ? (
                <Empty>{t('dashboard.noNotices')}</Empty>
            ) : (
                <ul className="space-y-3">
                    {notices.map((notice) => (
                        <li
                            key={notice.id}
                            className="border-border flex items-center justify-between gap-3 rounded-lg border p-3"
                        >
                            <strong className="text-foreground min-w-0 truncate text-sm font-semibold">
                                {notice.title}
                            </strong>
                            {notice.publishedAt ? (
                                <small className="text-muted-foreground shrink-0 text-xs">
                                    {new Date(
                                        notice.publishedAt,
                                    ).toLocaleDateString(locale)}
                                </small>
                            ) : null}
                        </li>
                    ))}
                </ul>
            )}
        </DashboardWidget>
    );
}

const NOTIFICATION_KEYS = ['sent', 'readCount', 'delivered'] as const;

type NotificationActivity = {
    sentToday: number;
    readToday: number;
    deliveredToday: number;
};

export function NotificationActivityWidget({
    activity,
    t,
}: {
    activity: NotificationActivity;
    t: TranslateFn;
}) {
    const values: Record<(typeof NOTIFICATION_KEYS)[number], number> = {
        sent: activity.sentToday,
        readCount: activity.readToday,
        delivered: activity.deliveredToday,
    };

    return (
        <DashboardWidget
            title={t('dashboard.notificationActivity')}
            refreshable
        >
            <dl className="grid grid-cols-3 gap-3">
                {NOTIFICATION_KEYS.map((key) => (
                    <div
                        key={key}
                        className="border-border rounded-lg border p-3"
                    >
                        <dt className="text-muted-foreground text-xs font-bold">
                            {t(`dashboard.${key}`)}
                        </dt>
                        <dd className="text-foreground mt-1 text-lg font-semibold">
                            {values[key]}
                        </dd>
                    </div>
                ))}
            </dl>
        </DashboardWidget>
    );
}

export function RecentActivityWidget({
    entries,
    locale,
    t,
}: {
    entries: ActivityEntry[];
    locale: string;
    t: TranslateFn;
}) {
    return (
        <DashboardWidget title={t('dashboard.recentActivity')}>
            {entries.length === 0 ? (
                <Empty>{t('dashboard.noActivity')}</Empty>
            ) : (
                <ol className="space-y-3">
                    {entries.map((entry) => (
                        <li
                            key={entry.id}
                            className="border-border flex items-center justify-between gap-3 rounded-lg border p-3"
                        >
                            <span className="min-w-0">
                                <strong className="text-foreground block truncate text-sm font-semibold">
                                    {humanizeAction(entry.action)}
                                </strong>
                                <small className="text-muted-foreground mt-1 block">
                                    {entry.actor ?? '—'}
                                </small>
                            </span>
                            {entry.at ? (
                                <small className="text-muted-foreground shrink-0 text-xs">
                                    {new Date(entry.at).toLocaleString(locale, {
                                        dateStyle: 'short',
                                        timeStyle: 'short',
                                    })}
                                </small>
                            ) : null}
                        </li>
                    ))}
                </ol>
            )}
        </DashboardWidget>
    );
}
