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

type InvoiceData = {
    id: number;
    number: string;
    student_name: string;
    issued_on: string | null;
    due_on: string | null;
    status: string;
    currency: string;
    subtotal_minor: number;
    total_minor: number;
    items_count: number;
};

type Props = {
    filters?: Record<string, any>;
    invoices: {
        data: InvoiceData[];
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

const LIST_URL = (schoolId: number) => `/admin/schools/${schoolId}/invoices`;

const STATUSES = [
    { value: 'draft', label: 'Draft' },
    { value: 'issued', label: 'Issued' },
    { value: 'paid', label: 'Paid' },
    { value: 'voided', label: 'Voided' },
];

const CURRENCIES = [
    { value: 'SAR', label: 'Saudi Riyal' },
    { value: 'USD', label: 'US Dollar' },
    { value: 'EUR', label: 'Euro' },
    { value: 'GBP', label: 'British Pound' },
];

export default function InvoiceIndex({
    filters = {},
    invoices,
    school,
}: Props) {
    const { t } = useT();
    const list = paginated<InvoiceData>(invoices);
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, _setStatus] = useState(filters.status ?? '');
    const [currency, _setCurrency] = useState(filters.currency ?? '');

    const applyFilters = (next: {
        search?: string;
        status?: string;
        currency?: string;
    }) => {
        router.get(
            LIST_URL(school.id),
            {
                search: next.search || undefined,
                status: next.status === '' ? undefined : next.status,
                currency: next.currency === '' ? undefined : next.currency,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title={t('invoices.title')} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t('invoices.title')}
                    </h1>
                    <Button asChild>
                        <Link href={`${LIST_URL(school.id)}/create`}>
                            {t('invoices.create')}
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
                            placeholder={t('invoices.searchPlaceholder')}
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
                            placeholder={t('invoices.filterByStatus')}
                        >
                            <option value="">
                                {t('invoices.allStatuses')}
                            </option>
                            {STATUSES.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {t(`invoices.statuses.${status.value}`)}
                                </option>
                            ))}
                        </Select>
                        <Select
                            value={currency}
                            onValueChange={(value) =>
                                applyFilters({ ...filters, currency: value })
                            }
                            placeholder={t('invoices.filterByCurrency')}
                        >
                            <option value="">
                                {t('invoices.allCurrencies')}
                            </option>
                            {CURRENCIES.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {t(`currencies.${c.value}`)}
                                </option>
                            ))}
                        </Select>
                    </div>
                </div>

                <DataTable
                    columns={[
                        { accessorKey: 'number', header: t('invoices.number') },
                        {
                            accessorKey: 'student_name',
                            header: t('invoices.student'),
                        },
                        {
                            accessorKey: 'issued_on',
                            header: t('invoices.issuedDate'),
                            cell: (value: string | null) =>
                                value ?? t('common.notAvailable'),
                        },
                        {
                            accessorKey: 'due_on',
                            header: t('invoices.dueDate'),
                            cell: (value: string | null) =>
                                value ?? t('common.notAvailable'),
                        },
                        {
                            accessorKey: 'status',
                            header: t('invoices.status'),
                            cell: (value: string) =>
                                value
                                    ? t(`invoices.statuses.${value}`)
                                    : t('common.notAvailable'),
                        },
                        {
                            accessorKey: 'currency',
                            header: t('invoices.currency'),
                        },
                        {
                            accessorKey: 'subtotal_minor',
                            header: t('invoices.subtotal'),
                            cell: (value: number) =>
                                `${(value / 100).toFixed(2)} SAR`,
                        },
                        {
                            accessorKey: 'total_minor',
                            header: t('invoices.total'),
                            cell: (value: number) =>
                                `${(value / 100).toFixed(2)} SAR`,
                        },
                        {
                            accessorKey: 'items_count',
                            header: t('invoices.itemsCount'),
                        },
                        {
                            accessorKey: 'actions',
                            header: t('common.actions'),
                        },
                    ]}
                    data={list.data.map((invoice) => ({
                        ...invoice,
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
                                            href={`${LIST_URL(school.id)}/${invoice.id}`}
                                        >
                                            {t('common.view')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={`${LIST_URL(school.id)}/${invoice.id}/edit`}
                                        >
                                            {t('actions.edit')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            confirmDelete(
                                                `${LIST_URL(school.id)}/${invoice.id}`,
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
                        filters.search || filters.status || filters.currency
                            ? t('invoices.emptyFiltered')
                            : t('invoices.empty')
                    }
                />

                <Pagination
                    page={list.meta.current_page}
                    lastPage={list.meta.last_page}
                    href={(page: number) =>
                        `${LIST_URL(school.id)}?page=${page}${filters.search ? `&search=${encodeURIComponent(filters.search)}` : ''}${filters.status ? `&status=${encodeURIComponent(filters.status)}` : ''}${filters.currency ? `&currency=${encodeURIComponent(filters.currency)}` : ''}`
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
