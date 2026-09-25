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
import { SearchField } from '@/components/forms/search-field';
import { useT } from '@/hooks/useT';
import { useState } from 'react';

type SectionData = {
    id: number;
    name: string;
    student_count?: number;
    academic_class_name?: string;
    academic_class?: { name: string } | null;
    enrollments_count?: number;
};

type Props = {
    school: { id: number; name: string };
    sections: {
        data: SectionData[];
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

const LIST_URL = (schoolId: number) => `/admin/schools/${schoolId}/sections`;

export default function SectionIndex({
    school,
    sections,
    filters = {},
}: Props) {
    const { t } = useT();
    const list = paginated<SectionData>(sections);
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
            <Head title={t('sections.title')} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t('sections.title')}
                    </h1>
                    <Button asChild>
                        <Link href={`${LIST_URL(school.id)}/create`}>
                            {t('sections.create')}
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
                            placeholder={t('sections.searchPlaceholder')}
                            value={search}
                            onChange={setSearch}
                        />
                    </form>
                </div>

                <DataTable
                    columns={[
                        { accessorKey: 'name', header: t('sections.name') },
                        {
                            accessorKey: 'academicClassName',
                            header: t('sections.academicClass'),
                        },
                        {
                            accessorKey: 'studentCount',
                            header: t('sections.students'),
                        },
                        {
                            accessorKey: 'actions',
                            header: t('common.actions'),
                        },
                    ]}
                    data={list.data.map((section) => ({
                        ...section,
                        academicClassName:
                            related<{ name: string }>(section, 'academic_class')
                                ?.name ??
                            section.academic_class_name ??
                            '—',
                        studentCount:
                            section.student_count ??
                            section.enrollments_count ??
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
                                            href={`${LIST_URL(school.id)}/${section.id}`}
                                        >
                                            {t('common.view')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={`${LIST_URL(school.id)}/${section.id}/edit`}
                                        >
                                            {t('actions.edit')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            confirmDelete(
                                                `${LIST_URL(school.id)}/${section.id}`,
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
                            ? t('sections.emptyFiltered')
                            : t('sections.empty')
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
