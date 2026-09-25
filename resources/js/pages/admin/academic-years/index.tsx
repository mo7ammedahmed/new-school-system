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
import { paginated } from '@/lib/paginated';
import { SearchField } from '@/components/forms/search-field';
import { useT } from '@/hooks/useT';
import { useState } from 'react';

type Props = {
    school: { id: number; name: string };
    academicYears: {
        data: Array<{
            id: number;
            name: string;
            starts_on: string;
            ends_on: string;
            is_current: boolean;
        }>;
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

const LIST_URL = (schoolId: number) =>
    `/admin/schools/${schoolId}/academic-years`;

export default function AcademicYearIndex({
    school,
    academicYears,
    filters = {},
}: Props) {
    const { t } = useT();
    const list =
        paginated<Props['academicYears']['data'][number]>(academicYears);
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
            <Head title={t('academicYears.title')} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t('academicYears.title')}
                    </h1>
                    <Button asChild>
                        <Link href={`${LIST_URL(school.id)}/create`}>
                            {t('academicYears.create')}
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
                            placeholder={t('academicYears.searchPlaceholder')}
                            value={search}
                            onChange={setSearch}
                        />
                    </form>

                    <select
                        aria-label={t('academicYears.filterStatus')}
                        className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                        value={status}
                        onChange={(event) =>
                            applyFilters({
                                ...filters,
                                status: event.target.value,
                            })
                        }
                    >
                        <option value="">
                            {t('academicYears.allStatuses')}
                        </option>
                        <option value="current">
                            {t('academicYears.statuses.current')}
                        </option>
                        <option value="past">
                            {t('academicYears.statuses.past')}
                        </option>
                        <option value="future">
                            {t('academicYears.statuses.future')}
                        </option>
                    </select>
                </div>

                <DataTable
                    columns={[
                        {
                            accessorKey: 'name',
                            header: t('academicYears.name'),
                        },
                        {
                            accessorKey: 'starts_on',
                            header: t('academicYears.startsOn'),
                            cell: (value: string) =>
                                new Date(value).toLocaleDateString(),
                        },
                        {
                            accessorKey: 'ends_on',
                            header: t('academicYears.endsOn'),
                            cell: (value: string) =>
                                new Date(value).toLocaleDateString(),
                        },
                        {
                            accessorKey: 'is_current',
                            header: t('academicYears.isCurrent'),
                            cell: (value: boolean) =>
                                value ? t('common.yes') : t('common.no'),
                        },
                        {
                            accessorKey: 'actions',
                            header: t('common.actions'),
                        },
                    ]}
                    data={list.data.map((year) => ({
                        ...year,
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
                                            href={`${LIST_URL(school.id)}/${year.id}`}
                                        >
                                            {t('common.view')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={`${LIST_URL(school.id)}/${year.id}/edit`}
                                        >
                                            {t('actions.edit')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            confirmDelete(
                                                `${LIST_URL(school.id)}/${year.id}`,
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
                            ? t('academicYears.emptyFiltered')
                            : t('academicYears.empty')
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
