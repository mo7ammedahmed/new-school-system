import { Head, router } from '@inertiajs/react';
import type { FormEvent } from 'react';

type Student = { id: number; name: string };
type AttendanceRecord = {
    id: number;
    student: string;
    status: string;
    note: string | null;
};
type Section = {
    id: number;
    name: string;
    school: string;
    students: Student[];
    sessions: Array<{
        id: number;
        date: string | null;
        records: AttendanceRecord[];
    }>;
};
type Props = { teacher: { name: string }; sections: Section[] };

export default function TeacherPortal({ teacher, sections }: Props) {
    function submit(section: Section, event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const fieldValue = (name: string) => {
            const value = form.get(name);
            return typeof value === 'string' ? value : '';
        };
        const records = section.students.map((student) => ({
            student_id: student.id,
            status: fieldValue(`status_${student.id}`),
            note: fieldValue(`note_${student.id}`),
        }));
        router.post(`/portal/sections/${section.id}/attendance`, {
            attendance_date: form.get('attendance_date'),
            records,
        });
    }
    return (
        <>
            <Head title="Teacher workspace" />
            <main className="space-y-8 p-6">
                <h1 className="text-3xl font-semibold">
                    Welcome, {teacher.name}
                </h1>
                {sections.map((section) => (
                    <div key={section.id} className="space-y-4">
                        <form
                            onSubmit={(event) => submit(section, event)}
                            className="space-y-4 rounded-xl border p-5"
                        >
                            <div>
                                <h2 className="text-xl font-medium">
                                    {section.name}
                                </h2>
                                <p className="text-muted-foreground text-sm">
                                    {section.school} · {section.students.length}{' '}
                                    students
                                </p>
                            </div>
                            <input
                                name="attendance_date"
                                type="date"
                                required
                                className="rounded border p-2"
                            />
                            {section.students.map((student) => (
                                <div
                                    key={student.id}
                                    className="grid gap-2 md:grid-cols-[1fr_auto_2fr]"
                                >
                                    <span>{student.name}</span>
                                    <select
                                        name={`status_${student.id}`}
                                        defaultValue="present"
                                        className="rounded border p-2"
                                    >
                                        <option>present</option>
                                        <option>absent</option>
                                        <option>late</option>
                                        <option>excused</option>
                                    </select>
                                    <input
                                        name={`note_${student.id}`}
                                        placeholder="Note (optional)"
                                        className="rounded border p-2"
                                    />
                                </div>
                            ))}
                            <button className="bg-primary text-primary-foreground rounded px-3 py-2">
                                Save attendance
                            </button>
                        </form>
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                const form = new FormData(event.currentTarget);
                                router.post(
                                    `/portal/sections/${section.id}/assessments`,
                                    {
                                        title: form.get('title'),
                                        assessed_on: form.get('assessed_on'),
                                        max_score: form.get('max_score'),
                                        records: section.students.map(
                                            (student) => ({
                                                student_id: student.id,
                                                score: form.get(
                                                    `score_${student.id}`,
                                                ),
                                                comment: form.get(
                                                    `comment_${student.id}`,
                                                ),
                                            }),
                                        ),
                                    },
                                );
                            }}
                            className="space-y-3 rounded-xl border p-5"
                        >
                            <h3 className="font-medium">Record assessment</h3>
                            <div className="flex flex-wrap gap-2">
                                <input
                                    name="title"
                                    required
                                    placeholder="Assessment title"
                                    className="rounded border p-2"
                                />
                                <input
                                    name="assessed_on"
                                    required
                                    type="date"
                                    className="rounded border p-2"
                                />
                                <input
                                    name="max_score"
                                    required
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    placeholder="Max score"
                                    className="rounded border p-2"
                                />
                            </div>
                            {section.students.map((student) => (
                                <div
                                    key={student.id}
                                    className="grid gap-2 md:grid-cols-[1fr_1fr_2fr]"
                                >
                                    <span>{student.name}</span>
                                    <input
                                        name={`score_${student.id}`}
                                        required
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="Score"
                                        className="rounded border p-2"
                                    />
                                    <input
                                        name={`comment_${student.id}`}
                                        placeholder="Comment"
                                        className="rounded border p-2"
                                    />
                                </div>
                            ))}
                            <button className="bg-primary text-primary-foreground rounded px-3 py-2">
                                Save assessment
                            </button>
                        </form>
                        <section className="rounded-xl border p-5">
                            <h3 className="mb-3 font-medium">
                                Recent attendance
                            </h3>
                            {section.sessions.length ? (
                                section.sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="space-y-2 border-t py-3"
                                    >
                                        <p className="font-medium">
                                            {session.date}
                                        </p>
                                        {session.records.map((record) => (
                                            <form
                                                key={record.id}
                                                className="grid gap-2 md:grid-cols-[1fr_auto_2fr_auto]"
                                                onSubmit={(event) => {
                                                    event.preventDefault();
                                                    const data = new FormData(
                                                        event.currentTarget,
                                                    );
                                                    router.patch(
                                                        `/portal/attendance/${record.id}`,
                                                        {
                                                            status: data.get(
                                                                'status',
                                                            ),
                                                            note: data.get(
                                                                'note',
                                                            ),
                                                        },
                                                    );
                                                }}
                                            >
                                                <span>{record.student}</span>
                                                <select
                                                    name="status"
                                                    defaultValue={record.status}
                                                    className="rounded border p-2"
                                                >
                                                    <option>present</option>
                                                    <option>absent</option>
                                                    <option>late</option>
                                                    <option>excused</option>
                                                </select>
                                                <input
                                                    name="note"
                                                    defaultValue={
                                                        record.note ?? ''
                                                    }
                                                    className="rounded border p-2"
                                                />
                                                <button className="rounded border px-3 py-2">
                                                    Correct
                                                </button>
                                            </form>
                                        ))}
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-sm">
                                    No attendance recorded yet.
                                </p>
                            )}
                        </section>
                    </div>
                ))}
            </main>
        </>
    );
}
