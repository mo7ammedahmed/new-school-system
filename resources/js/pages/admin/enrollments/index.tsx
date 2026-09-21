import { Head, usePage, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-display/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination } from '@/components/ui/pagination';
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

export default function EnrollmentIndex({ school, enrollments, filters }: Props) {
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
                    <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
                        <Link
                            href={`/admin/schools/${school.id}/enrollments/create`}
                            className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            New Enrollment
                        </Link>
                    </div>
                </div>

                {/* Toast would go here in a real implementation */}

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            { accessorKey: 'student.student_number', header: 'Student ID' },
                            { accessorKey: 'student.last_name', header: 'Student Last Name' },
                            { accessorKey: 'student.first_name', header: 'Student First Name' },
                            { accessorKey: 'academicYear.name', header: 'Academic Year' },
                            { accessorKey: 'academicClass.name', header: 'Class' },
                            { accessorKey: 'section?.name', header: 'Section' },
                            { accessorKey: 'enrolled_on', header: 'Enrolled On' },
                            { accessorKey: 'status', header: 'Status' },
                            { accessorKey: 'actions', header: 'Actions' },
                        ]}
                        data={enrollments.data.map((enrollment) => ({
                            ...enrollment,
                            actions: (
                                <DropdownMenu className="w-[80px]">
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon">
                                            {/* More vertical icon would go here */}
                                            ⋮
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" side="right">
                                        <DropdownMenuItem>
                                            <Link href={`/admin/schools/${school.id}/enrollments/${enrollment.id}`}>
                                                View
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Link href={`/admin/schools/${school.id}/enrollments/${enrollment.id}/edit`}>
                                                Edit
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={/* handle delete */}>
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ),
                        }))}
                        withBorders
                        withRowActions
                    />

                    <Pagination
                        page={enrollments.meta.current_page}
                        lastPage={enrollments.meta.last_page}
                        href={(page: number) => `/admin/schools/${school.id}/enrollments?page=${page}`}
                    />
                </div>
            </div>
        </>
    );
}