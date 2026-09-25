import { useT } from '@/hooks/useT';
import { Head, useForm, usePage } from '@inertiajs/react';
import { store as storeSubjectUrl } from '@/routes/admin/schedule/setup/subjects';
import { useState } from 'react';

interface Subject {
    id: number;
    code: string;
    name_en: string;
    name_ar: string;
    color: string | null;
    is_active: boolean;
}

interface TeachingAssignment {
    id: number;
    section: { id: number; name: string };
    subject: Subject;
    teacher: { id: number; name: string };
    academic_year: { id: number; name: string };
}

interface BellSchedule {
    id: number;
    name: string;
    is_default: boolean;
    bell_periods: BellPeriod[];
}

interface BellPeriod {
    id: number;
    number: number;
    label_en: string;
    label_ar: string;
    starts_at: string;
    ends_at: string;
    is_break: boolean;
}

interface Settings {
    working_days: number[];
    max_exams_per_day_per_section: number;
    teacher_max_periods_per_day: number | null;
    teacher_max_periods_per_week: number | null;
}

type ScheduleSetupProps = {
    school: { id: number; name: string };
    subjects: Subject[];
    teachingAssignments: TeachingAssignment[];
    bellSchedules: BellSchedule[];
    settings: Settings | null;
};

export default function ScheduleSetup() {
    const { school, subjects, _teachingAssignments, _bellSchedules, settings } =
        usePage<ScheduleSetupProps>().props;
    const { t, dayName, isArabic } = useT();
    const [activePanel, setActivePanel] = useState<
        'subjects' | 'assignments' | 'bell' | 'settings'
    >('subjects');

    const subjectForm = useForm({
        code: '',
        name_en: '',
        name_ar: '',
        color: '',
        is_active: true,
    });

    return (
        <>
            <Head title={t('nav.schedule')} />
            <div className="space-y-6 p-6">
                <div className="flex items-center gap-4 border-b pb-3">
                    {(
                        ['subjects', 'assignments', 'bell', 'settings'] as const
                    ).map((panel) => (
                        <button
                            key={panel}
                            onClick={() => setActivePanel(panel)}
                            className={`px-4 py-2 text-sm font-medium ${
                                activePanel === panel
                                    ? 'border-primary text-primary border-b-2'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {t(`setup.${panel}`)}
                        </button>
                    ))}
                </div>

                {activePanel === 'subjects' && (
                    <div className="space-y-4">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                subjectForm.post(
                                    storeSubjectUrl.url({ school: school.id }),
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => subjectForm.reset(),
                                    },
                                );
                            }}
                            className="grid gap-3 rounded border p-4 md:grid-cols-5"
                        >
                            <input
                                className="rounded border p-2 text-sm"
                                placeholder={
                                    t('actions.add') +
                                    ' ' +
                                    t('setup.subjects').slice(0, -1)
                                }
                                value={subjectForm.data.code}
                                onChange={(e) =>
                                    subjectForm.setData('code', e.target.value)
                                }
                                required
                            />
                            <input
                                className="rounded border p-2 text-sm"
                                placeholder="EN"
                                value={subjectForm.data.name_en}
                                onChange={(e) =>
                                    subjectForm.setData(
                                        'name_en',
                                        e.target.value,
                                    )
                                }
                                required
                            />
                            <input
                                className="rounded border p-2 text-sm"
                                placeholder="AR"
                                value={subjectForm.data.name_ar}
                                onChange={(e) =>
                                    subjectForm.setData(
                                        'name_ar',
                                        e.target.value,
                                    )
                                }
                                required
                            />
                            <input
                                type="color"
                                className="h-9 w-full rounded border p-0"
                                value={subjectForm.data.color || '#6b7280'}
                                onChange={(e) =>
                                    subjectForm.setData('color', e.target.value)
                                }
                            />
                            <button
                                type="submit"
                                disabled={subjectForm.processing}
                                className="bg-primary text-primary-foreground rounded px-3 py-2 text-sm font-medium"
                            >
                                {t('actions.add')}
                            </button>
                        </form>

                        <div className="rounded border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr>
                                        <th className="p-2 text-left">
                                            {t('setup.code')}
                                        </th>
                                        <th className="p-2 text-left">
                                            {isArabic
                                                ? 'Name (AR)'
                                                : 'Name (EN)'}
                                        </th>
                                        <th className="p-2 text-left">
                                            {t('setup.color')}
                                        </th>
                                        <th className="p-2 text-left">
                                            {t('setup.active')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subjects.map((subject) => (
                                        <tr
                                            key={subject.id}
                                            className="border-t"
                                        >
                                            <td className="p-2">
                                                {subject.code}
                                            </td>
                                            <td className="p-2">
                                                {isArabic
                                                    ? subject.name_ar
                                                    : subject.name_en}
                                            </td>
                                            <td className="p-2">
                                                {subject.color && (
                                                    <span
                                                        className="inline-block h-4 w-4 rounded"
                                                        style={{
                                                            backgroundColor:
                                                                subject.color,
                                                        }}
                                                    />
                                                )}
                                            </td>
                                            <td className="p-2">
                                                {subject.is_active
                                                    ? t('status.published')
                                                    : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activePanel === 'assignments' && (
                    <div className="text-muted-foreground text-center text-sm">
                        {t('timetable.byTeacher')}
                    </div>
                )}

                {activePanel === 'bell' && (
                    <div className="text-muted-foreground text-center text-sm">
                        {t('timetable.bySection')}
                    </div>
                )}

                {settings && (
                    <div className="space-y-4">
                        <div className="rounded border p-4">
                            <h3 className="mb-2 font-medium">
                                {t('setup.workingDays')}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                                    <label
                                        key={day}
                                        className="flex items-center gap-2"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={settings!.working_days.includes(
                                                day,
                                            )}
                                            readOnly
                                            className="rounded"
                                        />
                                        <span>{dayName(day)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2 rounded border p-4">
                            <h3 className="font-medium">
                                {t('setup.maxExamsPerDay')}
                            </h3>
                            <input
                                type="number"
                                min={1}
                                defaultValue={
                                    settings.max_exams_per_day_per_section
                                }
                                className="w-20 rounded border p-1 text-sm"
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
