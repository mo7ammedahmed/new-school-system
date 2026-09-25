import { Head, router } from '@inertiajs/react';

type Delivery = {
    id: number;
    type: string;
    recipient: string;
    locale: string;
    status: string;
    attempts: number;
    lastError: string | null;
    sentAt: string | null;
    createdAt: string;
};
type Heartbeat = { worker: string; queue: string; lastSeenAt: string };
type Metrics = {
    queued: number;
    failed: number;
    sent: number;
    failureThreshold: number;
    queueThreshold: number;
    averageSeconds: number;
    queueBacklog: number;
    failedJobs: number;
    workerHeartbeats: Heartbeat[];
};
type Props = { deliveries: Delivery[]; metrics: Metrics };

export default function Deliveries({ deliveries, metrics }: Props) {
    const resend = (id: number) =>
        router.post(`/admin/notifications/deliveries/${id}/resend`);
    const failureAlert = metrics.failed >= metrics.failureThreshold;
    const queueAlert = metrics.queued >= metrics.queueThreshold;
    const card = (label: string, value: string | number, alert = false) => (
        <article
            className={`rounded-xl border p-4 ${alert ? 'border-danger bg-danger-container' : ''}`}
        >
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="text-2xl font-semibold">{value}</p>
        </article>
    );
    return (
        <>
            <Head title="Email and queue monitoring" />
            <main className="mx-auto max-w-6xl space-y-6 p-6">
                <header>
                    <h1 className="text-3xl font-semibold">
                        Email and queue monitoring
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Email metrics cover 24 hours; queue health covers the
                        current backlog and last hour of failures.
                    </p>
                </header>
                <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {card('Email queued, 24h', metrics.queued, queueAlert)}
                    {card('Email failed, 24h', metrics.failed, failureAlert)}
                    {card('Email sent, 24h', metrics.sent)}
                    {card(
                        'Average email send time',
                        `${metrics.averageSeconds}s`,
                    )}
                </section>
                <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                    {card(
                        'Queue backlog',
                        metrics.queueBacklog,
                        metrics.queueBacklog > 0,
                    )}
                    {card(
                        'Failed jobs, last hour',
                        metrics.failedJobs,
                        metrics.failedJobs > 0,
                    )}
                    {card('Worker heartbeats', metrics.workerHeartbeats.length)}
                </section>
                {(failureAlert || queueAlert) && (
                    <aside className="border-danger bg-danger-container rounded-xl border p-4 text-sm">
                        Email delivery alert:{' '}
                        {failureAlert
                            ? `failed deliveries reached ${metrics.failed}/${metrics.failureThreshold}. `
                            : ''}
                        {queueAlert
                            ? `queued deliveries reached ${metrics.queued}/${metrics.queueThreshold}.`
                            : ''}
                    </aside>
                )}
                <section className="rounded-xl border p-4">
                    <h2 className="mb-3 text-lg font-semibold">
                        Worker heartbeats
                    </h2>
                    {metrics.workerHeartbeats.length ? (
                        <div className="space-y-2 text-sm">
                            {metrics.workerHeartbeats.map((heartbeat) => (
                                <div
                                    key={`${heartbeat.worker}-${heartbeat.queue}`}
                                    className="flex justify-between"
                                >
                                    <span>
                                        {heartbeat.worker} · {heartbeat.queue}
                                    </span>
                                    <span className="text-muted-foreground">
                                        {new Date(
                                            heartbeat.lastSeenAt,
                                        ).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">
                            No worker heartbeat has been recorded.
                        </p>
                    )}
                </section>
                <section className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b">
                            <tr>
                                <th className="p-3">Type</th>
                                <th className="p-3">Recipient</th>
                                <th className="p-3">Locale</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Attempts</th>
                                <th className="p-3">Last error</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {deliveries.map((delivery) => (
                                <tr key={delivery.id}>
                                    <td className="p-3">{delivery.type}</td>
                                    <td className="p-3">
                                        {delivery.recipient}
                                    </td>
                                    <td className="p-3">{delivery.locale}</td>
                                    <td className="p-3">{delivery.status}</td>
                                    <td className="p-3">{delivery.attempts}</td>
                                    <td className="text-muted-foreground max-w-sm p-3 text-xs">
                                        {delivery.lastError || '—'}
                                    </td>
                                    <td className="p-3">
                                        {delivery.status === 'failed' ? (
                                            <button
                                                type="button"
                                                className="rounded border px-3 py-1"
                                                onClick={() =>
                                                    resend(delivery.id)
                                                }
                                            >
                                                Resend
                                            </button>
                                        ) : null}
                                    </td>
                                </tr>
                            ))}
                            {!deliveries.length && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="text-muted-foreground p-5"
                                    >
                                        No email deliveries yet.
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
