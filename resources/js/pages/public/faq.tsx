import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ChevronDown, MessageCircleQuestion } from 'lucide-react';
import PublicLayout from '@/layouts/public-layout';
import { usePublicLocale } from '@/hooks/use-public-locale';
const questions = {
    ar: [
        [
            'هل مدرستي مناسبة للمدارس الحكومية والأهلية؟',
            'نعم. صُممت المنصة لتدعم نماذج تشغيل مختلفة، مع صلاحيات وبيانات منفصلة لكل مؤسسة ومدرسة وفرع.',
        ],
        [
            'هل تدعم المنصة العربية واتجاه RTL؟',
            'نعم. التجربة العربية وRTL جزء أساسي من التصميم.',
        ],
        [
            'كيف تضمنون عزل بيانات المدارس؟',
            'نستخدم عزلًا صارمًا على مستوى المؤسسة مع صلاحيات حسب الدور وأثر تدقيقي.',
        ],
        [
            'هل يمكن البدء بمدرسة واحدة ثم التوسع؟',
            'نعم، يمكن إضافة فروع ومؤسسات وصلاحيات دون إعادة بناء النظام.',
        ],
    ],
    en: [
        [
            'Is Madrasati suitable for public and private schools?',
            'Yes. The platform supports different operating models with separate permissions and data for every institution and school.',
        ],
        [
            'Does the platform support English and Arabic RTL?',
            'Yes. Arabic and RTL are first-class parts of the experience.',
        ],
        [
            'How do you isolate school data?',
            'We use strict organization-level isolation, role-based permissions, and auditable actions.',
        ],
        [
            'Can we start with one school and expand?',
            'Yes. Add branches, institutions, and permissions without rebuilding the system.',
        ],
    ],
};
export default function FAQ() {
    const { locale } = usePublicLocale();
    const isArabic = locale === 'ar';
    return (
        <PublicLayout active="/faq">
            <Head
                title={isArabic ? 'الأسئلة الشائعة — مدرستي' : 'FAQ — Madrasati'}
            />
            <section className="mx-auto max-w-4xl px-5 pt-20 pb-24 sm:px-8">
                <div className="text-center">
                    <div className="bg-surface-container-low text-primary mx-auto grid size-14 place-items-center rounded-lg">
                        <MessageCircleQuestion size={27} />
                    </div>
                    <p className="text-warning mt-6 text-sm font-semibold">
                        {isArabic
                            ? 'أسئلة شائعة'
                            : 'Frequently asked questions'}
                    </p>
                    <h1 className="mt-3 text-5xl font-semibold tracking-tight sm:text-6xl">
                        {isArabic
                            ? 'إجابات قبل البداية.'
                            : 'Answers before you begin.'}
                    </h1>
                </div>
                <div className="mt-14 space-y-3">
                    {questions[locale].map(([question, answer]) => (
                        <details
                            key={question}
                            className="group border-outline-variant bg-card open:bg-surface-container-low rounded-lg border p-5"
                        >
                            <summary className="text-on-surface flex cursor-pointer list-none items-center justify-between gap-5 font-semibold">
                                <span>{question}</span>
                                <ChevronDown
                                    size={20}
                                    className="text-on-surface-variant shrink-0 transition-transform group-open:rotate-180"
                                />
                            </summary>
                            <p className="text-on-surface-variant max-w-3xl pt-4 text-sm leading-8">
                                {answer}
                            </p>
                        </details>
                    ))}
                </div>
                <div className="bg-surface-container-low mt-10 flex items-center justify-between rounded-lg p-6">
                    <p className="text-on-surface font-semibold">
                        {isArabic
                            ? 'لديكم سؤال آخر؟'
                            : 'Have another question?'}
                    </p>
                    <Link
                        href="/contact"
                        className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
                    >
                        {isArabic ? 'تواصلوا معنا' : 'Contact us'}{' '}
                        <ArrowLeft size={16} />
                    </Link>
                </div>
            </section>
        </PublicLayout>
    );
}
