import { DashboardWidget } from '@/components/dashboard/dashboard-widget';
import { Empty } from '@/components/dashboard/empty';
import type {
    AdmissionsPipeline,
    TranslateFn,
} from '@/components/dashboard/types';

const STAGES = [
    'pending',
    'reviewing',
    'accepted',
    'rejected',
    'withdrawn',
] as const;

export function AdmissionsPipelineWidget({
    pipeline,
    total,
    t,
}: {
    pipeline: AdmissionsPipeline;
    total: number;
    t: TranslateFn;
}) {
    return (
        <DashboardWidget title={t('dashboard.admissionsPipeline')} refreshable>
            {total === 0 ? (
                <Empty>{t('dashboard.pendingAdmissionsHint')}</Empty>
            ) : (
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {STAGES.map((stage) => (
                        <div
                            key={stage}
                            className="border-border rounded-lg border p-3"
                        >
                            <dt className="text-muted-foreground text-xs font-bold">
                                {stage}
                            </dt>
                            <dd className="text-foreground mt-1 text-lg font-semibold">
                                {pipeline[stage]}
                            </dd>
                        </div>
                    ))}
                </dl>
            )}
        </DashboardWidget>
    );
}
