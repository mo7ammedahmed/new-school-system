import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowUpLeft, Globe2, Menu, ShieldCheck, X } from 'lucide-react';
import { PropsWithChildren, useEffect, useState } from 'react';

type PublicLayoutProps = PropsWithChildren<{ active?: string }>;
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

export default function PublicLayout({ children, active }: PublicLayoutProps) {
    const [open, setOpen] = useState(false);
    const [consentVisible, setConsentVisible] = useState(false);
    const {
        locale = 'ar',
        siteContent = {},
        auth,
    } = usePage<PublicPageProps>().props;
    const isArabic = locale === 'ar';
    const items = navItems(locale);
    const pageKey =
        active === '/' ? 'home' : (active?.replace(/^\//, '') ?? 'home');
    const managed = siteContent[pageKey]?.[locale];
    const managedBody = managed?.content?.body?.trim();

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
            className="min-h-screen bg-[#f7f8f4] text-[#17342f] selection:bg-[#cde9d5] selection:text-[#17342f]"
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
                            ? 'مدرستي — نظام تشغيل المدرسة'
                            : 'Madrasati — School operating system'
                    }
                />
                <meta
                    property="og:description"
                    content={
                        isArabic
                            ? 'نظام تشغيل حديث للمدارس السعودية.'
                            : 'The modern operating system for Saudi schools.'
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
                            ? 'مدرستي — نظام تشغيل المدرسة'
                            : 'Madrasati — School operating system'
                    }
                />
                <meta
                    name="twitter:description"
                    content={
                        isArabic
                            ? 'نظام تشغيل حديث للمدارس السعودية.'
                            : 'The modern operating system for Saudi schools.'
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
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-[60] focus:rounded-lg focus:bg-[#17342f] focus:px-4 focus:py-3 focus:text-white"
            >
                {isArabic ? 'تجاوز إلى المحتوى' : 'Skip to content'}
            </a>
            <header className="sticky top-0 z-50 border-b border-[#dbe8df]/80 bg-[#f7f8f4]/90 backdrop-blur-xl">
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
                        <span className="grid size-11 place-items-center rounded-2xl bg-[#0d5c4d] text-white shadow-[0_10px_25px_-12px_#0d5c4d] transition-transform group-hover:-rotate-3">
                            <ShieldCheck size={23} strokeWidth={2.2} />
                        </span>
                        <span className="leading-none">
                            <strong className="block text-[1.15rem] font-black tracking-tight">
                                مدرستي
                            </strong>
                            <small className="mt-1 block text-[9px] font-bold tracking-[0.2em] text-[#6c837c]">
                                SCHOOL OS
                            </small>
                        </span>
                    </Link>

                    <nav
                        className="hidden items-center gap-8 lg:flex"
                        aria-label={
                            isArabic ? 'التنقل الرئيسي' : 'Main navigation'
                        }
                    >
                        {items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`text-sm font-bold transition-colors hover:text-[#c56a3b] ${active === item.href ? 'text-[#c56a3b]' : 'text-[#48635b]'}`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-3 lg:flex">
                        <button
                            className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-[#48635b] transition hover:bg-white"
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
                            className="rounded-full border border-[#cbded2] px-5 py-2.5 text-sm font-bold text-[#28544a] transition hover:border-[#0d5c4d] hover:bg-white"
                        >
                            {auth?.user
                                ? isArabic
                                    ? 'لوحة التحكم'
                                    : 'Dashboard'
                                : isArabic
                                  ? 'تسجيل الدخول'
                                  : 'Log in'}
                        </Link>
                        <span
                            className="group flex items-center gap-2 rounded-full bg-[#0d5c4d] px-5 py-2.5 text-sm font-bold text-white transition hover:bg:#08483d"
                        >
                            {isArabic ? 'ابدأ الآن' : 'Get started'}{' '}
                            <ArrowUpLeft
                                size={16}
                                className="transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1"
                            />
                        </span>
                    </div>

                    <button
                        className="rounded-xl p-2 text-[#17342f] lg:hidden"
                        onClick={() => setOpen(!open)}
                        aria-label={isArabic ? 'فتح القائمة' : 'Open menu'}
                    >
                        {open ? <X /> : <Menu />}
                    </button>
                </div>
                {open && (
                    <div className="border-t border-[#dbe8df] bg-[#f7f8f4] px-5 py-5 lg:hidden">
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
                                    className="rounded-xl px-3 py-2 font-bold text-[#48635b] hover:bg-white"
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
                                className="flex items-center gap-2 rounded-xl px-3 py-2 text-right font-bold text-[#48635b] hover:bg-white"
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
                                className="rounded-full border border-[#cbded2] px-5 py-3 text-center font-bold"
                            >
                                {isArabic ? 'تسجيل الدخول' : 'Log in'}
                            </Link>
                        </nav>
                    </div>
                )}
            </header>
            <main id="main-content">
                {managedBody ? (
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
                            <p className="text-sm font-black text-[#c56a3b]">
                                {managed.content.eyebrow}
                            </p>
                        )}
                        {managed.content?.title && (
                            <h1 className="mt-4 text-5xl leading-tight font-black tracking-tight">
                                {managed.content.title}
                            </h1>
                        )}
                        <div className="mt-8 text-lg leading-9 whitespace-pre-line text-[#5d746c]">
                            {managedBody}
                        </div>
                        {managed.content?.cta && (
                            <Link
                                href="/contact"
                                className="mt-8 inline-flex rounded-full bg-[#0d5c4d] px-6 py-3 font-black text-white"
                            >
                                {managed.content.cta}
                            </Link>
                        )}
                    </section>
                ) : (
                    children
                )}
            </main>
            <footer className="border-t border-[#dbe8df] bg-[#eef4ee]">
                <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="font-black">Madrasati</p>
                        <p className="mt-1 text-sm text-[#6c837c]">
                            {isArabic
                                ? 'نظام تشغيل المدرسة، من الإدارة إلى أثر التعلم.'
                                : 'The school operating system, from administration to learning impact.'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-5 text-sm font-bold text-[#48635b]">
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
                    <p className="text-xs text-[#789087]">
                        © 2026 Madrasati.{' '}
                        {isArabic
                            ? 'صُنع للمدارس السعودية.'
                            : 'Built for Saudi schools.'}
                    </p>
                </div>
            </footer>
            {consentVisible && (
                <aside
                    className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-2xl border border-[#cbded2] bg-white p-5 shadow-[0_20px_55px_-20px_#17342f]"
                    role="dialog"
                    aria-label={
                        isArabic ? 'إعدادات الخصوصية' : 'Privacy settings'
                    }
                >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="font-black text-[#17342f]">
                                {isArabic
                                    ? 'نحترم خصوصيتكم'
                                    : 'We respect your privacy'}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-[#6c837c]">
                                {isArabic
                                    ? 'نستخدم التخزين الضروري لتذكر تفضيلاتكم وتحسين التجربة. تعرفوا على التفاصيل في سياسة الخصوصية.'
                                    : 'We use necessary storage to remember preferences and improve the experience. See the details in our privacy policy.'}
                            </p>
                            <Link
                                href="/privacy"
                                className="mt-1 inline-block text-sm font-bold text-[#0d5c4d]"
                            >
                                {isArabic ? 'سياسة الخصوصية' : 'Privacy policy'}
                            </Link>
                        </div>
                        <div className="flex shrink-0 gap-2">
                            <button
                                type="button"
                                onClick={() => saveConsent('necessary')}
                                className="rounded-full border border-[#cbded2] px-4 py-2 text-sm font-bold text-[#28544a]"
                            >
                                {isArabic ? 'الضروري فقط' : 'Necessary only'}
                            </button>
                            <button
                                type="button"
                                onClick={() => saveConsent('accepted')}
                                className="rounded-full bg-[#0d5c4d] px-4 py-2 text-sm font-bold text-white"
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
