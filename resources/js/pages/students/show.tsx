import { Head, useForm } from '@inertiajs/react';

type Snapshot = {
    id: number;
    term: string;
    issuedAt: string;
    enrollment: unknown;
    attendance: Record<string, number>;
    assessments: unknown[];
};
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
            date: string | null;
            comment: string | null;
        }>;
        snapshots: Snapshot[];
        canIssueSnapshot: boolean;
    };
};

export default function StudentShow({ student }: Props) {
    const form = useForm({ term: '' });
    return (
        <>
            <Head title={student.name} />
            <div className="mx-auto max-w-4xl space-y-6 p-6 print:max-w-none print:p-0">
                <div className="flex justify-end print:hidden">
                    <button
                        className="rounded border px-3 py-2"
                        onClick={() => window.print()}
                    >
                        Print report card
                    </button>
                </div>
                <p className="text-muted-foreground text-sm">
                    {student.school}
                </p>
                <h1 className="text-3xl font-semibold">{student.name}</h1>
                <p>Student number: {student.studentNumber}</p>
                <section className="rounded-xl border p-5">
                    <h2 className="text-xl font-medium">Enrollment</h2>
                    {student.enrollments.length ? (
                        student.enrollments.map((enrollment) => (
                            <p key={`${enrollment.year}-${enrollment.class}`}>
                                {enrollment.year} · {enrollment.class}
                                {enrollment.section
                                    ? ` · Section ${enrollment.section}`
                                    : ''}
                            </p>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-sm">
                            No active enrollment
                        </p>
                    )}
                </section>
                <section className="rounded-xl border p-5">
                    <h2 className="text-xl font-medium">Attendance summary</h2>
                    <p>
                        Present: {student.attendance.present ?? 0} · Absent:{' '}
                        {student.attendance.absent ?? 0} · Late:{' '}
                        {student.attendance.late ?? 0} · Excused:{' '}
                        {student.attendance.excused ?? 0}
                    </p>
                </section>
                <section className="rounded-xl border p-5">
                    <h2 className="text-xl font-medium">Assessments</h2>
                    {student.assessments.length ? (
                        <div className="divide-y">
                            {student.assessments.map((assessment) => (
                                <div
                                    key={`${assessment.title}-${assessment.date}`}
                                    className="py-3"
                                >
                                    <p className="font-medium">
                                        {assessment.title}: {assessment.score}/
                                        {assessment.maxScore}
                                    </p>
                                    <p className="text-muted-foreground text-sm">
                                        {assessment.date}
                                        {assessment.comment
                                            ? ` · ${assessment.comment}`
                                            : ''}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">
                            No assessments yet
                        </p>
                    )}
                </section>
                <section className="rounded-xl border p-5">
                    <h2 className="text-xl font-medium">Issued report cards</h2>
                    {student.canIssueSnapshot && (
                        <form
                            className="mb-4 flex gap-2 print:hidden"
                            onSubmit={(event) => {
                                event.preventDefault();
                                form.post(
                                    `/portal/students/${student.id}/report-card/snapshots`,
                                );
                            }}
                        >
                            <input
                                required
                                placeholder="Term, e.g. 2026 Term 1"
                                value={form.data.term}
                                onChange={(event) =>
                                    form.setData('term', event.target.value)
                                }
                                className="rounded border p-2"
                            />
                            <button className="rounded border px-3 py-2">
                                Issue snapshot
                            </button>
                        </form>
                    )}
                    {student.snapshots.length ? (
                        student.snapshots.map((snapshot) => (
                            <p key={snapshot.id}>
                                {snapshot.term} · issued{' '}
                                {new Date(
                                    snapshot.issuedAt,
                                ).toLocaleDateString()}{' '}
                                ·{' '}
                                {Object.values(snapshot.attendance).reduce(
                                    (sum, count) => sum + count,
                                    0,
                                )}{' '}
                                attendance records ·{' '}
                                {snapshot.assessments.length} assessments ·{' '}
                                <a
                                    className="underline"
                                    href={`/portal/report-card-snapshots/${snapshot.id}/download`}
                                >
                                    Download printable copy
                                </a>
                            </p>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-sm">
                            No issued snapshots yet
                        </p>
                    )}
                </section>
            </div>
        </>
    );
}
