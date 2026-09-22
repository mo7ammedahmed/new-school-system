import { Head, router } from '@inertiajs/react';

type Notification = {
    id: number;
    type: string;
    title: string;
    body: string;
    read_at: string | null;
    created_at: string;
};
type Preference = { locale: string; enabled: boolean; email_enabled: boolean };
type Props = {
    notifications: Notification[];
    preferences: Record<string, Preference>;
};
const categories = [
    { key: 'installment', label: 'Installment reminders' },
    { key: 'payment', label: 'Payment updates' },
    { key: 'notice', label: 'School notices' },
    { key: 'assessment', label: 'Assessment updates' },
    { key: 'report-card', label: 'Report cards' },
];

export default function NotificationIndex({
    notifications,
    preferences,
}: Props) {
    const save = (category: string, preference: Preference) =>
        router.patch(
            `/portal/notifications/preferences/${category}`,
            preference,
        );
    return (
        <>
            <Head title="Notifications" />
            <main className="mx-auto max-w-3xl space-y-8 p-6">
                <section>
                    <h1 className="text-3xl font-semibold">Notifications</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Choose your language and delivery channels.
                    </p>
                </section>
                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Preferences</h2>
                    <div className="divide-y rounded-xl border">
                        {categories.map((category) => {
                            const preference = preferences[category.key] ?? {
                                locale: 'en',
                                enabled: true,
                                email_enabled: true,
                            };
                            return (
                                <div
                                    key={category.key}
                                    className="flex flex-wrap items-center justify-between gap-3 p-4"
                                >
                                    <span className="font-medium">
                                        {category.label}
                                    </span>
                                    <div className="flex flex-wrap items-center gap-3 text-sm">
                                        <select
                                            className="rounded border p-2"
                                            value={preference.locale}
                                            onChange={(event) =>
                                                save(category.key, {
                                                    ...preference,
                                                    locale: event.target.value,
                                                })
                                            }
                                        >
                                            <option value="en">English</option>
                                            <option value="ar">العربية</option>
                                        </select>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={preference.enabled}
                                                onChange={(event) =>
                                                    save(category.key, {
                                                        ...preference,
                                                        enabled:
                                                            event.target
                                                                .checked,
                                                    })
                                                }
                                            />{' '}
                                            In-app
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    preference.email_enabled
                                                }
                                                onChange={(event) =>
                                                    save(category.key, {
                                                        ...preference,
                                                        email_enabled:
                                                            event.target
                                                                .checked,
                                                    })
                                                }
                                            />{' '}
                                            Email
                                        </label>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
                <section>
                    <h2 className="mb-3 text-xl font-semibold">Inbox</h2>
                    {notifications.length ? (
                        <div className="divide-y rounded-xl border">
                            {notifications.map((notification) => (
                                <article
                                    key={notification.id}
                                    className={`p-4 ${notification.read_at ? '' : 'bg-muted/40'}`}
                                >
                                    <h3 className="font-medium">
                                        {notification.title}
                                    </h3>
                                    <p className="mt-1 text-sm">
                                        {notification.body}
                                    </p>
                                    <p className="text-muted-foreground mt-2 text-xs">
                                        {new Date(
                                            notification.created_at,
                                        ).toLocaleString()}
                                    </p>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">
                            No notifications yet.
                        </p>
                    )}
                </section>
            </main>
        </>
    );
}
