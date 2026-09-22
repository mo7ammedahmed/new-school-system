import { Head, router } from '@inertiajs/react';
import { ClipboardCheck, Filter, GraduationCap, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ComponentType } from 'react';

type Application = {
    id: number;
    student_name: string;
    guardian_name: string;
    guardian_email: string;
    status: string;
    student_id?: number | null;
    submitted_at?: string;
};
type Props = {
    school: { id: number; name: string };
    applications: Application[];
    years: Array<{ id: number; name: string }>;
    classes: Array<{
        id: number;
        name: string;
        sections: Array<{ id: number; name: string }>;
    }>;
};
const statuses = ['pending', 'reviewing', 'accepted', 'rejected', 'withdrawn'];
const statusLabels: Record<string, string> = {
    pending: 'Pending',
    reviewing: 'Reviewing',
    accepted: 'Accepted',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
};
const statusStyles: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-800',
    reviewing: 'bg-blue-50 text-blue-800',
    accepted: 'bg-emerald-50 text-emerald-800',
    rejected: 'bg-red-50 text-red-800',
    withdrawn: 'bg-slate-100 text-slate-700',
};

export default function AdmissionsIndex({
    school,
    applications,
    years,
    classes,
}: Props) {
    const [filter, setFilter] = useState('all');
    const visible = useMemo(
        () =>
            filter === 'all'
                ? applications
                : applications.filter(
                      (application) => application.status === filter,
                  ),
        [applications, filter],
    );
    function updateStatus(application: Application, status: string) {
        router.patch(
            `/admin/schools/${school.id}/applications/${application.id}/status`,
            { status },
        );
    }
    return (
        <>
            <Head title={`Admissions — ${school.name}`} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="text-muted-foreground text-sm font-bold">
                            Admissions workspace
                        </p>
                        <h1 className="mt-1 text-3xl font-black">
                            {school.name}
                        </h1>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Review applications, convert accepted students, and
                            enroll them into a class.
                        </p>
                    </div>
                    <div className="bg-background flex items-center gap-2 rounded-xl border px-3 py-2">
                        <Filter size={16} />
                        <label htmlFor="status-filter" className="sr-only">
                            Filter applications
                        </label>
                        <select
                            id="status-filter"
                            className="bg-transparent text-sm font-bold outline-none"
                            value={filter}
                            onChange={(event) => setFilter(event.target.value)}
                        >
                            <option value="all">
                                All applications ({applications.length})
                            </option>
                            {statuses.map((status) => (
                                <option key={status} value={status}>
                                    {statusLabels[status]} (
                                    {
                                        applications.filter(
                                            (item) => item.status === status,
                                        ).length
                                    }
                                    )
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                    <Metric
                        icon={ClipboardCheck}
                        label="Total applications"
                        value={applications.length}
                    />
                    <Metric
                        icon={UserRound}
                        label="Awaiting review"
                        value={
                            applications.filter(
                                (item) => item.status === 'pending',
                            ).length
                        }
                    />
                    <Metric
                        icon={GraduationCap}
                        label="Accepted"
                        value={
                            applications.filter(
                                (item) => item.status === 'accepted',
                            ).length
                        }
                    />
                </div>
                {visible.length === 0 ? (
                    <div className="text-muted-foreground rounded-2xl border border-dashed p-12 text-center">
                        No applications match this filter.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {visible.map((application) => (
                            <article
                                key={application.id}
                                className="bg-card rounded-2xl border p-5 shadow-sm"
                            >
                                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h2 className="font-black">
                                                {application.student_name}
                                            </h2>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[application.status] ?? statusStyles.pending}`}
                                            >
                                                {statusLabels[
                                                    application.status
                                                ] ?? application.status}
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground mt-2 text-sm">
                                            Guardian:{' '}
                                            {application.guardian_name} ·{' '}
                                            {application.guardian_email}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <label
                                            htmlFor={`status-${application.id}`}
                                            className="sr-only"
                                        >
                                            Update status
                                        </label>
                                        <select
                                            id={`status-${application.id}`}
                                            className="bg-background rounded-lg border px-3 py-2 text-sm"
                                            value={application.status}
                                            onChange={(event) =>
                                                updateStatus(
                                                    application,
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            {statuses.map((status) => (
                                                <option
                                                    key={status}
                                                    value={status}
                                                >
                                                    {statusLabels[status]}
                                                </option>
                                            ))}
                                        </select>
                                        {!application.student_id &&
                                            application.status !==
                                                'rejected' && (
                                                <button
                                                    type="button"
                                                    className="bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm font-bold"
                                                    onClick={() =>
                                                        router.post(
                                                            `/admin/schools/${school.id}/applications/${application.id}/accept`,
                                                        )
                                                    }
                                                >
                                                    Accept & create student
                                                </button>
                                            )}
                                    </div>
                                </div>
                                {application.student_id && (
                                    <form
                                        className="mt-5 flex flex-wrap gap-2 border-t pt-5"
                                        onSubmit={(event) => {
                                            event.preventDefault();
                                            const form = new FormData(
                                                event.currentTarget,
                                            );
                                            router.post(
                                                `/admin/schools/${school.id}/applications/${application.id}/enroll`,
                                                Object.fromEntries(form),
                                            );
                                        }}
                                    >
                                        <span className="text-muted-foreground flex items-center gap-2 text-sm font-bold">
                                            <GraduationCap size={16} /> Enroll
                                            student
                                        </span>
                                        <select
                                            name="academic_year_id"
                                            required
                                            className="bg-background rounded-lg border px-3 py-2 text-sm"
                                        >
                                            <option value="">Year</option>
                                            {years.map((year) => (
                                                <option
                                                    key={year.id}
                                                    value={year.id}
                                                >
                                                    {year.name}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            name="class_id"
                                            required
                                            className="bg-background rounded-lg border px-3 py-2 text-sm"
                                        >
                                            <option value="">Class</option>
                                            {classes.map((item) => (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                >
                                                    {item.name}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            name="enrolled_on"
                                            type="date"
                                            required
                                            className="bg-background rounded-lg border px-3 py-2 text-sm"
                                        />
                                        <button className="rounded-lg border px-4 py-2 text-sm font-bold">
                                            Enroll
                                        </button>
                                    </form>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
function Metric({
    icon: Icon,
    label,
    value,
}: {
    icon: ComponentType<{ size?: number }>;
    label: string;
    value: number;
}) {
    return (
        <div className="bg-card flex items-center gap-4 rounded-2xl border p-5">
            <div className="bg-muted grid size-10 place-items-center rounded-xl">
                <Icon size={19} />
            </div>
            <div>
                <p className="text-2xl font-black">{value}</p>
                <p className="text-muted-foreground text-xs font-bold">
                    {label}
                </p>
            </div>
        </div>
    );
}
