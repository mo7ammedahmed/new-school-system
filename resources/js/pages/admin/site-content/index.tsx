import { Head, useForm } from '@inertiajs/react';
import { Globe2, Save, Send } from 'lucide-react';
import { useMemo, useState } from 'react';

type PageOption = { key: string; label: string };
type ContentRecord = {
    id: number;
    page: string;
    locale: 'ar' | 'en';
    content: Record<string, string>;
    seoTitle: string | null;
    seoDescription: string | null;
    status: 'draft' | 'published';
    publishedAt: string | null;
};
type Props = { pages: PageOption[]; contents: ContentRecord[] };

const emptyContent = {
    eyebrow: '',
    title: '',
    text: '',
    hero: '',
    cta: '',
    secondaryCta: '',
    body: '',
    features: '',
    faq: '',
};

export default function SiteContentIndex({ pages, contents }: Props) {
    const [selectedPage, setSelectedPage] = useState(pages[0]?.key ?? 'home');
    const [selectedLocale, setSelectedLocale] = useState<'ar' | 'en'>('ar');
    const existing = useMemo(
        () =>
            contents.find(
                (item) =>
                    item.page === selectedPage &&
                    item.locale === selectedLocale,
            ),
        [contents, selectedLocale, selectedPage],
    );
    const form = useForm({
        page: selectedPage,
        locale: selectedLocale,
        content: existing?.content ?? emptyContent,
        seo_title: existing?.seoTitle ?? '',
        seo_description: existing?.seoDescription ?? '',
        status: existing?.status ?? 'draft',
    });

    function select(page: string, locale: 'ar' | 'en') {
        const item = contents.find(
            (entry) => entry.page === page && entry.locale === locale,
        );
        setSelectedPage(page);
        setSelectedLocale(locale);
        form.setData({
            page,
            locale,
            content: item?.content ?? emptyContent,
            seo_title: item?.seoTitle ?? '',
            seo_description: item?.seoDescription ?? '',
            status: item?.status ?? 'draft',
        });
    }

    function submit(
        event: { preventDefault: () => void },
        status: 'draft' | 'published',
    ) {
        event.preventDefault();
        form.transform((data) => ({ ...data, status }));
        form.post('/admin/site-content', {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="Public site content" />
            <div className="space-y-8 p-4 md:p-8">
                <header className="bg-primary-container rounded-lg p-6 text-white md:p-8">
                    <p className="text-sm font-bold text-[#b7d7c5]">CMS</p>
                    <h1 className="mt-2 text-3xl font-semibold">
                        Manage the public website
                    </h1>
                    <p className="mt-3 max-w-3xl leading-7 text-[#d2e6d8]">
                        Edit every page in Arabic and English, control SEO
                        metadata, save drafts, and publish only reviewed
                        content.
                    </p>
                </header>

                <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
                    <aside className="border-outline-variant bg-card rounded-lg border p-4">
                        <p className="text-on-surface-variant mb-3 text-xs font-semibold tracking-widest uppercase">
                            Pages
                        </p>
                        <div className="space-y-2">
                            {pages.map((page) => (
                                <button
                                    key={page.key}
                                    type="button"
                                    onClick={() =>
                                        select(page.key, selectedLocale)
                                    }
                                    className={`w-full rounded-xl px-4 py-3 text-left font-bold transition ${selectedPage === page.key ? 'bg-surface-container-low text-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                                >
                                    {page.label}
                                </button>
                            ))}
                        </div>
                    </aside>

                    <form
                        className="border-outline-variant bg-card space-y-6 rounded-lg border p-5 md:p-6"
                        onSubmit={(event) => submit(event, form.data.status)}
                    >
                        <div className="border-outline-variant flex flex-wrap items-center justify-between gap-3 border-b pb-5">
                            <div>
                                <p className="text-on-surface-variant text-sm font-bold">
                                    Selected page
                                </p>
                                <h2 className="text-on-surface text-2xl font-semibold">
                                    {
                                        pages.find(
                                            (page) => page.key === selectedPage,
                                        )?.label
                                    }
                                </h2>
                            </div>
                            <div className="border-outline-variant flex rounded-full border p-1">
                                {(['ar', 'en'] as const).map((locale) => (
                                    <button
                                        key={locale}
                                        type="button"
                                        onClick={() =>
                                            select(selectedPage, locale)
                                        }
                                        className={`rounded-full px-4 py-2 text-sm font-semibold ${selectedLocale === locale ? 'bg-primary text-primary-foreground' : 'text-on-surface-variant'}`}
                                    >
                                        <Globe2
                                            className="mr-1 inline"
                                            size={14}
                                        />
                                        {locale === 'ar'
                                            ? 'العربية'
                                            : 'English'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {Object.entries(form.data.content).map(
                                ([key, value]) => (
                                    <label
                                        key={key}
                                        className="text-on-surface-variant space-y-2 text-sm font-bold"
                                    >
                                        <span>{key}</span>
                                        <textarea
                                            dir={
                                                selectedLocale === 'ar'
                                                    ? 'rtl'
                                                    : 'ltr'
                                            }
                                            className="field bg-surface-container-low min-h-24"
                                            value={value}
                                            onChange={(event) =>
                                                form.setData('content', {
                                                    ...form.data.content,
                                                    [key]: event.target.value,
                                                })
                                            }
                                        />
                                    </label>
                                ),
                            )}
                        </div>

                        <div className="border-outline-variant grid gap-4 border-t pt-5 md:grid-cols-2">
                            <label className="text-on-surface-variant space-y-2 text-sm font-bold">
                                <span>SEO title</span>
                                <input
                                    className="field"
                                    value={form.data.seo_title}
                                    onChange={(event) =>
                                        form.setData(
                                            'seo_title',
                                            event.target.value,
                                        )
                                    }
                                />
                            </label>
                            <label className="text-on-surface-variant space-y-2 text-sm font-bold">
                                <span>SEO description</span>
                                <textarea
                                    className="field min-h-24"
                                    value={form.data.seo_description}
                                    onChange={(event) =>
                                        form.setData(
                                            'seo_description',
                                            event.target.value,
                                        )
                                    }
                                />
                            </label>
                        </div>

                        <div className="flex flex-wrap justify-end gap-3">
                            <button
                                type="button"
                                disabled={form.processing}
                                onClick={(event) => submit(event, 'draft')}
                                className="border-outline-variant text-on-surface inline-flex items-center gap-2 rounded-full border px-5 py-3 font-semibold"
                            >
                                <Save size={16} /> Save draft
                            </button>
                            <button
                                type="submit"
                                disabled={form.processing}
                                onClick={(event) => submit(event, 'published')}
                                className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold disabled:opacity-50"
                            >
                                <Send size={16} /> Publish
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
