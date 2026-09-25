import { Link } from '@inertiajs/react';
import { Globe2 } from 'lucide-react';
import { DashboardWidget } from '@/components/dashboard/dashboard-widget';
import { QUICK_ACTION_META } from '@/components/dashboard/format';
import type { QuickAction, TranslateFn } from '@/components/dashboard/types';

type QuickActionsWidgetProps = {
    actions: QuickAction[];
    t: TranslateFn;
};

export function QuickActionsWidget({ actions, t }: QuickActionsWidgetProps) {
    if (actions.length === 0) {
        return null;
    }

    return (
        <DashboardWidget title={t('dashboard.quickActions')}>
            <div className="mt-4 flex flex-wrap gap-3">
                {actions.map((action) => {
                    const meta = QUICK_ACTION_META[action.key];
                    const Icon = meta?.icon ?? Globe2;

                    return (
                        <Link
                            key={action.key}
                            href={action.href}
                            className="bg-card text-brand-700 focus-visible:ring-brand-700 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:outline-none"
                        >
                            <Icon size={17} aria-hidden={true} />
                            {t(meta?.key ?? action.key)}
                        </Link>
                    );
                })}
            </div>
        </DashboardWidget>
    );
}
