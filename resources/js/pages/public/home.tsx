import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    CreditCard,
    LayoutDashboard,
    Play,
    Sparkles,
    UsersRound,
} from 'lucide-react';
import { usePageContext } from '@/hooks/use-page-context';
import { usePublicLocale } from '@/hooks/use-public-locale';
import PublicLayout from '@/layouts/public-layout';

const content = {
    ar: {
        eyebrow: 'مصمم للمدارس التي تريد أن تتقدم',
        title: 'كل ما تحتاجه مدرستك.',
        accent: 'في مكان واحد.',
        body: 'مدرستي هو نظام التشغيل الحديث للمدارس السعودية — يربط الإدارة والتعلم والمالية في تجربة بسيطة وآمنة.',
        start: 'ابدأ رحلة مدرستك',
        demo: 'احجز عرضاً تعريفياً',
        impact: 'أقل وقت في النظام. أكثر وقت للأثر.',
        today: 'نظرة اليوم',
        greeting: 'صباح الخير، أ. نورة',
        attendance: 'الحضور اليوم',
        learning: 'مؤشر التعلم',
        stats: [
            ['+250', 'مدرسة تبدأ بثقة'],
            ['98%', 'رضا مديري المدارس'],
            ['24/7', 'دعم ومراقبة'],
        ],
        features: [
            [
                'إدارة مدرسية مترابطة',
                'رؤية واضحة للتشغيل والحضور والأداء والقرارات اليومية.',
            ],
            ['مجتمع متصل', 'تجربة سلسة للمدير والمعلم والطالب وولي الأمر.'],
            ['مالية بلا مفاجآت', 'فواتير وأقساط وإيصالات موثقة مع عزل كامل.'],
        ],
    },
    en: {
        eyebrow: 'Built for schools ready to move forward',
        title: 'Everything your school needs.',
        accent: 'In one place.',
        body: 'Madrasati is the modern operating system for Saudi schools — connecting administration, learning, and finance in one simple, secure experience.',
        start: 'Start your school journey',
        demo: 'Book a demo',
        impact: 'Less time in systems. More time for impact.',
        today: 'Today at a glance',
        greeting: 'Good morning, Nora',
        attendance: "Today's attendance",
        learning: 'Learning index',
        stats: [
            ['+250', 'schools starting with confidence'],
            ['98%', 'leader satisfaction'],
            ['24/7', 'support and monitoring'],
        ],
        features: [
            [
                'Connected school management',
                'A clear view of operations, attendance, performance, and decisions.',
            ],
            [
                'One connected community',
                'A seamless experience for leaders, teachers, students, and families.',
            ],
            [
                'Finance without surprises',
                'Documented invoices, installments, and receipts with strict isolation.',
            ],
        ],
    },
} as const;

const featureIcons = [LayoutDashboard, UsersRound, CreditCard];

