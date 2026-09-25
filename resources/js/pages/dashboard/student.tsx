import { useT } from '@/hooks/useT';
import { PageHero } from '@/components/page-hero';
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
                <PageHero
                    eyebrow={
                        <>
                            {t('portal.today')} · {today.iso} ·{' '}
                            {dayName(today.weekday)}
                        </>
                    }
                    title={student?.name ?? t('portal.studentTitle')}
                    subtitle={
                        student
                            ? `${student.class_name ?? ''} · ${student.section_name ?? ''} · ${student.school_name ?? ''}`
                            : t('portal.noSchool')
                    }
                />

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
                                                <strong className="text-foreground block text-sm font-semibold">
                                                    {subjectLabel(entry)}
                                                </strong>
                                                <small className="text-muted-foreground mt-1 block">
                                                    {entry.teacher_name}
                                                </small>
                                            </span>
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
                    <section className="border-border bg-card rounded-lg border p-6">
                        <h2 className="text-foreground flex items-center gap-2 text-xl font-semibold">
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
                                    className="bg-muted rounded-lg p-4"
                                >
                                    <dt className="text-muted-foreground text-xs font-bold">
                                        {t(`portal.${key}`)}
                                    </dt>
                                    <dd className="text-foreground mt-1 text-2xl font-semibold">
                                        {value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    <section className="border-border bg-card rounded-lg border p-6">
                        <h2 className="text-foreground text-xl font-semibold">
                            {t('portal.recentAssessments')}
                        </h2>

                        {recentAssessments.length === 0 ? (
                            <p className="text-muted-foreground mt-4 text-sm">
                                {t('portal.noAssessments')}
                            </p>
                        ) : (
                            <ul className="mt-4 space-y-3">
                                {recentAssessments.map((assessment) => (
                                    <li
                                        key={assessment.id}
                                        className="border-border flex items-center justify-between gap-3 rounded-lg border p-3"
                                    >
                                        <span>
                                            <strong className="text-foreground block text-sm font-semibold">
                                                {assessment.title}
                                            </strong>
                                            <small className="text-muted-foreground mt-1 block">
                                                {assessment.assessed_on}
                                            </small>
                                        </span>
                                        <span
                                            dir="ltr"
                                            className="text-brand-600 text-sm font-semibold"
                                        >
                                            {assessment.score} /{' '}
                                            {assessment.max_score}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>

                <section className="border-border bg-muted rounded-lg border p-6">
                    <h2 className="text-foreground text-xl font-semibold">
                        {t('portal.quickLinks')}
                    </h2>
                    <div className="mt-4 flex flex-wrap gap-3">
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
