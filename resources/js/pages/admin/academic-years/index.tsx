import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Toast } from '@/components/ui/toast';
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
    filters: Record<string, any>;
};

export default function AcademicYearIndex({
    school,
    academicYears,
    filters = {},
}: Props) {
    const list = paginated<Props['academicYears']['data'][number]>(academicYears);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    // Handle flash messages from Laravel session
    // In a real implementation, you would check for flash messages in the page props

    return (
        <>
            <Head title={`Academic Years — ${school.name}`} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">Academic Years</h1>
                    <div className="mt-4 flex flex-wrap gap-4 md:mt-0">
                        <Link
                            href={`/admin/schools/${school.id}/academic-years/create`}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2 text-sm font-medium"
                        >
                            New Academic Year
                        </Link>
                    </div>
                </div>

                {/* Toast would go here in a real implementation */}

                <div className="space-y-4">
                    <SearchField
                        placeholder="Search academic years..."
                        value={filters.search ?? ''}
                        onChange={(value) => {
                            // In a real implementation, you would update the URL query params
                            // and trigger a refetch
                        }}
                    />

                    <DataTable
                        columns={[
                            { accessorKey: 'name', header: 'Name' },
                            { accessorKey: 'starts_on', header: 'Starts On' },
                            { accessorKey: 'ends_on', header: 'Ends On' },
                            { accessorKey: 'is_current', header: 'Current' },
                            { accessorKey: 'actions', header: 'Actions' },
                        ]}
                        data={list.data.map((year) => ({
                            ...year,
                            actions: (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon">
                                            {/* More vertical icon would go here */}
                                            ⋮
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        side="right"
                                    >
                                        <DropdownMenuItem>
                                            <Link
                                                href={`/admin/schools/${school.id}/academic-years/${year.id}`}
                                            >
                                                View
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Link
                                                href={`/admin/schools/${school.id}/academic-years/${year.id}/edit`}
                                            >
                                                Edit
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                confirmDelete(
                                                    `/admin/schools/${school.id}/academic-years/${year.id}`,
                                                    { preserveScroll: true },
                                                )
                                            }
                                        >
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ),
                        }))}
                    />

                    <Pagination
                        page={list.meta.current_page}
                        lastPage={list.meta.last_page}
                        href={(page: number) =>
                            `/admin/schools/${school.id}/academic-years?page=${page}`
                        }
                    />
                </div>
            </div>
        </>
    );
}
