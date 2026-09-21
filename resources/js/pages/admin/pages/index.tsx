import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type Page = {
    id: number;
    slug: string;
    title: Record<string, string>;
    status: string;
    publishedAt: string | null;
};

type Props = {
    school: { id: number; name: string };
    pages: Page[];
};

export default function PageIndex({ school, pages }: Props) {
    const form = useForm({
        slug: '',
        title: { en: '', ar: '' },
        body: { en: '', ar: '' },
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        form.post(`/admin/schools/${school.id}/pages`);
    }

    return (
        <>
            <Head title={`Pages — ${school.name}`} />
            <div className="space-y-8 p-6">
                <header>
                    <h1 className="text-2xl font-semibold">{school.name} pages</h1>
                    <p className="text-sm text-muted-foreground">Manage English and Arabic public content.</p>
                </header>
                <form onSubmit={submit} className="grid gap-3 rounded-lg border p-4">
                    <input className="rounded border p-2" placeholder="Slug" value={form.data.slug} onChange={(event) => form.setData('slug', event.target.value)} />
                    <input className="rounded border p-2" placeholder="English title" value={form.data.title.en} onChange={(event) => form.setData('title', { ...form.data.title, en: event.target.value })} />
                    <input className="rounded border p-2" dir="rtl" placeholder="العنوان بالعربية" value={form.data.title.ar} onChange={(event) => form.setData('title', { ...form.data.title, ar: event.target.value })} />
                    <textarea className="rounded border p-2" placeholder="English body" value={form.data.body.en} onChange={(event) => form.setData('body', { ...form.data.body, en: event.target.value })} />
                    <textarea className="rounded border p-2" dir="rtl" placeholder="النص بالعربية" value={form.data.body.ar} onChange={(event) => form.setData('body', { ...form.data.body, ar: event.target.value })} />
                    <button className="rounded bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50" disabled={form.processing}>Save draft</button>
                </form>
                <ul className="divide-y rounded-lg border">
                    {pages.map((page) => <li key={page.id} className="flex justify-between p-4"><span>{page.slug}</span><span className="text-sm text-muted-foreground">{page.status}</span></li>)}
                </ul>
            </div>
        </>
    );
}
