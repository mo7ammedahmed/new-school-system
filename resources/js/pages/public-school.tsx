import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/public-layout';
import { usePublicLocale } from '@/hooks/use-public-locale';

type Props = {
    school: {
        name: string;
        slug: string;
        organizationSlug: string;
    };
    page: {
        slug: string;
        title: string;
        body: string;
    };
};

export default function PublicSchool({ school, page }: Props) {
    const { isArabic } = usePublicLocale();

    return (
        <PublicLayout>
            <Head title={`${page.title} — ${school.name}`} />
            <section className="mx-auto max-w-5xl px-5 pt-16 pb-24 sm:px-8">
                <article className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
                    <div className="bg-hero-bg px-7 py-12 text-hero-muted sm:px-12">
                        <p className="mb-3 text-sm font-bold text-hero-accent">
                            {school.name}
                        </p>
                        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                            {page.title}
                        </h1>
                    </div>
                    <div className="px-7 py-10 text-lg leading-9 whitespace-pre-wrap text-foreground sm:px-12">
                        {page.body}
                    </div>
                    <div className="border-t border-border px-7 py-6 sm:px-12">
                        <Link
                            href={`/schools/${school.organizationSlug}/${school.slug}/apply`}
                            className="inline-flex rounded-full bg-brand-600 px-6 py-3 font-black text-white transition hover:bg-brand-700"
                        >
                            {isArabic
                                ? 'التقديم للمدرسة'
                                : 'Apply to this school'}
                        </Link>
                    </div>
                </article>
                <p className="mt-6 text-center text-sm font-bold text-muted-foreground">
                    {isArabic
                        ? 'مدرستي — مساحة المدرسة الرقمية'
                        : 'Madrasati — your school digital space'}
                </p>
            </section>
        </PublicLayout>
    );
}
