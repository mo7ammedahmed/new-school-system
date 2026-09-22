import { Head, router } from '@inertiajs/react';

type Row = {
    student: string;
    studentNumber: string;
    section: string;
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
};
type Props = {
    school: { id: number; name: string };
    filters: { section_id?: string; from?: string; to?: string };
    rows: Row[];
};

export default function AttendanceReport({ school, filters, rows }: Props) {
    return (
        <>
            <Head title={`Attendance report — ${school.name}`} />
            <main className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">
                        Attendance report — {school.name}
                    </h1>
                    <a
                        className="rounded border px-3 py-2"
                        href={`/admin/schools/${school.id}/reports/attendance.csv?from=${filters.from ?? ''}&to=${filters.to ?? ''}`}
                    >
                        Export CSV
                    </a>
                </div>
                <form
                    className="flex flex-wrap gap-2"
                    onSubmit={(event) => {
                        event.preventDefault();
                        const form = new FormData(event.currentTarget);
                        router.get(
                            `/admin/schools/${school.id}/reports/attendance`,
                            Object.fromEntries(form),
                        );
                    }}
                >
                    <input
                        name="from"
                        type="date"
                        defaultValue={filters.from}
                        className="rounded border p-2"
                    />
                    <input
                        name="to"
                        type="date"
                        defaultValue={filters.to}
                        className="rounded border p-2"
                    />
                    <button className="bg-primary text-primary-foreground rounded px-3 py-2">
                        Apply filters
                    </button>
                </form>
                <div className="overflow-x-auto rounded border">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="p-3">Student</th>
                                <th>Section</th>
                                <th>Present</th>
                                <th>Absent</th>
                                <th>Late</th>
                                <th>Excused</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr
                                    key={row.studentNumber}
                                    className="border-b"
                                >
                                    <td className="p-3">
                                        {row.student} ({row.studentNumber})
                                    </td>
                                    <td>{row.section}</td>
                                    <td>{row.present}</td>
                                    <td>{row.absent}</td>
                                    <td>{row.late}</td>
                                    <td>{row.excused}</td>
                                    <td>{row.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </>
    );
}
