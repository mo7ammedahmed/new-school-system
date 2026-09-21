import { Head, usePage, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
                    <h1 className="text-2xl font-semibold">Teacher Assignment Details</h1>
                    <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
                        <Link
                            href={`/admin/schools/${school.id}/teacher-assignments/${assignment.id}/edit`}
                            className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            Edit Assignment
                        </Link>
                        <Button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete this teacher assignment?')) {
                                    // In a real implementation, you would send a DELETE request
                                    // For now, we'll just show an alert
                                    alert('Teacher assignment deleted successfully!');
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
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">{assignment.teacher.name}</h2>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <p className="text-sm text-muted-foreground">Teacher</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Teacher Email</h3>
                                    <p className="mt-1 block truncate">{assignment.teacher.email}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Section</h3>
                                    <p className="mt-1 block truncate">{assignment.section.name}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Class</h3>
                                    <p className="mt-1 block truncate">{assignment.section.academic_class.name}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

TeacherAssignmentShow.layout = {
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
            title: 'Teacher Assignments',
            href: `/admin/schools/${school.id}/teacher-assignments`,
        },
        {
            title: 'Teacher Assignment Details',
            href: `/admin/schools/${school.id}/teacher-assignments/${assignment.id}`,
        },
    ],
};