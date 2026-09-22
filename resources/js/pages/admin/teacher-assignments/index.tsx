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
import { SearchField } from '@/components/forms/search-field';
import { Select } from '@/components/ui/select';
import { Toast } from '@/components/ui/toast';
import { useState } from 'react';

type Props = {
    filters: Record<string, any>;
    assignments: {
        data: Array<{
            id: number;
            teacher: {
                id: number;
                name: string;
            };
            section: {
                id: number;
                name: string;
                academic_class: {
                    id: number;
                    name: string;
                };
            };
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
    school: { id: number; name: string };
};

export default function TeacherAssignmentIndex({
    filters = {},
    assignments,
    school,
}: Props) {
    const list = paginated<Props['assignments']['data'][number]>(assignments);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    // Handle flash messages from Laravel session
    // In a real implementation, you would check for flash messages in the page props

    return (
        <>
            <Head title="Teacher Assignments" />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        Teacher Assignments
                    </h1>
                    <div className="mt-4 flex flex-wrap gap-4 md:mt-0">
                        <Link
                            href={`/admin/schools/${school.id}/teacher-assignments/create`}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2 text-sm font-medium"
                        >
                            New Assignment
                        </Link>
                    </div>
                </div>

                {/* Toast would go here in a real implementation */}

                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <SearchField
                            placeholder="Search assignments..."
                            value={filters.search ?? ''}
                            onChange={(value) => {
                                // In a real implementation, you would update the URL query params
                                // and trigger a refetch
                            }}
                        />
                        <Select
                            value={filters.teacher_id ?? ''}
                            onValueChange={(value) => {
                                // In a real implementation, you would update the URL query params
                                // and trigger a refetch
                            }}
                            placeholder="Filter by teacher"
                        >
                            <option value="">All Teachers</option>
                            {/* Options would be populated from props in a real implementation */}
                        </Select>
                    </div>

                    <DataTable
                        columns={[
                            { accessorKey: 'teacherName', header: 'Teacher' },
                            { accessorKey: 'sectionName', header: 'Section' },
                            {
                                accessorKey: 'className',
                                header: 'Class',
                            },
                            { accessorKey: 'actions', header: 'Actions' },
                        ]}
                        data={list.data.map((assignment) => ({
                            ...assignment,
                            teacherName:
                                related<{ name: string }>(assignment, 'teacher')
                                    ?.name ?? '',
                            sectionName:
                                related<{ name: string }>(assignment, 'section')
                                    ?.name ?? '',
                            className:
                                related<{
                                    academic_class?: { name: string } | null;
                                }>(assignment, 'section')?.academic_class?.name ?? '',
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
                                                href={`/admin/schools/${school.id}/teacher-assignments/${assignment.id}`}
                                            >
                                                View
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Link
                                                href={`/admin/schools/${school.id}/teacher-assignments/${assignment.id}/edit`}
                                            >
                                                Edit
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                confirmDelete(
                                                    `/admin/schools/${school.id}/teacher-assignments/${assignment.id}`,
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
                            `/admin/schools/${school.id}/teacher-assignments?page=${page}`
                        }
                    />
                </div>
            </div>
        </>
    );
}
