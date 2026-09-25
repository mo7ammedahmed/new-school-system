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

type UserData = {
    id: number;
    name: string;
    email: string;
    role: string;
    phone: string | null;
    status: string | null;
};

type Props = {
    filters?: Record<string, any>;
    users: {
        data: UserData[];
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

const LIST_URL = (schoolId: number) => `/admin/schools/${schoolId}/users`;

/**
 * Mirrors UserController::MANAGED_ROLES. Teachers, guardians and students are
 * not managed here, so offering them as filters would only ever produce an
 * empty list with no explanation.
 */
const ROLES = [
    { value: 'school_admin' },
    { value: 'academic_coordinator' },
    { value: 'teacher' },
    { value: 'finance_staff' },
];

export default function UserIndex({ filters = {}, users, school }: Props) {
    const { t } = useT();
    const list = paginated<UserData>(users);
    const [search, setSearch] = useState(filters.search ?? '');
    const [role, _setRole] = useState(filters.role ?? '');

    const applyFilters = (next: { search?: string; role?: string }) => {
        router.get(
            LIST_URL(school.id),
            {
                search: next.search || undefined,
                role: next.role || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title={t('users.title')} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t('users.title')}
                    </h1>
                    <Button asChild>
                        <Link href={`${LIST_URL(school.id)}/create`}>
                            {t('users.create')}
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
                            placeholder={t('users.searchPlaceholder')}
                            value={search}
                            onChange={setSearch}
                        />
                    </form>
                    <Select
                        value={role}
                        onValueChange={(value) =>
                            applyFilters({ ...filters, role: value })
                        }
                        placeholder={t('users.filterByRole')}
                    >
                        <option value="">{t('users.allRoles')}</option>
                        {ROLES.map((r) => (
                            <option key={r.value} value={r.value}>
                                {t(`roles.${r.value}`)}
                            </option>
                        ))}
                    </Select>
                </div>

                <DataTable
                    columns={[
                        { accessorKey: 'name', header: t('users.name') },
                        { accessorKey: 'email', header: t('users.email') },
                        {
                            accessorKey: 'role',
                            header: t('users.role'),
                            cell: (value: string) => t(`roles.${value}`),
                        },
                        {
                            accessorKey: 'actions',
                            header: t('common.actions'),
                        },
                    ]}
                    data={list.data.map((user) => ({
                        ...user,
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
                                            href={`${LIST_URL(school.id)}/${user.id}`}
                                        >
                                            {t('common.view')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={`${LIST_URL(school.id)}/${user.id}/edit`}
                                        >
                                            {t('actions.edit')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            confirmDelete(
                                                `${LIST_URL(school.id)}/${user.id}`,
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
                        filters.search || filters.role
                            ? t('users.emptyFiltered')
                            : t('users.empty')
                    }
                />

                <Pagination
                    page={list.meta.current_page}
                    lastPage={list.meta.last_page}
                    href={(page: number) =>
                        `${LIST_URL(school.id)}?page=${page}${filters.search ? `&search=${encodeURIComponent(filters.search)}` : ''}${filters.role ? `&role=${filters.role}` : ''}`
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
