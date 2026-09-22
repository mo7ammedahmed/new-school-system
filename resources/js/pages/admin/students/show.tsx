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
import { Badge } from '@/components/ui/badge';
import { DateCell } from '@/components/data-display/date-cell';
import { UserCell } from '@/components/data-display/user-cell';
import { MoneyCell } from '@/components/data-display/money-cell';
import { StatCard } from '@/components/dashboard/stat-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Props = {
    student: {
        id: number;
        name: string;
        studentNumber: string;
        school: string;
        enrollments: Array<{
            year: string;
            class: string;
            section: string | null;
        }>;
        attendance: Record<string, number>;
        assessments: Array<{
            title: string;
            score: number;
            maxScore: number;
            date: string;
            comment: string | null;
        }>;
        snapshots: Array<{
            id: number;
            term: string;
            issuedAt: string;
            enrollment: number;
            attendance: Record<string, number>;
            assessments: Array<{
                title: string;
                score: number;
                maxScore: number;
                date: string;
                comment: string | null;
            }>;
        }>;
        canIssueSnapshot: boolean;
    };
};

export default function StudentShow({ student }: Props) {
    // Calculate attendance rate from student.attendance record
    const attendance = student.attendance || {};
    const present = attendance.present || 0;
    const absent = attendance.absent || 0;
    const late = attendance.late || 0;
    const excused = attendance.excused || 0;
    const total = present + absent + late + excused;
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

    return (
        <>
            <Head title={`Student: ${student.name}`} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        Student: {student.name}
                    </h1>
                    <div className="mt-4 flex flex-wrap gap-4 md:mt-0">
                        <Button href="/admin/students" variant="outline">
                            Back to Students
                        </Button>
                        <Button
                            href={`/admin/students/${student.id}/edit`}
                            variant="default"
                        >
                            Edit Student
                        </Button>
                        {student.canIssueSnapshot && (
                            <Button
                                href={`/admin/students/${student.id}/issue-snapshot`}
                                variant="default"
                            >
                                Issue Report Card
                            </Button>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Student Overview</CardTitle>
                        <CardDescription>
                            Key information and statistics for this student.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <StatCard
                                title="Student ID"
                                value={student.studentNumber}
                                trend="up"
                                description="Unique identification number"
                            />
                            <StatCard
                                title="Current School"
                                value={student.school}
                                trend="up"
                                description="Currently enrolled school"
                            />
                            <StatCard
                                title="Current Enrollments"
                                value={student.enrollments.length}
                                trend="up"
                                description="Active class enrollments"
                            />
                            <StatCard
                                title="Attendance Rate"
                                value={`${attendanceRate}%`}
                                trend="up"
                                description="Percentage of present days"
                            />
                        </div>

                        <div className="space-y-4">
                            <Tabs defaultValue="info">
                                <TabsList className="grid w-[200px] grid-cols-1">
                                    <TabsTrigger value="info">
                                        Information
                                    </TabsTrigger>
                                    <TabsTrigger value="enrollments">
                                        Enrollments
                                    </TabsTrigger>
                                    <TabsTrigger value="assessments">
                                        Assessments
                                    </TabsTrigger>
                                    <TabsTrigger value="attendance">
                                        Attendance
                                    </TabsTrigger>
                                    <TabsTrigger value="snapshots">
                                        Snapshots
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="info">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <p className="font-medium">Name:</p>
                                            <p className="text-muted-foreground">
                                                {student.name}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                Student ID:
                                            </p>
                                            <p className="text-muted-foreground">
                                                {student.studentNumber}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                School:
                                            </p>
                                            <p className="text-muted-foreground">
                                                {student.school}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                Date of Birth:
                                            </p>
                                            {/* This would come from the student record - for now showing placeholder */}
                                            <p className="text-muted-foreground">
                                                Date of birth
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                Gender:
                                            </p>
                                            {/* This would come from the student record - for now showing placeholder */}
                                            <p className="text-muted-foreground">
                                                Gender
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                Phone:
                                            </p>
                                            <p className="text-muted-foreground">
                                                {/* Phone from student record */}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                Email:
                                            </p>
                                            <p className="text-muted-foreground">
                                                {/* Email from student record */}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                Address:
                                            </p>
                                            <p className="text-muted-foreground">
                                                {/* Address from student record */}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                Status:
                                            </p>
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                    /* Status from student record */
                                                    'bg-success/20 text-success'
                                                }`}
                                            >
                                                {/* Status from student record */}
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="enrollments">
                                    <div className="space-y-4">
                                        {student.enrollments.length > 0 ? (
                                            <div className="space-y-2">
                                                {student.enrollments.map(
                                                    (enrollment, index) => (
                                                        <div
                                                            key={index}
                                                            className="rounded border p-3"
                                                        >
                                                            <p className="font-medium">
                                                                Academic Year:
                                                            </p>
                                                            <p className="text-muted-foreground">
                                                                {
                                                                    enrollment.year
                                                                }
                                                            </p>
                                                            <p className="font-medium">
                                                                Class:
                                                            </p>
                                                            <p className="text-muted-foreground">
                                                                {
                                                                    enrollment.class
                                                                }
                                                            </p>
                                                            {enrollment.section && (
                                                                <>
                                                                    <p className="font-medium">
                                                                        Section:
                                                                    </p>
                                                                    <p className="text-muted-foreground">
                                                                        {
                                                                            enrollment.section
                                                                        }
                                                                    </p>
                                                                </>
                                                            )}
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground">
                                                No active enrollments
                                            </p>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="assessments">
                                    <div className="space-y-4">
                                        {student.assessments.length > 0 ? (
                                            <div className="space-y-2">
                                                {student.assessments.map(
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
                                                No assessments recorded
                                            </p>
                                        )}
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
                                                    {student.attendance
                                                        .present ?? 0}
                                                </p>
                                            </div>
                                            <div className="rounded border p-3">
                                                <p className="font-medium">
                                                    Absent
                                                </p>
                                                <p className="text-2xl font-bold">
                                                    {student.attendance
                                                        .absent ?? 0}
                                                </p>
                                            </div>
                                            <div className="rounded border p-3">
                                                <p className="font-medium">
                                                    Late
                                                </p>
                                                <p className="text-2xl font-bold">
                                                    {student.attendance.late ??
                                                        0}
                                                </p>
                                            </div>
                                            <div className="rounded border p-3">
                                                <p className="font-medium">
                                                    Excused
                                                </p>
                                                <p className="text-2xl font-bold">
                                                    {student.attendance
                                                        .excused ?? 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="snapshots">
                                    <div className="space-y-4">
                                        {student.snapshots.length > 0 ? (
                                            <div className="space-y-2">
                                                {student.snapshots.map(
                                                    (snapshot, index) => (
                                                        <div
                                                            key={index}
                                                            className="mb-4 rounded border p-3"
                                                        >
                                                            <p className="font-medium">
                                                                Term:{' '}
                                                                {snapshot.term}
                                                            </p>
                                                            <p className="text-muted-foreground text-sm">
                                                                Issued:{' '}
                                                                {new Date(
                                                                    snapshot.issuedAt,
                                                                ).toLocaleDateString()}
                                                            </p>
                                                            <div className="mt-2">
                                                                <p className="font-medium">
                                                                    Attendance:
                                                                </p>
                                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                                    <div>
                                                                        <p>
                                                                            Present:
                                                                        </p>
                                                                        <p className="font-medium">
                                                                            {snapshot
                                                                                .attendance
                                                                                .present ??
                                                                                0}
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p>
                                                                            Absent:
                                                                        </p>
                                                                        {snapshot
                                                                            .attendance
                                                                            .absent ??
                                                                            0}
                                                                    </div>
                                                                    <div>
                                                                        <p>
                                                                            Late:
                                                                        </p>
                                                                        {snapshot
                                                                            .attendance
                                                                            .late ??
                                                                            0}
                                                                    </div>
                                                                    <div>
                                                                        <p>
                                                                            Excused:
                                                                        </p>
                                                                        {snapshot
                                                                            .attendance
                                                                            .excused ??
                                                                            0}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2">
                                                                <p className="font-medium">
                                                                    Assessments:
                                                                </p>
                                                                {snapshot
                                                                    .assessments
                                                                    .length >
                                                                0 ? (
                                                                    <div className="space-y-1">
                                                                        {snapshot.assessments.map(
                                                                            (
                                                                                assessment,
                                                                                idx,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        idx
                                                                                    }
                                                                                    className="border p-2"
                                                                                >
                                                                                    <p className="font-medium">
                                                                                        {
                                                                                            assessment.title
                                                                                        }
                                                                                    </p>
                                                                                    <p className="text-muted-foreground text-xs">
                                                                                        {
                                                                                            assessment.date
                                                                                        }
                                                                                    </p>
                                                                                    <div className="flex items-baseline">
                                                                                        <p className="font-medium">
                                                                                            {
                                                                                                assessment.score
                                                                                            }
                                                                                            /
                                                                                            {
                                                                                                assessment.maxScore
                                                                                            }
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-muted-foreground">
                                                                        No
                                                                        assessments
                                                                        in this
                                                                        snapshot
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground">
                                                No report card snapshots
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
