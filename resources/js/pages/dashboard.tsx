import { useT } from '@/hooks/useT';
import { PageHero } from '@/components/page-hero';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    CreditCard,
    FileText,
    Globe2,
    GraduationCap,
    Inbox,
    Layers,
    TrendingUp,
    UsersRound,
    WalletCards,
    XCircle,
} from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { DashboardWidget } from '@/components/dashboard/dashboard-widget';
import { StatCard } from '@/components/dashboard/stat-card';

type AttendanceTotals = {
    present: number;
    absent: number;
    late: number;
    excused: number;
    recorded: number;
    presentPercentage: number;
};

type UpcomingExam = {
    id: number;
    exam_date: string;
    starts_at: string | null;
    ends_at: string | null;
    room: string | null;
    class_name: string | null;
    section_name: string | null;
    subject_name_en: string | null;
    subject_name_ar: string | null;
};

type TimetableEntry = {
    id: number;
    period: number;
    starts_at: string | null;
    ends_at: string | null;
    class_name: string | null;
    section_name: string | null;
    subject_name_en: string | null;
    subject_name_ar: string | null;
    subject_color: string | null;
    teacher_name: string | null;
};

type OutstandingInstallment = {
    id: number;
    number: string | null;
    student: string;
    studentNumber: string | null;
    sequence: number;
    amountMinor: number;
    paidMinor: number;
    outstandingMinor: number;
    currency: string;
    dueOn: string | null;
    status: string;
};

type RecentAssessment = {
    id: number;
    title: string;
    assessedOn: string | null;
    sectionName: string | null;
    student: string;
    score: number;
    maxScore: number;
};

type DashboardProps = {
    school: { id: number; name: string } | null;
    metrics: {
        students: { total: number; active: number; inactive: number };
        teachers: { total: number; assigned: number };
        attendanceToday: AttendanceTotals;
        activeClasses: number;
        pendingAdmissions: number;
        outstandingBalances: { amountMinor: number; formatted: string };
        paymentsToday: {
            amountMinor: number;
            count: number;
            formattedAmount: string;
        };
        upcomingExams: UpcomingExam[];
        assessmentStats: {
            total: number;
            averagePercent: number;
            passRate: number;
            recent: RecentAssessment[];
        };
    };
    widgets: {
        attendanceOverview: { today: AttendanceTotals };
        admissionsPipeline: {
            pending: number;
            reviewing: number;
            accepted: number;
            rejected: number;
            withdrawn: number;
        };
        financeSummary: {
            income: { today: number; month: number };
            outstandingMinor: number;
            currency: string;
        };
        todaysTimetable: TimetableEntry[];
        recentNotices: Array<{
            id: number;
            title: string;
            publishedAt: string | null;
        }>;
        paymentStatus: { successful: number; failed: number; pending: number };
        outstandingInvoices: OutstandingInstallment[];
        notificationActivity: {
            sentToday: number;
            readToday: number;
            deliveredToday: number;
        };
        recentActivity: Array<{
            id: number;
            action: string;
            actor: string | null;
            at: string | null;
        }>;
        quickActions: Array<{ key: string; href: string }>;
    };
};

const QUICK_ACTION_META: Record<
    string,
    {
        key: string;
        icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;
    }
> = {
    take_attendance: { key: 'dashboard.takeAttendance', icon: ClipboardList },
    view_applications: { key: 'dashboard.viewApplications', icon: Inbox },
    manage_finance: { key: 'dashboard.manageFinance', icon: CreditCard },
    manage_timetable: { key: 'dashboard.manageTimetable', icon: CalendarDays },
    manage_exams: { key: 'dashboard.manageExams', icon: FileText },
    manage_academics: { key: 'dashboard.manageAcademics', icon: GraduationCap },
};

/** Turns an audit action such as `student.account_linked` into `Account linked`. */
function humanizeAction(action: string): string {
    const verb = action.split('.').pop() ?? action;
    const readable = verb.replace(/_/g, ' ');

    return readable.charAt(0).toUpperCase() + readable.slice(1);
}

