import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Database,
    FileCheck2,
    KeyRound,
    LockKeyhole,
    ServerCog,
    ShieldCheck,
} from 'lucide-react';
import PublicLayout from '@/layouts/public-layout';
import { usePublicLocale } from '@/hooks/use-public-locale';
const pillars = {
    ar: [
        {
            icon: Database,
            title: 'عزل على مستوى المؤسسة',
            text: 'كل استعلام مالي أو أكاديمي يمر عبر نطاق المؤسسة، حتى تبقى بيانات المدارس منفصلة وواضحة.',
        },
        {
            icon: KeyRound,
            title: 'صلاحيات دقيقة',
            text: 'الأدوار والصلاحيات تمنح كل مستخدم أقل قدر لازم من الوصول لأداء عمله.',
        },
        {
            icon: FileCheck2,
            title: 'أثر تدقيقي غير قابل للعبث',
            text: 'الإجراءات الحساسة والمالية تُسجل مع هوية المنفذ والوقت والسياق.',
        },
        {
            icon: ServerCog,
            title: 'مراقبة تشغيلية',
            text: 'نراقب الطوابير والتسليم ونبض العمال حتى تظهر المشكلات قبل أن تؤثر على يوم المدرسة.',
        },
    ],
    en: [
        {
            icon: Database,
            title: 'Organization-level isolation',
            text: 'Every academic and finance query is scoped to its organization so school data stays separate and clear.',
        },
        {
            icon: KeyRound,
            title: 'Precise permissions',
            text: 'Roles give each user only the access they need to perform their work.',
        },
        {
            icon: FileCheck2,
            title: 'Tamper-resistant audit trail',
            text: 'Sensitive and financial actions record the actor, time, and context for trusted review.',
        },
        {
            icon: ServerCog,
            title: 'Operational monitoring',
            text: 'We monitor queues, delivery, and worker health before issues affect the school day.',
        },
    ],
};
export default function Security() {
    const { locale } = usePublicLocale();
    const isArabic = locale === 'ar';
    return (
        <PublicLayout active="/security">
            <Head
                title={
                    isArabic
                        ? 'الأمان والثقة — مدرستي'
                        : 'Trust and security — Madrasati'
                }
            />
            <section className="mx-auto max-w-7xl px-5 pt-20 pb-24 sm:px-8">
                <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
                    <div>
                        <div className="bg-primary text-primary-foreground grid size-14 place-items-center rounded-lg">
                            <ShieldCheck size={28} />
                        </div>
                        <p className="text-warning mt-7 text-sm font-semibold">
                            {isArabic
                                ? 'الثقة ليست ميزة إضافية'
                                : 'Trust is not an add-on'}
                        </p>
                        <h1 className="mt-3 text-5xl leading-tight font-semibold tracking-tight sm:text-6xl">
                            {isArabic
                                ? 'الأمان جزء من كل قرار.'
                                : 'Security belongs in every decision.'}
                        </h1>
                    </div>
                    <p className="text-on-surface-variant max-w-xl text-lg leading-9">
                        {isArabic
                            ? 'نبني مدرستي لتكون مساحة موثوقة للبيانات التعليمية والمالية. الوضوح والعزل وإمكانية المراجعة مبادئ في المنتج.'
                            : 'Madrasati is built as a trusted space for education and finance data. Clarity, isolation, and reviewability are product principles.'}
                    </p>
                </div>
                <div className="mt-14 grid gap-5 md:grid-cols-2">
                    {pillars[locale].map(({ icon: Icon, title, text }) => (
                        <article
                            key={title}
                            className="border-outline-variant bg-card rounded-lg border p-7"
                        >
                            <div className="bg-surface-container-low text-primary grid size-12 place-items-center rounded-lg">
                                <Icon size={22} />
                            </div>
                            <h2 className="mt-6 text-xl font-semibold">
                                {title}
                            </h2>
                            <p className="text-on-surface-variant mt-3 leading-7">
                                {text}
                            </p>
                        </article>
                    ))}
                </div>
                <div className="bg-primary-container mt-12 flex flex-col gap-5 rounded-lg p-8 text-white sm:p-10 md:flex-row md:items-center md:justify-between">
                    <div>
                        <LockKeyhole
                            className="text-warning-border"
                            size={25}
                        />
                        <h2 className="mt-5 text-2xl font-semibold">
                            {isArabic
                                ? 'لديكم متطلبات امتثال محددة؟'
                                : 'Have specific compliance requirements?'}
                        </h2>
                    </div>
                    <Link
                        href="/contact"
                        className="bg-card text-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold"
                    >
                        {isArabic ? 'تحدثوا مع الفريق' : 'Talk to the team'}{' '}
                        <ArrowLeft size={17} />
                    </Link>
                </div>
            </section>
        </PublicLayout>
    );
}
