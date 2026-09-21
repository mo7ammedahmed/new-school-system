import { Head, router, useForm } from '@inertiajs/react';

type Notice = { id: number; title: string; body: string; status: string; students_count: number };
type Props = { school: { id: number; name: string }; notices: Notice[] };

export default function NoticeIndex({ school, notices }: Props) {
    const form = useForm({ title: '', body: '' });
    return <><Head title={`Notices — ${school.name}`} /><main className="space-y-6 p-6"><h1 className="text-2xl font-semibold">Notices — {school.name}</h1><form className="grid gap-2 rounded border p-4" onSubmit={(event) => { event.preventDefault(); form.post(`/admin/schools/${school.id}/notices`); }}><input className="rounded border p-2" placeholder="Title" value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} /><textarea className="rounded border p-2" placeholder="Notice body" value={form.data.body} onChange={(event) => form.setData('body', event.target.value)} /><button className="rounded bg-primary px-3 py-2 text-primary-foreground">Save draft</button></form><ul className="divide-y rounded border">{notices.map((notice) => <li key={notice.id} className="flex items-center justify-between gap-4 p-4"><div><p className="font-medium">{notice.title}</p><p className="text-sm text-muted-foreground">{notice.status} · {notice.students_count ? `${notice.students_count} targeted students` : 'Whole school'}</p></div>{notice.status !== 'published' && <button className="rounded border px-3 py-2" onClick={() => router.post(`/admin/schools/${school.id}/notices/${notice.id}/publish`)}>Publish</button>}</li>)}</ul></main></>;
}
