import { Head, Link, router } from '@inertiajs/react';

type School = { id: number; name: string };
type Row = {
    id: number;
    student: string;
    studentNumber: string;
    invoice: string;
    installment: number;
    dueOn: string;
    amountMinor: number;
    paidMinor: number;
    outstandingMinor: number;
    status: string;
};
type FailedPayment = {
    id: number;
    student: string;
    invoice: string;
    amountMinor: number;
    failedAt: string;
};
type Summary = {
    revenueMinor: number;
    receiptCount: number;
    failedPaymentCount: number;
    failedPaymentMinor: number;
    outstandingMinor: number;
};
type Props = {
    school: School;
    rows: Row[];
    failedPayments: FailedPayment[];
    summary: Summary;
};

export default function FinanceReport({
    school,
    rows,
    failedPayments,
    summary,
}: Props) {
    const money = (minor: number) => `${(minor / 100).toFixed(2)} SAR`;
    const manualMatch = (row: Row) => {
        const reference = window.prompt('Manual payment reference');
        const amount = window.prompt(
            `Amount in halalas (maximum ${row.outstandingMinor})`,
        );
        if (
            reference &&
            amount &&
            Number.isInteger(Number(amount)) &&
            Number(amount) > 0
        )
            router.post(`/admin/installments/${row.id}/manual-payment`, {
                amount_minor: Number(amount),
                reference,
            });
    };
    const retry = (id: number) =>
        router.post(`/admin/payment-intents/${id}/retry`);
    return (
        <>
            <Head title={`Finance — ${school.name}`} />
            <main className="mx-auto max-w-6xl space-y-6 p-6">
                <header className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-semibold">
                            Finance reconciliation
                        </h1>
                        <p className="text-muted-foreground">
                            Revenue, failed payments, and open balances for{' '}
                            {school.name}.
                        </p>
                    </div>
                    <Link
                        className="rounded border px-4 py-2"
                        href={`/admin/schools/${school.id}/reports/finance.csv`}
                    >
                        Export outstanding CSV
                    </Link>
                </header>
                <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <article className="rounded-xl border p-4">
                        <p className="text-muted-foreground text-sm">
                            Collected revenue
                        </p>
                        <p className="text-2xl font-semibold">
                            {money(summary.revenueMinor)}
                        </p>
                        <p className="text-muted-foreground text-xs">
                            {summary.receiptCount} receipts
                        </p>
                    </article>
                    <article className="rounded-xl border p-4">
                        <p className="text-muted-foreground text-sm">
                            Outstanding
                        </p>
                        <p className="text-2xl font-semibold">
                            {money(summary.outstandingMinor)}
                        </p>
                    </article>
                    <article className="rounded-xl border p-4">
                        <p className="text-muted-foreground text-sm">
                            Failed payments
                        </p>
                        <p className="text-2xl font-semibold">
                            {summary.failedPaymentCount}
                        </p>
                    </article>
                    <article className="rounded-xl border p-4">
                        <p className="text-muted-foreground text-sm">
                            Failed amount
                        </p>
                        <p className="text-2xl font-semibold">
                            {money(summary.failedPaymentMinor)}
                        </p>
                    </article>
                </section>
                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">
                        Failed payment queue
                    </h2>
                    {failedPayments.length ? (
                        <div className="divide-y rounded-xl border">
                            {failedPayments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="flex flex-wrap items-center justify-between gap-3 p-4"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {payment.student} ·{' '}
                                            {payment.invoice}
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                            {money(payment.amountMinor)} ·
                                            failed{' '}
                                            {new Date(
                                                payment.failedAt,
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="rounded border px-3 py-1"
                                        onClick={() => retry(payment.id)}
                                    >
                                        Retry
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">
                            No failed payments.
                        </p>
                    )}
                </section>
                <section className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b">
                            <tr>
                                <th className="p-3">Student</th>
                                <th className="p-3">Invoice</th>
                                <th className="p-3">Due</th>
                                <th className="p-3">Amount</th>
                                <th className="p-3">Paid</th>
                                <th className="p-3">Outstanding</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {rows.map((row) => (
                                <tr key={`${row.invoice}-${row.installment}`}>
                                    <td className="p-3">
                                        {row.student}
                                        <span className="text-muted-foreground block text-xs">
                                            {row.studentNumber}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {row.invoice} · #{row.installment}
                                    </td>
                                    <td className="p-3">{row.dueOn}</td>
                                    <td className="p-3">
                                        {money(row.amountMinor)}
                                    </td>
                                    <td className="p-3">
                                        {money(row.paidMinor)}
                                    </td>
                                    <td className="p-3 font-medium">
                                        {money(row.outstandingMinor)}
                                    </td>
                                    <td className="p-3">{row.status}</td>
                                    <td className="p-3">
                                        <button
                                            type="button"
                                            className="rounded border px-2 py-1"
                                            onClick={() => manualMatch(row)}
                                        >
                                            Match manual
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!rows.length && (
                                <tr>
                                    <td
                                        className="text-muted-foreground p-5"
                                        colSpan={8}
                                    >
                                        No outstanding balances.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>
            </main>
        </>
    );
}
