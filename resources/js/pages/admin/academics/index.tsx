import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type Props = {
    school: { id: number; name: string };
    years: Array<{
        id: number;
        name: string;
        starts_on: string;
        ends_on: string;
    }>;
    classes: Array<{
        id: number;
        name: string;
        sections: Array<{ id: number; name: string }>;
    }>;
    students: Array<{
        id: number;
        first_name: string;
        last_name: string;
        student_number: string;
        user_id: number | null;
    }>;
    studentAccounts: Array<{ id: number; name: string; email: string }>;
    teachers: Array<{ id: number; name: string; email: string }>;
};

export default function AcademicIndex({
    school,
    years,
    classes,
    students,
    studentAccounts,
    teachers,
}: Props) {
    const yearForm = useForm({
        name: '',
        starts_on: '',
        ends_on: '',
        is_current: false,
    });
    const classForm = useForm({ name: '' });
    const enrollmentForm = useForm({
        student_id: '',
        academic_year_id: '',
        class_id: '',
        section_id: '',
        enrolled_on: '',
    });
    const assignmentForm = useForm({ teacher_id: '', section_id: '' });
    const linkForm = useForm({ student_id: '', user_id: '' });
    const post = (
        form: { post: (url: string) => void },
        url: string,
        event: FormEvent,
    ) => {
        event.preventDefault();
        form.post(url);
    };

    return (
        <>
            <Head title={`Academics — ${school.name}`} />
            <div className="space-y-8 p-6">
                <h1 className="text-2xl font-semibold">
                    Academics — {school.name}
                </h1>
                <form
                    onSubmit={(event) =>
                        post(
                            yearForm,
                            `/admin/schools/${school.id}/academics/years`,
                            event,
                        )
                    }
                    className="grid gap-2 rounded border p-4"
                >
                    <h2 className="font-medium">Academic year</h2>
                    <input
                        className="rounded border p-2"
                        placeholder="2026–2027"
                        value={yearForm.data.name}
                        onChange={(e) =>
                            yearForm.setData('name', e.target.value)
                        }
                    />
                    <div className="flex gap-2">
                        <input
                            type="date"
                            className="rounded border p-2"
                            value={yearForm.data.starts_on}
                            onChange={(e) =>
                                yearForm.setData('starts_on', e.target.value)
                            }
                        />
                        <input
                            type="date"
                            className="rounded border p-2"
                            value={yearForm.data.ends_on}
                            onChange={(e) =>
                                yearForm.setData('ends_on', e.target.value)
                            }
                        />
                    </div>
                    <button className="bg-primary text-primary-foreground rounded px-3 py-2">
                        Add year
                    </button>
                </form>
                <form
                    onSubmit={(event) =>
                        post(
                            classForm,
                            `/admin/schools/${school.id}/academics/classes`,
                            event,
                        )
                    }
                    className="flex gap-2 rounded border p-4"
                >
                    <input
                        className="flex-1 rounded border p-2"
                        placeholder="Class name"
                        value={classForm.data.name}
                        onChange={(e) =>
                            classForm.setData('name', e.target.value)
                        }
                    />
                    <button className="bg-primary text-primary-foreground rounded px-3 py-2">
                        Add class
                    </button>
                </form>
                <section className="rounded border p-4">
                    <h2 className="mb-3 font-medium">Classes and sections</h2>
                    <ul className="space-y-2">
                        {classes.map((item) => (
                            <li key={item.id}>
                                <strong>{item.name}</strong>
                                <span className="text-muted-foreground ml-3 text-sm">
                                    {item.sections
                                        .map((section) => section.name)
                                        .join(', ') || 'No sections'}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
                <form
                    onSubmit={(event) =>
                        post(
                            enrollmentForm,
                            `/admin/schools/${school.id}/academics/enrollments`,
                            event,
                        )
                    }
                    className="grid gap-2 rounded border p-4"
                >
                    <h2 className="font-medium">Enroll student</h2>
                    <select
                        className="rounded border p-2"
                        value={enrollmentForm.data.student_id}
                        onChange={(e) =>
                            enrollmentForm.setData('student_id', e.target.value)
                        }
                    >
                        <option value="">Student</option>
                        {students.map((student) => (
                            <option key={student.id} value={student.id}>
                                {student.first_name} {student.last_name} (
                                {student.student_number})
                            </option>
                        ))}
                    </select>
                    <select
                        className="rounded border p-2"
                        value={enrollmentForm.data.academic_year_id}
                        onChange={(e) =>
                            enrollmentForm.setData(
                                'academic_year_id',
                                e.target.value,
                            )
                        }
                    >
                        <option value="">Academic year</option>
                        {years.map((year) => (
                            <option key={year.id} value={year.id}>
                                {year.name}
                            </option>
                        ))}
                    </select>
                    <select
                        className="rounded border p-2"
                        value={enrollmentForm.data.class_id}
                        onChange={(e) =>
                            enrollmentForm.setData('class_id', e.target.value)
                        }
                    >
                        <option value="">Class</option>
                        {classes.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="date"
                        className="rounded border p-2"
                        value={enrollmentForm.data.enrolled_on}
                        onChange={(e) =>
                            enrollmentForm.setData(
                                'enrolled_on',
                                e.target.value,
                            )
                        }
                    />
                    <button className="bg-primary text-primary-foreground rounded px-3 py-2">
                        Enroll
                    </button>
                </form>
                <form
                    onSubmit={(event) =>
                        post(
                            assignmentForm,
                            `/admin/schools/${school.id}/academics/teacher-assignments`,
                            event,
                        )
                    }
                    className="grid gap-2 rounded border p-4"
                >
                    <h2 className="font-medium">Assign teacher</h2>
                    <select
                        className="rounded border p-2"
                        value={assignmentForm.data.teacher_id}
                        onChange={(e) =>
                            assignmentForm.setData('teacher_id', e.target.value)
                        }
                    >
                        <option value="">Teacher</option>
                        {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                                {teacher.name}
                            </option>
                        ))}
                    </select>
                    <button className="bg-primary text-primary-foreground rounded px-3 py-2">
                        Assign
                    </button>
                </form>
                <section className="rounded border p-4">
                    <h2 className="mb-3 font-medium">Student accounts</h2>
                    <ul className="mb-4 space-y-1 text-sm">
                        {students.map((student) => (
                            <li key={student.id}>
                                {student.first_name} {student.last_name}
                                <span className="text-muted-foreground ml-2">
                                    ({student.student_number})
                                </span>
                                <span className="text-muted-foreground ml-2">
                                    {student.user_id
                                        ? 'Linked to an account'
                                        : 'No account linked'}
                                </span>
                            </li>
                        ))}
                        {students.length === 0 && (
                            <li className="text-muted-foreground">
                                No students yet.
                            </li>
                        )}
                    </ul>
                    <form
                        onSubmit={(event) =>
                            post(
                                linkForm,
                                `/admin/schools/${school.id}/academics/student-accounts`,
                                event,
                            )
                        }
                        className="grid gap-2 md:grid-cols-3"
                    >
                        <select
                            className="rounded border p-2"
                            value={linkForm.data.student_id}
                            onChange={(e) =>
                                linkForm.setData('student_id', e.target.value)
                            }
                        >
                            <option value="">Student record</option>
                            {students.map((student) => (
                                <option key={student.id} value={student.id}>
                                    {student.first_name} {student.last_name} (
                                    {student.student_number})
                                </option>
                            ))}
                        </select>
                        <select
                            className="rounded border p-2"
                            value={linkForm.data.user_id}
                            onChange={(e) =>
                                linkForm.setData('user_id', e.target.value)
                            }
                        >
                            <option value="">Student login</option>
                            {studentAccounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.name} ({account.email})
                                </option>
                            ))}
                        </select>
                        <button className="bg-primary text-primary-foreground rounded px-3 py-2">
                            Link account
                        </button>
                    </form>
                    {linkForm.errors.user_id && (
                        <p className="text-danger-foreground mt-2 text-sm">
                            {linkForm.errors.user_id}
                        </p>
                    )}
                    {linkForm.errors.student_id && (
                        <p className="text-danger-foreground mt-2 text-sm">
                            {linkForm.errors.student_id}
                        </p>
                    )}
                    {studentAccounts.length === 0 && (
                        <p className="text-muted-foreground mt-2 text-sm">
                            No unlinked student logins are available for this
                            school.
                        </p>
                    )}
                </section>
            </div>
        </>
    );
}
