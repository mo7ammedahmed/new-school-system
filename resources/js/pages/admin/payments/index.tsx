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

type PaymentData = {
    id: number;
    payment_date: string | null;
    amount_minor: number;
    status: string;
    payment_method: string | null;
    reference_number: string | null;
    reference: string;
    student_name: string;
    received_by: string;
};

type Props = {
    filters: Record<string, any>;
    payments: {
        data: PaymentData[];
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

const LIST_URL = (schoolId: number) => `/admin/schools/${schoolId}/payments`;

const STATUSES = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
];

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'check', label: 'Check' },
];

export default function PaymentIndex({
    filters = {},
    payments,
    school,
}: Props) {
    const { t } = useT();
    const list = paginated<PaymentData>(payments);
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [paymentMethod, setPaymentMethod] = useState(filters.payment_method ?? '');

    const applyFilters = (next: { search?: string; status?: string; payment_method?: string }) => {
        router.get(
            LIST_URL(school.id),
            {
                search: next.search || undefined,
                status: next.status === '' ? undefined : next.status,
                payment_method: next.payment_method === '' ? undefined : next.payment_method,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title={t('payments.title')} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t('payments.title')}
                    </h1>
                    <Button asChild>
                        <Link href={`${LIST_URL(school.id)}/create`}>
                            {t('payments.create')}
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
                            placeholder={t('payments.searchPlaceholder')}
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
                            placeholder={t('payments.filterByStatus')}
                        >
                            <option value="">{t('payments.allStatuses')}</option>
                            {STATUSES.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {t(`payments.statuses.${status.value}`)}
                                </option>
                            ))}
                        </Select>
                        <Select
                            value={paymentMethod}
                            onValueChange={(value) =>
                                applyFilters({ ...filters, payment_method: value })
                            }
                            placeholder={t('payments.filterByPaymentMethod')}
                        >
                            <option value="">{t('payments.allMethods')}</option>
                            {PAYMENT_METHODS.map((method) => (
                                <option key={method.value} value={method.value}>
                                    {t(`payments.methods.${method.value}`)}
                                </option>
                            ))}
                        </Select>
                    </div>
                </div>

                <DataTable
                    columns={[
                        { accessorKey: 'payment_date', header: t('payments.date') },
                        { accessorKey: 'reference', header: t('payments.reference') },
                        { accessorKey: 'student_name', header: t('payments.student') },
                        { accessorKey: 'amount_minor', header: t('payments.amount'),
                            cell: (value: number) =>
                                `${(value / 100).toFixed(2)} SAR`,
                        },
                        { accessorKey: 'status', header: t('payments.status'),
                            cell: (value: string) =>
                                value
                                    ? t(`payments.statuses.${value}`)
                                    : t('common.notAvailable'),
                        },
                        { accessorKey: 'payment_method', header: t('payments.method'),
                            cell: (value: string | null) =>
                                value
                                    ? t(`payments.methods.${value}`)
                                    : t('common.notAvailable'),
                        },
                        { accessorKey: 'received_by', header: t('payments.receivedBy') },
                        { accessorKey: 'actions', header: t('common.actions') },
                    ]}
                    data={list.data.map((payment) => ({
                        ...payment,
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
                                            href={`${LIST_URL(school.id)}/${payment.id}`}
                                        >
                                            {t('common.view')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={`${LIST_URL(school.id)}/${payment.id}/edit`}
                                        >
                                            {t('actions.edit')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            confirmDelete(
                                                `${LIST_URL(school.id)}/${payment.id}`,
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
                        filters.search ||
                        filters.status ||
                        filters.payment_method
                            ? t('payments.emptyFiltered')
                            : t('payments.empty')
                    }
                />

                <Pagination
                    page={list.meta.current_page}
                    lastPage={list.meta.last_page}
                    href={(page: number) =>
                        `${LIST_URL(school.id)}?page=${page}${filters.search ? `&search=${encodeURIComponent(filters.search)}` : ''}${filters.status ? `&status=${encodeURIComponent(filters.status)}` : ''}${filters.payment_method ? `&payment_method=${encodeURIComponent(filters.payment_method)}` : ''}`
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