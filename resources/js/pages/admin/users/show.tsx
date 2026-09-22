import { Head, usePage, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
                    <div className="mt-4 flex flex-wrap gap-4 md:mt-0">
                        <Link
                            href={`/admin/schools/${school.id}/users/${user.id}/edit`}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2 text-sm font-medium"
                        >
                            Edit User
                        </Link>
                        <Button
                            onClick={() => {
                                if (
                                    window.confirm(
                                        'Are you sure you want to delete this user?',
                                    )
                                ) {
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
                                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">
                                        {user.name}
                                    </h2>
                                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                        {user.role && (
                                            <Badge variant="secondary">
                                                {user.role
                                                    .split('_')
                                                    .map(
                                                        (word) =>
                                                            word
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                            word.slice(1),
                                                    )
                                                    .join(' ')}
                                            </Badge>
                                        )}
                                        {user.status && (
                                            <Badge
                                                variant={
                                                    user.status === 'active'
                                                        ? 'success'
                                                        : 'destructive'
                                                }
                                            >
                                                {user.status
                                                    .split('_')
                                                    .map(
                                                        (word) =>
                                                            word
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                            word.slice(1),
                                                    )
                                                    .join(' ')}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        Email
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {user.email}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        Phone
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {user.phone ?? 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        Status
                                    </h3>
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
