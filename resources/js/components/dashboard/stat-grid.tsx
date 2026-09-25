import {
    CalendarDays,
    ClipboardList,
    CreditCard,
    GraduationCap,
    Inbox,
    Layers,
    UsersRound,
    WalletCards,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { formatMinor } from '@/components/dashboard/format';
import type {
    AttendanceTotals,
    DashboardMetrics,
    TranslateFn,
} from '@/components/dashboard/types';

type StatGridProps = {
    schoolId: number;
    metrics: DashboardMetrics;
    attendance: AttendanceTotals;
    locale: string;
    t: TranslateFn;
};

export function StatGrid({
    schoolId,
    metrics,
    attendance,
    locale,
    t,
}: StatGridProps) {
    return (
        <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard
                title={t('dashboard.students')}
                value={metrics.students.total.toLocaleString(locale)}
                description={t('dashboard.studentsHint', {
                    active: metrics.students.active,
                    inactive: metrics.students.inactive,
                })}
                icon={UsersRound}
                href="/portal/students"
            />

            <StatCard
                title={t('dashboard.teachers')}
                value={metrics.teachers.total.toLocaleString(locale)}
                description={t('dashboard.teachersHint', {
                    assigned: metrics.teachers.assigned,
                })}
                icon={GraduationCap}
                href={`/admin/schools/${schoolId}/users`}
            />

            <StatCard
                title={t('dashboard.attendanceToday')}
                value={`${attendance.presentPercentage}%`}
                description={t('dashboard.attendanceHint', {
                    recorded: attendance.recorded,
                })}
                icon={ClipboardList}
                href={`/admin/schools/${schoolId}/reports/attendance`}
            />

            <StatCard
                title={t('dashboard.activeClasses')}
                value={metrics.activeClasses.toLocaleString(locale)}
                description={t('dashboard.activeClassesHint')}
                icon={Layers}
                href={`/admin/schools/${schoolId}/academic-classes`}
            />

            <StatCard
                title={t('dashboard.pendingAdmissions')}
                value={metrics.pendingAdmissions.toLocaleString(locale)}
                description={t('dashboard.pendingAdmissionsHint')}
                icon={Inbox}
                href={`/admin/schools/${schoolId}/applications`}
            />

            <StatCard
                title={t('dashboard.outstandingBalances')}
                value={formatMinor(
                    metrics.outstandingBalances.amountMinor,
                    locale,
                )}
                description={t('dashboard.outstandingHint')}
                icon={WalletCards}
                href={`/admin/schools/${schoolId}/reports/finance`}
            />

            <StatCard
                title={t('dashboard.paymentsToday')}
                value={formatMinor(metrics.paymentsToday.amountMinor, locale)}
                description={t('dashboard.paymentsHint', {
                    count: metrics.paymentsToday.count,
                })}
                icon={CreditCard}
                href={`/admin/schools/${schoolId}/finance`}
            />

            <StatCard
                title={t('dashboard.upcomingExams')}
                value={metrics.upcomingExams.length.toLocaleString(locale)}
                description={t('dashboard.upcomingExamsHint')}
                icon={CalendarDays}
                href={`/admin/schools/${schoolId}/schedule/exams`}
            />
        </section>
    );
}
