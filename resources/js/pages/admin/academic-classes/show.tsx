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
    academicClass: {
        id: number;
        name: string;
        created_at: string;
        updated_at: string;
        // Additional fields that might be useful
        section_count?: number;
        student_count?: number;
        teacher_count?: number;
    };
};

export default function AcademicClassShow({ school, academicClass }: Props) {
    return (
        <>
            <Head title={`Academic Class: ${academicClass.name} — ${school.name}`} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">Academic Class: {academicClass.name}</h1>
                    <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
                        <Link
                            href={`/admin/schools/${school.id}/academic-classes`}
                            variant="outline"
                        >
                            Back to Academic Classes
                        </Link>
                        <Link
                            href={`/admin/schools/${school.id}/academic-classes/${academicClass.id}/edit`}
                            variant="default"
                        >
                            Edit Academic Class
                        </Link>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Academic Class Overview</CardTitle>
                        <CardDescription>
                            Key information and statistics for this academic class.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Student Count"
                                value={academicClass.student_count ?? 0}
                                trend="up"
                                description="Total students in this class"
                            />
                            <StatCard
                                title="Section Count"
                                value={academicClass.section_count ?? 0}
                                trend="up"
                                description="Class sections"
                            />
                            <StatCard
                                title="Teacher Count"
                                value={academicClass.teacher_count ?? 0}
                                trend="up"
                                description="Teachers assigned"
                            />
                            <StatCard
                                title="Average Section Size"
                                value={academicClass.student_count ? Math.round(academicClass.student_count / (academicClass.section_count || 1)) : 0}
                                trend="up"
                                description="Average students per section"
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
                                            <p className="text-muted-foreground">{academicClass.name}</p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">Created At:</p>
                                            <p className="text-muted-foreground">
                                                {new Date(academicClass.created_at).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">Updated At:</p>
                                            <p className="text-muted-foreground">
                                                {new Date(academicClass.updated_at).toLocaleDateString()}
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