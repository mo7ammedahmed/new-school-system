import { useT } from '@/hooks/useT';
import { Head, Link, usePage } from '@inertiajs/react';
import { Bell, CalendarDays, ClipboardList, LineChart } from 'lucide-react';

type ClassEntry = {
    id: number;
    period_number: number;
    starts_at: string | null;
    section_name: string | null;
    class_name: string | null;
    subject_name_en: string | null;
    subject_name_ar: string | null;
    subject_color: string | null;
    teacher_name: string | null;
};

type ExamRow = {
    id: number;
    exam_date: string;
    starts_at: string;
    ends_at: string;
    room: string | null;
    section_name: string | null;
    subject_name_en: string | null;
    subject_name_ar: string | null;
};

type AssessmentRow = {
    id: number;
    title: string;
    score: number;
    max_score: number;
    assessed_on: string | null;
};

type StudentDashboardProps = {
    student: {
        id: number;
        name: string;
        student_number: string;
        school_name: string | null;
        class_name: string | null;
        section_name: string | null;
    } | null;
    today: { iso: string; weekday: number };
    today_classes: ClassEntry[];
    upcoming_exams: ExamRow[];
    attendance: {
        present: number;
        absent: number;
        late: number;
        excused: number;
    };
    recent_assessments: AssessmentRow[];
};

export default function StudentDashboard() {
    const {
        student,
        today,
        today_classes: todayClasses,
        upcoming_exams: upcomingExams,
        attendance,
        recent_assessments: recentAssessments,
    } = usePage<StudentDashboardProps>().props;
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
            <Head title={t('portal.studentTitle')} />

            <div className="space-y-6 p-4 md:p-8">
                <header className="rounded-[1.75rem] bg-hero-bg p-6 text-white md:p-8">
                    <p className="text-sm font-bold text-hero-muted">
                        {t('portal.today')} · {today.iso} ·{' '}
                        {dayName(today.weekday)}
                    </p>
                    <h1 className="mt-2 text-3xl font-black md:text-4xl">
                        {student?.name ?? t('portal.studentTitle')}
                    </h1>
                    <p className="mt-3 max-w-xl leading-7 text-hero-accent">
                        {student
                            ? `${student.class_name ?? ''} · ${student.section_name ?? ''} · ${student.school_name ?? ''}`
                            : t('portal.noSchool')}
                    </p>
                </header>

                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-[1.75rem] border border-border bg-card p-6">
                        <h2 className="flex items-center gap-2 text-xl font-black text-foreground">
                            <CalendarDays size={19} aria-hidden="true" />
                            {t('portal.todayClasses')}
                        </h2>

                        {todayClasses.length === 0 ? (
                            <p className="mt-4 text-sm text-muted-foreground">
                                {t('portal.noClassesToday')}
                            </p>
                        ) : (
                            <ol className="mt-4 space-y-3">
                                {todayClasses.map((entry) => (
                                    <li
                                        key={entry.id}
                                        className="flex items-center justify-between gap-3 rounded-2xl border border-border p-3"
                                    >
                                        <span className="flex min-w-0 items-center gap-2">
                                            {entry.subject_color ? (
                                                <span
                                                    aria-hidden="true"
                                                    className="inline-block size-3 shrink-0 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            entry.subject_color,
                                                    }}
                                                />
                                            ) : null}
                                            <span className="min-w-0">
                                                <strong className="block text-sm font-black text-foreground">
                                                    {subjectLabel(entry)}
                                                </strong>
                                                <small className="mt-1 block text-muted-foreground">
                                                    {entry.teacher_name}
                                                </small>
                                            </span>
                                        </span>
                                        <span className="shrink-0 text-end text-xs font-bold text-brand-600">
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
                                            {exam.exam_date}
                                            {exam.room
                                                ? ` · ${t('portal.room')} ${exam.room}`
                                                : ''}
                                        </small>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </section>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-[1.75rem] border border-border bg-card p-6">
                        <h2 className="flex items-center gap-2 text-xl font-black text-foreground">
                            <LineChart size={19} aria-hidden="true" />
                            {t('portal.attendance')}
                        </h2>
                        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {(
                                [
                                    ['present', attendance.present],
                                    ['absent', attendance.absent],
                                    ['late', attendance.late],
                                    ['excused', attendance.excused],
                                ] as const
                            ).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="rounded-2xl bg-muted p-4"
                                >
                                    <dt className="text-xs font-bold text-muted-foreground">
                                        {t(`portal.${key}`)}
                                    </dt>
                                    <dd className="mt-1 text-2xl font-black text-foreground">
                                        {value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    <section className="rounded-[1.75rem] border border-border bg-card p-6">
                        <h2 className="text-xl font-black text-foreground">
                            {t('portal.recentAssessments')}
                        </h2>

                        {recentAssessments.length === 0 ? (
                            <p className="mt-4 text-sm text-muted-foreground">
                                {t('portal.noAssessments')}
                            </p>
                        ) : (
                            <ul className="mt-4 space-y-3">
                                {recentAssessments.map((assessment) => (
                                    <li
                                        key={assessment.id}
                                        className="flex items-center justify-between gap-3 rounded-2xl border border-border p-3"
                                    >
                                        <span>
                                            <strong className="block text-sm font-black text-foreground">
                                                {assessment.title}
                                            </strong>
                                            <small className="mt-1 block text-muted-foreground">
                                                {assessment.assessed_on}
                                            </small>
                                        </span>
                                        <span className="text-sm font-black text-brand-600">
                                            {assessment.score} /{' '}
                                            {assessment.max_score}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>

                <section className="rounded-[1.75rem] border border-border bg-muted p-6">
                    <h2 className="text-xl font-black text-foreground">
                        {t('portal.quickLinks')}
                    </h2>
                    <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                            href="/portal/notifications"
                            className="inline-flex items-center gap-2 rounded-full bg-card px-5 py-3 font-black text-brand-700 shadow-sm"
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
