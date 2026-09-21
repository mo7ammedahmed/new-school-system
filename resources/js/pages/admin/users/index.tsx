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
    users: {
        data: Array<{
            id: number;
            name: string;
            email: string;
            role: string;
            phone: string | null;
            status: string | null;
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

export default function UserIndex({ filters, users, school }: Props) {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    // Handle flash messages from Laravel session
    // In a real implementation, you would check for flash messages in the page props

    return (
        <>
            <Head title="Users" />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">Users</h1>
                    <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
                        <Link
                            href={`/admin/schools/${school.id}/users/create`}
                            className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            New User
                        </Link>
                    </div>
                </div>

                {/* Toast would go here in a real implementation */}

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SearchField
                            placeholder="Search users..."
                            value={filters.search ?? ''}
                            onChange={(value) => {
                                // In a real implementation, you would update the URL query params
                                // and trigger a refetch
                            }}
                        />
                        <Select
                            value={filters.role ?? ''}
                            onValueChange={(value) => {
                                // In a real implementation, you would update the URL query params
                                // and trigger a refetch
                            }}
                            placeholder="Filter by role"
                        >
                            <option value="">All Roles</option>
                            <option value="organization_admin">Organization Admin</option>
                            <option value="school_admin">School Admin</option>
                            <option value="teacher">Teacher</option>
                            <option value="staff">Staff</option>
                            <option value="guardian">Guardian</option>
                        </Select>
                    </div>

                    <DataTable
                        columns={[
                            { accessorKey: 'name', header: 'Name' },
                            { accessorKey: 'email', header: 'Email' },
                            { accessorKey: 'role', header: 'Role' },
                            { accessorKey: 'phone', header: 'Phone' },
                            { accessorKey: 'status', header: 'Status' },
                            { accessorKey: 'actions', header: 'Actions' },
                        ]}
                        data={users.data.map((user) => ({
                            ...user,
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
                                            <Link href={`/admin/schools/${school.id}/users/${user.id}`}>
                                                View
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Link href={`/admin/schools/${school.id}/users/${user.id}/edit`}>
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
                        page={users.meta.current_page}
                        lastPage={users.meta.last_page}
                        href={(page: number) => `/admin/schools/${school.id}/users?page=${page}`}
                    />
                </div>
            </div>
        </>
    );
}

UserIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Schools',
            href: '/admin/schools',
        },
        {
            title: (school) => school.name,
            href: `/admin/schools/${school.id}`,
        },
        {
            title: 'Users',
            href: `/admin/schools/${school.id}/users`,
        },
    ],
};