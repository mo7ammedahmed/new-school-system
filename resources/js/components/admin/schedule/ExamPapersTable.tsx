import { Trash2 } from 'lucide-react';
import type { DayNameFn, Paper, TeacherOption, TranslateFn } from './types';
import { subjectLabel } from './types';

type ExamPapersTableProps = {
    papers: Paper[];
    teachers: TeacherOption[];
    groupedByDate: number;
    isDraft: boolean;
    canManage: boolean;
    isArabic: boolean;
    footer: string;
    onToggleInvigilator: (paper: Paper, teacherId: number) => void;
    onRemovePaper: (paper: Paper) => void;
    t: TranslateFn;
    dayName: DayNameFn;
};

export default function ExamPapersTable({
    papers,
    teachers,
    groupedByDate,
    isDraft,
    canManage,
    isArabic,
    footer,
    onToggleInvigilator,
    onRemovePaper,
    t,
    dayName,
}: ExamPapersTableProps) {
    return (
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
                                            {paper.starts_at}–{paper.ends_at}
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
                                            {subjectLabel(paper, isArabic)}
                                        </span>
                                    </td>
                                    <td className="border-outline-variant border-b p-2">
                                        {paper.room ?? '—'}
                                    </td>
                                    <td className="border-outline-variant border-b p-2">
                                        <div className="flex flex-wrap gap-1">
                                            {teachers.map((teacher) => {
                                                const assigned =
                                                    paper.invigilators.some(
                                                        (invigilator) =>
                                                            invigilator.id ===
                                                            teacher.id,
                                                    );

                                                return (
                                                    <button
                                                        key={teacher.id}
                                                        type="button"
                                                        aria-pressed={assigned}
                                                        disabled={!canManage}
                                                        onClick={() =>
                                                            onToggleInvigilator(
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
                                                        {teacher.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </td>
                                    <td className="border-outline-variant border-b p-2 print:hidden">
                                        {canManage && isDraft ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onRemovePaper(paper)
                                                }
                                                aria-label={t('actions.delete')}
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
                {footer}
            </p>

            <p className="sr-only">{groupedByDate}</p>
        </section>
    );
}
