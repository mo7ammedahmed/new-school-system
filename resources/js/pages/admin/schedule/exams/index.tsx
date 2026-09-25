import { Head, usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import { useT } from '@/hooks/useT';
import { PageHero } from '@/components/page-hero';
import ExamScheduleCalendar from '@/components/admin/schedule/Calendar';
import ExamPeriods from '@/components/admin/schedule/ExamPeriods';
import ExamScheduleHeader from '@/components/admin/schedule/ExamScheduleHeader';
import {
    ExamConflictAlert,
    ExamCoverageWarning,
} from '@/components/admin/schedule/ExamAlerts';
import ExamDayAgenda from '@/components/admin/schedule/ExamDayAgenda';
import ExamPaperForm from '@/components/admin/schedule/ExamPaperForm';
import ExamPapersTable from '@/components/admin/schedule/ExamPapersTable';
import { useExamSchedule } from '@/components/admin/schedule/useExamSchedule';
import type { ExamPageProps, Paper } from '@/components/admin/schedule/types';
import { formatHijri, scheduleLabel } from '@/components/admin/schedule/types';

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

    const {
        invigilatorPick,
        periodForm,
        paperForm,
        classSections,
        selectableSubjects,
        openDate,
        submitPeriod,
        submitPaper,
        removePaper,
        toggleInvigilator,
        toggleInvigilatorPick,
        publish,
        archive,
    } = useExamSchedule({
        schoolId: school.id,
        selectedScheduleId: selectedSchedule?.id ?? null,
        selectedDate,
        defaultStartsOn: selectedSchedule?.starts_on ?? null,
        academicYearId: academicYears[0]?.id ?? 0,
        sections,
        subjects,
        classSubjects,
        isArabic,
    });

    const conflicts = props.flash?.conflicts ?? [];

    const conflicting = useMemo(() => {
        const errors =
            (props as unknown as { errors?: Record<string, string> }).errors ??
            {};

        return errors.conflicts ?? null;
    }, [props]);

    const papersByDate = useMemo(() => {
        const grouped = new Map<string, Paper[]>();

        papers.forEach((paper) => {
            const list = grouped.get(paper.exam_date) ?? [];
            list.push(paper);
            grouped.set(paper.exam_date, list);
        });

        return grouped;
    }, [papers]);

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

                <ExamPeriods
                    schedules={schedules}
                    selectedSchedule={selectedSchedule}
                    academicYears={academicYears}
                    can={can}
                    periodForm={periodForm}
                    submitPeriod={submitPeriod}
                    t={t}
                    isArabic={isArabic}
                    schoolId={school.id}
                />

                {selectedSchedule ? (
                    <>
                        <ExamScheduleHeader
                            schedule={selectedSchedule}
                            label={scheduleLabel(selectedSchedule, isArabic)}
                            can={can}
                            onPublish={publish}
                            onArchive={archive}
                            t={t}
                        />

                        <ExamCoverageWarning
                            hasCoverageWarnings={coverageWarnings.length > 0}
                            t={t}
                        />

                        <ExamConflictAlert
                            conflicting={conflicting}
                            conflicts={conflicts}
                            t={t}
                        />

                        <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
                            <ExamScheduleCalendar
                                workingDays={workingDays}
                                calendar={calendar}
                                selectedDate={selectedDate}
                                onDateSelect={openDate}
                                t={t}
                                dayName={dayName}
                            />
                            <ExamDayAgenda
                                selectedDate={selectedDate}
                                hijri={hijri}
                                rows={dayAgenda}
                                isArabic={isArabic}
                                t={t}
                                dayName={dayName}
                            />
                        </div>

                        {can.manage && selectedSchedule.status === 'draft' ? (
                            <ExamPaperForm
                                form={paperForm}
                                onSubmit={submitPaper}
                                classes={classes}
                                classSections={classSections}
                                selectableSubjects={selectableSubjects}
                                teachers={teachers}
                                invigilatorPick={invigilatorPick}
                                onToggleInvigilator={toggleInvigilatorPick}
                                isArabic={isArabic}
                                t={t}
                            />
                        ) : null}

                        <ExamPapersTable
                            papers={papers}
                            teachers={teachers}
                            groupedByDate={papersByDate.size}
                            isDraft={selectedSchedule.status === 'draft'}
                            canManage={can.manage}
                            isArabic={isArabic}
                            footer={`${school.name} · ${scheduleLabel(selectedSchedule, isArabic)} · ${locale}`}
                            onToggleInvigilator={toggleInvigilator}
                            onRemovePaper={removePaper}
                            t={t}
                            dayName={dayName}
                        />
                    </>
                ) : null}
            </div>
        </>
    );
}
