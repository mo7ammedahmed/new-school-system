import { CheckCircle2, TrendingUp, XCircle } from 'lucide-react';
import { DashboardWidget } from '@/components/dashboard/dashboard-widget';
import { formatMinor } from '@/components/dashboard/format';
import type { TranslateFn } from '@/components/dashboard/types';

type FinanceSummary = {
    income: { today: number; month: number };
    outstandingMinor: number;
    currency: string;
};

export function FinanceSummaryWidget({
    summary,
    locale,
    t,
}: {
    summary: FinanceSummary;
    locale: string;
    t: TranslateFn;
}) {
    const rows: Array<[string, number]> = [
        [t('dashboard.incomeToday'), summary.income.today],
        [t('dashboard.incomeMonth'), summary.income.month],
        [t('dashboard.outstandingMinor'), summary.outstandingMinor],
    ];

    return (
        <DashboardWidget title={t('dashboard.financeSummary')} refreshable>
            <dl className="space-y-3">
                {rows.map(([label, value]) => (
                    <div
                        key={label}
                        className="border-border flex items-center justify-between gap-4 rounded-lg border p-3"
                    >
                        <dt className="text-muted-foreground text-sm font-bold">
                            {label}
                        </dt>
                        <dd className="text-foreground text-sm font-semibold">
                            {formatMinor(value, locale)}
                        </dd>
                    </div>
                ))}
            </dl>
        </DashboardWidget>
    );
}

export function PaymentStatusWidget({
    status,
    t,
}: {
    status: { successful: number; failed: number; pending: number };
    t: TranslateFn;
}) {
    const cards = [
        {
            key: 'successful',
            label: t('dashboard.successful'),
            value: status.successful,
            icon: CheckCircle2,
        },
        {
            key: 'failed',
            label: t('dashboard.failed'),
            value: status.failed,
            icon: XCircle,
        },
        {
            key: 'inProgress',
            label: t('dashboard.inProgress'),
            value: status.pending,
            icon: TrendingUp,
        },
    ];

    return (
        <DashboardWidget title={t('dashboard.paymentStatus')} refreshable>
            <dl className="grid grid-cols-3 gap-3">
                {cards.map(({ key, label, value, icon: Icon }) => (
                    <div
                        key={key}
                        className="border-border rounded-lg border p-3"
                    >
                        <dt className="text-muted-foreground flex items-center gap-1 text-xs font-bold">
                            <Icon size={14} aria-hidden="true" />
                            {label}
                        </dt>
                        <dd className="text-foreground mt-1 text-lg font-semibold">
                            {value}
                        </dd>
                    </div>
                ))}
            </dl>
        </DashboardWidget>
    );
}
