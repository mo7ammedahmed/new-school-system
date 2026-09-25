import { Link } from '@inertiajs/react';
import exams from '@/routes/admin/schedule/exams';
import { Plus } from 'lucide-react';
import type {
    AcademicYearOption,
    ExamScheduleItem,
    TranslateFn,
} from './types';

type ExamPeriodsProps = {
    schedules: ExamScheduleItem[];
    selectedSchedule: ExamScheduleItem | null;
    academicYears: AcademicYearOption[];
    can: { manage: boolean; publish: boolean; delete: boolean };
    periodForm: any; // UseForm from @inertiajs/react
    submitPeriod: (event: React.FormEvent) => void;
    t: TranslateFn;
    isArabic: boolean;
    schoolId: number;
};

export default function ExamPeriods({
    schedules,
    selectedSchedule,
    academicYears,
    can,
    periodForm,
    submitPeriod,
    t,
    isArabic,
    schoolId,
}: ExamPeriodsProps) {
    const scheduleLabels = (schedule: ExamScheduleItem) =>
        isArabic && schedule.title_ar ? schedule.title_ar : schedule.title;

    return (
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
                                    school: schoolId,
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
                                    {schedule.starts_on} → {schedule.ends_on}
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
                                    <option key={year.id} value={year.id}>
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
                            href={`/admin/schools/${schoolId}/academic-years`}
                            className="text-secondary font-semibold underline underline-offset-4"
                        >
                            {t('exams.addAcademicYear')}
                        </Link>
                    </div>
                )
            ) : null}
        </section>
    );
}
