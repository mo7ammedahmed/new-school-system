import { useT } from '@/hooks/useT';
import { PageHero, PageHeroStat, PageHeroStats } from '@/components/page-hero';
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
                <PageHero
                    eyebrow={
                        <>
                            {guardian?.name} · {t('portal.today')} {today.iso} ·{' '}
                            {dayName(today.weekday)}
                        </>
                    }
                    title={t('portal.guardianTitle')}
                    subtitle={t('portal.guardianSubtitle')}
                >
                    <PageHeroStats>
                        <PageHeroStat>
                            {t('portal.children')}: {counts.children}
                        </PageHeroStat>
                        <PageHeroStat>
                            {t('portal.upcomingExams')}: {counts.exams}
                        </PageHeroStat>
                    </PageHeroStats>
                </PageHero>

                {children.length === 0 ? (
                    <p className="border-border bg-card text-muted-foreground rounded-lg border p-6 text-sm font-bold">
                        {t('portal.noChildren')}
                    </p>
                ) : (
                    <section className="border-border bg-card rounded-lg border p-6">
                        <h2 className="text-foreground flex items-center gap-2 text-xl font-semibold">
                            <UsersRound size={19} aria-hidden="true" />
                            {t('portal.children')}
                        </h2>
                        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {children.map((child) => (
                                <li
                                    key={child.id}
                                    className="border-border rounded-lg border p-4"
                                >
                                    <strong className="text-foreground block text-sm font-semibold">
                                        {child.name}
                                    </strong>
                                    <small className="text-muted-foreground mt-1 block">
                                        {child.class_name} ·{' '}
                                        {child.section_name} ·{' '}
                                        {child.school_name}
                                    </small>
                                    <small className="text-brand-600 mt-2 block">
                                        {outstandingFor(child.id) > 0
                                            ? `${t('portal.outstanding')}: ${money(outstandingFor(child.id), outstanding.currency)}`
                                            : t('portal.noOutstanding')}
                                    </small>
                                    <Link
                                        href={`/portal/students/${child.id}`}
                                        className="text-brand-600 mt-3 inline-block text-xs font-semibold underline"
                                    >
                                        {t('portal.myRecord')}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="border-border bg-card rounded-lg border p-6">
                        <h2 className="text-foreground flex items-center gap-2 text-xl font-semibold">
                            <ClipboardList size={19} aria-hidden="true" />
                            {t('portal.upcomingExams')}
                        </h2>

                        {upcomingExams.length === 0 ? (
                            <p className="text-muted-foreground mt-4 text-sm">
                                {t('portal.noUpcomingExams')}
                            </p>
                        ) : (
                            <ol className="mt-4 space-y-3">
                                {upcomingExams.map((exam) => (
                                    <li
                                        key={exam.id}
                                        className="border-border rounded-lg border p-3"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <strong className="text-foreground text-sm font-semibold">
                                                {subjectLabel(exam)}
                                            </strong>
                                            <span
                                                dir="ltr"
                                                className="text-brand-600 text-xs font-bold"
                                            >
                                                {exam.starts_at}–{exam.ends_at}
                                            </span>
                                        </div>
                                        <small className="text-muted-foreground mt-1 block">
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

                    <section className="border-border bg-card rounded-lg border p-6">
                        <h2 className="text-foreground flex items-center gap-2 text-xl font-semibold">
                            <WalletCards size={19} aria-hidden="true" />
                            {t('portal.outstanding')}
                        </h2>
                        <p className="text-foreground mt-4 text-3xl font-semibold">
                            {money(
                                outstanding.total_minor,
                                outstanding.currency,
                            )}
                        </p>
                        {outstanding.total_minor === 0 ? (
                            <p className="text-muted-foreground mt-2 text-sm">
                                {t('portal.noOutstanding')}
                            </p>
                        ) : null}

                        <div className="mt-5 flex flex-wrap gap-3">
                            <Link
                                href="/portal/guardian"
                                className="bg-muted text-brand-700 inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold"
                            >
                                <WalletCards size={18} aria-hidden="true" />
                                {t('portal.myWorkspace')}
                            </Link>
                            <Link
                                href="/portal/notifications"
                                className="bg-muted text-brand-700 inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold"
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
