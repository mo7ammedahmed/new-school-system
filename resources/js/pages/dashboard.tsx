import { useT } from '@/hooks/useT';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Bell,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    CreditCard,
    FileText,
    Globe2,
    GraduationCap,
    Inbox,
    Layers,
    Megaphone,
    Receipt,
    TrendingUp,
    UsersRound,
    WalletCards,
    XCircle,
} from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

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

function Card({
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
        <section className="rounded-[1.75rem] border border-[#dbe8df] bg-white p-6">
            <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-black text-[#17342f]">
                    <Icon size={18} aria-hidden={true} />
                    {title}
                </h2>
                {href ? (
                    <Link
                        href={href}
                        className="text-xs font-bold text-[#0d5c4d] underline-offset-4 hover:underline"
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
    return <p className="text-sm text-[#789087]">{children}</p>;
}

function StatCard({
    title,
    value,
    hint,
    icon,
    href,
}: {
    title: string;
    value: string;
    hint: string;
    icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;
    href?: string;
}) {
    const Icon = icon;
    const body = (
        <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#eaf3ee] text-[#0d5c4d]">
                <Icon size={18} aria-hidden={true} />
            </span>
            <span className="min-w-0">
                <span className="block text-sm font-bold text-[#6c837c]">
                    {title}
                </span>
                <span className="mt-1 block truncate text-2xl font-black text-[#17342f]">
                    {value}
                </span>
                <span className="mt-1 block text-xs text-[#789087]">
                    {hint}
                </span>
            </span>
        </div>
    );

    if (href) {
        return (
            <Link
                href={href}
                className="rounded-[1.5rem] border border-[#dbe8df] bg-white p-5 transition-shadow hover:shadow-[0_18px_40px_-32px_#17342f] focus-visible:ring-2 focus-visible:ring-[#28544a] focus-visible:outline-none"
            >
                {body}
            </Link>
        );
    }

    return (
        <div className="rounded-[1.5rem] border border-[#dbe8df] bg-white p-5">
            {body}
        </div>
    );
}

function AttendanceBar({ totals }: { totals: AttendanceTotals }) {
    const { t } = useT();
    const segments = [
        { key: 'present', value: totals.present, className: 'bg-[#2f6b3a]' },
        { key: 'late', value: totals.late, className: 'bg-[#d9a01a]' },
        { key: 'excused', value: totals.excused, className: 'bg-[#3b7ea1]' },
        { key: 'absent', value: totals.absent, className: 'bg-[#c0392b]' },
    ];

    if (totals.recorded === 0) {
        return <Empty>{t('dashboard.attendanceEmptyToday')}</Empty>;
    }

    return (
        <div className="space-y-4">
            <div className="flex h-2.5 overflow-hidden rounded-full bg-[#eef3ef]">
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
                        className="rounded-2xl border border-[#edf2ed] p-3"
                    >
                        <dt className="text-xs font-bold text-[#789087]">
                            {t(`portal.${segment.key}`)}
                        </dt>
                        <dd className="mt-1 text-lg font-black text-[#17342f]">
                            {segment.value}
                        </dd>
                    </div>
                ))}
            </dl>
            <p className="text-xs text-[#789087]">
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
                <header className="rounded-[1.75rem] bg-[#143e36] p-6 text-white md:p-8">
                    <p className="text-sm font-bold text-[#b7d7c5]">
                        {t('dashboard.title')}
                    </p>
                    <h1 className="mt-2 text-3xl font-black md:text-4xl">
                        {school.name}
                    </h1>
                    <p className="mt-3 max-w-2xl leading-7 text-[#d2e6d8]">
                        {t('dashboard.subtitle', { school: school.name })}
                    </p>
                </header>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title={t('dashboard.students')}
                        value={metrics.students.total.toLocaleString(locale)}
                        hint={t('dashboard.studentsHint', {
                            active: metrics.students.active,
                            inactive: metrics.students.inactive,
                        })}
                        icon={UsersRound}
                        href="/portal/students"
                    />
                    <StatCard
                        title={t('dashboard.teachers')}
                        value={metrics.teachers.total.toLocaleString(locale)}
                        hint={t('dashboard.teachersHint', {
                            assigned: metrics.teachers.assigned,
                        })}
                        icon={GraduationCap}
                        href={`/admin/schools/${school.id}/users`}
                    />
                    <StatCard
                        title={t('dashboard.attendanceToday')}
                        value={`${attendance.presentPercentage}%`}
                        hint={t('dashboard.attendanceHint', {
                            recorded: attendance.recorded,
                        })}
                        icon={ClipboardList}
                        href={`/admin/schools/${school.id}/reports/attendance`}
                    />
                    <StatCard
                        title={t('dashboard.activeClasses')}
                        value={metrics.activeClasses.toLocaleString(locale)}
                        hint={t('dashboard.activeClassesHint')}
                        icon={Layers}
                        href={`/admin/schools/${school.id}/academic-classes`}
                    />
                    <StatCard
                        title={t('dashboard.pendingAdmissions')}
                        value={metrics.pendingAdmissions.toLocaleString(locale)}
                        hint={t('dashboard.pendingAdmissionsHint')}
                        icon={Inbox}
                        href={`/admin/schools/${school.id}/applications`}
                    />
                    <StatCard
                        title={t('dashboard.outstandingBalances')}
                        value={formatMinor(
                            metrics.outstandingBalances.amountMinor,
                            locale,
                        )}
                        hint={t('dashboard.outstandingHint')}
                        icon={WalletCards}
                        href={`/admin/schools/${school.id}/reports/finance`}
                    />
                    <StatCard
                        title={t('dashboard.paymentsToday')}
                        value={formatMinor(
                            metrics.paymentsToday.amountMinor,
                            locale,
                        )}
                        hint={t('dashboard.paymentsHint', {
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
                        hint={t('dashboard.upcomingExamsHint')}
                        icon={CalendarDays}
                        href={`/admin/schools/${school.id}/schedule/exams`}
                    />
                </section>

                {widgets.quickActions.length > 0 ? (
                    <section className="rounded-[1.75rem] border border-[#dbe8df] bg-[#f7f8f4] p-6">
                        <h2 className="text-lg font-black text-[#17342f]">
                            {t('dashboard.quickActions')}
                        </h2>
                        <div className="mt-4 flex flex-wrap gap-3">
                            {widgets.quickActions.map((action) => {
                                const meta = QUICK_ACTION_META[action.key];
                                const Icon = meta?.icon ?? Globe2;

                                return (
                                    <Link
                                        key={action.key}
                                        href={action.href}
                                        className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-[#28544a] shadow-sm transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#28544a] focus-visible:outline-none"
                                    >
                                        <Icon size={17} aria-hidden={true} />
                                        {t(meta?.key ?? action.key)}
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                ) : null}

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card
                        title={t('dashboard.attendanceToday')}
                        icon={BarChart3}
                        href={`/admin/schools/${school.id}/reports/attendance`}
                        actionLabel={t('dashboard.viewAll')}
                    >
                        <AttendanceBar totals={attendance} />
                    </Card>

                    <Card
                        title={t('dashboard.admissionsPipeline')}
                        icon={Inbox}
                        href={`/admin/schools/${school.id}/applications`}
                        actionLabel={t('dashboard.viewAll')}
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
                                        className="rounded-2xl border border-[#edf2ed] p-3"
                                    >
                                        <dt className="text-xs font-bold text-[#789087]">
                                            {key}
                                        </dt>
                                        <dd className="mt-1 text-lg font-black text-[#17342f]">
                                            {value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        )}
                    </Card>

                    <Card
                        title={t('dashboard.financeSummary')}
                        icon={WalletCards}
                        href={`/admin/schools/${school.id}/reports/finance`}
                        actionLabel={t('dashboard.viewAll')}
                    >
                        <dl className="space-y-3">
                            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#edf2ed] p-3">
                                <dt className="text-sm font-bold text-[#789087]">
                                    {t('dashboard.incomeToday')}
                                </dt>
                                <dd className="text-sm font-black text-[#17342f]">
                                    {formatMinor(
                                        widgets.financeSummary.income.today,
                                        locale,
                                    )}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#edf2ed] p-3">
                                <dt className="text-sm font-bold text-[#789087]">
                                    {t('dashboard.incomeMonth')}
                                </dt>
                                <dd className="text-sm font-black text-[#17342f]">
                                    {formatMinor(
                                        widgets.financeSummary.income.month,
                                        locale,
                                    )}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#edf2ed] p-3">
                                <dt className="text-sm font-bold text-[#789087]">
                                    {t('dashboard.outstandingMinor')}
                                </dt>
                                <dd className="text-sm font-black text-[#17342f]">
                                    {formatMinor(
                                        widgets.financeSummary.outstandingMinor,
                                        locale,
                                    )}
                                </dd>
                            </div>
                        </dl>
                    </Card>

                    <Card
                        title={t('dashboard.paymentStatus')}
                        icon={Receipt}
                        href={`/admin/schools/${school.id}/finance`}
                        actionLabel={t('dashboard.viewAll')}
                    >
                        <dl className="grid grid-cols-3 gap-3">
                            <div className="rounded-2xl border border-[#edf2ed] p-3">
                                <dt className="flex items-center gap-1 text-xs font-bold text-[#789087]">
                                    <CheckCircle2
                                        size={14}
                                        aria-hidden="true"
                                    />
                                    {t('dashboard.successful')}
                                </dt>
                                <dd className="mt-1 text-lg font-black text-[#17342f]">
                                    {widgets.paymentStatus.successful}
                                </dd>
                            </div>
                            <div className="rounded-2xl border border-[#edf2ed] p-3">
                                <dt className="flex items-center gap-1 text-xs font-bold text-[#789087]">
                                    <XCircle size={14} aria-hidden="true" />
                                    {t('dashboard.failed')}
                                </dt>
                                <dd className="mt-1 text-lg font-black text-[#17342f]">
                                    {widgets.paymentStatus.failed}
                                </dd>
                            </div>
                            <div className="rounded-2xl border border-[#edf2ed] p-3">
                                <dt className="flex items-center gap-1 text-xs font-bold text-[#789087]">
                                    <TrendingUp size={14} aria-hidden="true" />
                                    {t('dashboard.inProgress')}
                                </dt>
                                <dd className="mt-1 text-lg font-black text-[#17342f]">
                                    {widgets.paymentStatus.pending}
                                </dd>
                            </div>
                        </dl>
                    </Card>

                    <Card
                        title={t('dashboard.assessmentTitle')}
                        icon={FileText}
                    >
                        {metrics.assessmentStats.total === 0 ? (
                            <Empty>{t('portal.noAssessments')}</Empty>
                        ) : (
                            <div className="space-y-4">
                                <dl className="grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl border border-[#edf2ed] p-3">
                                        <dt className="text-xs font-bold text-[#789087]">
                                            {t('dashboard.assessmentAverage')}
                                        </dt>
                                        <dd className="mt-1 text-lg font-black text-[#17342f]">
                                            {
                                                metrics.assessmentStats
                                                    .averagePercent
                                            }
                                            %
                                        </dd>
                                    </div>
                                    <div className="rounded-2xl border border-[#edf2ed] p-3">
                                        <dt className="text-xs font-bold text-[#789087]">
                                            {t('dashboard.assessmentPassRate')}
                                        </dt>
                                        <dd className="mt-1 text-lg font-black text-[#17342f]">
                                            {metrics.assessmentStats.passRate}%
                                        </dd>
                                    </div>
                                </dl>
                                <p className="text-xs text-[#789087]">
                                    {t('dashboard.assessmentCount', {
                                        count: metrics.assessmentStats.total,
                                    })}
                                </p>
                                <ul className="space-y-2">
                                    {metrics.assessmentStats.recent.map(
                                        (assessment) => (
                                            <li
                                                key={assessment.id}
                                                className="rounded-2xl border border-[#edf2ed] p-3"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <strong className="truncate text-sm font-black text-[#17342f]">
                                                        {assessment.title}
                                                    </strong>
                                                    <span className="shrink-0 text-xs font-bold text-[#0d5c4d]">
                                                        {assessment.score}/
                                                        {assessment.maxScore}
                                                    </span>
                                                </div>
                                                <small className="mt-1 block text-[#789087]">
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
                    </Card>

                    <Card
                        title={t('dashboard.todaysTimetable')}
                        icon={CalendarDays}
                        href={`/admin/schools/${school.id}/schedule/timetable`}
                        actionLabel={t('dashboard.viewAll')}
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
                                            className="flex items-center justify-between gap-3 rounded-2xl border border-[#edf2ed] p-3"
                                        >
                                            <span
                                                className="min-w-0 border-s-4 ps-3"
                                                style={{
                                                    borderColor:
                                                        entry.subject_color ??
                                                        '#dbe8df',
                                                }}
                                            >
                                                <strong className="block truncate text-sm font-black text-[#17342f]">
                                                    {subjectLabel(entry)}
                                                </strong>
                                                <small className="mt-1 block text-[#789087]">
                                                    {entry.class_name} ·{' '}
                                                    {entry.section_name}
                                                    {entry.teacher_name
                                                        ? ` · ${entry.teacher_name}`
                                                        : ''}
                                                </small>
                                            </span>
                                            <span className="shrink-0 text-end text-xs font-bold text-[#0d5c4d]">
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
                    </Card>

                    <Card
                        title={t('dashboard.outstandingInvoices')}
                        icon={WalletCards}
                        href={`/admin/schools/${school.id}/reports/finance`}
                        actionLabel={t('dashboard.viewAll')}
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
                                            className="flex items-center justify-between gap-3 rounded-2xl border border-[#edf2ed] p-3"
                                        >
                                            <span className="min-w-0">
                                                <strong className="block truncate text-sm font-black text-[#17342f]">
                                                    {installment.student}
                                                </strong>
                                                <small className="mt-1 block text-[#789087]">
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
                                            <span className="shrink-0 text-end text-sm font-black text-[#17342f]">
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
                    </Card>

                    <Card
                        title={t('dashboard.upcomingExams')}
                        icon={GraduationCap}
                    >
                        {metrics.upcomingExams.length === 0 ? (
                            <Empty>{t('portal.noUpcomingExams')}</Empty>
                        ) : (
                            <ol className="space-y-3">
                                {metrics.upcomingExams
                                    .slice(0, 6)
                                    .map((exam) => (
                                        <li
                                            key={exam.id}
                                            className="rounded-2xl border border-[#edf2ed] p-3"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <strong className="truncate text-sm font-black text-[#17342f]">
                                                    {subjectLabel(exam)}
                                                </strong>
                                                <span className="shrink-0 text-xs font-bold text-[#0d5c4d]">
                                                    {exam.starts_at}
                                                    {exam.ends_at
                                                        ? `–${exam.ends_at}`
                                                        : ''}
                                                </span>
                                            </div>
                                            <small className="mt-1 block text-[#789087]">
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
                    </Card>

                    <Card
                        title={t('dashboard.recentNotices')}
                        icon={Megaphone}
                        href={`/admin/schools/${school.id}/notices`}
                        actionLabel={t('dashboard.viewAll')}
                    >
                        {widgets.recentNotices.length === 0 ? (
                            <Empty>{t('dashboard.noNotices')}</Empty>
                        ) : (
                            <ul className="space-y-3">
                                {widgets.recentNotices.map((notice) => (
                                    <li
                                        key={notice.id}
                                        className="flex items-center justify-between gap-3 rounded-2xl border border-[#edf2ed] p-3"
                                    >
                                        <strong className="min-w-0 truncate text-sm font-black text-[#17342f]">
                                            {notice.title}
                                        </strong>
                                        {notice.publishedAt ? (
                                            <small className="shrink-0 text-xs text-[#789087]">
                                                {new Date(
                                                    notice.publishedAt,
                                                ).toLocaleDateString(locale)}
                                            </small>
                                        ) : null}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>

                    <Card
                        title={t('dashboard.notificationActivity')}
                        icon={Bell}
                        href="/admin/notifications/deliveries"
                        actionLabel={t('dashboard.viewAll')}
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
                                    className="rounded-2xl border border-[#edf2ed] p-3"
                                >
                                    <dt className="text-xs font-bold text-[#789087]">
                                        {t(`dashboard.${key}`)}
                                    </dt>
                                    <dd className="mt-1 text-lg font-black text-[#17342f]">
                                        {value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </Card>

                    <Card
                        title={t('dashboard.recentActivity')}
                        icon={TrendingUp}
                    >
                        {widgets.recentActivity.length === 0 ? (
                            <Empty>{t('dashboard.noActivity')}</Empty>
                        ) : (
                            <ol className="space-y-3">
                                {widgets.recentActivity.map((entry) => (
                                    <li
                                        key={entry.id}
                                        className="flex items-center justify-between gap-3 rounded-2xl border border-[#edf2ed] p-3"
                                    >
                                        <span className="min-w-0">
                                            <strong className="block truncate text-sm font-black text-[#17342f]">
                                                {humanizeAction(entry.action)}
                                            </strong>
                                            <small className="mt-1 block text-[#789087]">
                                                {entry.actor ?? '—'}
                                            </small>
                                        </span>
                                        {entry.at ? (
                                            <small className="shrink-0 text-xs text-[#789087]">
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
                    </Card>
                </div>
            </div>
        </>
    );
}
