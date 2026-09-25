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

type FeeStructureData = {
    id: number;
    name: string;
    description: string | null;
    amount_minor: number;
    currency: string;
    frequency: string;
    is_active: boolean;
};

type Props = {
    filters?: Record<string, any>;
    feeStructures: {
        data: FeeStructureData[];
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
    `/admin/schools/${schoolId}/fee-structures`;

const CURRENCIES = [
    { value: 'SAR', label: 'Saudi Riyal' },
    { value: 'USD', label: 'US Dollar' },
    { value: 'EUR', label: 'Euro' },
    { value: 'GBP', label: 'British Pound' },
];

const FREQUENCIES = [
    { value: 'one_time', label: 'One Time' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'termly', label: 'Termly' },
    { value: 'yearly', label: 'Yearly' },
];

export default function FeeStructureIndex({
    filters = {},
    feeStructures,
    school,
}: Props) {
    const { t } = useT();
    const list = paginated<FeeStructureData>(feeStructures);
    const [search, setSearch] = useState(filters.search ?? '');
    const [currency, _setCurrency] = useState(filters.currency ?? '');
    const [frequency, _setFrequency] = useState(filters.frequency ?? '');
    const [isActive, _setIsActive] = useState(filters.is_active ?? '');

    const applyFilters = (next: {
        search?: string;
        currency?: string;
        frequency?: string;
        is_active?: string;
    }) => {
        router.get(
            LIST_URL(school.id),
            {
                search: next.search || undefined,
                currency: next.currency || undefined,
                frequency: next.frequency || undefined,
                is_active: next.is_active === '' ? undefined : next.is_active,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title={t('feeStructures.title')} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t('feeStructures.title')}
                    </h1>
                    <Button asChild>
                        <Link href={`${LIST_URL(school.id)}/create`}>
                            {t('feeStructures.create')}
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
                            placeholder={t('feeStructures.searchPlaceholder')}
                            value={search}
                            onChange={setSearch}
                        />
                    </form>
                    <div className="flex gap-2 md:gap-4">
                        <Select
                            value={currency}
                            onValueChange={(value) =>
                                applyFilters({ ...filters, currency: value })
                            }
                            placeholder={t('feeStructures.filterByCurrency')}
                        >
                            <option value="">
                                {t('feeStructures.allCurrencies')}
                            </option>
                            {CURRENCIES.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {t(`currencies.${c.value}`)}
                                </option>
                            ))}
                        </Select>
                        <Select
                            value={frequency}
                            onValueChange={(value) =>
                                applyFilters({ ...filters, frequency: value })
                            }
                            placeholder={t('feeStructures.filterByFrequency')}
                        >
                            <option value="">
                                {t('feeStructures.allFrequencies')}
                            </option>
                            {FREQUENCIES.map((f) => (
                                <option key={f.value} value={f.value}>
                                    {t(`frequencies.${f.value}`)}
                                </option>
                            ))}
                        </Select>
                        <Select
                            value={isActive}
                            onValueChange={(value) =>
                                applyFilters({ ...filters, is_active: value })
                            }
                            placeholder={t('feeStructures.filterByStatus')}
                        >
                            <option value="">
                                {t('feeStructures.allStatuses')}
                            </option>
                            <option value="true">{t('common.active')}</option>
                            <option value="false">
                                {t('common.inactive')}
                            </option>
                        </Select>
                    </div>
                </div>

                <DataTable
                    columns={[
                        {
                            accessorKey: 'name',
                            header: t('feeStructures.name'),
                        },
                        {
                            accessorKey: 'description',
                            header: t('feeStructures.description'),
                        },
                        {
                            accessorKey: 'amount',
                            header: t('feeStructures.amount'),
                            cell: (value: number) =>
                                `${(value / 100).toFixed(2)} ${value > 0 ? 'SAR' : ''}`,
                        },
                        {
                            accessorKey: 'currency',
                            header: t('feeStructures.currency'),
                        },
                        {
                            accessorKey: 'frequency',
                            header: t('feeStructures.frequency'),
                        },
                        {
                            accessorKey: 'is_active',
                            header: t('feeStructures.isActive'),
                            cell: (value: boolean) =>
                                value ? t('common.yes') : t('common.no'),
                        },
                        {
                            accessorKey: 'actions',
                            header: t('common.actions'),
                        },
                    ]}
                    data={list.data.map((feeStructure) => ({
                        ...feeStructure,
                        amount: feeStructure.amount_minor,
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
                                            href={`${LIST_URL(school.id)}/${feeStructure.id}`}
                                        >
                                            {t('common.view')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={`${LIST_URL(school.id)}/${feeStructure.id}/edit`}
                                        >
                                            {t('actions.edit')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            confirmDelete(
                                                `${LIST_URL(school.id)}/${feeStructure.id}`,
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
                        filters.currency ||
                        filters.frequency ||
                        filters.is_active
                            ? t('feeStructures.emptyFiltered')
                            : t('feeStructures.empty')
                    }
                />

                <Pagination
                    page={list.meta.current_page}
                    lastPage={list.meta.last_page}
                    href={(page: number) =>
                        `${LIST_URL(school.id)}?page=${page}${filters.search ? `&search=${encodeURIComponent(filters.search)}` : ''}${filters.currency ? `&currency=${encodeURIComponent(filters.currency)}` : ''}${filters.frequency ? `&frequency=${encodeURIComponent(filters.frequency)}` : ''}${filters.is_active ? `&is_active=${filters.is_active}` : ''}`
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
