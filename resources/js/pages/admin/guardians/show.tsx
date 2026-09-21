import { Head, usePage, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
                    <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
                        <Link
                            href={`/admin/schools/${school.id}/guardians/${guardian.id}/edit`}
                            className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            Edit Guardian
                        </Link>
                        <Button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete this guardian?')) {
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
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">{guardian.name}</h2>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        {guardian.relationship && (
                                            <Badge variant="secondary">{guardian.relationship}</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                                    <p className="mt-1 block truncate">{guardian.email}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                                    <p className="mt-1 block truncate">{guardian.phone ?? 'N/A'}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                                    <p className="mt-1 block truncate">{guardian.address ?? 'N/A'}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Occupation</h3>
                                    <p className="mt-1 block truncate">{guardian.occupation ?? 'N/A'}</p>
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
                                    <div key={student.id} className="border border-muted/20 rounded-lg p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center text-muted-foreground">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{student.name}</h4>
                                                <p className="text-sm text-muted-foreground">Student ID: {student.student_number}</p>
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