import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Megaphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { PageHero } from '@/components/page-hero';
import { useT } from '@/hooks/useT';
import type { SharedPageProps } from '@/types/shared';

type Notice = {
    id: number;
    title: string;
    body: string;
    status: string;
    students_count: number;
};

type Props = {
    school: { id: number; name: string };
    notices: Notice[];
};

export default function NoticeIndex({ school, notices }: Props) {
    const { t } = useT();
    const { flash } = usePage<SharedPageProps>().props;
    const form = useForm({ title: '', body: '' });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(`/admin/schools/${school.id}/notices`, {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    const publish = (notice: Notice) => {
        router.post(
            `/admin/schools/${school.id}/notices/${notice.id}/publish`,
            {},
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title={t('notices.title')} />

            <div className="space-y-6 p-4 md:p-8">
                <PageHero
                    eyebrow={school.name}
                    title={t('notices.title')}
                    subtitle={t('notices.subtitle')}
                />

                {flash?.success ? (
                    <p
                        role="status"
                        className="text-brand-600 bg-surface-container-low rounded-lg px-4 py-3 font-semibold"
                    >
                        {flash.success}
                    </p>
                ) : null}

                <Card>
                    <CardHeader>
                        <CardTitle>{t('notices.newNotice')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-4">
                            <label className="text-on-surface-variant grid gap-1.5 text-sm font-semibold">
                                {t('notices.titleLabel')}
                                <input
                                    className="field"
                                    placeholder={t('notices.titlePlaceholder')}
                                    value={form.data.title}
                                    maxLength={255}
                                    onChange={(event) =>
                                        form.setData(
                                            'title',
                                            event.target.value,
                                        )
                                    }
                                />
                            </label>
                            {form.errors.title ? (
                                <p className="text-danger text-sm">
                                    {form.errors.title}
                                </p>
                            ) : null}

                            <label className="text-on-surface-variant grid gap-1.5 text-sm font-semibold">
                                {t('notices.bodyLabel')}
                                <Textarea
                                    rows={4}
                                    placeholder={t('notices.bodyPlaceholder')}
                                    value={form.data.body}
                                    onChange={(event) =>
                                        form.setData('body', event.target.value)
                                    }
                                />
                            </label>
                            {form.errors.body ? (
                                <p className="text-danger text-sm">
                                    {form.errors.body}
                                </p>
                            ) : null}

                            <div>
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="gap-2"
                                >
                                    <Megaphone size={16} aria-hidden="true" />
                                    {t('notices.saveDraft')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('notices.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {notices.length === 0 ? (
                            <p className="text-muted-foreground px-4 pb-4 text-sm">
                                {t('notices.empty')}
                            </p>
                        ) : (
                            <ul className="divide-outline-variant divide-y">
                                {notices.map((notice) => (
                                    <li
                                        key={notice.id}
                                        className="flex flex-wrap items-center justify-between gap-4 px-4 py-3"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-foreground truncate font-semibold">
                                                    {notice.title}
                                                </p>
                                                <Badge
                                                    variant={
                                                        notice.status ===
                                                        'published'
                                                            ? 'secondary'
                                                            : 'outline'
                                                    }
                                                >
                                                    {t(
                                                        `status.${notice.status}`,
                                                    )}
                                                </Badge>
                                            </div>
                                            <p className="text-muted-foreground mt-0.5 text-sm">
                                                {notice.students_count
                                                    ? t('notices.targeted', {
                                                          count: notice.students_count,
                                                      })
                                                    : t('notices.wholeSchool')}
                                            </p>
                                        </div>
                                        {notice.status !== 'published' ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => publish(notice)}
                                            >
                                                {t('actions.publish')}
                                            </Button>
                                        ) : null}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