function minorToMajor(amountMinor: number): number {
    return Math.round(amountMinor) / 100;
}

function formatMinor(
    amountMinor: number,
    locale: string,
    currency = 'SAR',
): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
    }).format(minorToMajor(amountMinor));
}

function _Card({
    title,
    icon,
    href,
    actionLabel,
    children,
}: {
    title: string;
    icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;
    href?: string;
    actionLabel?: string;
    children: ReactNode;
}) {
    const Icon = icon;

    return (
        <section className="border-border bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                    <Icon size={18} aria-hidden={true} />
                    {title}
                </h2>
                {href ? (
                    <Link
                        href={href}
                        className="text-brand-600 text-xs font-bold underline-offset-4 hover:underline"
                    >
                        {actionLabel}
                    </Link>
                ) : null}
            </div>
            <div className="mt-4">{children}</div>
        </section>
    );
}

function Empty({ children }: { children: ReactNode }) {
    return <p className="text-muted-foreground text-sm">{children}</p>;
}

function AttendanceBar({ totals }: { totals: AttendanceTotals }) {
    const { t } = useT();
    const segments = [
        { key: 'present', value: totals.present, className: 'bg-brand-800' },
        { key: 'late', value: totals.late, className: 'bg-warning' },
        { key: 'excused', value: totals.excused, className: 'bg-secondary' },
        { key: 'absent', value: totals.absent, className: 'bg-destructive' },
    ];

    if (totals.recorded === 0) {
        return <Empty>{t('dashboard.attendanceEmptyToday')}</Empty>;
    }

    return (
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
                {t('dashboard.attendanceHint', { recorded: totals.recorded })} ·{' '}
                {totals.presentPercentage}%
            </p>
        </div>
    );
}

