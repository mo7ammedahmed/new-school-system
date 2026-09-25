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
import { Select } from '@/components/ui/select';
import { confirmDelete } from '@/lib/confirm-delete';
import { paginated } from '@/lib/paginated';
import { SearchField } from '@/components/forms/search-field';
import { useT } from '@/hooks/useT';
import { useState } from 'react';

type InstallmentData = {
    id: number;
    sequence: number;
    due_on: string | null;
    amount_minor: number;
    paid_minor: number;
    status: string;
    invoice_number: string;
    student_name: string;
};

type Props = {
    filters?: Record<string, any>;
    installments: {
        data: InstallmentData[];
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

const LIST_URL = (schoolId: number) =>
    `/admin/schools/${schoolId}/installments`;

const STATUSES = [
    { value: 'created', label: 'Created' },
    { value: 'succeeded', label: 'Succeeded' },
    { value: 'partially_paid', label: 'Partially Paid' },
    { value: 'paid', label: 'Paid' },
];

export default function InstallmentIndex({
    filters = {},
    installments,
    school,
}: Props) {
    const { t } = useT();
    const list = paginated<InstallmentData>(installments);
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, _setStatus] = useState(filters.status ?? '');

    const applyFilters = (next: { search?: string; status?: string }) => {
        router.get(
            LIST_URL(school.id),
            {
                search: next.search || undefined,
                status: next.status === '' ? undefined : next.status,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title={t('installments.title')} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t('installments.title')}
                    </h1>
                    <Button asChild>
                        <Link href={`${LIST_URL(school.id)}/create`}>
                            {t('installments.create')}
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
                            placeholder={t('installments.searchPlaceholder')}
                            value={search}
                            onChange={setSearch}
                        />
                    </form>
                    <div className="flex gap-2 md:gap-4">
                        <Select
                            value={status}
                            onValueChange={(value) =>
                                applyFilters({ ...filters, status: value })
                            }
                            placeholder={t('installments.filterByStatus')}
                        >
                            <option value="">
                                {t('installments.allStatuses')}
                            </option>
                            {STATUSES.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {t(`installments.statuses.${status.value}`)}
                                </option>
                            ))}
                        </Select>
                    </div>
                </div>

                <DataTable
                    columns={[
                        {
                            accessorKey: 'sequence',
                            header: t('installments.sequence'),
                        },
                        {
                            accessorKey: 'student_name',
                            header: t('installments.student'),
                        },
                        {
                            accessorKey: 'invoice_number',
                            header: t('installments.invoice'),
                        },
                        {
                            accessorKey: 'due_on',
                            header: t('installments.dueDate'),
                            cell: (value: string | null) =>
                                value ?? t('common.notAvailable'),
                        },
                        {
                            accessorKey: 'amount',
                            header: t('installments.amount'),
                            cell: (value: number) =>
                                `${(value / 100).toFixed(2)} SAR`,
                        },
                        {
                            accessorKey: 'paid',
                            header: t('installments.paidAmount'),
                            cell: (value: number) =>
                                `${(value / 100).toFixed(2)} SAR`,
                        },
                        {
                            accessorKey: 'outstanding',
                            header: t('installments.outstanding'),
                            cell: (row: InstallmentData) =>
                                `${((row.amount_minor - row.paid_minor) / 100).toFixed(2)} SAR`,
                        },
                        {
                            accessorKey: 'status',
                            header: t('installments.status'),
                            cell: (value: string) =>
                                value
                                    ? t(`installments.statuses.${value}`)
                                    : t('common.notAvailable'),
                        },
                        {
                            accessorKey: 'actions',
                            header: t('common.actions'),
                        },
                    ]}
                    data={list.data.map((installment) => ({
                        ...installment,
                        amount: installment.amount_minor,
                        paid: installment.paid_minor,
                        outstanding:
                            installment.amount_minor - installment.paid_minor,
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
                                            href={`${LIST_URL(school.id)}/${installment.id}`}
                                        >
                                            {t('common.view')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={`${LIST_URL(school.id)}/${installment.id}/edit`}
                                        >
                                            {t('actions.edit')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            confirmDelete(
                                                `${LIST_URL(school.id)}/${installment.id}`,
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
                            ? t('installments.emptyFiltered')
                            : t('installments.empty')
                    }
                />

                <Pagination
                    page={list.meta.current_page}
                    lastPage={list.meta.last_page}
                    href={(page: number) =>
                        `${LIST_URL(school.id)}?page=${page}${filters.search ? `&search=${encodeURIComponent(filters.search)}` : ''}${filters.status ? `&status=${encodeURIComponent(filters.status)}` : ''}`
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
