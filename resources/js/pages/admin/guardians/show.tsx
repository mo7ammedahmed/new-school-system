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
import { type ComponentType } from 'react';

type Props = {
    school: { id: number; name: string };
    guardian: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        address: string | null;
        occupation: string | null;
        relationship: string | null;
        students: Array<{
            id: number;
            name: string; // first_name + last_name
            student_number: string;
        }>;
    };
};

export default function GuardianShow({ school, guardian }: Props) {
    return (
        <>
            <Head title="Guardian Details" />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">Guardian Details</h1>
                    <div className="mt-4 flex flex-wrap gap-4 md:mt-0">
                        <Link
                            href={`/admin/schools/${school.id}/guardians/${guardian.id}/edit`}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2 text-sm font-medium"
                        >
                            Edit Guardian
                        </Link>
                        <Button
                            onClick={() => {
                                if (
                                    window.confirm(
                                        'Are you sure you want to delete this guardian?',
                                    )
                                ) {
                                    // In a real implementation, you would send a DELETE request
                                    // For now, we'll just show an alert
                                    alert('Guardian deleted successfully!');
                                    // In a real app, you would redirect to the index page
                                    // window.location.href = `/admin/schools/${school.id}/guardians`;
                                }
                            }}
                            variant="destructive"
                        >
                            Delete Guardian
                        </Button>
                        <Button
                            href={`/admin/schools/${school.id}/guardians`}
                            variant="outline"
                        >
                            Back to Guardians
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Guardian Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">
                                        {guardian.name}
                                    </h2>
                                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                        {guardian.relationship && (
                                            <Badge variant="secondary">
                                                {guardian.relationship}
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
                                        {guardian.email}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        Phone
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {guardian.phone ?? 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        Address
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {guardian.address ?? 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        Occupation
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {guardian.occupation ?? 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {guardian.students.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Associated Students</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {guardian.students.map((student) => (
                                    <div
                                        key={student.id}
                                        className="border-muted/20 rounded-lg border p-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="bg-muted/20 text-muted-foreground flex h-10 w-10 items-center justify-center rounded-xl">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">
                                                    {student.name}
                                                </h4>
                                                <p className="text-muted-foreground text-sm">
                                                    Student ID:{' '}
                                                    {student.student_number}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
