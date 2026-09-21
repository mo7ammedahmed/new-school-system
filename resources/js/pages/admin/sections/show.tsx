import { Head, usePage, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DateCell } from '@/components/data-display/date-cell';
import { UserCell } from '@/components/data-display/user-cell';
import { MoneyCell } from '@/components/data-display/money-cell';
import { StatCard } from '@/components/dashboard/stat-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Props = {
    school: { id: number; name: string };
    section: {
        id: number;
        name: string;
        created_at: string;
        updated_at: string;
        // Additional fields that might be useful
        student_count?: number;
        academic_class_name?: string;
        teacher_name?: string;
    };
};

export default function SectionShow({ school, section }: Props) {
    return (
        <>
            <Head title={`Section: ${section.name} — ${school.name}`} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">Section: {section.name}</h1>
                    <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
                        <Link
                            href={`/admin/schools/${school.id}/sections`}
                            variant="outline"
                        >
                            Back to Sections
                        </Link>
                        <Link
                            href={`/admin/schools/${school.id}/sections/${section.id}/edit`}
                            variant="default"
                        >
                            Edit Section
                        </Link>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Section Overview</CardTitle>
                        <CardDescription>
                            Key information and statistics for this section.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Student Count"
                                value={section.student_count ?? 0}
                                trend="up"
                                description="Total students in this section"
                            />
                            <StatCard
                                title="Academic Class"
                                value={section.academic_class_name ?? 'N/A'}
                                trend="up"
                                description="Assigned academic class"
                            />
                            <StatCard
                                title="Homeroom Teacher"
                                value={section.teacher_name ?? 'Unassigned'}
                                trend="up"
                                description="Assigned homeroom teacher"
                            />
                            <StatCard
                                title="Section Capacity"
                                value={35} // Example capacity
                                trend="up"
                                description="Maximum students allowed"
                            />
                        </div>

                        <div className="space-y-4">
                            <Tabs defaultValue="info">
                                <TabsList className="grid w-[200px] grid-cols-1">
                                    <TabsTrigger value="info">Information</TabsTrigger>
                                    <TabsTrigger value="details">Details</TabsTrigger>
                                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                                </TabsList>

                                <TabsContent value="info">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <p className="font-medium">Name:</p>
                                            <p className="text-muted-foreground">{section.name}</p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">Academic Class:</p>
                                            <p className="text-muted-foreground">
                                                {section.academic_class_name ?? 'Not assigned'}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">Homeroom Teacher:</p>
                                            <p className="text-muted-foreground">
                                                {section.teacher_name ?? 'Not assigned'}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">Created At:</p>
                                            <p className="text-muted-foreground">
                                                {new Date(section.created_at).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">Updated At:</p>
                                            <p className="text-muted-foreground">
                                                {new Date(section.updated_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="details">
                                    <div className="space-y-4">
                                        {/* In a real implementation, this would show detailed information */}
                                        <p className="text-muted-foreground">Detailed view coming soon...</p>
                                    </div>
                                </TabsContent>

                                <TabsContent value="timeline">
                                    <div className="space-y-4">
                                        {/* In a real implementation, this would show a timeline of events */}
                                        <p className="text-muted-foreground">Timeline view coming soon...</p>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}