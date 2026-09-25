import { DashboardWidget } from '@/components/dashboard/dashboard-widget';
import { formatMinor } from '@/components/dashboard/format';
import { Empty } from '@/components/dashboard/empty';
import type {
    OutstandingInstallment,
    TranslateFn,
} from '@/components/dashboard/types';

export function OutstandingInvoicesWidget({
    installments,
    locale,
    t,
}: {
    installments: OutstandingInstallment[];
    locale: string;
    t: TranslateFn;
}) {
    return (
        <DashboardWidget title={t('dashboard.outstandingInvoices')} refreshable>
            {installments.length === 0 ? (
                <Empty>{t('dashboard.noOutstandingInvoices')}</Empty>
            ) : (
                <ul className="space-y-3">
                    {installments.slice(0, 6).map((installment) => (
                        <li
                            key={installment.id}
                            className="border-border flex items-center justify-between gap-3 rounded-lg border p-3"
                        >
                            <span className="min-w-0">
                                <strong className="text-foreground block truncate text-sm font-semibold">
                                    {installment.student}
                                </strong>
                                <small className="text-muted-foreground mt-1 block">
                                    {installment.number} · #
                                    {installment.sequence}
                                    {installment.dueOn
                                        ? ` · ${t('dashboard.dueOn', {
                                              date: installment.dueOn,
                                          })}`
                                        : ''}
                                </small>
                            </span>
                            <span className="text-foreground shrink-0 text-end text-sm font-semibold">
                                {formatMinor(
                                    installment.outstandingMinor,
                                    locale,
                                    installment.currency,
                                )}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </DashboardWidget>
    );
}
