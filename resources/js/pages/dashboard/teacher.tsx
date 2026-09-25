import { useT } from '@/hooks/useT';
import { PageHero, PageHeroStat, PageHeroStats } from '@/components/page-hero';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Bell,
    BookOpenCheck,
    CalendarDays,
    ClipboardList,
    UsersRound,
} from 'lucide-react';

type ClassEntry = {
    id: number;
    period_number: number;
    starts_at: string | null;
    section_id: number;
    section_name: string | null;
    class_name: string | null;
    subject_name_en: string | null;
    subject_name_ar: string | null;
    subject_color: string | null;
};

type Duty = {
    id: number;
    exam_date: string;
    starts_at: string;
    ends_at: string;
    room: string | null;
    section_name: string | null;
    class_name: string | null;
    subject_name_en: string | null;
    subject_name_ar: string | null;
    schedule_title: string | null;
    schedule_title_ar: string | null;
};

type SectionRow = {
    id: number;
    name: string;
    class_name: string | null;
    school_name: string | null;
    students_count: number;
};

type TeacherDashboardProps = {
    today: { iso: string; weekday: number };
    sections: SectionRow[];
    today_classes: ClassEntry[];
    invigilation_duties: Duty[];
    counts: { sections: number; students: number };
};

export default function TeacherDashboard() {
    const {
        today,
        sections,
        today_classes: todayClasses,
        invigilation_duties: duties,
        counts,
    } = usePage<TeacherDashboardProps>().props;
    const { t, dayName, isArabic } = useT();

    const subjectLabel = (item: {
        subject_name_en: string | null;
        subject_name_ar: string | null;
    }) =>
        isArabic
            ? (item.subject_name_ar ?? item.subject_name_en)
            : (item.subject_name_en ?? item.subject_name_ar);

    return (
        <>
            <Head title={t('portal.teacherTitle')} />

            <div className="space-y-6 p-4 md:p-8">
                <PageHero
                    eyebrow={
                        <>
                            {t('portal.today')} · {today.iso} ·{' '}
                            {dayName(today.weekday)}
                        </>
                    }
                    title={t('portal.teacherTitle')}
                    subtitle={t('portal.teacherSubtitle')}
                >
                    <PageHeroStats>
                        <PageHeroStat>
                            {t('portal.sections')}: {counts.sections}
                        </PageHeroStat>
                        <PageHeroStat>
                            {t('portal.studentsCount', {
                                count: counts.students,
                            })}
                        </PageHeroStat>
                    </PageHeroStats>
                </PageHero>

                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="border-border bg-card rounded-lg border p-6">
                        <h2 className="text-foreground flex items-center gap-2 text-xl font-semibold">
                            <CalendarDays size={19} aria-hidden="true" />
                            {t('portal.todayClasses')}
                        </h2>

                        {todayClasses.length === 0 ? (
                            <p className="text-muted-foreground mt-4 text-sm">
                                {t('portal.noClassesToday')}
                            </p>
                        ) : (
                            <ol className="mt-4 space-y-3">
                                {todayClasses.map((entry) => (
                                    <li
                                        key={entry.id}
                                        className="border-border flex items-center justify-between gap-3 rounded-lg border p-3"
                                    >
                                        <span className="min-w-0">
                                            <strong className="text-foreground block text-sm font-semibold">
                                                {subjectLabel(entry)}
                                            </strong>
                                            <small className="text-muted-foreground mt-1 block">
                                                {entry.class_name} ·{' '}
                                                {entry.section_name}
                                            </small>
                                        </span>
                                        <span className="text-brand-600 shrink-0 text-end text-xs font-bold">
                                            {t('portal.period')}{' '}
                                            {entry.period_number}
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
                    </section>

                    <section className="border-border bg-card rounded-lg border p-6">
                        <h2 className="text-foreground flex items-center gap-2 text-xl font-semibold">
                            <ClipboardList size={19} aria-hidden="true" />
                            {t('portal.invigilation')}
                        </h2>

                        {duties.length === 0 ? (
                            <p className="text-muted-foreground mt-4 text-sm">
                                {t('portal.noDuties')}
                            </p>
                        ) : (
                            <ol className="mt-4 space-y-3">
                                {duties.map((duty) => (
                                    <li
                                        key={duty.id}
                                        className="border-border rounded-lg border p-3"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <strong className="text-foreground text-sm font-semibold">
                                                {subjectLabel(duty)}
                                            </strong>
                                            <span
                                                dir="ltr"
                                                className="text-brand-600 text-xs font-bold"
                                            >
                                                {duty.starts_at}–{duty.ends_at}
                                            </span>
                                        </div>
                                        <small className="text-muted-foreground mt-1 block">
                                            {duty.exam_date} · {duty.class_name}{' '}
                                            · {duty.section_name}
                                            {duty.room
                                                ? ` · ${t('portal.room')} ${duty.room}`
                                                : ''}
                                        </small>
                                        {duty.schedule_title ? (
                                            <small className="text-muted-foreground mt-1 block">
                                                {isArabic &&
                                                duty.schedule_title_ar
                                                    ? duty.schedule_title_ar
                                                    : duty.schedule_title}
                                            </small>
                                        ) : null}
                                    </li>
                                ))}
                            </ol>
                        )}
                    </section>
                </div>

                <section className="border-border bg-card rounded-lg border p-6">
                    <h2 className="text-foreground flex items-center gap-2 text-xl font-semibold">
                        <UsersRound size={19} aria-hidden="true" />
                        {t('portal.mySections')}
                    </h2>

                    {sections.length === 0 ? (
                        <p className="text-muted-foreground mt-4 text-sm">
                            {t('portal.noSections')}
                        </p>
                    ) : (
                        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {sections.map((section) => (
                                <li
                                    key={section.id}
                                    className="border-border rounded-lg border p-4"
                                >
                                    <strong className="text-foreground block text-sm font-semibold">
                                        {section.class_name} · {section.name}
                                    </strong>
                                    <small className="text-muted-foreground mt-1 block">
                                        {section.school_name}
                                    </small>
                                    <small className="text-brand-600 mt-1 block">
                                        {t('portal.studentsCount', {
                                            count: section.students_count,
                                        })}
                                    </small>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="border-border bg-card bg-muted rounded-lg border p-6">
                    <h2 className="text-foreground text-xl font-semibold">
                        {t('portal.quickLinks')}
                    </h2>
                    <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                            href="/portal/teacher"
                            className="bg-card text-brand-700 inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold"
                        >
                            <BookOpenCheck size={18} aria-hidden="true" />
                            {t('portal.myWorkspace')}
                        </Link>
                        <Link
                            href="/portal/notifications"
                            className="bg-card text-brand-700 inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold"
                        >
                            <Bell size={18} aria-hidden="true" />
                            {t('portal.notifications')}
                        </Link>
                    </div>
                </section>
            </div>
        </>
    );
}
