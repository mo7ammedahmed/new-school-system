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
import { paginated, related } from '@/lib/paginated';
import { DateCell } from '@/components/data-display/date-cell';
import { SearchField } from '@/components/forms/search-field';
import { Select } from '@/components/ui/select';
import { Toast } from '@/components/ui/toast';
import { useState } from 'react';

type Props = {
    school: { id: number; name: string };
    enrollments: {
        data: Array<{
            id: number;
            student: {
                id: number;
                first_name: string;
                last_name: string;
                student_number: string;
            };
            academicYear: {
                id: number;
                name: string;
            };
            academicClass: {
                id: number;
                name: string;
            };
            section: {
                id: number;
                name: string;
            } | null;
            status: string;
            enrolled_on: string;
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

export default function EnrollmentIndex({
    school,
    enrollments,
    filters = {},
}: Props) {
    const list = paginated<Props['enrollments']['data'][number]>(enrollments);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    // Handle flash messages from Laravel session
    // In a real implementation, you would check for flash messages in the page props

    return (
        <>
            <Head title={`Enrollments — ${school.name}`} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">Enrollments</h1>
                    <div className="mt-4 flex flex-wrap gap-4 md:mt-0">
                        <Link
                            href={`/admin/schools/${school.id}/enrollments/create`}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2 text-sm font-medium"
                        >
                            New Enrollment
                        </Link>
                    </div>
                </div>

                {/* Toast would go here in a real implementation */}

                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <SearchField
                            placeholder="Search enrollments..."
                            value={filters.search ?? ''}
                            onChange={(value) => {
                                // In a real implementation, you would update the URL query params
                                // and trigger a refetch
                            }}
                        />
                        <Select
                            value={filters.status ?? ''}
                            onValueChange={(value) => {
                                // In a real implementation, you would update the URL query params
                                // and trigger a refetch
                            }}
                            placeholder="Filter by status"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="withdrawn">Withdrawn</option>
                        </Select>
                    </div>

                    <DataTable
                        columns={[
                            {
                                accessorKey: 'studentNumber',
                                header: 'Student ID',
                            },
                            {
                                accessorKey: 'studentName',
                                header: 'Student',
                            },
                            {
                                accessorKey: 'yearName',
                                header: 'Academic Year',
                            },
                            {
                                accessorKey: 'className',
                                header: 'Class',
                            },
                            { accessorKey: 'sectionName', header: 'Section' },
                            {
                                accessorKey: 'enrolled_on',
                                header: 'Enrolled On',
                                cell: (value: string) => (
                                    <DateCell value={value} />
                                ),
                            },
                            { accessorKey: 'status', header: 'Status' },
                            { accessorKey: 'actions', header: 'Actions' },
                        ]}
                        data={list.data.map((enrollment) => ({
                            ...enrollment,
                            studentNumber: related<{ student_number: string }>(enrollment, 'student')
                                ?.student_number ?? '',
                            studentName: [
                                related<{ first_name?: string }>(enrollment, 'student')
                                    ?.first_name,
                                related<{ last_name?: string }>(enrollment, 'student')
                                    ?.last_name,
                            ]
                                .filter(Boolean)
                                .join(' '),
                            yearName:
                                related<{ name: string }>(
                                    enrollment,
                                    'academic_year',
                                )?.name ?? '',
                            className:
                                related<{ name: string }>(
                                    enrollment,
                                    'academic_class',
                                )?.name ?? '',
                            sectionName:
                                related<{ name: string }>(enrollment, 'section')
                                    ?.name ?? '—',
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
                                                href={`/admin/schools/${school.id}/enrollments/${enrollment.id}`}
                                            >
                                                View
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Link
                                                href={`/admin/schools/${school.id}/enrollments/${enrollment.id}/edit`}
                                            >
                                                Edit
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                confirmDelete(
                                                    `/admin/schools/${school.id}/enrollments/${enrollment.id}`,
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
                            `/admin/schools/${school.id}/enrollments?page=${page}`
                        }
                    />
                </div>
            </div>
        </>
    );
}
