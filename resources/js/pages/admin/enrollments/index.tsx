import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-display/data-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pagination } from '@/components/ui/pagination';
import { confirmDelete } from '@/lib/confirm-delete';
import { paginated, related } from '@/lib/paginated';
import { DateCell } from '@/components/data-display/date-cell';
import { SearchField } from '@/components/forms/search-field';
import { Select } from '@/components/ui/select';
import { useT } from '@/hooks/useT';
import { useState } from 'react';

type EnrollmentData = {
    id: number;
    student: {
        id: number;
        first_name: string;
        last_name: string;
        student_number: string;
    };
    academic_year: {
        id: number;
        name: string;
    };
    academic_class: {
        id: number;
        name: string;
    };
    section: {
        id: number;
        name: string;
    } | null;
    status: string;
    enrolled_on: string;
};

type Props = {
    school: { id: number; name: string };
    enrollments: {
        data: EnrollmentData[];
        meta: {
            total: number;
            per_page: number;
            current_page: number;
            last_page: number;
            from: number;
            to: number;
        };
        links: {
            prev: string | null;
            next: string | null;
        };
    };
    filters?: Record<string, any>;
};

const LIST_URL = (schoolId: number) => `/admin/schools/${schoolId}/enrollments`;

const STATUSES = [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'withdrawn', label: 'Withdrawn' },
];

export default function EnrollmentIndex({
    school,
    enrollments,
    filters = {},
}: Props) {
    const { t } = useT();
    const list = paginated<EnrollmentData>(enrollments);
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, _setStatus] = useState(filters.status ?? '');

    const applyFilters = (next: { search?: string; status?: string }) => {
        router.get(
            LIST_URL(school.id),
            {
                search: next.search || undefined,
                status: next.status || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title={t('enrollments.title')} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t('enrollments.title')}
                    </h1>
                    <Button asChild>
                        <Link href={`${LIST_URL(school.id)}/create`}>
                            {t('enrollments.create')}
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <form
                        className="w-full md:max-w-sm"
                        onSubmit={(event) => {
                            event.preventDefault();
                            applyFilters({ ...filters, search });
                        }}
                    >
                        <SearchField
                            placeholder={t('enrollments.searchPlaceholder')}
                            value={search}
                            onChange={setSearch}
                        />
                    </form>
                    <Select
                        value={status}
                        onValueChange={(value) =>
                            applyFilters({ ...filters, status: value })
                        }
                        placeholder={t('enrollments.filterByStatus')}
                    >
                        <option value="">{t('enrollments.allStatuses')}</option>
                        {STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>
                                {t(`enrollments.statuses.${s.value}`)}
                            </option>
                        ))}
                    </Select>
                </div>

                <DataTable
                    columns={[
                        {
                            accessorKey: 'studentNumber',
                            header: t('enrollments.studentNumber'),
                        },
                        {
                            accessorKey: 'studentName',
                            header: t('enrollments.student'),
                        },
                        {
                            accessorKey: 'yearName',
                            header: t('enrollments.academicYear'),
                        },
                        {
                            accessorKey: 'className',
                            header: t('enrollments.class'),
                        },
                        {
                            accessorKey: 'sectionName',
                            header: t('enrollments.section'),
                        },
                        {
                            accessorKey: 'enrolled_on',
                            header: t('enrollments.enrolledOn'),
                            cell: (value: string) => <DateCell value={value} />,
                        },
                        {
                            accessorKey: 'status',
                            header: t('enrollments.status'),
                            cell: (value: string) =>
                                t(`enrollments.statuses.${value}`),
                        },
                        {
                            accessorKey: 'actions',
                            header: t('common.actions'),
                        },
                    ]}
                    data={list.data.map((enrollment) => ({
                        ...enrollment,
                        studentNumber:
                            related<{ student_number: string }>(
                                enrollment,
                                'student',
                            )?.student_number ?? '',
                        studentName: [
                            related<{ first_name?: string }>(
                                enrollment,
                                'student',
                            )?.first_name,
                            related<{ last_name?: string }>(
                                enrollment,
                                'student',
                            )?.last_name,
                        ]
                            .filter(Boolean)
                            .join(' '),
                        yearName:
                            related<{ name: string }>(
                                enrollment,
                                'academic_year',
                            )?.name ?? '',
                        className:
                            related<{ name: string }>(
                                enrollment,
                                'academic_class',
                            )?.name ?? '',
                        sectionName:
                            related<{ name: string }>(enrollment, 'section')
                                ?.name ?? '—',
                        actions: (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <span aria-hidden="true">⋮</span>
                                        <span className="sr-only">
                                            {t('common.actions')}
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={`${LIST_URL(school.id)}/${enrollment.id}`}
                                        >
                                            {t('common.view')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={`${LIST_URL(school.id)}/${enrollment.id}/edit`}
                                        >
                                            {t('actions.edit')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            confirmDelete(
                                                `${LIST_URL(school.id)}/${enrollment.id}`,
                                                { preserveScroll: true },
                                            )
                                        }
                                    >
                                        {t('actions.delete')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ),
                    }))}
                    emptyMessage={
                        filters.search || filters.status
                            ? t('enrollments.emptyFiltered')
                            : t('enrollments.empty')
                    }
                />

                <Pagination
                    page={list.meta.current_page}
                    lastPage={list.meta.last_page}
                    href={(page: number) =>
                        `${LIST_URL(school.id)}?page=${page}${filters.search ? `&search=${encodeURIComponent(filters.search)}` : ''}${filters.status ? `&status=${filters.status}` : ''}`
                    }
                    labels={{
                        previous: t('common.previous'),
                        next: t('common.next'),
                        page: t('common.page'),
                        of: t('common.of'),
                    }}
                />
            </div>
        </>
    );
}
