import { useT } from '@/hooks/useT';
import { Head, Link, usePage } from '@inertiajs/react';
import { Bell, ClipboardList, UsersRound, WalletCards } from 'lucide-react';

type Child = {
    id: number;
    name: string;
    student_number: string;
    school_name: string | null;
    class_name: string | null;
    section_name: string | null;
};

type ExamRow = {
    id: number;
    child_name: string | null;
    exam_date: string;
    starts_at: string;
    ends_at: string;
    room: string | null;
    section_name: string | null;
    class_name: string | null;
    subject_name_en: string | null;
    subject_name_ar: string | null;
};

type Outstanding = {
    total_minor: number;
    currency: string | null;
    by_child: Array<{
        student_id: number;
        amount_minor: number;
        currency: string | null;
    }>;
};

type GuardianDashboardProps = {
    guardian: { name: string } | null;
    today: { iso: string; weekday: number };
    children: Child[];
    upcoming_exams: ExamRow[];
    outstanding: Outstanding;
    counts: { children: number; exams: number };
};

export default function GuardianDashboard() {
    const {
        guardian,
        today,
        children,
        upcoming_exams: upcomingExams,
        outstanding,
        counts,
    } = usePage<GuardianDashboardProps>().props;
    const { t, dayName, isArabic } = useT();

    const subjectLabel = (item: {
        subject_name_en: string | null;
        subject_name_ar: string | null;
    }) =>
        isArabic
            ? (item.subject_name_ar ?? item.subject_name_en)
            : (item.subject_name_en ?? item.subject_name_ar);

    const money = (minor: number, currency: string | null) =>
        `${(minor / 100).toFixed(2)} ${currency ?? 'SAR'}`;

    const outstandingFor = (studentId: number) =>
        outstanding.by_child.find((row) => row.student_id === studentId)
            ?.amount_minor ?? 0;

    return (
        <>
            <Head title={t('portal.guardianTitle')} />

            <div className="space-y-6 p-4 md:p-8">
                <header className="rounded-[1.75rem] bg-hero-bg p-6 text-white md:p-8">
                    <p className="text-sm font-bold text-hero-muted">
                        {guardian?.name} · {t('portal.today')} {today.iso} ·{' '}
                        {dayName(today.weekday)}
                    </p>
                    <h1 className="mt-2 text-3xl font-black md:text-4xl">
                        {t('portal.guardianTitle')}
                    </h1>
                    <p className="mt-3 max-w-xl leading-7 text-hero-accent">
                        {t('portal.guardianSubtitle')}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
                            {t('portal.children')}: {counts.children}
                        </span>
                        <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
                            {t('portal.upcomingExams')}: {counts.exams}
                        </span>
                    </div>
                </header>

                {children.length === 0 ? (
                    <p className="rounded-[1.75rem] border border-border bg-card p-6 text-sm font-bold text-muted-foreground">
                        {t('portal.noChildren')}
                    </p>
                ) : (
                    <section className="rounded-[1.75rem] border border-border bg-card p-6">
                        <h2 className="flex items-center gap-2 text-xl font-black text-foreground">
                            <UsersRound size={19} aria-hidden="true" />
                            {t('portal.children')}
                        </h2>
                        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {children.map((child) => (
                                <li
                                    key={child.id}
                                    className="rounded-2xl border border-border p-4"
                                >
                                    <strong className="block text-sm font-black text-foreground">
                                        {child.name}
                                    </strong>
                                    <small className="mt-1 block text-muted-foreground">
                                        {child.class_name} ·{' '}
                                        {child.section_name} ·{' '}
                                        {child.school_name}
                                    </small>
                                    <small className="mt-2 block text-brand-600">
                                        {outstandingFor(child.id) > 0
                                            ? `${t('portal.outstanding')}: ${money(outstandingFor(child.id), outstanding.currency)}`
                                            : t('portal.noOutstanding')}
                                    </small>
                                    <Link
                                        href={`/portal/students/${child.id}`}
                                        className="mt-3 inline-block text-xs font-black text-brand-600 underline"
                                    >
                                        {t('portal.myRecord')}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-[1.75rem] border border-border bg-card p-6">
                        <h2 className="flex items-center gap-2 text-xl font-black text-foreground">
                            <ClipboardList size={19} aria-hidden="true" />
                            {t('portal.upcomingExams')}
                        </h2>

                        {upcomingExams.length === 0 ? (
                            <p className="mt-4 text-sm text-muted-foreground">
                                {t('portal.noUpcomingExams')}
                            </p>
                        ) : (
                            <ol className="mt-4 space-y-3">
                                {upcomingExams.map((exam) => (
                                    <li
                                        key={exam.id}
                                        className="rounded-2xl border border-border p-3"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <strong className="text-sm font-black text-foreground">
                                                {subjectLabel(exam)}
                                            </strong>
                                            <span className="text-xs font-bold text-brand-600">
                                                {exam.starts_at}–{exam.ends_at}
                                            </span>
                                        </div>
                                        <small className="mt-1 block text-muted-foreground">
                                            {exam.exam_date} ·{' '}
                                            {t('portal.child')}:{' '}
                                            {exam.child_name}
                                            {exam.room
                                                ? ` · ${t('portal.room')} ${exam.room}`
                                                : ''}
                                        </small>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </section>

                    <section className="rounded-[1.75rem] border border-border bg-card p-6">
                        <h2 className="flex items-center gap-2 text-xl font-black text-foreground">
                            <WalletCards size={19} aria-hidden="true" />
                            {t('portal.outstanding')}
                        </h2>
                        <p className="mt-4 text-3xl font-black text-foreground">
                            {money(
                                outstanding.total_minor,
                                outstanding.currency,
                            )}
                        </p>
                        {outstanding.total_minor === 0 ? (
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t('portal.noOutstanding')}
                            </p>
                        ) : null}

                        <div className="mt-5 flex flex-wrap gap-3">
                            <Link
                                href="/portal/guardian"
                                className="inline-flex items-center gap-2 rounded-full bg-muted px-5 py-3 font-black text-brand-700"
                            >
                                <WalletCards size={18} aria-hidden="true" />
                                {t('portal.myWorkspace')}
                            </Link>
                            <Link
                                href="/portal/notifications"
                                className="inline-flex items-center gap-2 rounded-full bg-muted px-5 py-3 font-black text-brand-700"
                            >
                                <Bell size={18} aria-hidden="true" />
                                {t('portal.notifications')}
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
