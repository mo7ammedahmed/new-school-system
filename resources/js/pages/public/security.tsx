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
                        <div className="grid size-14 place-items-center rounded-2xl bg-[#0d5c4d] text-white">
                            <ShieldCheck size={28} />
                        </div>
                        <p className="mt-7 text-sm font-black text-[#c56a3b]">
                            {isArabic
                                ? 'الثقة ليست ميزة إضافية'
                                : 'Trust is not an add-on'}
                        </p>
                        <h1 className="mt-3 text-5xl leading-tight font-black tracking-tight sm:text-6xl">
                            {isArabic
                                ? 'الأمان جزء من كل قرار.'
                                : 'Security belongs in every decision.'}
                        </h1>
                    </div>
                    <p className="max-w-xl text-lg leading-9 text-[#5d746c]">
                        {isArabic
                            ? 'نبني مدرستي لتكون مساحة موثوقة للبيانات التعليمية والمالية. الوضوح والعزل وإمكانية المراجعة مبادئ في المنتج.'
                            : 'Madrasati is built as a trusted space for education and finance data. Clarity, isolation, and reviewability are product principles.'}
                    </p>
                </div>
                <div className="mt-14 grid gap-5 md:grid-cols-2">
                    {pillars[locale].map(({ icon: Icon, title, text }) => (
                        <article
                            key={title}
                            className="rounded-[1.75rem] border border-[#dbe8df] bg-white p-7"
                        >
                            <div className="grid size-12 place-items-center rounded-2xl bg-[#e1efe2] text-[#0d5c4d]">
                                <Icon size={22} />
                            </div>
                            <h2 className="mt-6 text-xl font-black">{title}</h2>
                            <p className="mt-3 leading-7 text-[#6c837c]">
                                {text}
                            </p>
                        </article>
                    ))}
                </div>
                <div className="mt-12 flex flex-col gap-5 rounded-[2rem] bg-[#17342f] p-8 text-white sm:p-10 md:flex-row md:items-center md:justify-between">
                    <div>
                        <LockKeyhole className="text-[#f4c765]" size={25} />
                        <h2 className="mt-5 text-2xl font-black">
                            {isArabic
                                ? 'لديكم متطلبات امتثال محددة؟'
                                : 'Have specific compliance requirements?'}
                        </h2>
                    </div>
                    <Link
                        href="/contact"
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-black text-[#0d5c4d]"
                    >
                        {isArabic ? 'تحدثوا مع الفريق' : 'Talk to the team'}{' '}
                        <ArrowLeft size={17} />
                    </Link>
                </div>
            </section>
        </PublicLayout>
    );
}
