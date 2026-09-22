import { useT } from '@/hooks/useT';
import { Head, Link } from '@inertiajs/react';
import {
    create as createUrl,
    index as indexUrl,
} from '@/routes/admin/schedule/timetable';
import { usePage } from '@inertiajs/react';

interface TimetableVersion {
    id: number;
    name: string;
    status: 'draft' | 'published' | 'archived';
    academic_year: { id: number; name: string };
    bell_schedule: { id: number; name: string };
    created_by: { name: string };
    created_at: string | null;
}

type TimetableIndexProps = {
    school: { id: number; name: string };
    versions: TimetableVersion[];
};

export default function TimetableIndex() {
    const { school, versions } = usePage<TimetableIndexProps>().props;
    const { t, locale, isArabic } = useT();

    return (
        <>
            <Head title={t('nav.timetable')} />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{t('nav.timetable')}</h1>
                    <Link
                        href={createUrl({ school: school.id }).url}
                        className="bg-primary text-primary-foreground rounded px-4 py-2 text-sm font-medium"
                    >
                        {t('actions.add')} {t('status.draft')}
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr>
                                <th className="p-2 text-left">
                                    {t('nav.setup')}
                                </th>
                                <th className="p-2 text-left">
                                    {t('timetable.bySection')}
                                </th>
                                <th className="p-2 text-left">
                                    {t('timetable.byTeacher')}
                                </th>
                                <th className="p-2 text-left">
                                    {isArabic ? 'الحالة' : 'Status'}
                                </th>
                                <th className="p-2 text-left">
                                    {isArabic ? 'الإنشاء' : 'Created'}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {versions.map((version) => (
                                <tr key={version.id} className="border-t">
                                    <td className="p-2">
                                        <Link
                                            href={indexUrl({
                                                school: school.id,
                                            }).url.replace(
                                                'timetable',
                                                `timetable/${version.id}/edit`,
                                            )}
                                            className="text-primary font-medium hover:underline"
                                        >
                                            {version.name}
                                        </Link>
                                    </td>
                                    <td className="p-2">
                                        {version.academic_year?.name ?? '—'}
                                    </td>
                                    <td className="p-2">
                                        {version.bell_schedule?.name ?? '—'}
                                    </td>
                                    <td className="p-2">
                                        <span
                                            className={`inline-block rounded px-2 py-1 text-xs ${
                                                version.status === 'published'
                                                    ? 'bg-green-100 text-green-800'
                                                    : version.status ===
                                                        'archived'
                                                      ? 'bg-gray-100 text-gray-800'
                                                      : 'bg-blue-100 text-blue-800'
                                            }`}
                                        >
                                            {t(`status.${version.status}`)}
                                        </span>
                                    </td>
                                    <td className="p-2">
                                        {version.created_at
                                            ? new Date(
                                                  version.created_at,
                                              ).toLocaleDateString(locale)
                                            : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
