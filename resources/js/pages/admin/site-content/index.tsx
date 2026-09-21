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
                <header className="rounded-[1.75rem] bg-[#143e36] p-6 text-white md:p-8">
                    <p className="text-sm font-bold text-[#b7d7c5]">CMS</p>
                    <h1 className="mt-2 text-3xl font-black">
                        Manage the public website
                    </h1>
                    <p className="mt-3 max-w-3xl leading-7 text-[#d2e6d8]">
                        Edit every page in Arabic and English, control SEO
                        metadata, save drafts, and publish only reviewed
                        content.
                    </p>
                </header>

                <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
                    <aside className="rounded-[1.5rem] border border-[#dbe8df] bg-white p-4">
                        <p className="mb-3 text-xs font-black tracking-widest text-[#789087] uppercase">
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
                                    className={`w-full rounded-xl px-4 py-3 text-left font-bold transition ${selectedPage === page.key ? 'bg-[#dcecdf] text-[#0d5c4d]' : 'text-[#48635b] hover:bg-[#f7f8f4]'}`}
                                >
                                    {page.label}
                                </button>
                            ))}
                        </div>
                    </aside>

                    <form
                        className="space-y-6 rounded-[1.5rem] border border-[#dbe8df] bg-white p-5 md:p-7"
                        onSubmit={(event) => submit(event, form.data.status)}
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf2ed] pb-5">
                            <div>
                                <p className="text-sm font-bold text-[#789087]">
                                    Selected page
                                </p>
                                <h2 className="text-2xl font-black text-[#17342f]">
                                    {
                                        pages.find(
                                            (page) => page.key === selectedPage,
                                        )?.label
                                    }
                                </h2>
                            </div>
                            <div className="flex rounded-full border border-[#cbded2] p-1">
                                {(['ar', 'en'] as const).map((locale) => (
                                    <button
                                        key={locale}
                                        type="button"
                                        onClick={() =>
                                            select(selectedPage, locale)
                                        }
                                        className={`rounded-full px-4 py-2 text-sm font-black ${selectedLocale === locale ? 'bg-[#0d5c4d] text-white' : 'text-[#48635b]'}`}
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
                                        className="space-y-2 text-sm font-bold text-[#48635b]"
                                    >
                                        <span>{key}</span>
                                        <textarea
                                            dir={
                                                selectedLocale === 'ar'
                                                    ? 'rtl'
                                                    : 'ltr'
                                            }
                                            className="min-h-24 w-full rounded-xl border border-[#dbe8df] bg-[#fbfdf9] p-3 font-normal outline-none focus:border-[#0d5c4d]"
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

                        <div className="grid gap-4 border-t border-[#edf2ed] pt-5 md:grid-cols-2">
                            <label className="space-y-2 text-sm font-bold text-[#48635b]">
                                <span>SEO title</span>
                                <input
                                    className="w-full rounded-xl border border-[#dbe8df] p-3 font-normal"
                                    value={form.data.seo_title}
                                    onChange={(event) =>
                                        form.setData(
                                            'seo_title',
                                            event.target.value,
                                        )
                                    }
                                />
                            </label>
                            <label className="space-y-2 text-sm font-bold text-[#48635b]">
                                <span>SEO description</span>
                                <textarea
                                    className="min-h-24 w-full rounded-xl border border-[#dbe8df] p-3 font-normal"
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
                                className="inline-flex items-center gap-2 rounded-full border border-[#cbded2] px-5 py-3 font-black text-[#28544a]"
                            >
                                <Save size={16} /> Save draft
                            </button>
                            <button
                                type="submit"
                                disabled={form.processing}
                                onClick={(event) => submit(event, 'published')}
                                className="inline-flex items-center gap-2 rounded-full bg-[#0d5c4d] px-5 py-3 font-black text-white disabled:opacity-50"
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
