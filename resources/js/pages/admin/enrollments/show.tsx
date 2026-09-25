import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DateCell } from '@/components/data-display/date-cell';
import { UserCell } from '@/components/data-display/user-cell';
import { StatCard } from '@/components/dashboard/stat-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { confirmDelete } from '@/lib/confirm-delete';

type Props = {
    school: { id: number; name: string };
    enrollment: {
        id: number;
        student: {
            id: number;
            name: string;
            first_name: string;
            last_name: string;
            student_number: string;
            date_of_birth: string | null;
        };
        academicYear: {
            id: number;
            name: string;
            start_date: string;
            end_date: string;
        };
        academicClass: {
            id: number;
            name: string;
        };
        section: {
            id: number;
            name: string;
        } | null;
        enrolled_on: string;
        status: string;
        attendance: Record<string, number>;
        assessments: Array<{
            title: string;
            score: number;
            maxScore: number;
            date: string;
            comment: string | null;
        }>;
    };
    canEdit: boolean;
    canDelete: boolean;
};

export default function EnrollmentShow({
    school,
    enrollment,
    canEdit,
    canDelete,
}: Props) {
    return (
        <>
            <Head title={`Enrollment: ${enrollment.student.name}`} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        Enrollment Details
                    </h1>
                    <div className="mt-4 flex flex-wrap gap-4 md:mt-0">
                        <Button
                            href={`/admin/schools/${school.id}/enrollments`}
                            variant="outline"
                        >
                            Back to Enrollments
                        </Button>
                        {canEdit && (
                            <Button
                                href={`/admin/schools/${school.id}/enrollments/${enrollment.id}/edit`}
                                variant="default"
                            >
                                Edit Enrollment
                            </Button>
                        )}
                        {canDelete && (
                            <Button
                                onClick={() =>
                                    confirmDelete(
                                        `/admin/schools/${school.id}/enrollments/${enrollment.id}`,
                                        {
                                            message:
                                                'Are you sure you want to delete this enrollment?',
                                        },
                                    )
                                }
                                variant="destructive"
                            >
                                Delete Enrollment
                            </Button>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Enrollment Overview</CardTitle>
                        <CardDescription>
                            Key information and statistics for this enrollment.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <StatCard
                                title="Student"
                                value={
                                    <UserCell
                                        id={enrollment.student.id}
                                        name={`${enrollment.student.first_name} ${enrollment.student.last_name}`}
                                    />
                                }
                                trend="up"
                                description="Enrolled student"
                            />
                            <StatCard
                                title="Student ID"
                                value={enrollment.student.student_number}
                                trend="up"
                                description="Unique identification number"
                            />
                            <StatCard
                                title="Academic Year"
                                value={enrollment.academicYear.name}
                                trend="up"
                                description="Academic year of enrollment"
                            />
                            <StatCard
                                title="Class"
                                value={enrollment.academicClass.name}
                                trend="up"
                                description="Assigned class"
                            />
                            {enrollment.section && (
                                <StatCard
                                    title="Section"
                                    value={enrollment.section.name}
                                    trend="up"
                                    description="Assigned section"
                                />
                            )}
                            <StatCard
                                title="Enrollment Date"
                                value={
                                    <DateCell value={enrollment.enrolled_on} />
                                }
                                trend="up"
                                description="Date of enrollment"
                            />
                            <StatCard
                                title="Status"
                                value={
                                    <Badge
                                        className={
                                            enrollment.status === 'active'
                                                ? 'bg-success/20 text-success'
                                                : enrollment.status ===
                                                    'completed'
                                                  ? 'bg-muted/20 text-muted-foreground'
                                                  : enrollment.status ===
                                                      'withdrawn'
                                                    ? 'bg-destructive/20 text-destructive'
                                                    : 'bg-primary/20 text-primary'
                                        }
                                    >
                                        {enrollment.status
                                            .charAt(0)
                                            .toUpperCase() +
                                            enrollment.status.slice(1)}
                                    </Badge>
                                }
                                trend="up"
                                description="Current enrollment status"
                            />
                        </div>

                        <div className="space-y-4">
                            <Tabs defaultValue="info">
                                <TabsList className="grid w-[200px] grid-cols-1">
                                    <TabsTrigger value="info">
                                        Information
                                    </TabsTrigger>
                                    <TabsTrigger value="attendance">
                                        Attendance
                                    </TabsTrigger>
                                    <TabsTrigger value="assessments">
                                        Assessments
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="info">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                Student Name:
                                            </p>
                                            <p className="text-muted-foreground">
                                                {enrollment.student.first_name}{' '}
                                                {enrollment.student.last_name}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                Date of Birth:
                                            </p>
                                            <p className="text-muted-foreground">
                                                {enrollment.student
                                                    .date_of_birth
                                                    ? new Date(
                                                          enrollment.student
                                                              .date_of_birth,
                                                      ).toLocaleDateString()
                                                    : 'Not specified'}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                Student Number:
                                            </p>
                                            <p className="text-muted-foreground">
                                                {enrollment.student
                                                    .student_number ??
                                                    'Not specified'}
                                            </p>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="attendance">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                Attendance Breakdown:
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="rounded border p-3">
                                                <p className="font-medium">
                                                    Present
                                                </p>
                                                <p className="text-2xl font-bold">
                                                    {enrollment.attendance
                                                        .present ?? 0}
                                                </p>
                                            </div>
                                            <div className="rounded border p-3">
                                                <p className="font-medium">
                                                    Absent
                                                </p>
                                                <p className="text-2xl font-bold">
                                                    {enrollment.attendance
                                                        .absent ?? 0}
                                                </p>
                                            </div>
                                            <div className="rounded border p-3">
                                                <p className="font-medium">
                                                    Late
                                                </p>
                                                <p className="text-2xl font-bold">
                                                    {enrollment.attendance
                                                        .late ?? 0}
                                                </p>
                                            </div>
                                            <div className="rounded border p-3">
                                                <p className="font-medium">
                                                    Excused
                                                </p>
                                                <p className="text-2xl font-bold">
                                                    {enrollment.attendance
                                                        .excused ?? 0}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <p className="font-medium">
                                                Attendance Rate:
                                            </p>
                                            <p className="text-2xl font-bold">
                                                {enrollment.attendance.present
                                                    ? Math.round(
                                                          (enrollment.attendance
                                                              .present /
                                                              (enrollment
                                                                  .attendance
                                                                  .present +
                                                                  (enrollment
                                                                      .attendance
                                                                      .absent ??
                                                                      0) +
                                                                  (enrollment
                                                                      .attendance
                                                                      .late ??
                                                                      0) +
                                                                  (enrollment
                                                                      .attendance
                                                                      .excused ??
                                                                      0))) *
                                                              100,
                                                      )
                                                    : 0}
                                                %
                                            </p>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="assessments">
                                    <div className="space-y-4">
                                        {enrollment.assessments.length > 0 ? (
                                            <div className="space-y-2">
                                                {enrollment.assessments.map(
                                                    (assessment, index) => (
                                                        <div
                                                            key={index}
                                                            className="rounded border p-3"
                                                        >
                                                            <p className="font-medium">
                                                                {
                                                                    assessment.title
                                                                }
                                                            </p>
                                                            <p className="text-muted-foreground text-sm">
                                                                {
                                                                    assessment.date
                                                                }
                                                            </p>
                                                            <div className="mt-1 flex items-baseline">
                                                                <p className="text-lg font-medium">
                                                                    {
                                                                        assessment.score
                                                                    }
                                                                    /
                                                                    {
                                                                        assessment.maxScore
                                                                    }
                                                                </p>
                                                                <p className="text-muted-foreground ml-2 text-sm">
                                                                    (
                                                                    {Math.round(
                                                                        (assessment.score /
                                                                            assessment.maxScore) *
                                                                            100,
                                                                    )}
                                                                    %)
                                                                </p>
                                                            </div>
                                                            {assessment.comment && (
                                                                <div className="mt-2">
                                                                    <p className="text-sm font-medium">
                                                                        Comment:
                                                                    </p>
                                                                    <p className="text-muted-foreground text-sm">
                                                                        {
                                                                            assessment.comment
                                                                        }
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground">
                                                No assessments recorded for this
                                                enrollment
                                            </p>
                                        )}
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
