import { Head } from '@inertiajs/react';
import { PageHero } from '@/components/page-hero';
import { useDashboardData } from '@/components/dashboard/useDashboardData';
import { StatGrid } from '@/components/dashboard/stat-grid';
import { QuickActionsWidget } from '@/components/dashboard/quick-actions-widget';
import { AttendanceSummaryWidget } from '@/components/dashboard/attendance-summary-widget';
import { AdmissionsPipelineWidget } from '@/components/dashboard/admissions-pipeline-widget';
import {
    FinanceSummaryWidget,
    PaymentStatusWidget,
} from '@/components/dashboard/finance-widgets';
import { AssessmentWidget } from '@/components/dashboard/assessment-widget';
import { TimetableWidget } from '@/components/dashboard/timetable-widget';
import { OutstandingInvoicesWidget } from '@/components/dashboard/outstanding-invoices-widget';
import { UpcomingExamsWidget } from '@/components/dashboard/upcoming-exams-widget';
import {
    NotificationActivityWidget,
    RecentActivityWidget,
    RecentNoticesWidget,
} from '@/components/dashboard/activity-widgets';
import { Empty } from '@/components/dashboard/empty';

export default function Dashboard() {
    const {
        t,
        locale,
        school,
        metrics,
        widgets,
        attendance,
        pipeline,
        assessmentStats,
        pipelineTotal,
        subjectName,
    } = useDashboardData();

    if (!school) {
        return (
            <>
                <Head title={t('dashboard.title')} />
                <div className="p-4 md:p-8">
                    <Empty>{t('dashboard.noSchool')}</Empty>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={t('dashboard.title')} />

            <div className="space-y-6 p-4 md:p-8">
                <PageHero
                    eyebrow={t('dashboard.title')}
                    title={school.name}
                    subtitle={t('dashboard.subtitle', { school: school.name })}
                />

                <StatGrid
                    schoolId={school.id}
                    metrics={metrics}
                    attendance={attendance}
                    locale={locale}
                    t={t}
                />

                <QuickActionsWidget actions={widgets.quickActions} t={t} />

                <div className="grid gap-6 lg:grid-cols-2">
                    <AttendanceSummaryWidget totals={attendance} t={t} />

                    <AdmissionsPipelineWidget
                        pipeline={pipeline}
                        total={pipelineTotal}
                        t={t}
                    />

                    <FinanceSummaryWidget
                        summary={widgets.financeSummary}
                        locale={locale}
                        t={t}
                    />

                    <PaymentStatusWidget status={widgets.paymentStatus} t={t} />

                    <AssessmentWidget stats={assessmentStats} t={t} />

                    <TimetableWidget
                        entries={widgets.todaysTimetable}
                        subjectName={subjectName}
                        t={t}
                    />

                    <OutstandingInvoicesWidget
                        installments={widgets.outstandingInvoices}
                        locale={locale}
                        t={t}
                    />

                    <UpcomingExamsWidget
                        exams={metrics.upcomingExams}
                        subjectName={subjectName}
                        t={t}
                    />

                    <RecentNoticesWidget
                        notices={widgets.recentNotices}
                        locale={locale}
                        t={t}
                    />

                    <NotificationActivityWidget
                        activity={widgets.notificationActivity}
                        t={t}
                    />

                    <RecentActivityWidget
                        entries={widgets.recentActivity}
                        locale={locale}
                        t={t}
                    />
                </div>
            </div>
        </>
    );
}
