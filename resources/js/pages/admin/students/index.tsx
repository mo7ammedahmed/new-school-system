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
    filters: Record<string, any>;
    students: {
        data: Array<{
            id: number;
            first_name: string;
            last_name: string;
            student_number: string;
            // Additional fields that might be useful
            email?: string;
            phone?: string;
            status?: string;
            date_of_birth?: string;
            gender?: string;
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
};

export default function StudentIndex({ filters, students }: Props) {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    // Handle flash messages from Laravel session
    // In a real implementation, you would check for flash messages in the page props

    return (
        <>
            <Head title="Students" />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">Students</h1>
                    <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
                        <Button
                            href="/admin/students/create"
                            className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            New Student
                        </Button>
                    </div>
                </div>

                {/* Toast would go here in a real implementation */}

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SearchField
                            placeholder="Search students..."
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
                            <option value="inactive">Inactive</option>
                            <option value="graduated">Graduated</option>
                            <option value="transferred">Transferred</option>
                        </Select>
                    </div>

                    <DataTable
                        columns={[
                            { accessorKey: 'student_number', header: 'Student ID' },
                            { accessorKey: 'last_name', header: 'Last Name' },
                            { accessorKey: 'first_name', header: 'First Name' },
                            { accessorKey: 'email', header: 'Email' },
                            { accessorKey: 'phone', header: 'Phone' },
                            { accessorKey: 'date_of_birth', header: 'Date of Birth' },
                            { accessorKey: 'gender', header: 'Gender' },
                            { accessorKey: 'status', header: 'Status' },
                            { accessorKey: 'actions', header: 'Actions' },
                        ]}
                        data={students.data.map((student) => ({
                            ...student,
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
                                            <Link href={`/admin/students/${student.id}`}>
                                                View
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Link href={`/admin/students/${student.id}/edit`}>
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
                        page={students.meta.current_page}
                        lastPage={students.meta.last_page}
                        href={(page: number) => `/admin/students?page=${page}`}
                    />
                </div>
            </div>
        </>
    );
}