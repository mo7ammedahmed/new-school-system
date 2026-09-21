import { useT } from '@/hooks/useT';
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
                <header className="rounded-[1.75rem] bg-[#143e36] p-6 text-white md:p-8">
                    <p className="text-sm font-bold text-[#b7d7c5]">
                        {t('portal.today')} · {today.iso} ·{' '}
                        {dayName(today.weekday)}
                    </p>
                    <h1 className="mt-2 text-3xl font-black md:text-4xl">
                        {t('portal.teacherTitle')}
                    </h1>
                    <p className="mt-3 max-w-xl leading-7 text-[#d2e6d8]">
                        {t('portal.teacherSubtitle')}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
                            {t('portal.sections')}: {counts.sections}
                        </span>
                        <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
                            {t('portal.studentsCount', {
                                count: counts.students,
                            })}
                        </span>
                    </div>
                </header>

                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-[1.75rem] border border-[#dbe8df] bg-white p-6">
                        <h2 className="flex items-center gap-2 text-xl font-black text-[#17342f]">
                            <CalendarDays size={19} aria-hidden="true" />
                            {t('portal.todayClasses')}
                        </h2>

                        {todayClasses.length === 0 ? (
                            <p className="mt-4 text-sm text-[#789087]">
                                {t('portal.noClassesToday')}
                            </p>
                        ) : (
                            <ol className="mt-4 space-y-3">
                                {todayClasses.map((entry) => (
                                    <li
                                        key={entry.id}
                                        className="flex items-center justify-between gap-3 rounded-2xl border border-[#edf2ed] p-3"
                                    >
                                        <span className="min-w-0">
                                            <strong className="block text-sm font-black text-[#17342f]">
                                                {subjectLabel(entry)}
                                            </strong>
                                            <small className="mt-1 block text-[#789087]">
                                                {entry.class_name} ·{' '}
                                                {entry.section_name}
                                            </small>
                                        </span>
                                        <span className="shrink-0 text-end text-xs font-bold text-[#0d5c4d]">
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

                    <section className="rounded-[1.75rem] border border-[#dbe8df] bg-white p-6">
                        <h2 className="flex items-center gap-2 text-xl font-black text-[#17342f]">
                            <ClipboardList size={19} aria-hidden="true" />
                            {t('portal.invigilation')}
                        </h2>

                        {duties.length === 0 ? (
                            <p className="mt-4 text-sm text-[#789087]">
                                {t('portal.noDuties')}
                            </p>
                        ) : (
                            <ol className="mt-4 space-y-3">
                                {duties.map((duty) => (
                                    <li
                                        key={duty.id}
                                        className="rounded-2xl border border-[#edf2ed] p-3"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <strong className="text-sm font-black text-[#17342f]">
                                                {subjectLabel(duty)}
                                            </strong>
                                            <span className="text-xs font-bold text-[#0d5c4d]">
                                                {duty.starts_at}–{duty.ends_at}
                                            </span>
                                        </div>
                                        <small className="mt-1 block text-[#789087]">
                                            {duty.exam_date} · {duty.class_name}{' '}
                                            · {duty.section_name}
                                            {duty.room
                                                ? ` · ${t('portal.room')} ${duty.room}`
                                                : ''}
                                        </small>
                                        {duty.schedule_title ? (
                                            <small className="mt-1 block text-[#789087]">
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

                <section className="rounded-[1.75rem] border border-[#dbe8df] bg-white p-6">
                    <h2 className="flex items-center gap-2 text-xl font-black text-[#17342f]">
                        <UsersRound size={19} aria-hidden="true" />
                        {t('portal.mySections')}
                    </h2>

                    {sections.length === 0 ? (
                        <p className="mt-4 text-sm text-[#789087]">
                            {t('portal.noSections')}
                        </p>
                    ) : (
                        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {sections.map((section) => (
                                <li
                                    key={section.id}
                                    className="rounded-2xl border border-[#edf2ed] p-4"
                                >
                                    <strong className="block text-sm font-black text-[#17342f]">
                                        {section.class_name} · {section.name}
                                    </strong>
                                    <small className="mt-1 block text-[#789087]">
                                        {section.school_name}
                                    </small>
                                    <small className="mt-1 block text-[#0d5c4d]">
                                        {t('portal.studentsCount', {
                                            count: section.students_count,
                                        })}
                                    </small>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="rounded-[1.75rem] border border-[#dbe8df] bg-[#f7f8f4] p-6">
                    <h2 className="text-xl font-black text-[#17342f]">
                        {t('portal.quickLinks')}
                    </h2>
                    <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                            href="/portal/teacher"
                            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-black text-[#28544a] shadow-sm"
                        >
                            <BookOpenCheck size={18} aria-hidden="true" />
                            {t('portal.myWorkspace')}
                        </Link>
                        <Link
                            href="/portal/notifications"
                            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-black text-[#28544a] shadow-sm"
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
