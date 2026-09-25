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
        /** Null until an admin publishes a page with this slug. */
        title: string | null;
        body: string | null;
    };
};

export default function PublicSchool({ school, page }: Props) {
    const { isArabic } = usePublicLocale();
    const title = page.title ?? school.name;

    return (
        <PublicLayout>
            <Head title={`${title} — ${school.name}`} />
            <section className="mx-auto max-w-5xl px-5 pt-16 pb-24 sm:px-8">
                <article className="border-border bg-card overflow-hidden rounded-lg border">
                    <div className="bg-hero-bg text-hero-muted px-7 py-12 sm:px-12">
                        <p className="text-hero-accent mb-3 text-sm font-bold">
                            {school.name}
                        </p>
                        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                            {title}
                        </h1>
                    </div>
                    <div className="text-foreground px-7 py-10 text-lg leading-9 whitespace-pre-wrap sm:px-12">
                        {page.body ??
                            (isArabic
                                ? 'لم يُنشر محتوى هذه الصفحة بعد. للاستفسارات والتسجيل، تواصلوا مع مكتب المدرسة.'
                                : 'This page has no published content yet. For enquiries and admissions, contact the school office.')}
                    </div>
                    <div className="border-border border-t px-7 py-6 sm:px-12">
                        <Link
                            href={`/schools/${school.organizationSlug}/${school.slug}/apply`}
                            className="bg-brand-600 hover:bg-brand-700 inline-flex rounded-full px-6 py-3 font-semibold text-white transition"
                        >
                            {isArabic
                                ? 'التقديم للمدرسة'
                                : 'Apply to this school'}
                        </Link>
                    </div>
                </article>
                <p className="text-muted-foreground mt-6 text-center text-sm font-bold">
                    {isArabic
                        ? 'مدرستي — مساحة المدرسة الرقمية'
                        : 'Madrasati — your school digital space'}
                </p>
            </section>
        </PublicLayout>
    );
}
