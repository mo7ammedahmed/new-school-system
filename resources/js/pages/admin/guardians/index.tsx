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
import { Select } from '@/components/ui/select';
import { useT } from '@/hooks/useT';
import { useState } from 'react';

type GuardianData = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    occupation: string | null;
    relationship: string | null;
};

type Props = {
    filters: Record<string, any>;
    guardians: {
        data: GuardianData[];
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
    school: { id: number; name: string };
};

const LIST_URL = (schoolId: number) => `/admin/schools/${schoolId}/guardians`;

const RELATIONSHIPS = [
    { value: 'father', label: 'Father' },
    { value: 'mother', label: 'Mother' },
    { value: 'guardian', label: 'Guardian' },
    { value: 'other', label: 'Other' },
];

export default function GuardianIndex({
    filters = {},
    guardians,
    school,
}: Props) {
    const { t } = useT();
    const list = paginated<GuardianData>(guardians);
    const [search, setSearch] = useState(filters.search ?? '');
    const [relationship, setRelationship] = useState(
        filters.relationship ?? '',
    );

    const applyFilters = (next: { search?: string; relationship?: string }) => {
        router.get(
            LIST_URL(school.id),
            {
                search: next.search || undefined,
                relationship: next.relationship || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title={t('guardians.title')} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t('guardians.title')}
                    </h1>
                    <Button asChild>
                        <Link href={`${LIST_URL(school.id)}/create`}>
                            {t('guardians.create')}
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
                            placeholder={t('guardians.searchPlaceholder')}
                            value={search}
                            onChange={setSearch}
                        />
                    </form>
                    <Select
                        value={relationship}
                        onValueChange={(value) =>
                            applyFilters({ ...filters, relationship: value })
                        }
                        placeholder={t('guardians.filterByRelationship')}
                    >
                        <option value="">
                            {t('guardians.allRelationships')}
                        </option>
                        {RELATIONSHIPS.map((rel) => (
                            <option key={rel.value} value={rel.value}>
                                {t(`guardians.relationship.${rel.value}`)}
                            </option>
                        ))}
                    </Select>
                </div>

                <DataTable
                    columns={[
                        { accessorKey: 'name', header: t('guardians.name') },
                        { accessorKey: 'email', header: t('guardians.email') },
                        { accessorKey: 'phone', header: t('guardians.phone') },
                        {
                            accessorKey: 'relationship',
                            header: t('guardians.relationship'),
                        },
                        {
                            accessorKey: 'actions',
                            header: t('common.actions'),
                        },
                    ]}
                    data={list.data.map((guardian) => ({
                        ...guardian,
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
                                            href={`${LIST_URL(school.id)}/${guardian.id}`}
                                        >
                                            {t('common.view')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={`${LIST_URL(school.id)}/${guardian.id}/edit`}
                                        >
                                            {t('actions.edit')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            confirmDelete(
                                                `${LIST_URL(school.id)}/${guardian.id}`,
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
                        filters.search || filters.relationship
                            ? t('guardians.emptyFiltered')
                            : t('guardians.empty')
                    }
                />

                <Pagination
                    page={list.meta.current_page}
                    lastPage={list.meta.last_page}
                    href={(page: number) =>
                        `${LIST_URL(school.id)}?page=${page}${filters.search ? `&search=${encodeURIComponent(filters.search)}` : ''}${filters.relationship ? `&relationship=${filters.relationship}` : ''}`
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
