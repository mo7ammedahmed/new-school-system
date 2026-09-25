import { useT } from '@/hooks/useT';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    entries as saveEntriesUrl,
    publish as publishUrl,
} from '@/routes/admin/schedule/timetable';
import { useState } from 'react';

interface BellPeriod {
    id: number;
    number: number;
    label_en: string;
    label_ar: string;
    starts_at: string;
    ends_at: string;
    is_break: boolean;
}

interface Section {
    id: number;
    name: string;
}

interface Subject {
    id: number;
    code: string;
    name_en: string;
    name_ar: string;
}

interface Teacher {
    id: number;
    name: string;
}

interface Entry {
    id: number | null;
    section_id: number;
    subject_id: number | null;
    teacher_id: number | null;
    day_of_week: number;
    period_number: number;
    lesson_type: string;
}

type TimetableEditProps = {
    school: { id: number; name: string };
    version: {
        id: number;
        name: string;
        status: string;
        bellSchedule: BellSchedule | null;
    };
    sections: Section[];
    subjects: Subject[];
    teachers: Teacher[];
    workingDays: number[];
    entries: Entry[];
};

interface BellSchedule {
    id: number;
    name: string;
    bell_periods: BellPeriod[];
}

export default function TimetableEdit() {
    const {
        school,
        version,
        sections,
        subjects,
        teachers,
        workingDays,
        entries,
    } = usePage<TimetableEditProps>().props;
    const { t, dayName, isArabic } = useT();

    const teachingPeriods =
        version.bellSchedule?.bell_periods?.filter((p) => !p.is_break) ?? [];

    const [grid, setGrid] = useState<
        Record<string, { subject_id: number | null; teacher_id: number | null }>
    >(() => {
        const initial: Record<
            string,
            { subject_id: number | null; teacher_id: number | null }
        > = {};
        entries.forEach((entry) => {
            const key = `${entry.section_id}-${entry.day_of_week}-${entry.period_number}`;
            initial[key] = {
                subject_id: entry.subject_id,
                teacher_id: entry.teacher_id,
            };
        });
        return initial;
    });

    const form = useForm({
        entries: entries.map((e) => ({
            section_id: e.section_id,
            subject_id: e.subject_id,
            teacher_id: e.teacher_id,
            day_of_week: e.day_of_week,
            period_number: e.period_number,
            lesson_type: e.lesson_type,
        })),
    });

    // Hooks must be called during render, not from an event handler, so the
    // publish form is created here alongside the grid form.
    const publishForm = useForm({});

    const handleCellChange = (
        sectionId: number,
        day: number,
        period: number,
        field: 'subject_id' | 'teacher_id',
        value: string,
    ) => {
        const key = `${sectionId}-${day}-${period}`;
        const numValue = value ? Number(value) : null;

        setGrid((prev) => ({
            ...prev,
            [key]: { ...prev[key], [field]: numValue },
        }));

        const entryIndex = form.data.entries.findIndex(
            (e) =>
                e.section_id === sectionId &&
                e.day_of_week === day &&
                e.period_number === period,
        );

        if (entryIndex >= 0) {
            form.setData(
                'entries',
                form.data.entries.map((e, i) =>
                    i === entryIndex ? { ...e, [field]: numValue } : e,
                ),
            );
        } else {
            form.setData('entries', [
                ...form.data.entries,
                {
                    section_id: sectionId,
                    subject_id:
                        field === 'subject_id'
                            ? numValue
                            : (grid[key]?.subject_id ?? null),
                    teacher_id:
                        field === 'teacher_id'
                            ? numValue
                            : (grid[key]?.teacher_id ?? null),
                    day_of_week: day,
                    period_number: period,
                    lesson_type: 'lesson',
                },
            ]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(
            saveEntriesUrl.url({ school: school.id, version: version.id }),
        );
    };

    const handlePublish = (e: React.FormEvent) => {
        e.preventDefault();
        if (window.confirm(t('timetable.confirmPublish'))) {
            publishForm.post(
                publishUrl.url({ school: school.id, version: version.id }),
            );
        }
    };

    return (
        <>
            <Head title={version.name} />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{version.name}</h1>
                    {version.status === 'draft' && (
                        <form onSubmit={handlePublish}>
                            <button
                                type="submit"
                                className="bg-success rounded px-4 py-2 text-sm font-medium text-white"
                            >
                                {t('actions.publish')}
                            </button>
                        </form>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr>
                                <th className="border p-2 text-left">
                                    {t('timetable.bySection')}
                                </th>
                                {workingDays.map((day) => (
                                    <th
                                        key={day}
                                        className="min-w-[120px] border p-2"
                                    >
                                        {dayName(day)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sections.map((section) => (
                                <tr key={section.id}>
                                    <td className="border p-2 font-medium">
                                        {section.name}
                                    </td>
                                    {workingDays.map((day) => (
                                        <td key={day} className="border p-1">
                                            {teachingPeriods.map((period) => {
                                                const key = `${section.id}-${day}-${period.number}`;
                                                const cell = grid[key];
                                                return (
                                                    <div
                                                        key={period.number}
                                                        className="mb-1 space-y-1"
                                                    >
                                                        <div className="text-muted-foreground text-xs">
                                                            {isArabic
                                                                ? period.label_ar
                                                                : period.label_en}
                                                        </div>
                                                        <select
                                                            className="w-full rounded border p-1 text-xs"
                                                            value={
                                                                cell?.subject_id ??
                                                                ''
                                                            }
                                                            onChange={(e) =>
                                                                handleCellChange(
                                                                    section.id,
                                                                    day,
                                                                    period.number,
                                                                    'subject_id',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        >
                                                            <option value="">
                                                                {t(
                                                                    'actions.select',
                                                                )}
                                                            </option>
                                                            {subjects.map(
                                                                (s) => (
                                                                    <option
                                                                        key={
                                                                            s.id
                                                                        }
                                                                        value={
                                                                            s.id
                                                                        }
                                                                    >
                                                                        {s.code}
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                        <select
                                                            className="w-full rounded border p-1 text-xs"
                                                            value={
                                                                cell?.teacher_id ??
                                                                ''
                                                            }
                                                            onChange={(e) =>
                                                                handleCellChange(
                                                                    section.id,
                                                                    day,
                                                                    period.number,
                                                                    'teacher_id',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        >
                                                            <option value="">
                                                                {t(
                                                                    'actions.select',
                                                                )}
                                                            </option>
                                                            {teachers.map(
                                                                (t) => (
                                                                    <option
                                                                        key={
                                                                            t.id
                                                                        }
                                                                        value={
                                                                            t.id
                                                                        }
                                                                    >
                                                                        {t.name}
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    </div>
                                                );
                                            })}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="bg-primary text-primary-foreground mt-4 rounded px-4 py-2 text-sm font-medium"
                    >
                        {t('actions.save')}
                    </button>
                </form>
            </div>
        </>
    );
}