export default function Dashboard() {
    const { school, metrics, widgets } = usePage<DashboardProps>().props;
    const { t, locale, isArabic } = useT();

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

    const subjectLabel = (item: {
        subject_name_en: string | null;
        subject_name_ar: string | null;
    }) =>
        isArabic
            ? (item.subject_name_ar ?? item.subject_name_en)
            : (item.subject_name_en ?? item.subject_name_ar);

    const attendance = widgets.attendanceOverview.today;
    const pipeline = widgets.admissionsPipeline;
    const pipelineTotal =
        pipeline.pending +
        pipeline.reviewing +
        pipeline.accepted +
        pipeline.rejected +
        pipeline.withdrawn;

    return (
        <>
            <Head title={t('dashboard.title')} />

            <div className="space-y-6 p-4 md:p-8">
                <PageHero
                    eyebrow={t('dashboard.title')}
                    title={school.name}
                    subtitle={t('dashboard.subtitle', { school: school.name })}
                />

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
                        href={`/admin/schools/${school.id}/users`}
                    />

                    <StatCard
                        title={t('dashboard.attendanceToday')}
                        value={`${attendance.presentPercentage}%`}
                        description={t('dashboard.attendanceHint', {
                            recorded: attendance.recorded,
                        })}
                        icon={ClipboardList}
                        href={`/admin/schools/${school.id}/reports/attendance`}
                    />

                    <StatCard
                        title={t('dashboard.activeClasses')}
                        value={metrics.activeClasses.toLocaleString(locale)}
                        description={t('dashboard.activeClassesHint')}
                        icon={Layers}
                        href={`/admin/schools/${school.id}/academic-classes`}
                    />

                    <StatCard
                        title={t('dashboard.pendingAdmissions')}
                        value={metrics.pendingAdmissions.toLocaleString(locale)}
                        description={t('dashboard.pendingAdmissionsHint')}
                        icon={Inbox}
                        href={`/admin/schools/${school.id}/applications`}
                    />

                    <StatCard
                        title={t('dashboard.outstandingBalances')}
                        value={formatMinor(
                            metrics.outstandingBalances.amountMinor,
                            locale,
                        )}
                        description={t('dashboard.outstandingHint')}
                        icon={WalletCards}
                        href={`/admin/schools/${school.id}/reports/finance`}
                    />

                    <StatCard
                        title={t('dashboard.paymentsToday')}
                        value={formatMinor(
                            metrics.paymentsToday.amountMinor,
                            locale,
                        )}
                        description={t('dashboard.paymentsHint', {
                            count: metrics.paymentsToday.count,
                        })}
                        icon={CreditCard}
                        href={`/admin/schools/${school.id}/finance`}
                    />

                    <StatCard
                        title={t('dashboard.upcomingExams')}
                        value={metrics.upcomingExams.length.toLocaleString(
                            locale,
                        )}
                        description={t('dashboard.upcomingExamsHint')}
                        icon={CalendarDays}
                        href={`/admin/schools/${school.id}/schedule/exams`}
                    />
                </section>

                {widgets.quickActions.length > 0 ? (
                    <DashboardWidget title={t('dashboard.quickActions')}>
                        <div className="mt-4 flex flex-wrap gap-3">
                            {widgets.quickActions.map((action) => {
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
                ) : null}

                <div className="grid gap-6 lg:grid-cols-2">
                    <DashboardWidget
                        title={t('dashboard.attendanceToday')}
                        refreshable
                    >
                        <AttendanceBar totals={attendance} />
                    </DashboardWidget>

                    <DashboardWidget
                        title={t('dashboard.admissionsPipeline')}
                        refreshable
                    >
                        {pipelineTotal === 0 ? (
                            <Empty>
                                {t('dashboard.pendingAdmissionsHint')}
                            </Empty>
                        ) : (
                            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {(
                                    [
                                        ['pending', pipeline.pending],
                                        ['reviewing', pipeline.reviewing],
                                        ['accepted', pipeline.accepted],
                                        ['rejected', pipeline.rejected],
                                        ['withdrawn', pipeline.withdrawn],
                                    ] as const
                                ).map(([key, value]) => (
                                    <div
                                        key={key}
                                        className="border-border rounded-lg border p-3"
                                    >
                                        <dt className="text-muted-foreground text-xs font-bold">
                                            {key}
                                        </dt>
                                        <dd className="text-foreground mt-1 text-lg font-semibold">
                                            {value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        )}
                    </DashboardWidget>

                    <DashboardWidget
                        title={t('dashboard.financeSummary')}
                        refreshable
                    >
                        <dl className="space-y-3">
                            <div className="border-border flex items-center justify-between gap-4 rounded-lg border p-3">
                                <dt className="text-muted-foreground text-sm font-bold">
                                    {t('dashboard.incomeToday')}
                                </dt>
                                <dd className="text-foreground text-sm font-semibold">
                                    {formatMinor(
                                        widgets.financeSummary.income.today,
                                        locale,
                                    )}
                                </dd>
                            </div>
                            <div className="border-border flex items-center justify-between gap-4 rounded-lg border p-3">
                                <dt className="text-muted-foreground text-sm font-bold">
                                    {t('dashboard.incomeMonth')}
                                </dt>
                                <dd className="text-foreground text-sm font-semibold">
                                    {formatMinor(
                                        widgets.financeSummary.income.month,
                                        locale,
                                    )}
                                </dd>
                            </div>
                            <div className="border-border flex items-center justify-between gap-4 rounded-lg border p-3">
                                <dt className="text-muted-foreground text-sm font-bold">
                                    {t('dashboard.outstandingMinor')}
                                </dt>
                                <dd className="text-foreground text-sm font-semibold">
                                    {formatMinor(
                                        widgets.financeSummary.outstandingMinor,
                                        locale,
                                    )}
                                </dd>
                            </div>
                        </dl>
                    </DashboardWidget>

                    <DashboardWidget
                        title={t('dashboard.paymentStatus')}
                        refreshable
                    >
                        <dl className="grid grid-cols-3 gap-3">
                            <div className="border-border rounded-lg border p-3">
                                <dt className="text-muted-foreground flex items-center gap-1 text-xs font-bold">
                                    <CheckCircle2
                                        size={14}
                                        aria-hidden="true"
                                    />
                                    {t('dashboard.successful')}
                                </dt>
                                <dd className="text-foreground mt-1 text-lg font-semibold">
                                    {widgets.paymentStatus.successful}
                                </dd>
                            </div>
                            <div className="border-border rounded-lg border p-3">
                                <dt className="text-muted-foreground flex items-center gap-1 text-xs font-bold">
                                    <XCircle size={14} aria-hidden="true" />
                                    {t('dashboard.failed')}
                                </dt>
                                <dd className="text-foreground mt-1 text-lg font-semibold">
                                    {widgets.paymentStatus.failed}
                                </dd>
                            </div>
                            <div className="border-border rounded-lg border p-3">
                                <dt className="text-muted-foreground flex items-center gap-1 text-xs font-bold">
                                    <TrendingUp size={14} aria-hidden="true" />
                                    {t('dashboard.inProgress')}
                                </dt>
                                <dd className="text-foreground mt-1 text-lg font-semibold">
                                    {widgets.paymentStatus.pending}
                                </dd>
                            </div>
                        </dl>
                    </DashboardWidget>

                    <DashboardWidget title={t('dashboard.assessmentTitle')}>
                        {metrics.assessmentStats.total === 0 ? (
                            <Empty>{t('portal.noAssessments')}</Empty>
                        ) : (
                            <div className="space-y-4">
                                <dl className="grid grid-cols-2 gap-3">
                                    <div className="border-border rounded-lg border p-3">
                                        <dt className="text-muted-foreground text-xs font-bold">
                                            {t('dashboard.assessmentAverage')}
                                        </dt>
                                        <dd className="text-foreground mt-1 text-lg font-semibold">
                                            {
                                                metrics.assessmentStats
                                                    .averagePercent
                                            }
                                            %
                                        </dd>
                                    </div>
                                    <div className="border-border rounded-lg border p-3">
                                        <dt className="text-muted-foreground text-xs font-bold">
                                            {t('dashboard.assessmentPassRate')}
                                        </dt>
                                        <dd className="text-foreground mt-1 text-lg font-semibold">
                                            {metrics.assessmentStats.passRate}%
                                        </dd>
                                    </div>
                                </dl>
                                <p className="text-muted-foreground text-xs">
                                    {t('dashboard.assessmentCount', {
                                        count: metrics.assessmentStats.total,
                                    })}
                                </p>
                                <ul className="space-y-2">
                                    {metrics.assessmentStats.recent.map(
                                        (assessment) => (
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
                                                        {assessment.score}/
                                                        {assessment.maxScore}
                                                    </span>
                                                </div>
                                                <small className="text-muted-foreground mt-1 block">
                                                    {assessment.student}
                                                    {assessment.sectionName
                                                        ? ` · ${assessment.sectionName}`
                                                        : ''}
                                                </small>
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </div>
                        )}
                    </DashboardWidget>

                    <DashboardWidget
                        title={t('dashboard.todaysTimetable')}
                        refreshable
                    >
                        {widgets.todaysTimetable.length === 0 ? (
                            <Empty>{t('dashboard.noTimetable')}</Empty>
                        ) : (
                            <ol className="space-y-3">
                                {widgets.todaysTimetable
                                    .slice(0, 6)
                                    .map((entry) => (
                                        <li
                                            key={entry.id}
                                            className="border-border flex items-center justify-between gap-3 rounded-lg border p-3"
                                        >
                                            <span
                                                className="min-w-0 border-s-4 ps-3"
                                                style={{
                                                    borderColor:
                                                        entry.subject_color ??
                                                        'var(--border)',
                                                }}
                                            >
                                                <strong className="text-foreground block truncate text-sm font-semibold">
                                                    {subjectLabel(entry)}
                                                </strong>
                                                <small className="text-muted-foreground mt-1 block">
                                                    {entry.class_name} ·{' '}
                                                    {entry.section_name}
                                                    {entry.teacher_name
                                                        ? ` · ${entry.teacher_name}`
                                                        : ''}
                                                </small>
                                            </span>
                                            <span className="text-brand-600 shrink-0 text-end text-xs font-bold">
                                                {t('portal.period')}{' '}
                                                {entry.period}
                                                {entry.starts_at ? (
                                                    <span className="block">
                                                        {entry.starts_at}
                                                    </span>
                                                ) : null}
                                            </span>
                                        </li>
                                    ))}
                            </ol>
                        )}
                    </DashboardWidget>

                    <DashboardWidget
                        title={t('dashboard.outstandingInvoices')}
                        refreshable
                    >
                        {widgets.outstandingInvoices.length === 0 ? (
                            <Empty>
                                {t('dashboard.noOutstandingInvoices')}
                            </Empty>
                        ) : (
                            <ul className="space-y-3">
                                {widgets.outstandingInvoices
                                    .slice(0, 6)
                                    .map((installment) => (
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
                                                        ? ` · ${t(
                                                              'dashboard.dueOn',
                                                              {
                                                                  date: installment.dueOn,
                                                              },
                                                          )}`
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

                    <DashboardWidget title={t('dashboard.upcomingExams')}>
                        {metrics.upcomingExams.length === 0 ? (
                            <Empty>{t('portal.noUpcomingExams')}</Empty>
                        ) : (
                            <ol className="space-y-3">
                                {metrics.upcomingExams
                                    .slice(0, 6)
                                    .map((exam) => (
                                        <li
                                            key={exam.id}
                                            className="border-border rounded-lg border p-3"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <strong className="text-foreground truncate text-sm font-semibold">
                                                    {subjectLabel(exam)}
                                                </strong>
                                                <span className="text-brand-600 shrink-0 text-xs font-bold">
                                                    {exam.starts_at}
                                                    {exam.ends_at
                                                        ? `–${exam.ends_at}`
                                                        : ''}
                                                </span>
                                            </div>
                                            <small className="text-muted-foreground mt-1 block">
                                                {exam.exam_date} ·{' '}
                                                {exam.class_name} ·{' '}
                                                {exam.section_name}
                                                {exam.room
                                                    ? ` · ${t('portal.room')} ${exam.room}`
                                                    : ''}
                                            </small>
                                        </li>
                                    ))}
                            </ol>
                        )}
                    </DashboardWidget>

                    <DashboardWidget
                        title={t('dashboard.recentNotices')}
                        refreshable
                    >
                        {widgets.recentNotices.length === 0 ? (
                            <Empty>{t('dashboard.noNotices')}</Empty>
                        ) : (
                            <ul className="space-y-3">
                                {widgets.recentNotices.map((notice) => (
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

                    <DashboardWidget
                        title={t('dashboard.notificationActivity')}
                        refreshable
                    >
                        <dl className="grid grid-cols-3 gap-3">
                            {(
                                [
                                    [
                                        'sent',
                                        widgets.notificationActivity.sentToday,
                                    ],
                                    [
                                        'readCount',
                                        widgets.notificationActivity.readToday,
                                    ],
                                    [
                                        'delivered',
                                        widgets.notificationActivity
                                            .deliveredToday,
                                    ],
                                ] as const
                            ).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="border-border rounded-lg border p-3"
                                >
                                    <dt className="text-muted-foreground text-xs font-bold">
                                        {t(`dashboard.${key}`)}
                                    </dt>
                                    <dd className="text-foreground mt-1 text-lg font-semibold">
                                        {value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </DashboardWidget>

                    <DashboardWidget title={t('dashboard.recentActivity')}>
                        {widgets.recentActivity.length === 0 ? (
                            <Empty>{t('dashboard.noActivity')}</Empty>
                        ) : (
                            <ol className="space-y-3">
                                {widgets.recentActivity.map((entry) => (
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
                                                {new Date(
                                                    entry.at,
                                                ).toLocaleString(locale, {
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
                </div>
            </div>
        </>
    );
}
