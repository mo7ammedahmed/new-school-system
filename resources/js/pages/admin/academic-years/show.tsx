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
    academicYear: {
        id: number;
        name: string;
        starts_on: string;
        ends_on: string;
        is_current: boolean;
        created_at: string;
        updated_at: string;
        // Additional fields that might be useful
        student_count?: number;
        class_count?: number;
        section_count?: number;
        enrollment_count?: number;
    };
};

export default function AcademicYearShow({ school, academicYear }: Props) {
    return (
        <>
            <Head title={`Academic Year: ${academicYear.name} — ${school.name}`} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">Academic Year: {academicYear.name}</h1>
                    <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
                        <Link
                            href={`/admin/schools/${school.id}/academic-years`}
                            variant="outline"
                        >
                            Back to Academic Years
                        </Link>
                        <Link
                            href={`/admin/schools/${school.id}/academic-years/${academicYear.id}/edit`}
                            variant="default"
                        >
                            Edit Academic Year
                        </Link>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Academic Year Overview</CardTitle>
                        <CardDescription>
                            Key information and statistics for this academic year.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Student Count"
                                value={academicYear.student_count ?? 0}
                                trend="up"
                                description="Total students enrolled"
                            />
                            <StatCard
                                title="Class Count"
                                value={academicYear.class_count ?? 0}
                                trend="up"
                                description="Academic classes offered"
                            />
                            <StatCard
                                title="Section Count"
                                value={academicYear.section_count ?? 0}
                                trend="up"
                                description="Class sections"
                            />
                            <StatCard
                                title="Enrollment Count"
                                value={academicYear.enrollment_count ?? 0}
                                trend="up"
                                description="Total enrollments"
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
                                            <p className="text-muted-foreground">{academicYear.name}</p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">Status:</p>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                academicYear.is_current
                                                    ? 'bg-success/20 text-success'
                                                    : 'bg-muted/20 text-muted-foreground'
                                            }`}>
                                                {academicYear.is_current ? 'Current' : 'Inactive'}
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">Start Date:</p>
                                            <DateCell value={academicYear.starts_on} />
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">End Date:</p>
                                            <DateCell value={academicYear.ends_on} />
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">Duration:</p>
                                            <p className="text-muted-foreground">
                                                {/* Calculate duration - simplified for example */}
                                                {new Date(academicYear.ends_on).getFullYear() - new Date(academicYear.starts_on).getFullYear()} years
                                            </p>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="details">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <p className="font-medium">Created At:</p>
                                            <p className="text-muted-foreground">
                                                {new Date(academicYear.created_at).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">Updated At:</p>
                                            <p className="text-muted-foreground">
                                                {new Date(academicYear.updated_at).toLocaleDateString()}
                                            </p>
                                        </div>
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