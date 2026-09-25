import exams from '@/routes/admin/schedule/exams';
import examPapers from '@/routes/admin/schedule/exams/papers';
import examPaperRecord from '@/routes/admin/schedule/exam-papers';
import examInvigilators from '@/routes/admin/schedule/exam-papers/invigilators';
import { useT } from '@/hooks/useT';
import { PageHero } from '@/components/page-hero';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Plus,
    Printer,
    Trash2,
    TriangleAlert,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type ExamScheduleItem = {
    id: number;
    title: string;
    title_ar: string | null;
    term: string | null;
    status: string;
    starts_on: string;
    ends_on: string;
    academic_year_id: number;
    academic_year: string | null;
    papers_count: number | null;
    lock_version: number;
};

type Paper = {
    id: number;
    class_id: number;
    class_name: string | null;
    section_id: number;
    section_name: string | null;
    subject_id: number;
    subject_name_en: string | null;
    subject_name_ar: string | null;
    subject_color: string | null;
    exam_date: string;
    starts_at: string;
    ends_at: string;
    room: string | null;
    max_score: string | null;
    invigilators: Array<{ id: number; name: string; role: string }>;
};

type AgendaRow = {
    id: number;
    class_name: string | null;
    section_name: string | null;
    subject_name_en: string | null;
    subject_name_ar: string | null;
    starts_at: string;
    ends_at: string;
    room: string | null;
    invigilators: string[];
};

type Conflict = {
    code: string;
    severity: string;
    params: Record<string, unknown>;
};

type ExamPageProps = {
    school: { id: number; name: string };
    schedules: ExamScheduleItem[];
    selectedSchedule: ExamScheduleItem | null;
    academicYears: Array<{ id: number; name: string; is_current: boolean }>;
    classes: Array<{ id: number; name: string }>;
    sections: Array<{ id: number; name: string; class_id: number }>;
    subjects: Array<{
        id: number;
        code: string;
        name_en: string;
        name_ar: string;
        color: string | null;
    }>;
    teachers: Array<{ id: number; name: string }>;
    classSubjects: Array<{
        class_id: number;
        subject_id: number;
        periods_per_week: number;
    }>;
    workingDays: number[];
    papers: Paper[];
    calendar: Record<string, number>;
    selectedDate: string | null;
    dayAgenda: AgendaRow[];
    coverageWarnings: Conflict[];
    can: { manage: boolean; publish: boolean; delete: boolean };
    flash?: {
        success?: string | null;
        error?: string | null;
        conflicts?: Conflict[] | null;
    };
};

const conflictKeys: Record<string, string> = {
    EXAM_OUTSIDE_WINDOW: 'errors.examOutsideWindow',
    EXAM_NON_WORKING_DAY: 'errors.nonWorkingDay',
    SECTION_TOO_MANY_PAPERS_PER_DAY: 'errors.sectionTooManyExams',
    SECTION_TIME_OVERLAP: 'errors.examTimeOverlap',
    ROOM_DOUBLE_BOOKED: 'errors.roomDoubleBooked',
    INVIGILATOR_DOUBLE_BOOKED: 'errors.invigilatorDoubleBooked',
    INVIGILATOR_NOT_A_TEACHER_OF_SCHOOL: 'errors.invigilatorNotTeacher',
    INVIGILATOR_HAS_CLASS: 'warnings.invigilatorHasClass',
    SUBJECT_NOT_IN_CLASS: 'warnings.subjectUnderAllocated',
    MISSING_PAPERS: 'warnings.missingPapers',
};

function pad(value: number): string {
    return value.toString().padStart(2, '0');
}

function monthOf(iso: string): string {
    return iso.slice(0, 7);
}

function buildMonthGrid(
    month: string,
): Array<{ iso: string; inMonth: boolean }> {
    const [year, monthNumber] = month.split('-').map(Number);
    const first = new Date(Date.UTC(year, monthNumber - 1, 1));
    const leading = first.getUTCDay();
    const cells: Array<{ iso: string; inMonth: boolean }> = [];

    for (let index = 0; index < 42; index += 1) {
        const day = new Date(
            Date.UTC(year, monthNumber - 1, 1 - leading + index),
        );
        const iso = `${day.getUTCFullYear()}-${pad(day.getUTCMonth() + 1)}-${pad(day.getUTCDate())}`;

        cells.push({ iso, inMonth: day.getUTCMonth() === monthNumber - 1 });
    }

    return cells;
}

