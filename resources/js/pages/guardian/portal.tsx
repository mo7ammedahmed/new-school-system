import { Head, Link, router } from '@inertiajs/react';

type Enrollment = { year: string; class: string; section: string | null };
type Attendance = {
    totals: Record<string, number>;
    recent: Array<{ date: string | null; status: string; note: string | null }>;
};
type Notice = {
    id: number;
    title: string;
    body: string;
    publishedAt: string | null;
};
type Progress = {
    title: string;
    score: number;
    maxScore: number;
    assessedOn: string | null;
    comment: string | null;
};
type Installment = {
    id: number;
    sequence: number;
    dueOn: string;
    amountMinor: number;
    paidMinor: number;
    status: string;
};
type Invoice = {
    id: number;
    number: string;
    studentName: string;
    issuedOn: string;
    dueOn: string;
    status: string;
    totalMinor: number;
    currency: string;
    installments: Installment[];
};
type Receipt = {
    id: number;
    number: string;
    invoiceNumber: string;
    studentName: string;
    amountMinor: number;
    currency: string;
    issuedAt: string;
    providerReference: string;
};
type Student = {
    id: number;
    name: string;
    studentNumber: string;
    school: string;
    enrollments: Enrollment[];
    attendance: Attendance;
    progress: Progress[];
};
type Props = {
    guardian: { name: string };
    students: Student[];
    notices: Notice[];
    invoices: Invoice[];
    receipts: Receipt[];
};

export default function GuardianPortal({
    guardian,
    students,
    notices,
    invoices,
    receipts,
}: Props) {
    const startPayment = (installmentId: number) =>
        router.post(`/portal/installments/${installmentId}/payment-intents`, {
            idempotency_key: crypto.randomUUID(),
        });
    return (
        <>
            <Head title="Guardian portal" />
            <main className="space-y-8 p-6">
                <header>
                    <p className="text-muted-foreground text-sm">Welcome</p>
                    <h1 className="text-3xl font-semibold">{guardian.name}</h1>
                </header>
                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">School notices</h2>
                    {notices.length ? (
                        notices.map((notice) => (
                            <article
                                key={notice.id}
                                className="rounded-xl border p-4"
                            >
                                <h3 className="font-medium">{notice.title}</h3>
                                <p className="mt-1 text-sm whitespace-pre-wrap">
                                    {notice.body}
                                </p>
                            </article>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-sm">
                            No notices
                        </p>
                    )}
                </section>
                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Invoices</h2>
                    {invoices.length ? (
                        <div className="divide-y rounded-xl border">
                            {invoices.map((invoice) => (
                                <article
                                    key={invoice.id}
                                    className="space-y-2 p-4"
                                >
                                    <div className="flex flex-wrap justify-between gap-3">
                                        <div>
                                            <h3 className="font-medium">
                                                {invoice.number}
                                            </h3>
                                            <p className="text-muted-foreground text-sm">
                                                {invoice.studentName} · issued{' '}
                                                {invoice.issuedOn} · due{' '}
                                                {invoice.dueOn}
                                            </p>
                                        </div>
                                        <p className="font-medium">
                                            {(invoice.totalMinor / 100).toFixed(
                                                2,
                                            )}{' '}
                                            {invoice.currency} ·{' '}
                                            {invoice.status}
                                        </p>
                                    </div>
                                    {invoice.installments?.length ? (
                                        <div className="text-muted-foreground grid gap-2 text-sm">
                                            {invoice.installments.map(
                                                (part) => (
                                                    <div
                                                        key={part.sequence}
                                                        className="flex flex-wrap items-center justify-between gap-2"
                                                    >
                                                        <span>
                                                            #{part.sequence}:{' '}
                                                            {(
                                                                part.amountMinor /
                                                                100
                                                            ).toFixed(2)}{' '}
                                                            {invoice.currency}{' '}
                                                            due {part.dueOn} ·{' '}
                                                            {part.status}
                                                        </span>
                                                        {part.status !==
                                                        'paid' ? (
                                                            <button
                                                                type="button"
                                                                className="text-foreground rounded border px-3 py-1"
                                                                onClick={() =>
                                                                    startPayment(
                                                                        part.id,
                                                                    )
                                                                }
                                                            >
                                                                Start payment
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ) : null}
                                </article>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">
                            No invoices
                        </p>
                    )}
                </section>
                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Payment receipts</h2>
                    {receipts.length ? (
                        <div className="divide-y rounded-xl border">
                            {receipts.map((receipt) => (
                                <article
                                    key={receipt.id}
                                    className="flex flex-wrap justify-between gap-3 p-4"
                                >
                                    <div>
                                        <h3 className="font-medium">
                                            {receipt.number}
                                        </h3>
                                        <p className="text-muted-foreground text-sm">
                                            {receipt.studentName} ·{' '}
                                            {receipt.invoiceNumber} ·{' '}
                                            {new Date(
                                                receipt.issuedAt,
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="font-medium">
                                            {(
                                                receipt.amountMinor / 100
                                            ).toFixed(2)}{' '}
                                            {receipt.currency}
                                        </p>
                                        <a
                                            className="text-sm underline"
                                            href={`/portal/receipts/${receipt.id}/download`}
                                        >
                                            Download
                                        </a>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">
                            No receipts yet
                        </p>
                    )}
                </section>
                <section className="grid gap-4 md:grid-cols-2">
                    {students.map((student) => (
                        <article
                            key={student.id}
                            className="space-y-3 rounded-xl border p-5"
                        >
                            <div>
                                <h2 className="text-xl font-medium">
                                    {student.name}
                                </h2>
                                <p className="text-muted-foreground text-sm">
                                    {student.school} · {student.studentNumber}
                                </p>
                            </div>
                            <div>
                                {student.enrollments.length ? (
                                    student.enrollments.map((enrollment) => (
                                        <p
                                            key={`${enrollment.year}-${enrollment.class}`}
                                        >
                                            {enrollment.year} ·{' '}
                                            {enrollment.class}
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
                            </div>
                            <div>
                                <h3 className="font-medium">Attendance</h3>
                                <p className="text-muted-foreground text-sm">
                                    Present:{' '}
                                    {student.attendance.totals.present ?? 0} ·
                                    Absent:{' '}
                                    {student.attendance.totals.absent ?? 0} ·
                                    Late: {student.attendance.totals.late ?? 0}
                                </p>
                                {student.attendance.recent
                                    .slice(0, 5)
                                    .map((entry) => (
                                        <p
                                            key={`${entry.date}-${entry.status}`}
                                            className="text-sm"
                                        >
                                            {entry.date}: {entry.status}
                                        </p>
                                    ))}
                            </div>
                            <div>
                                <h3 className="font-medium">Progress</h3>
                                {student.progress.length ? (
                                    student.progress.slice(0, 5).map((item) => (
                                        <p
                                            key={`${item.title}-${item.assessedOn}`}
                                            className="text-sm"
                                        >
                                            {item.title}: {item.score}/
                                            {item.maxScore} ({item.assessedOn})
                                        </p>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground text-sm">
                                        No assessments yet
                                    </p>
                                )}
                            </div>
                            <Link
                                className="text-sm underline"
                                href={`/portal/students/${student.id}`}
                            >
                                View student
                            </Link>
                        </article>
                    ))}
                </section>
            </main>
        </>
    );
}