export default function Home() {
    const { locale } = usePublicLocale();
    const { canRegister } = usePageContext();
    const copy = content[locale];

    return (
        <PublicLayout active="/">
            <Head
                title={
                    locale === 'ar'
                        ? 'مدرستي — نظام تشغيل المدرسة'
                        : 'Madrasati — School operating system'
                }
            />

            <section className="relative overflow-hidden">
                <div className="pointer-events-none absolute top-12 -left-32 size-96 rounded-full bg-accent/50 blur-3xl" />
                <div className="mx-auto grid max-w-7xl gap-14 px-5 pt-16 pb-20 sm:px-8 md:pt-24 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
                    <div className="relative">
                        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-4 py-2 text-xs font-black text-brand-600">
                            <Sparkles size={14} aria-hidden="true" />
                            {copy.eyebrow}
                        </div>
                        <h1 className="max-w-3xl text-5xl leading-[1.12] font-black tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl">
                            {copy.title}
                            <br />
                            <span className="text-secondary">
                                {copy.accent}
                            </span>
                        </h1>
                        <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">
                            {copy.body}
                        </p>
                        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href={canRegister ? '/register' : '/contact'}
                                className="flex items-center justify-center gap-3 rounded-full bg-brand-600 px-7 py-4 font-black text-white transition hover:bg-brand-700"
                            >
                                {copy.start}
                                <ArrowLeft size={18} aria-hidden="true" />
                            </Link>
                            <Link
                                href="/contact"
                                className="flex items-center justify-center gap-2 rounded-full border border-border bg-white/60 px-7 py-4 font-black text-brand-700 transition hover:bg-white"
                            >
                                <Play
                                    size={16}
                                    fill="currentColor"
                                    aria-hidden="true"
                                />
                                {copy.demo}
                            </Link>
                        </div>
                        <div className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-7">
                            {copy.stats.map(([value, label]) => (
                                <div key={label}>
                                    <p className="text-2xl font-black text-foreground">
                                        {value}
                                    </p>
                                    <p className="mt-1 text-xs leading-5 font-bold text-muted-foreground">
                                        {label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative mx-auto hidden w-full max-w-[520px] lg:block">
                        <div className="rounded-[2.5rem] border border-white bg-hero-bg p-4 shadow-[0_35px_80px_-30px_var(--brand-900)]">
                            <div className="rounded-[2rem] bg-card/50 p-5">
                                <p className="text-xs font-bold text-muted-foreground">
                                    {copy.today}
                                </p>
                                <h2 className="mt-2 text-xl font-black text-foreground">
                                    {copy.greeting}
                                </h2>
                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl bg-brand-600 p-4 text-white">
                                        <p className="text-xs text-hero-muted">
                                            {copy.attendance}
                                        </p>
                                        <p className="mt-2 text-3xl font-black">
                                            94.8%
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-border bg-white p-4">
                                        <p className="text-xs font-bold text-muted-foreground">
                                            {copy.learning}
                                        </p>
                                        <p className="mt-2 text-3xl font-black text-foreground">
                                            86.2
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white py-20" id="features">
                <div className="mx-auto max-w-7xl px-5 sm:px-8">
                    <h2 className="text-4xl font-black tracking-tight text-foreground">
                        {copy.impact}
                    </h2>
                    <div className="mt-12 grid gap-5 md:grid-cols-3">
                        {copy.features.map(([title, body], index) => {
                            const Icon = featureIcons[index];

                            return (
                                <article
                                    key={title}
                                    className="rounded-[1.75rem] border border-border bg-card/50 p-7"
                                >
                                    <div className="grid size-12 place-items-center rounded-2xl bg-accent text-brand-600">
                                        <Icon size={23} aria-hidden="true" />
                                    </div>
                                    <h3 className="mt-6 text-xl font-black text-foreground">
                                        {title}
                                    </h3>
                                    <p className="mt-3 leading-7 text-muted-foreground">
                                        {body}
                                    </p>
                                    <div className="mt-6 flex items-center gap-2 text-sm font-black text-brand-600">
                                        <Check size={16} aria-hidden="true" />
                                        {locale === 'ar'
                                            ? 'مصمم ليوم المدرسة'
                                            : 'Built for the school day'}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="bg-muted py-20" id="platform">
                <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
                    <div>
                        <p className="text-sm font-black tracking-[0.18em] text-secondary uppercase">
                            {locale === 'ar'
                                ? 'منصة واحدة لكل يوم المدرسة'
                                : 'One platform for every school day'}
                        </p>
                        <h2 className="mt-4 text-4xl font-black tracking-tight text-foreground">
                            {locale === 'ar'
                                ? 'من الإدارة إلى أثر التعلم.'
                                : 'From administration to learning impact.'}
                        </h2>
                        <p className="mt-5 max-w-xl leading-8 text-muted-foreground">
                            {locale === 'ar'
                                ? 'اربط القبول والأكاديميات والحضور والمالية والإشعارات في مساحة عمل واحدة، مع صلاحيات واضحة لكل دور.'
                                : 'Connect admissions, academics, attendance, finance, and notifications in one workspace with clear permissions for every role.'}
                        </p>
                        <Link
                            href="/features"
                            className="mt-7 inline-flex rounded-full bg-brand-600 px-6 py-3 font-black text-white transition hover:bg-brand-700"
                        >
                            {locale === 'ar'
                                ? 'استكشف المزايا'
                                : 'Explore features'}
                        </Link>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {[
                            [
                                locale === 'ar'
                                    ? 'القبول والتسجيل'
                                    : 'Admissions',
                                locale === 'ar'
                                    ? 'حوّل طلبات القبول إلى تسجيلات منظمة.'
                                    : 'Turn applications into organized enrollments.',
                                '/contact',
                            ],
                            [
                                locale === 'ar' ? 'المالية' : 'Finance',
                                locale === 'ar'
                                    ? 'فواتير وأقساط وإيصالات مع مصالحة موثوقة.'
                                    : 'Invoices, installments, and receipts with reliable reconciliation.',
                                '/pricing',
                            ],
                            [
                                locale === 'ar'
                                    ? 'التعلم والحضور'
                                    : 'Learning and attendance',
                                locale === 'ar'
                                    ? 'اجعل الحضور والأداء جزءاً من القرار اليومي.'
                                    : 'Make attendance and performance part of every daily decision.',
                                '/features',
                            ],
                            [
                                locale === 'ar'
                                    ? 'المجتمع المدرسي'
                                    : 'School community',
                                locale === 'ar'
                                    ? 'تجربة متصلة للمدير والمعلم والطالب وولي الأمر.'
                                    : 'A connected experience for leaders, teachers, students, and families.',
                                '/about',
                            ],
                        ].map(([title, body, href]) => (
                            <Link
                                key={title}
                                href={href}
                                className="group rounded-[1.75rem] border border-border bg-white p-6 transition hover:-translate-y-1 hover:border-brand-600 hover:shadow-[0_18px_45px_-28px_var(--brand-900)]"
                            >
                                <h3 className="text-lg font-black text-foreground">
                                    {title}
                                </h3>
                                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                                    {body}
                                </p>
                                <span className="mt-5 block text-sm font-black text-brand-600">
                                    {locale === 'ar'
                                        ? 'اعرف المزيد ←'
                                        : 'Learn more →'}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-hero-bg text-hero-muted" id="security">
                <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                        <p className="text-sm font-black tracking-[0.18em] text-hero-muted uppercase">
                            {locale === 'ar' ? 'الأمان أولاً' : 'Security first'}
                        </p>
                        <h2 className="mt-4 text-4xl font-black">
                            {locale === 'ar'
                                ? 'بيانات المدرسة في مكان آمن.'
                                : 'Your school data belongs in a safe place.'}
                        </h2>
                        <p className="mt-4 max-w-2xl leading-8 text-hero-accent">
                            {locale === 'ar'
                                ? 'عزل صارم بين المؤسسات، سجلات تدقيق غير قابلة للتغيير، وأمان مصمم للمدارس السعودية.'
                                : 'Strict tenant isolation, immutable audit trails, and security designed for Saudi schools.'}
                        </p>
                    </div>
                    <Link
                        href="/security"
                        className="rounded-full bg-white px-6 py-3 text-center font-black text-brand-600 transition hover:bg-accent/80"
                    >
                        {locale === 'ar'
                            ? 'اقرأ عن الأمان'
                            : 'Read about security'}
                    </Link>
                </div>
            </section>

            <section className="bg-white py-20" id="pricing">
                <div className="mx-auto max-w-7xl px-5 text-center sm:px-8">
                    <p className="text-sm font-black tracking-[0.18em] text-secondary uppercase">
                        {locale === 'ar' ? 'ابدأ بوضوح' : 'Start with clarity'}
                    </p>
                    <h2 className="mt-4 text-4xl font-black text-foreground">
                        {locale === 'ar'
                            ? 'خطة تناسب مرحلة مدرستك.'
                            : 'A plan that fits your school stage.'}
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl leading-8 text-muted-foreground">
                        {locale === 'ar'
                            ? 'تواصل معنا لنصمم بداية مناسبة لحجم مدرستك وأهدافها.'
                            : 'Talk to us and shape the right starting point for your school size and goals.'}
                    </p>
                    <Link
                        href="/pricing"
                        className="mt-7 inline-flex rounded-full border border-border px-6 py-3 font-black text-brand-700 transition hover:bg-muted"
                    >
                        {locale === 'ar' ? 'شاهد الأسعار' : 'View pricing'}
                    </Link>
                </div>
            </section>

            <section className="bg-accent py-16" id="faq">
                <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 sm:px-8 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-foreground">
                            {locale === 'ar'
                                ? 'لديك سؤال قبل البداية؟'
                                : 'Have a question before you start?'}
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            {locale === 'ar'
                                ? 'ستجد إجابات عملية في مركز الأسئلة الشائعة.'
                                : 'Find practical answers in our FAQ center.'}
                        </p>
                    </div>
                    <Link
                        href="/faq"
                        className="rounded-full bg-brand-600 px-6 py-3 text-center font-black text-white transition hover:bg-brand-700"
                    >
                        {locale === 'ar' ? 'الأسئلة الشائعة' : 'Visit the FAQ'}
                    </Link>
                </div>
            </section>
        </PublicLayout>
    );
}
