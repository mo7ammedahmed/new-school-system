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

type AcademicClassData = {
    id: number;
    name: string;
    section_count?: number;
    student_count?: number;
    enrollments_count?: number;
    sections?: unknown[] | null;
};

type Props = {
    school: { id: number; name: string };
    academicClasses: {
        data: AcademicClassData[];
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
    `/admin/schools/${schoolId}/academic-classes`;

export default function AcademicClassIndex({
    school,
    academicClasses,
    filters = {},
}: Props) {
    const { t } = useT();
    const list = paginated<AcademicClassData>(academicClasses);
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (next: { search?: string }) => {
        router.get(
            LIST_URL(school.id),
            {
                search: next.search || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title={t('academicClasses.title')} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t('academicClasses.title')}
                    </h1>
                    <Button asChild>
                        <Link href={`${LIST_URL(school.id)}/create`}>
                            {t('academicClasses.create')}
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
                            placeholder={t('academicClasses.searchPlaceholder')}
                            value={search}
                            onChange={setSearch}
                        />
                    </form>
                </div>

                <DataTable
                    columns={[
                        {
                            accessorKey: 'name',
                            header: t('academicClasses.name'),
                        },
                        {
                            accessorKey: 'sectionCount',
                            header: t('academicClasses.sections'),
                        },
                        {
                            accessorKey: 'studentCount',
                            header: t('academicClasses.students'),
                        },
                        {
                            accessorKey: 'actions',
                            header: t('common.actions'),
                        },
                    ]}
                    data={list.data.map((academicClass) => ({
                        ...academicClass,
                        sectionCount:
                            academicClass.sections?.length ??
                            academicClass.section_count ??
                            0,
                        studentCount:
                            academicClass.student_count ??
                            academicClass.enrollments_count ??
                            0,
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
                                            href={`${LIST_URL(school.id)}/${academicClass.id}`}
                                        >
                                            {t('common.view')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={`${LIST_URL(school.id)}/${academicClass.id}/edit`}
                                        >
                                            {t('actions.edit')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            confirmDelete(
                                                `${LIST_URL(school.id)}/${academicClass.id}`,
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
                        filters.search
                            ? t('academicClasses.emptyFiltered')
                            : t('academicClasses.empty')
                    }
                />

                <Pagination
                    page={list.meta.current_page}
                    lastPage={list.meta.last_page}
                    href={(page: number) =>
                        `${LIST_URL(school.id)}?page=${page}${filters.search ? `&search=${encodeURIComponent(filters.search)}` : ''}`
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
