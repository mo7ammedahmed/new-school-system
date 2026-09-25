import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import { useT } from '@/hooks/useT';
import type { DashboardProps } from './types';
import { subjectLabel } from './format';

/**
 * Reads the shared Inertia dashboard payload and derives the values the
 * widgets would otherwise recompute on every render.
 */
export function useDashboardData() {
    const props = usePage<DashboardProps>().props;
    const { t, locale, isArabic } = useT();

    const { school, metrics, widgets } = props;

    const attendance = widgets.attendanceOverview.today;
    const pipeline = widgets.admissionsPipeline;
    const assessmentStats = metrics.assessmentStats;

    const pipelineTotal = useMemo(
        () =>
            pipeline.pending +
            pipeline.reviewing +
            pipeline.accepted +
            pipeline.rejected +
            pipeline.withdrawn,
        [pipeline],
    );

    return {
        t,
        locale,
        isArabic,
        school,
        metrics,
        widgets,
        attendance,
        pipeline,
        assessmentStats,
        pipelineTotal,
        subjectName: (item: {
            subject_name_en: string | null;
            subject_name_ar: string | null;
        }) => subjectLabel(item, isArabic),
    };
}
