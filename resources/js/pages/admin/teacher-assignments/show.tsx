import { Head, usePage, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
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
    assignment: {
        id: number;
        teacher: {
            id: number;
            name: string;
            email: string;
        };
        section: {
            id: number;
            name: string;
            academic_class: {
                id: number;
                name: string;
            };
        };
    };
};

export default function TeacherAssignmentShow({ school, assignment }: Props) {
    return (
        <>
            <Head title="Teacher Assignment Details" />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        Teacher Assignment Details
                    </h1>
                    <div className="mt-4 flex flex-wrap gap-4 md:mt-0">
                        <Link
                            href={`/admin/schools/${school.id}/teacher-assignments/${assignment.id}/edit`}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2 text-sm font-medium"
                        >
                            Edit Assignment
                        </Link>
                        <Button
                            onClick={() => {
                                if (
                                    window.confirm(
                                        'Are you sure you want to delete this teacher assignment?',
                                    )
                                ) {
                                    // In a real implementation, you would send a DELETE request
                                    // For now, we'll just show an alert
                                    alert(
                                        'Teacher assignment deleted successfully!',
                                    );
                                    // In a real app, you would redirect to the index page
                                    // window.location.href = `/admin/schools/${school.id}/teacher-assignments`;
                                }
                            }}
                            variant="destructive"
                        >
                            Delete Assignment
                        </Button>
                        <Button
                            href={`/admin/schools/${school.id}/teacher-assignments`}
                            variant="outline"
                        >
                            Back to Assignments
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Assignment Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">
                                        {assignment.teacher.name}
                                    </h2>
                                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                        <p className="text-muted-foreground text-sm">
                                            Teacher
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        Teacher Email
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {assignment.teacher.email}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        Section
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {assignment.section.name}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        Class
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {assignment.section.academic_class.name}
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
