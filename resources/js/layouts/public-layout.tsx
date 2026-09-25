import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowUpLeft, Globe2, Menu, ShieldCheck, X } from 'lucide-react';
import { PropsWithChildren, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type PublicLayoutProps = PropsWithChildren<{
    active?: string;
    title?: string;
    description?: string;
    className?: string;
    breadcrumbs?: never[]; // Not used in public layout but included for consistency
}>;
type ManagedLocaleContent = {
    content?: Record<string, string>;
    seoTitle?: string | null;
    seoDescription?: string | null;
};
type PublicPageProps = {
    locale?: string;
    siteContent?: Record<string, Record<string, ManagedLocaleContent>>;
    auth?: { user?: { id: number } | null };
};

const navItems = (locale: string) =>
    locale === 'ar'
        ? [
              { label: 'الرئيسية', href: '/' },
              { label: 'عن المنصة', href: '/about' },
              { label: 'المزايا', href: '/features' },
              { label: 'الأسعار', href: '/pricing' },
              { label: 'الأسئلة الشائعة', href: '/faq' },
              { label: 'الأمان', href: '/security' },
              { label: 'تواصل معنا', href: '/contact' },
          ]
        : [
              { label: 'Home', href: '/' },
              { label: 'About', href: '/about' },
              { label: 'Features', href: '/features' },
              { label: 'Pricing', href: '/pricing' },
              { label: 'FAQ', href: '/faq' },
              { label: 'Security', href: '/security' },
              { label: 'Contact', href: '/contact' },
          ];

export default function PublicLayout({
    children,
    active,
    title,
    description,
    className,
}: PublicLayoutProps) {
    const [open, setOpen] = useState(false);
    const [consentVisible, setConsentVisible] = useState(false);
    const page = usePage<PublicPageProps>();
    const { locale = 'ar', siteContent = {}, auth } = page.props;
    const isArabic = locale === 'ar';
    const items = navItems(locale);
    // The CMS key for this page. An explicit `active` wins; otherwise the
    // current path decides, so a page that passes neither reads its own
    // content instead of inheriting the home page's.
    const currentPath = (active ?? page.url).split('?')[0].replace(/\/+$/, '');
    const pageKey =
        currentPath === '' || currentPath === '/'
            ? 'home'
            : currentPath.replace(/^\//, '');
    // A page with no published CMS row must still render, so every read of
    // `managed` stays optional.
    const managed = siteContent[pageKey]?.[locale];
    const managedBody = managed?.content?.body?.trim();
    // Use provided title/description or fallback to managed content
    const finalTitle = title ?? managed?.seoTitle ?? managed?.content?.title;
    const finalDescription =
        description ?? managed?.seoDescription ?? managed?.content?.description;

    useEffect(() => {
        if (typeof document === 'undefined') return;
        document.documentElement.lang = locale;
        document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
        setConsentVisible(
            window.localStorage.getItem('madrasati-privacy-consent') === null,
        );
    }, [isArabic, locale]);

    function saveConsent(value: 'accepted' | 'necessary') {
        window.localStorage.setItem('madrasati-privacy-consent', value);
        setConsentVisible(false);
    }

    return (
        <div
            dir={isArabic ? 'rtl' : 'ltr'}
            className={cn(
                'bg-muted text-foreground selection:bg-accent/50 selection:text-foreground min-h-screen',
                className,
            )}
        >
            <Head>
                <meta
                    name="description"
                    content={
                        isArabic
                            ? 'مدرستي — نظام تشغيل حديث للمدارس السعودية، يربط الإدارة والتعلم والمالية في تجربة واحدة.'
                            : 'Madrasati — the modern operating system for Saudi schools, connecting administration, learning, and finance.'
                    }
                />
                <meta property="og:site_name" content="Madrasati" />
                <meta property="og:type" content="website" />
                <meta
                    property="og:locale"
                    content={isArabic ? 'ar_SA' : 'en_US'}
                />
                <meta
                    property="og:title"
                    content={
                        isArabic
                            ? (finalTitle ?? 'مدرستي — نظام تشغيل المدرسة')
                            : (finalTitle ??
                              'Madrasati — School operating system')
                    }
                />
                <meta
                    property="og:description"
                    content={
                        isArabic
                            ? (finalDescription ??
                              'نظام تشغيل حديث للمدارس السعودية.')
                            : (finalDescription ??
                              'The modern operating system for Saudi schools.')
                    }
                />
                <meta
                    property="og:url"
                    content={
                        typeof window !== 'undefined'
                            ? window.location.href.split('?')[0]
                            : ''
                    }
                />
                <meta name="twitter:card" content="summary" />
                <meta
                    name="twitter:title"
                    content={
                        isArabic
                            ? (finalTitle ?? 'مدرستي — نظام تشغيل المدرسة')
                            : (finalTitle ??
                              'Madrasati — School operating system')
                    }
                />
                <meta
                    name="twitter:description"
                    content={
                        isArabic
                            ? (finalDescription ??
                              'نظام تشغيل حديث للمدارس السعودية.')
                            : (finalDescription ??
                              'The modern operating system for Saudi schools.')
                    }
                />
                <link
                    rel="canonical"
                    href={
                        typeof window !== 'undefined'
                            ? window.location.href.split('?')[0]
                            : ''
                    }
                />
                <link
                    rel="alternate"
                    hrefLang="ar"
                    href={
                        typeof window !== 'undefined'
                            ? `${window.location.href.split('?')[0]}?locale=ar`
                            : ''
                    }
                />
                <link
                    rel="alternate"
                    hrefLang="en"
                    href={
                        typeof window !== 'undefined'
                            ? `${window.location.href.split('?')[0]}?locale=en`
                            : ''
                    }
                />
                <link
                    rel="alternate"
                    hrefLang="x-default"
                    href={
                        typeof window !== 'undefined'
                            ? window.location.href.split('?')[0]
                            : ''
                    }
                />
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Organization',
                        name: 'Madrasati',
                        url:
                            typeof window !== 'undefined'
                                ? window.location.origin
                                : '',
                        description: isArabic
                            ? 'نظام تشغيل حديث للمدارس السعودية.'
                            : 'The modern operating system for Saudi schools.',
                        areaServed: 'SA',
                    })}
                </script>
            </Head>
            <header className="border-border/80 bg-muted/90 sticky top-0 z-50 border-b backdrop-blur-xl">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
                    <Link
                        href="/"
                        className="group flex items-center gap-3"
                        aria-label={
                            isArabic
                                ? 'مدرستي - الصفحة الرئيسية'
                                : 'Madrasati - home'
                        }
                    >
                        <span className="bg-brand-600 text-primary-foreground grid size-11 place-items-center rounded-lg shadow-[0_10px_25px_-12px_var(--brand-600)] transition-transform group-hover:-rotate-3">
                            <ShieldCheck size={23} strokeWidth={2.2} />
                        </span>
                        <span className="leading-none">
                            <strong className="text-foreground text-headline-sm block font-semibold tracking-tight">
                                مدرستي
                            </strong>
                            <small className="text-muted-foreground text-label-caps mt-1 block font-bold tracking-[0.2em]">
                                SCHOOL OS
                            </small>
                        </span>
                    </Link>

                    <nav
                        className="hidden items-center gap-6 xl:flex"
                        aria-label={
                            isArabic ? 'التنقل الرئيسي' : 'Main navigation'
                        }
                    >
                        {items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`hover:text-secondary text-sm font-bold transition-colors ${active === item.href ? 'text-secondary' : 'text-muted-foreground'}`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-3 xl:flex">
                        <button
                            className="text-muted-foreground hover:bg-card flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold transition"
                            type="button"
                            onClick={() => {
                                const nextLocale = isArabic ? 'en' : 'ar';
                                document.cookie = `locale=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
                                window.location.reload();
                            }}
                            aria-label={
                                isArabic
                                    ? 'تبديل اللغة إلى الإنجليزية'
                                    : 'Switch language to Arabic'
                            }
                        >
                            <Globe2 size={16} />{' '}
                            {isArabic ? 'English' : 'العربية'}
                        </button>
                        <Link
                            href={auth?.user ? '/dashboard' : '/login'}
                            className="border-border text-brand-700 hover:border-brand-600 hover:bg-card rounded-full border px-5 py-2.5 text-sm font-bold transition"
                        >
                            {auth?.user
                                ? isArabic
                                    ? 'لوحة التحكم'
                                    : 'Dashboard'
                                : isArabic
                                  ? 'تسجيل الدخول'
                                  : 'Log in'}
                        </Link>
                        <span className="group hover:bg-brand-900/80 bg-brand-600 text-primary-foreground flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition">
                            {isArabic ? 'ابدأ الآن' : 'Get started'}{' '}
                            <ArrowUpLeft
                                size={16}
                                className="transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1"
                            />
                        </span>
                    </div>

                    <button
                        className="text-foreground rounded-xl p-2 xl:hidden"
                        onClick={() => setOpen(!open)}
                        aria-label={isArabic ? 'فتح القائمة' : 'Open menu'}
                    >
                        {open ? <X /> : <Menu />}
                    </button>
                </div>
                {open && (
                    <div className="border-border bg-muted border-t px-5 py-5 xl:hidden">
                        <nav
                            className="flex flex-col gap-4"
                            aria-label={
                                isArabic ? 'قائمة الهاتف' : 'Mobile menu'
                            }
                        >
                            {items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className="text-muted-foreground hover:bg-card rounded-xl px-3 py-2 font-bold"
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    const nextLocale = isArabic ? 'en' : 'ar';
                                    document.cookie = `locale=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
                                    window.location.reload();
                                }}
                                className="text-muted-foreground hover:bg-card flex items-center gap-2 rounded-xl px-3 py-2 text-right font-bold"
                                aria-label={
                                    isArabic
                                        ? 'Switch to English'
                                        : 'التبديل إلى العربية'
                                }
                            >
                                <Globe2 size={16} />{' '}
                                {isArabic ? 'English' : 'العربية'}
                            </button>
                            <Link
                                href="/login"
                                className="border-border rounded-full border px-5 py-3 text-center font-bold"
                            >
                                {isArabic ? 'تسجيل الدخول' : 'Log in'}
                            </Link>
                        </nav>
                    </div>
                )}
            </header>
            <main id="main-content">
                {/* A page with its own component always renders it: a CMS row
                    overrides copy and metadata, it never replaces the page. */}
                {children ? (
                    <div
                        className={cn(
                            'mx-auto max-w-4xl px-5 pt-20 pb-24 sm:px-8',
                            className,
                        )}
                    >
                        {children}
                    </div>
                ) : managedBody ? (
                    <section className="mx-auto max-w-4xl px-5 pt-20 pb-24 sm:px-8">
                        <Head
                            title={
                                managed.seoTitle ||
                                managed.content?.title ||
                                undefined
                            }
                        >
                            {managed.seoDescription && (
                                <meta
                                    name="description"
                                    content={managed.seoDescription}
                                />
                            )}
                        </Head>
                        {managed.content?.eyebrow && (
                            <p className="text-secondary text-sm font-semibold">
                                {managed.content.eyebrow}
                            </p>
                        )}
                        {managed.content?.title && (
                            <h1 className="text-foreground mt-4 text-5xl leading-tight font-semibold tracking-tight">
                                {managed.content.title}
                            </h1>
                        )}
                        <div className="text-muted-foreground mt-8 text-lg leading-9 whitespace-pre-line">
                            {managedBody}
                        </div>
                        {managed.content?.cta && (
                            <Link
                                href="/contact"
                                className="bg-brand-600 text-primary-foreground mt-8 inline-flex rounded-full px-6 py-3 font-semibold"
                            >
                                {managed.content.cta}
                            </Link>
                        )}
                    </section>
                ) : null}
            </main>
            <footer className="border-border bg-muted border-t">
                <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-foreground font-semibold">
                            Madrasati
                        </p>
                        <p className="text-muted-foreground mt-1 text-sm">
                            {isArabic
                                ? 'نظام تشغيل المدرسة، من الإدارة إلى أثر التعلم.'
                                : 'The school operating system, from administration to learning impact.'}
                        </p>
                    </div>
                    <div className="text-muted-foreground flex flex-wrap gap-5 text-sm font-bold">
                        <Link href="/about">
                            {isArabic ? 'عن المنصة' : 'About'}
                        </Link>
                        <Link href="/features">
                            {isArabic ? 'المزايا' : 'Features'}
                        </Link>
                        <Link href="/pricing">
                            {isArabic ? 'الأسعار' : 'Pricing'}
                        </Link>
                        <Link href="/faq">
                            {isArabic ? 'الأسئلة الشائعة' : 'FAQ'}
                        </Link>
                        <Link href="/security">
                            {isArabic ? 'الأمان' : 'Security'}
                        </Link>
                        <Link href="/privacy">
                            {isArabic ? 'الخصوصية' : 'Privacy'}
                        </Link>
                        <Link href="/terms">
                            {isArabic ? 'الشروط' : 'Terms'}
                        </Link>
                        <Link href="/contact">
                            {isArabic ? 'الدعم' : 'Contact'}
                        </Link>
                    </div>
                    <p className="text-muted-foreground text-xs">
                        © 2026 Madrasati.{' '}
                        {isArabic
                            ? 'صُنع للمدارس السعودية.'
                            : 'Built for Saudi schools.'}
                    </p>
                </div>
            </footer>
            {consentVisible && (
                <aside
                    className="border-border bg-card fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-lg border p-5 shadow-[0_20px_55px_-20px_var(--brand-900)]"
                    role="dialog"
                    aria-label={
                        isArabic ? 'إعدادات الخصوصية' : 'Privacy settings'
                    }
                >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-foreground font-semibold">
                                {isArabic
                                    ? 'نحترم خصوصيتكم'
                                    : 'We respect your privacy'}
                            </p>
                            <p className="text-muted-foreground mt-1 text-sm leading-6">
                                {isArabic
                                    ? 'نستخدم التخزين الضروري لتذكر تفضيلاتكم وتحسين التجربة. تعرفوا على التفاصيل في سياسة الخصوصية.'
                                    : 'We use necessary storage to remember preferences and improve the experience. See the details in our privacy policy.'}
                            </p>
                            <Link
                                href="/privacy"
                                className="text-brand-600 mt-1 inline-block text-sm font-bold"
                            >
                                {isArabic ? 'سياسة الخصوصية' : 'Privacy policy'}
                            </Link>
                        </div>
                        <div className="flex shrink-0 gap-2">
                            <button
                                type="button"
                                onClick={() => saveConsent('necessary')}
                                className="border-border text-brand-700 rounded-full border px-4 py-2 text-sm font-bold"
                            >
                                {isArabic ? 'الضروري فقط' : 'Necessary only'}
                            </button>
                            <button
                                type="button"
                                onClick={() => saveConsent('accepted')}
                                className="bg-brand-600 text-primary-foreground rounded-full px-4 py-2 text-sm font-bold"
                            >
                                {isArabic ? 'موافق' : 'Accept'}
                            </button>
                        </div>
                    </div>
                </aside>
            )}
        </div>
    );
}
