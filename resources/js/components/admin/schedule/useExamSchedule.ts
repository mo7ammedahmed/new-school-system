import { router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import examPapers from '@/routes/admin/schedule/exams/papers';
import examPaperRecord from '@/routes/admin/schedule/exam-papers';
import examInvigilators from '@/routes/admin/schedule/exam-papers/invigilators';
import exams from '@/routes/admin/schedule/exams';
import type { Paper } from './types';
import { subjectLabel } from './types';

type UseExamScheduleArgs = {
    schoolId: number;
    selectedScheduleId: number | null;
    selectedDate: string | null;
    defaultStartsOn: string | null;
    academicYearId: number;
    sections: Array<{ id: number; name: string; class_id: number }>;
    subjects: Array<{
        id: number;
        code: string;
        name_en: string;
        name_ar: string;
        color: string | null;
    }>;
    classSubjects: Array<{
        class_id: number;
        subject_id: number;
        periods_per_week: number;
    }>;
    isArabic: boolean;
};

export function useExamSchedule({
    schoolId,
    selectedScheduleId,
    selectedDate,
    defaultStartsOn,
    academicYearId,
    sections,
    subjects,
    classSubjects,
    isArabic,
}: UseExamScheduleArgs) {
    const [invigilatorPick, setInvigilatorPick] = useState<number[]>([]);

    const periodForm = useForm({
        academic_year_id: academicYearId,
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
        exam_date: selectedDate ?? defaultStartsOn ?? '',
        starts_at: '08:00',
        ends_at: '09:00',
        room: '',
        bulk: false,
    });

    const classSections = useMemo(
        () =>
            sections.filter(
                (section) => section.class_id === paperForm.data.class_id,
            ),
        [sections, paperForm.data.class_id],
    );

    const selectableSubjects = useMemo(() => {
        const classSubjectIds = classSubjects
            .filter((entry) => entry.class_id === paperForm.data.class_id)
            .map((entry) => entry.subject_id);

        return classSubjectIds.length
            ? subjects.filter((subject) => classSubjectIds.includes(subject.id))
            : subjects;
    }, [classSubjects, subjects, paperForm.data.class_id]);

    const openDate = (iso: string) => {
        if (!selectedScheduleId) {
            return;
        }

        router.get(
            exams.show.url(
                { school: schoolId, examSchedule: selectedScheduleId },
                { query: { date: iso } },
            ),
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    const submitPeriod = (event: React.FormEvent) => {
        event.preventDefault();
        periodForm.post(exams.store.url({ school: schoolId }));
    };

    const submitPaper = (event: React.FormEvent) => {
        event.preventDefault();

        if (!selectedScheduleId) {
            return;
        }

        const url = paperForm.data.bulk
            ? examPapers.bulk.url({
                  school: schoolId,
                  examSchedule: selectedScheduleId,
              })
            : examPapers.store.url({
                  school: schoolId,
                  examSchedule: selectedScheduleId,
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
        if (
            !window.confirm(
                `${subjectLabel(paper, isArabic)} — ${paper.section_name}`,
            )
        ) {
            return;
        }

        router.delete(
            examPaperRecord.destroy.url({
                school: schoolId,
                examPaper: paper.id,
            }),
            { preserveScroll: true },
        );
    };

    const toggleInvigilator = (paper: Paper, teacherId: number) => {
        const assigned = paper.invigilators.some(
            (invigilator) => invigilator.id === teacherId,
        );

        if (assigned) {
            router.delete(
                examInvigilators.destroy.url({
                    school: schoolId,
                    examPaper: paper.id,
                    teacher: teacherId,
                }),
                { preserveScroll: true },
            );

            return;
        }

        router.post(
            examInvigilators.store.url({
                school: schoolId,
                examPaper: paper.id,
            }),
            { teacher_id: teacherId, role: 'invigilator' },
            { preserveScroll: true },
        );
    };

    const publish = () => {
        if (!selectedScheduleId) {
            return;
        }

        router.post(
            exams.publish.url({
                school: schoolId,
                examSchedule: selectedScheduleId,
            }),
            { acknowledge_warnings: true },
            { preserveScroll: true },
        );
    };

    const archive = () => {
        if (!selectedScheduleId) {
            return;
        }

        router.post(
            exams.archive.url({
                school: schoolId,
                examSchedule: selectedScheduleId,
            }),
            {},
            { preserveScroll: true },
        );
    };

    const toggleInvigilatorPick = (teacherId: number, checked: boolean) => {
        setInvigilatorPick((previous) =>
            checked
                ? [...previous, teacherId]
                : previous.filter((id) => id !== teacherId),
        );
    };

    return {
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
    };
}
