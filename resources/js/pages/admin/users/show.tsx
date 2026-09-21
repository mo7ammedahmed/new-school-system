import { Head, usePage, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';

type Props = {
    school: { id: number; name: string };
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
        phone: string | null;
        status: string | null;
    };
};

export default function UserShow({ school, user }: Props) {
    return (
        <>
            <Head title="User Details" />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">User Details</h1>
                    <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
                        <Link
                            href={`/admin/schools/${school.id}/users/${user.id}/edit`}
                            className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            Edit User
                        </Link>
                        <Button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete this user?')) {
                                    // In a real implementation, you would send a DELETE request
                                    // For now, we'll just show an alert
                                    alert('User deleted successfully!');
                                    // In a real app, you would redirect to the index page
                                    // window.location.href = `/admin/schools/${school.id}/users`;
                                }
                            }}
                            variant="destructive"
                        >
                            Delete User
                        </Button>
                        <Button
                            href={`/admin/schools/${school.id}/users`}
                            variant="outline"
                        >
                            Back to Users
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>User Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">{user.name}</h2>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        {user.role && (
                                            <Badge variant="secondary">
                                                {user.role
                                                    .split('_')
                                                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                    .join(' ')
                                                }
                                            </Badge>
                                        )}
                                        {user.status && (
                                            <Badge
                                                variant={user.status === 'active' ? 'success' : 'destructive'}
                                            >
                                                {user.status
                                                    .split('_')
                                                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                    .join(' ')
                                                }
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                                    <p className="mt-1 block truncate">{user.email}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                                    <p className="mt-1 block truncate">{user.phone ?? 'N/A'}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                                    <p className="mt-1 block capitalize">
                                        {user.status ?? 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

UserShow.layout = {
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
        {
            title: 'User Details',
            href: `/admin/schools/${school.id}/users/${user.id}`,
        },
    ],
};