import { useT } from '@/hooks/useT';
import { Head, useForm } from '@inertiajs/react';
import { store as storeVersionUrl } from '@/routes/admin/schedule/timetable';

interface AcademicYear {
    id: number;
    name: string;
}

interface BellSchedule {
    id: number;
    name: string;
}

type TimetableCreateProps = {
    school: { id: number; name: string };
    academicYears: AcademicYear[];
    bellSchedules: BellSchedule[];
};

export default function TimetableCreate({
    school,
    academicYears,
    bellSchedules,
}: TimetableCreateProps) {
    const { t } = useT();

    const form = useForm({
        name: '',
        academic_year_id: '',
        bell_schedule_id: '',
        effective_from: '',
        effective_to: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(storeVersionUrl.url({ school: school.id }));
    };

    return (
        <>
            <Head title={t('actions.add') + ' ' + t('nav.timetable')} />
            <div className="space-y-6 p-6">
                <h1 className="text-2xl font-bold">
                    {t('actions.add')} {t('nav.timetable')}
                </h1>

                <form onSubmit={handleSubmit} className="grid max-w-2xl gap-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            {t('nav.setup')}
                        </label>
                        <input
                            className="w-full rounded border p-2 text-sm"
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                            required
                        />
                        {form.errors.name && (
                            <span className="text-danger-foreground text-xs">
                                {form.errors.name}
                            </span>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            {t('timetable.bySection')}
                        </label>
                        <select
                            className="w-full rounded border p-2 text-sm"
                            value={form.data.academic_year_id}
                            onChange={(e) =>
                                form.setData(
                                    'academic_year_id',
                                    parseInt(
                                        e.target.value,
                                        10,
                                    ) as unknown as string,
                                )
                            }
                            required
                        >
                            <option value="">{t('actions.select')}</option>
                            {academicYears.map((year) => (
                                <option key={year.id} value={year.id}>
                                    {year.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            {t('timetable.byTeacher')}
                        </label>
                        <select
                            className="w-full rounded border p-2 text-sm"
                            value={form.data.bell_schedule_id}
                            onChange={(e) =>
                                form.setData(
                                    'bell_schedule_id',
                                    parseInt(
                                        e.target.value,
                                        10,
                                    ) as unknown as string,
                                )
                            }
                            required
                        >
                            <option value="">{t('actions.select')}</option>
                            {bellSchedules.map((schedule) => (
                                <option key={schedule.id} value={schedule.id}>
                                    {schedule.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                {t('setup.effectiveFrom')}
                            </label>
                            <input
                                type="date"
                                className="w-full rounded border p-2 text-sm"
                                value={form.data.effective_from}
                                onChange={(e) =>
                                    form.setData(
                                        'effective_from',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                {t('setup.effectiveTo')}
                            </label>
                            <input
                                type="date"
                                className="w-full rounded border p-2 text-sm"
                                value={form.data.effective_to}
                                onChange={(e) =>
                                    form.setData('effective_to', e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="bg-primary text-primary-foreground rounded px-4 py-2 text-sm font-medium"
                    >
                        {t('actions.save')}
                    </button>
                </form>
            </div>
        </>
    );
}
