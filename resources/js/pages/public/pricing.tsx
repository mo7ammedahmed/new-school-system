import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import PublicLayout from '@/layouts/public-layout';
import { usePublicLocale } from '@/hooks/use-public-locale';
const plans = {
    ar: [
        {
            name: 'الأساسية',
            note: 'للمدارس الصغيرة التي تبدأ بتركيز',
            items: ['إدارة الطلاب والصفوف', 'الحضور والانضباط', 'بوابة ولي الأمر'],
        },
        {
            name: 'النمو',
            note: 'للمدارس التي تريد رؤية أوسع',
            items: [
                'كل ما في الأساسية',
                'المالية والفواتير والأقساط',
                'التقارير والإشعارات',
            ],
        },
        {
            name: 'المؤسسية',
            note: 'للمجموعات التعليمية متعددة الفروع',
            items: [
                'كل ما في النمو',
                'تعدد المؤسسات والفروع',
                'مدير نجاح مخصص',
            ],
        },
    ],
    en: [
        {
            name: 'Essentials',
            note: 'For focused, growing schools',
            items: [
                'Student and class management',
                'Attendance and discipline',
                'Family portal',
            ],
        },
        {
            name: 'Growth',
            note: 'For schools seeking a wider view',
            items: [
                'Everything in Essentials',
                'Finance, billing, and installments',
                'Reports and notifications',
            ],
        },
        {
            name: 'Enterprise',
            note: 'For multi-branch education groups',
            items: [
                'Everything in Growth',
                'Multiple institutions and branches',
                'Dedicated success manager',
            ],
        },
    ],
};
export default function Pricing() {
    const { locale } = usePublicLocale();
    const isArabic = locale === 'ar';
    return (
        <PublicLayout active="/pricing">
            <Head
                title={isArabic ? 'الأسعار — مدرستي' : 'Pricing — Madrasati'}
            />
            <section className="mx-auto max-w-7xl px-5 pt-20 pb-24 sm:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <p className="text-warning inline-flex items-center gap-2 text-sm font-semibold">
                        <Sparkles size={15} />{' '}
                        {isArabic
                            ? 'استثمار واضح في يوم مدرستك'
                            : 'A clear investment in your school day'}
                    </p>
                    <h1 className="mt-4 text-5xl leading-tight font-semibold tracking-tight sm:text-6xl">
                        {isArabic
                            ? 'خطة تناسب مرحلتكم.'
                            : 'A plan for your next stage.'}
                    </h1>
                    <p className="text-on-surface-variant mt-6 text-lg leading-8">
                        {isArabic
                            ? 'ابدؤوا بما تحتاجونه اليوم، وتوسعوا عندما تكبر رؤيتكم.'
                            : 'Start with what you need today and expand as your vision grows.'}
                    </p>
                </div>
                <div className="mt-14 grid gap-5 lg:grid-cols-3">
                    {plans[locale].map((plan, index) => (
                        <article
                            key={plan.name}
                            className={`rounded-lg border p-8 ${index === 1 ? 'border-primary bg-primary text-primary-foreground shadow-[0_25px_60px_-25px_#0d5c4d]' : 'border-outline-variant bg-card'}`}
                        >
                            <h2 className="text-2xl font-semibold">
                                {plan.name}
                            </h2>
                            <p
                                className={`mt-3 min-h-12 text-sm leading-6 ${index === 1 ? 'text-[#c9e0d0]' : 'text-on-surface-variant'}`}
                            >
                                {plan.note}
                            </p>
                            <p className="mt-8 text-3xl font-semibold">
                                {isArabic ? 'تواصل معنا' : 'Let’s talk'}
                            </p>
                            <Link
                                href="/contact"
                                className={`mt-8 flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ${index === 1 ? 'bg-card text-primary' : 'bg-primary text-primary-foreground'}`}
                            >
                                {isArabic ? 'طلب عرض' : 'Request a demo'}{' '}
                                <ArrowLeft size={16} />
                            </Link>
                            <ul
                                className={`mt-8 space-y-4 border-t pt-7 text-sm ${index === 1 ? 'border-white/20' : 'border-outline-variant'}`}
                            >
                                {plan.items.map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-center gap-3"
                                    >
                                        <span className="bg-surface-container-low text-primary grid size-5 place-items-center rounded-full">
                                            <Check size={13} />
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}