function shiftMonth(month: string, delta: number): string {
    const [year, monthNumber] = month.split('-').map(Number);
    const date = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));

    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
}

function formatHijri(iso: string): string | null {
    try {
        return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(new Date(`${iso}T00:00:00Z`));
    } catch {
        return null;
    }
}

export default function ExamScheduleIndex() {
    const props = usePage<ExamPageProps>().props;
    const { t, dayName, isArabic, locale } = useT();

    const {
        school,
        schedules,
        selectedSchedule,
        academicYears,
        classes,
        sections,
        subjects,
        teachers,
        classSubjects,
        workingDays,
        papers,
        calendar,
        selectedDate,
        dayAgenda,
        coverageWarnings,
        can,
    } = props;

    const [month, setMonth] = useState<string>(() =>
        selectedDate
            ? monthOf(selectedDate)
            : monthOf(new Date().toISOString().slice(0, 10)),
    );

    const [invigilatorPick, setInvigilatorPick] = useState<number[]>([]);

    const periodForm = useForm({
        academic_year_id: academicYears[0]?.id ?? 0,
        title: '',
        title_ar: '',
        term: '',
        starts_on: '',
        ends_on: '',
    });

    const paperForm = useForm<{
        class_id: number | '';
        section_id: number | '';
        subject_id: number | '';
        exam_date: string;
        starts_at: string;
        ends_at: string;
        room: string;
        bulk: boolean;
    }>({
        class_id: '',
        section_id: '',
        subject_id: '',
        exam_date: selectedDate ?? selectedSchedule?.starts_on ?? '',
        starts_at: '08:00',
        ends_at: '09:00',
        room: '',
        bulk: false,
    });

    const grid = useMemo(() => buildMonthGrid(month), [month]);
    const conflicts = props.flash?.conflicts ?? [];

    const conflicting = useMemo(() => {
        const errors =
            (props as unknown as { errors?: Record<string, string> }).errors ??
            {};

        return errors.conflicts ?? null;
    }, [props]);

    const classSections = sections.filter(
        (section) => section.class_id === paperForm.data.class_id,
    );
    const classSubjectIds = classSubjects
        .filter((entry) => entry.class_id === paperForm.data.class_id)
        .map((entry) => entry.subject_id);
    const selectableSubjects = classSubjectIds.length
        ? subjects.filter((subject) => classSubjectIds.includes(subject.id))
        : subjects;

    const subjectName = (paper: {
        subject_name_en: string | null;
        subject_name_ar: string | null;
    }) =>
        isArabic
            ? (paper.subject_name_ar ?? paper.subject_name_en)
            : (paper.subject_name_en ?? paper.subject_name_ar);

    const scheduleLabels = (schedule: ExamScheduleItem) =>
        isArabic && schedule.title_ar ? schedule.title_ar : schedule.title;

    const openDate = (iso: string) => {
        if (!selectedSchedule) {
            return;
        }

        router.get(
            exams.show.url(
                { school: school.id, examSchedule: selectedSchedule.id },
                { query: { date: iso } },
            ),
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    const submitPeriod = (event: React.FormEvent) => {
        event.preventDefault();
        periodForm.post(exams.store.url({ school: school.id }));
    };

    const submitPaper = (event: React.FormEvent) => {
        event.preventDefault();

        if (!selectedSchedule) {
            return;
        }

        const url = paperForm.data.bulk
            ? examPapers.bulk.url({
                  school: school.id,
                  examSchedule: selectedSchedule.id,
              })
            : examPapers.store.url({
                  school: school.id,
                  examSchedule: selectedSchedule.id,
              });

        paperForm.transform((data) => ({
            class_id: data.class_id,
            section_id: data.section_id,
            subject_id: data.subject_id,
            exam_date: data.exam_date,
            starts_at: data.starts_at,
            ends_at: data.ends_at,
            room: data.room || null,
            invigilator_ids: invigilatorPick,
        }));

        paperForm.post(url, {
            preserveScroll: true,
            onSuccess: () => {
                paperForm.reset('subject_id');
                setInvigilatorPick([]);
            },
        });
    };

    const removePaper = (paper: Paper) => {
        if (!window.confirm(`${subjectName(paper)} — ${paper.section_name}`)) {
            return;
        }

        router.delete(
            examPaperRecord.destroy.url({
                school: school.id,
                examPaper: paper.id,
            }),
            {
                preserveScroll: true,
            },
        );
    };

    const toggleInvigilator = (paper: Paper, teacherId: number) => {
        const assigned = paper.invigilators.some(
            (invigilator) => invigilator.id === teacherId,
        );

        if (assigned) {
            router.delete(
                examInvigilators.destroy.url({
                    school: school.id,
                    examPaper: paper.id,
                    teacher: teacherId,
                }),
                { preserveScroll: true },
            );

            return;
        }

        router.post(
            examInvigilators.store.url({
                school: school.id,
                examPaper: paper.id,
            }),
            { teacher_id: teacherId, role: 'invigilator' },
            { preserveScroll: true },
        );
    };

    const publish = () => {
        if (!selectedSchedule) {
            return;
        }

        router.post(
            exams.publish.url({
                school: school.id,
                examSchedule: selectedSchedule.id,
            }),
            { acknowledge_warnings: true },
            { preserveScroll: true },
        );
    };

    const papersByDate = useMemo(() => {
        const grouped = new Map<string, Paper[]>();

        papers.forEach((paper) => {
            const list = grouped.get(paper.exam_date) ?? [];
            list.push(paper);
            grouped.set(paper.exam_date, list);
        });

        return grouped;
    }, [papers]);

    const weekTotal = grid.reduce(
        (total, cell) => total + (calendar[cell.iso] ?? 0),
        0,
    );
    const hijri = selectedDate ? formatHijri(selectedDate) : null;

    return (
        <>
            <Head title={t('exams.title')} />

            <div className="space-y-6 p-4 md:p-8">
                <PageHero
                    eyebrow={school.name}
                    title={t('exams.title')}
                    subtitle={t('exams.subtitle')}
                />

                {props.flash?.success ? (
                    <p
                        role="status"
                        className="text-brand-600 bg-surface-container-low rounded-xl px-4 py-3 font-bold"
                    >
                        {props.flash.success}
                    </p>
                ) : null}
                {props.flash?.error ? (
                    <p
                        role="alert"
                        className="bg-warning-container text-warning-foreground rounded-xl px-4 py-3 font-bold"
                    >
                        {props.flash.error}
                    </p>
                ) : null}

                {/* Exam periods */}
                <section
                    aria-labelledby="periods-heading"
                    className="border-border bg-card rounded-[1.5rem] border p-6"
                >
                    <h2
                        id="periods-heading"
                        className="text-foreground text-xl font-semibold"
                    >
                        {t('exams.periods')}
                    </h2>

                    {schedules.length === 0 ? (
                        <p className="text-foreground mt-3 text-sm">
                            {t('exams.noPeriods')}
                        </p>
                    ) : (
                        <ul className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {schedules.map((schedule) => (
                                <li key={schedule.id}>
                                    <a
                                        href={exams.show.url({
                                            school: school.id,
                                            examSchedule: schedule.id,
                                        })}
                                        className={`hover:border-primary block rounded-lg border p-4 transition ${
                                            selectedSchedule?.id === schedule.id
                                                ? 'border-primary bg-surface-container-low'
                                                : 'border-outline-variant'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-foreground font-semibold">
                                                {scheduleLabels(schedule)}
                                            </span>
                                            <span className="text-brand-600 bg-surface-container-low rounded-full px-2 py-1 text-xs font-bold">
                                                {t(`status.${schedule.status}`)}
                                            </span>
                                        </div>
                                        <p className="text-foreground mt-2 text-xs font-bold">
                                            {schedule.starts_on} →{' '}
                                            {schedule.ends_on}
                                        </p>
                                        {schedule.papers_count !== null ? (
                                            <p className="text-foreground mt-1 text-xs">
                                                {t('exams.papersCount', {
                                                    count: schedule.papers_count,
                                                })}
                                            </p>
                                        ) : null}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}

                    {can.manage ? (
                        academicYears.length > 0 ? (
                            <form
                                onSubmit={submitPeriod}
                                className="border-outline-variant mt-6 grid gap-3 border-t pt-6 md:grid-cols-3"
                            >
                                <h3 className="text-foreground text-sm font-semibold md:col-span-3">
                                    {t('exams.newPeriod')}
                                </h3>

                                <label className="text-on-surface-variant text-sm font-bold">
                                    {t('exams.academicYear')}
                                    <select
                                        className="field mt-1"
                                        value={periodForm.data.academic_year_id}
                                        onChange={(event) =>
                                            periodForm.setData(
                                                'academic_year_id',
                                                Number(event.target.value),
                                            )
                                        }
                                    >
                                        {academicYears.map((year) => (
                                            <option
                                                key={year.id}
                                                value={year.id}
                                            >
                                                {year.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="text-on-surface-variant text-sm font-bold">
                                    {t('exams.titleEn')}
                                    <input
                                        className="field mt-1"
                                        value={periodForm.data.title}
                                        onChange={(event) =>
                                            periodForm.setData(
                                                'title',
                                                event.target.value,
                                            )
                                        }
                                        required
                                    />
                                </label>

                                <label className="text-on-surface-variant text-sm font-bold">
                                    {t('exams.titleAr')}
                                    <input
                                        className="field mt-1"
                                        dir="rtl"
                                        value={periodForm.data.title_ar}
                                        onChange={(event) =>
                                            periodForm.setData(
                                                'title_ar',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </label>

                                <label className="text-on-surface-variant text-sm font-bold">
                                    {t('exams.term')}
                                    <input
                                        className="field mt-1"
                                        placeholder={t('exams.termHint')}
                                        value={periodForm.data.term}
                                        onChange={(event) =>
                                            periodForm.setData(
                                                'term',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </label>

                                <label className="text-on-surface-variant text-sm font-bold">
                                    {t('exams.startsOn')}
                                    <input
                                        type="date"
                                        className="field mt-1"
                                        value={periodForm.data.starts_on}
                                        onChange={(event) =>
                                            periodForm.setData(
                                                'starts_on',
                                                event.target.value,
                                            )
                                        }
                                        required
                                    />
                                </label>

                                <label className="text-on-surface-variant text-sm font-bold">
                                    {t('exams.endsOn')}
                                    <input
                                        type="date"
                                        className="field mt-1"
                                        value={periodForm.data.ends_on}
                                        onChange={(event) =>
                                            periodForm.setData(
                                                'ends_on',
                                                event.target.value,
                                            )
                                        }
                                        required
                                    />
                                </label>

                                <div className="md:col-span-3">
                                    <button
                                        type="submit"
                                        disabled={periodForm.processing}
                                        className="bg-hero-bg inline-flex items-center gap-2 rounded-full px-5 py-2 font-semibold text-white disabled:opacity-60"
                                    >
                                        <Plus size={16} aria-hidden="true" />
                                        {t('exams.createPeriod')}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            // An exam period is scoped to an academic year, so say
                            // which prerequisite is missing and link to it instead
                            // of hiding the form with no explanation.
                            <div className="border-outline-variant text-muted-foreground mt-6 flex flex-wrap items-center gap-2 border-t pt-6 text-sm">
                                <span>{t('exams.needsAcademicYear')}</span>
                                <Link
                                    href={`/admin/schools/${school.id}/academic-years`}
                                    className="text-secondary font-semibold underline underline-offset-4"
                                >
                                    {t('exams.addAcademicYear')}
                                </Link>
                            </div>
                        )
                    ) : null}
                </section>

                {selectedSchedule ? (
                    <>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-foreground text-2xl font-semibold">
                                {scheduleLabels(selectedSchedule)}
                            </h2>
                            <div className="flex flex-wrap gap-2 print:hidden">
                                {can.publish &&
                                selectedSchedule.status === 'draft' ? (
                                    <button
                                        type="button"
                                        onClick={publish}
                                        className="bg-primary text-primary-foreground rounded-full px-5 py-2 font-semibold"
                                    >
                                        {t('exams.publishPeriod')}
                                    </button>
                                ) : null}
                                {can.delete &&
                                selectedSchedule.status !== 'archived' ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.post(
                                                exams.archive.url({
                                                    school: school.id,
                                                    examSchedule:
                                                        selectedSchedule.id,
                                                }),
                                                {},
                                                { preserveScroll: true },
                                            )
                                        }
                                        className="border-outline-variant text-on-surface-variant rounded-full border px-5 py-2 font-semibold"
                                    >
                                        {t('exams.archivePeriod')}
                                    </button>
                                ) : null}
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="border-outline-variant text-on-surface-variant inline-flex items-center gap-2 rounded-full border px-5 py-2 font-semibold"
                                >
                                    <Printer size={16} aria-hidden="true" />
                                    {t('exams.printSchedule')}
                                </button>
                            </div>
                        </div>
                        {coverageWarnings.length > 0 ? (
                            <p className="bg-warning-container text-warning-foreground rounded-xl px-4 py-3 text-sm font-bold">
                                <TriangleAlert
                                    size={16}
                                    className="inline"
                                    aria-hidden="true"
                                />{' '}
                                {t('exams.coverage')}: {t('exams.coverageHint')}
                            </p>
                        ) : null}{' '}
                        {conflicting ? (
                            <div
                                role="alert"
                                className="bg-warning-container text-warning-foreground rounded-xl px-4 py-3 font-bold"
                            >
                                <p>{conflicting}</p>
                                {conflicts.length > 0 ? (
                                    <ul className="mt-2 list-inside list-disc text-sm font-normal">
                                        {conflicts.map((conflict, index) => (
                                            <li
                                                key={`${conflict.code}-${index}`}
                                            >
                                                {t(
                                                    conflictKeys[
                                                        conflict.code
                                                    ] ?? 'timetable.conflict',
                                                )}
                                                {conflict.severity === 'warning'
                                                    ? ` (${t('exams.warnings')})`
                                                    : ''}
                                            </li>
                                        ))}
                                    </ul>
                                ) : null}
                            </div>
                        ) : null}
                        <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
                            {/* Month calendar */}
                            <section
                                aria-labelledby="calendar-heading"
                                className="border-border bg-card rounded-[1.5rem] border p-6"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <h2
                                        id="calendar-heading"
                                        className="text-foreground text-lg font-semibold"
                                    >
                                        <CalendarDays
                                            size={18}
                                            className="inline"
                                            aria-hidden="true"
                                        />{' '}
                                        {t('exams.calendar')}
                                    </h2>
                                    <div className="flex items-center gap-2 print:hidden">
                                        <button
                                            type="button"
                                            aria-label={t('exams.prevMonth')}
                                            onClick={() =>
                                                setMonth(shiftMonth(month, -1))
                                            }
                                            className="border-outline-variant rounded-full border p-2"
                                        >
                                            <ChevronRight
                                                size={16}
                                                aria-hidden="true"
                                                className="rtl:hidden"
                                            />
                                            <ChevronLeft
                                                size={16}
                                                aria-hidden="true"
                                                className="hidden rtl:inline"
                                            />
                                        </button>
                                        <span className="text-foreground min-w-[7rem] text-center font-semibold">
                                            {month}
                                        </span>
                                        <button
                                            type="button"
                                            aria-label={t('exams.nextMonth')}
                                            onClick={() =>
                                                setMonth(shiftMonth(month, 1))
                                            }
                                            className="border-outline-variant rounded-full border p-2"
                                        >
                                            <ChevronLeft
                                                size={16}
                                                aria-hidden="true"
                                                className="rtl:hidden"
                                            />
                                            <ChevronRight
                                                size={16}
                                                aria-hidden="true"
                                                className="hidden rtl:inline"
                                            />
                                        </button>
                                    </div>
                                </div>

                                <div
                                    role="grid"
                                    className="mt-4 grid grid-cols-7 gap-1 text-center"
                                >
                                    {workingDays
                                        .map((day) => (
                                            <div
                                                key={day}
                                                role="columnheader"
                                                className="text-foreground p-1 text-xs font-semibold"
                                            >
                                                {dayName(day)}
                                            </div>
                                        ))
                                        .slice(0, 7)}
                                </div>

                                <div
                                    role="grid"
                                    className="mt-1 grid grid-cols-7 gap-1"
                                >
                                    {(() => {
                                        const firstWeekday = grid[0]
                                            ? new Date(
                                                  `${grid[0].iso}T00:00:00Z`,
                                              ).getUTCDay()
                                            : 0;
                                        const workingSet = new Set(workingDays);

                                        return grid.map((cell, index) => {
                                            const weekday =
                                                (firstWeekday + index) % 7;
                                            const isWorking =
                                                workingSet.has(weekday);
                                            const count =
                                                calendar[cell.iso] ?? 0;
                                            const isSelected =
                                                selectedDate === cell.iso;

                                            return (
                                                <button
                                                    key={cell.iso}
                                                    type="button"
                                                    role="gridcell"
                                                    aria-selected={isSelected}
                                                    onClick={() =>
                                                        openDate(cell.iso)
                                                    }
                                                    className={`flex min-h-[4.5rem] flex-col items-start rounded-xl border p-2 text-start transition ${
                                                        isSelected
                                                            ? 'border-primary bg-surface-container-low'
                                                            : 'border-outline-variant hover:border-primary'
                                                    } ${cell.inMonth ? '' : 'opacity-40'} ${
                                                        isWorking
                                                            ? ''
                                                            : 'bg-surface-container-low'
                                                    }`}
                                                >
                                                    <span className="text-on-surface-variant text-xs font-bold">
                                                        {Number(
                                                            cell.iso.slice(
                                                                8,
                                                                10,
                                                            ),
                                                        )}
                                                    </span>
                                                    {count > 0 ? (
                                                        <span className="bg-primary text-primary-foreground mt-auto rounded-full px-2 py-0.5 text-xs font-semibold">
                                                            {count}
                                                        </span>
                                                    ) : null}
                                                </button>
                                            );
                                        });
                                    })()}
                                </div>

                                <p className="text-foreground mt-4 text-xs font-bold">
                                    {t('exams.weekTotal')}: {weekTotal}
                                </p>
                            </section>

                            {/* Day agenda */}
                            <section
                                aria-labelledby="agenda-heading"
                                className="border-border bg-card rounded-[1.5rem] border p-6"
                            >
                                <h2
                                    id="agenda-heading"
                                    className="text-foreground text-lg font-semibold"
                                >
                                    {t('exams.selectedDay')}
                                </h2>
                                <p className="text-foreground mt-1 text-sm font-bold">
                                    {selectedDate}
                                    {hijri ? ` · ${hijri}` : ''}
                                    {selectedDate
                                        ? ` · ${dayName(new Date(`${selectedDate}T00:00:00Z`).getUTCDay())}`
                                        : ''}
                                </p>

                                {dayAgenda.length === 0 ? (
                                    <p className="text-foreground mt-4 text-sm">
                                        {t('exams.noPapersOnDay')}
                                    </p>
                                ) : (
                                    <ol className="mt-4 space-y-3">
                                        {dayAgenda.map((row) => (
                                            <li
                                                key={row.id}
                                                className="border-outline-variant rounded-lg border p-4"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-foreground font-semibold">
                                                        {subjectName({
                                                            subject_name_en:
                                                                row.subject_name_en,
                                                            subject_name_ar:
                                                                row.subject_name_ar,
                                                        })}
                                                    </span>
                                                    <span
                                                        dir="ltr"
                                                        className="text-brand-600 text-xs font-bold"
                                                    >
                                                        {row.starts_at} –{' '}
                                                        {row.ends_at}
                                                    </span>
                                                </div>
                                                <p className="text-foreground mt-1 text-xs font-bold">
                                                    {row.class_name} ·{' '}
                                                    {t('exams.section')}{' '}
                                                    {row.section_name}
                                                    {row.room
                                                        ? ` · ${row.room}`
                                                        : ''}
                                                </p>
                                                {row.invigilators.length > 0 ? (
                                                    <p className="text-foreground mt-1 text-xs">
                                                        {t(
                                                            'exams.invigilators',
                                                        )}
                                                        :{' '}
                                                        {row.invigilators.join(
                                                            '، ',
                                                        )}
                                                    </p>
                                                ) : null}
                                            </li>
                                        ))}
                                    </ol>
                                )}
                            </section>
                        </div>
                        {/* Add paper */}
                        {can.manage && selectedSchedule.status === 'draft' ? (
                            <section
                                aria-labelledby="paper-heading"
                                className="border-border bg-card rounded-[1.5rem] border p-6 print:hidden"
                            >
                                <h2
                                    id="paper-heading"
                                    className="text-foreground text-lg font-semibold"
                                >
                                    {t('exams.addPaper')}
                                </h2>

                                <form
                                    onSubmit={submitPaper}
                                    className="mt-4 grid gap-3 md:grid-cols-4"
                                >
                                    <label className="text-on-surface-variant text-sm font-bold">
                                        {t('exams.class')}
                                        <select
                                            className="field mt-1"
                                            value={paperForm.data.class_id}
                                            onChange={(event) => {
                                                paperForm.setData(
                                                    'class_id',
                                                    Number(event.target.value),
                                                );
                                                paperForm.setData(
                                                    'section_id',
                                                    '',
                                                );
                                            }}
                                            required
                                        >
                                            <option value="">—</option>
                                            {classes.map((klass) => (
                                                <option
                                                    key={klass.id}
                                                    value={klass.id}
                                                >
                                                    {klass.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="text-on-surface-variant text-sm font-bold">
                                        {t('exams.section')}
                                        <select
                                            className="border-outline-variant mt-1 w-full rounded-lg border p-2 font-normal disabled:opacity-50"
                                            value={paperForm.data.section_id}
                                            disabled={paperForm.data.bulk}
                                            onChange={(event) =>
                                                paperForm.setData(
                                                    'section_id',
                                                    Number(event.target.value),
                                                )
                                            }
                                            required={!paperForm.data.bulk}
                                        >
                                            <option value="">—</option>
                                            {classSections.map((section) => (
                                                <option
                                                    key={section.id}
                                                    value={section.id}
                                                >
                                                    {section.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="text-on-surface-variant text-sm font-bold">
                                        {t('exams.subject')}
                                        <select
                                            className="field mt-1"
                                            value={paperForm.data.subject_id}
                                            onChange={(event) =>
                                                paperForm.setData(
                                                    'subject_id',
                                                    Number(event.target.value),
                                                )
                                            }
                                            required
                                        >
                                            <option value="">—</option>
                                            {selectableSubjects.map(
                                                (subject) => (
                                                    <option
                                                        key={subject.id}
                                                        value={subject.id}
                                                    >
                                                        {isArabic
                                                            ? subject.name_ar
                                                            : subject.name_en}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </label>

                                    <label className="text-on-surface-variant text-sm font-bold">
                                        {t('exams.date')}
                                        <input
                                            type="date"
                                            className="field mt-1"
                                            value={paperForm.data.exam_date}
                                            onChange={(event) =>
                                                paperForm.setData(
                                                    'exam_date',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </label>

                                    <label className="text-on-surface-variant text-sm font-bold">
                                        {t('exams.time')}
                                        <span className="mt-1 flex gap-2">
                                            <input
                                                type="time"
                                                className="field"
                                                value={paperForm.data.starts_at}
                                                onChange={(event) =>
                                                    paperForm.setData(
                                                        'starts_at',
                                                        event.target.value,
                                                    )
                                                }
                                                required
                                            />
                                            <input
                                                type="time"
                                                className="field"
                                                value={paperForm.data.ends_at}
                                                onChange={(event) =>
                                                    paperForm.setData(
                                                        'ends_at',
                                                        event.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        </span>
                                    </label>

                                    <label className="text-on-surface-variant text-sm font-bold">
                                        {t('exams.room')}
                                        <input
                                            className="field mt-1"
                                            value={paperForm.data.room}
                                            onChange={(event) =>
                                                paperForm.setData(
                                                    'room',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </label>

                                    <fieldset className="md:col-span-2">
                                        <legend className="text-on-surface-variant text-sm font-bold">
                                            {t('exams.invigilators')}
                                        </legend>
                                        <div className="border-outline-variant mt-1 flex max-h-32 flex-wrap gap-2 overflow-auto rounded-lg border p-2">
                                            {teachers.map((teacher) => (
                                                <label
                                                    key={teacher.id}
                                                    className="flex items-center gap-1 text-xs font-bold"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={invigilatorPick.includes(
                                                            teacher.id,
                                                        )}
                                                        onChange={(event) =>
                                                            setInvigilatorPick(
                                                                (previous) =>
                                                                    event.target
                                                                        .checked
                                                                        ? [
                                                                              ...previous,
                                                                              teacher.id,
                                                                          ]
                                                                        : previous.filter(
                                                                              (
                                                                                  id,
                                                                              ) =>
                                                                                  id !==
                                                                                  teacher.id,
                                                                          ),
                                                            )
                                                        }
                                                    />
                                                    {teacher.name}
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>

                                    <label className="text-on-surface-variant flex items-center gap-2 text-sm font-bold md:col-span-4">
                                        <input
                                            type="checkbox"
                                            checked={paperForm.data.bulk}
                                            onChange={(event) =>
                                                paperForm.setData(
                                                    'bulk',
                                                    event.target.checked,
                                                )
                                            }
                                        />
                                        {t('exams.addForAllSections')}
                                    </label>

                                    {paperForm.errors.section_id ? (
                                        <p className="text-warning-foreground text-sm font-bold md:col-span-4">
                                            {paperForm.errors.section_id}
                                        </p>
                                    ) : null}
                                    {paperForm.errors.subject_id ? (
                                        <p className="text-warning-foreground text-sm font-bold md:col-span-4">
                                            {paperForm.errors.subject_id}
                                        </p>
                                    ) : null}

                                    <div className="md:col-span-4">
                                        <button
                                            type="submit"
                                            disabled={paperForm.processing}
                                            className="bg-hero-bg rounded-full px-6 py-2 font-semibold text-white disabled:opacity-60"
                                        >
                                            {t('exams.addPaper')}
                                        </button>
                                    </div>
                                </form>
                            </section>
                        ) : null}
                        {/* Papers table (printable) */}
                        <section
                            aria-labelledby="papers-heading"
                            className="border-border bg-card rounded-[1.5rem] border p-6"
                        >
                            <h2
                                id="papers-heading"
                                className="text-foreground text-lg font-semibold"
                            >
                                {t('exams.papers')}
                            </h2>

                            {papers.length === 0 ? (
                                <p className="text-foreground mt-3 text-sm">
                                    {t('exams.noExams')}
                                </p>
                            ) : (
                                <div className="mt-4 overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="text-start">
                                                <th className="border-outline-variant border-b p-2 text-start">
                                                    {t('exams.date')}
                                                </th>
                                                <th className="border-outline-variant border-b p-2 text-start">
                                                    {t('exams.time')}
                                                </th>
                                                <th className="border-outline-variant border-b p-2 text-start">
                                                    {t('exams.class')}
                                                </th>
                                                <th className="border-outline-variant border-b p-2 text-start">
                                                    {t('exams.subject')}
                                                </th>
                                                <th className="border-outline-variant border-b p-2 text-start">
                                                    {t('exams.room')}
                                                </th>
                                                <th className="border-outline-variant border-b p-2 text-start">
                                                    {t('exams.invigilators')}
                                                </th>
                                                <th className="border-outline-variant border-b p-2 print:hidden" />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {papers.map((paper) => (
                                                <tr key={paper.id}>
                                                    <td className="border-outline-variant border-b p-2 font-bold">
                                                        {paper.exam_date}
                                                        <span className="text-foreground block text-xs font-normal">
                                                            {dayName(
                                                                new Date(
                                                                    `${paper.exam_date}T00:00:00Z`,
                                                                ).getUTCDay(),
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="border-outline-variant border-b p-2">
                                                        <span dir="ltr">
                                                            {paper.starts_at}–
                                                            {paper.ends_at}
                                                        </span>
                                                    </td>
                                                    <td className="border-outline-variant border-b p-2">
                                                        {paper.class_name} ·{' '}
                                                        {paper.section_name}
                                                    </td>
                                                    <td className="border-outline-variant border-b p-2">
                                                        <span className="flex items-center gap-2">
                                                            {paper.subject_color ? (
                                                                <span
                                                                    aria-hidden="true"
                                                                    className="inline-block size-3 rounded-full"
                                                                    style={{
                                                                        backgroundColor:
                                                                            paper.subject_color,
                                                                    }}
                                                                />
                                                            ) : null}
                                                            {subjectName(paper)}
                                                        </span>
                                                    </td>
                                                    <td className="border-outline-variant border-b p-2">
                                                        {paper.room ?? '—'}
                                                    </td>
                                                    <td className="border-outline-variant border-b p-2">
                                                        <div className="flex flex-wrap gap-1">
                                                            {teachers.map(
                                                                (teacher) => {
                                                                    const assigned =
                                                                        paper.invigilators.some(
                                                                            (
                                                                                invigilator,
                                                                            ) =>
                                                                                invigilator.id ===
                                                                                teacher.id,
                                                                        );

                                                                    return (
                                                                        <button
                                                                            key={
                                                                                teacher.id
                                                                            }
                                                                            type="button"
                                                                            aria-pressed={
                                                                                assigned
                                                                            }
                                                                            disabled={
                                                                                !can.manage
                                                                            }
                                                                            onClick={() =>
                                                                                toggleInvigilator(
                                                                                    paper,
                                                                                    teacher.id,
                                                                                )
                                                                            }
                                                                            className={`rounded-full px-2 py-1 text-xs font-bold ${
                                                                                assigned
                                                                                    ? 'bg-primary text-primary-foreground'
                                                                                    : 'bg-surface-container-low text-on-surface-variant'
                                                                            }`}
                                                                        >
                                                                            {
                                                                                teacher.name
                                                                            }
                                                                        </button>
                                                                    );
                                                                },
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="border-outline-variant border-b p-2 print:hidden">
                                                        {can.manage &&
                                                        selectedSchedule.status ===
                                                            'draft' ? (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removePaper(
                                                                        paper,
                                                                    )
                                                                }
                                                                aria-label={t(
                                                                    'actions.delete',
                                                                )}
                                                                className="text-warning-foreground"
                                                            >
                                                                <Trash2
                                                                    size={16}
                                                                    aria-hidden="true"
                                                                />
                                                            </button>
                                                        ) : null}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <p className="text-foreground mt-4 hidden text-xs print:block">
                                {school.name} ·{' '}
                                {scheduleLabels(selectedSchedule)} · {locale}
                            </p>

                            <p className="sr-only">{papersByDate.size}</p>
                        </section>
                    </>
                ) : null}
            </div>
        </>
    );
}
