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
import { SearchField } from '@/components/forms/search-field';
import { paginated } from '@/lib/paginated';
import { useT } from '@/hooks/useT';
import { useState } from 'react';

type StudentRow = {
    id: number;
    name: string;
    studentNumber: string;
    status: string;
};

type Props = {
    school: { id: number; name: string } | null;
    filters: { search?: string; status?: string };
    students: unknown;
};

const STATUSES = ['active', 'inactive', 'graduated', 'transferred'];

const LIST_URL = '/portal/students';

export default function StudentIndex({ filters, students }: Props) {
    const { t } = useT();
    const list = paginated<StudentRow>(students);
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (next: { search?: string; status?: string }) => {
        router.get(
            LIST_URL,
            {
                search: next.search || undefined,
                status: next.status || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title={t('shell.students')} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t('shell.students')}
                    </h1>
                    <Button asChild>
                        <Link href={`${LIST_URL}/create`}>
                            {t('students.new')}
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col gap-4 md:flex-row">
                    <form
                        className="w-full md:max-w-sm"
                        onSubmit={(event) => {
                            event.preventDefault();
                            applyFilters({ ...filters, search });
                        }}
                    >
                        <SearchField
                            placeholder={t('students.searchPlaceholder')}
                            value={search}
                            onChange={setSearch}
                        />
                    </form>

                    <select
                        aria-label={t('students.filterStatus')}
                        className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                        value={filters.status ?? ''}
                        onChange={(event) =>
                            applyFilters({
                                ...filters,
                                status: event.target.value,
                            })
                        }
                    >
                        <option value="">{t('students.allStatuses')}</option>
                        {STATUSES.map((status) => (
                            <option key={status} value={status}>
                                {t(`students.status.${status}`)}
                            </option>
                        ))}
                    </select>
                </div>

                <DataTable
                    columns={[
                        {
                            accessorKey: 'studentNumber',
                            header: t('students.studentNumber'),
                        },
                        { accessorKey: 'name', header: t('students.name') },
                        {
                            accessorKey: 'status',
                            header: t('students.statusLabel'),
                            cell: (value: string) =>
                                t(`students.status.${value}`),
                        },
                        {
                            accessorKey: 'actions',
                            header: t('common.actions'),
                        },
                    ]}
                    data={list.data.map((student) => ({
                        ...student,
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
                                        <Link href={`${LIST_URL}/${student.id}`}>
                                            {t('common.view')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={`${LIST_URL}/${student.id}/edit`}
                                        >
                                            {t('actions.edit')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onSelect={() => {
                                            if (
                                                window.confirm(
                                                    t('students.confirmDelete'),
                                                )
                                            ) {
                                                router.delete(
                                                    `${LIST_URL}/${student.id}`,
                                                    {
                                                        preserveScroll: true,
                                                    },
                                                );
                                            }
                                        }}
                                    >
                                        {t('actions.delete')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ),
                    }))}
                    emptyMessage={
                        filters.search || filters.status
                            ? t('students.emptyFiltered')
                            : t('students.empty')
                    }
                />

                <Pagination
                    page={list.meta.current_page}
                    lastPage={list.meta.last_page}
                    href={(page: number) =>
                        `${LIST_URL}?page=${page}${filters.search ? `&search=${encodeURIComponent(filters.search)}` : ''}${filters.status ? `&status=${filters.status}` : ''}`
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
