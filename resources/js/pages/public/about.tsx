import { Head, usePage } from '@inertiajs/react';
import { HeartHandshake, LockKeyhole, MapPinned, Target } from 'lucide-react';
import PublicLayout from '@/layouts/public-layout';
import { publicCopy } from '@/lib/public-copy';
import type { PublicLocale } from '@/lib/public-copy';

const values = {
    ar: [
        {
            icon: Target,
            title: 'وضوح يصنع القرار',
            text: 'نحوّل البيانات اليومية إلى صورة عملية تساعد فرق المدرسة على التحرك بثقة.',
        },
        {
            icon: HeartHandshake,
            title: 'إنسانية قبل التقنية',
            text: 'نصمم حول احتياجات المعلم والطالب وولي الأمر، لا حول تعقيد النظام.',
        },
        {
            icon: LockKeyhole,
            title: 'ثقة من الأساس',
            text: 'عزل صارم للبيانات، أثر تدقيقي واضح، وتجربة دفع لا تعتمد على التخمين.',
        },
    ],
    en: [
        {
            icon: Target,
            title: 'Clarity drives decisions',
            text: 'We turn everyday data into practical insight that helps school teams move with confidence.',
        },
        {
            icon: HeartHandshake,
            title: 'People before technology',
            text: 'We design around teachers, students, and families — not around system complexity.',
        },
        {
            icon: LockKeyhole,
            title: 'Trust by design',
            text: 'Strict data isolation, visible audit trails, and payment flows built on evidence.',
        },
    ],
};

export default function About() {
    const locale = (usePage<{ locale?: PublicLocale }>().props.locale ??
        'ar') as PublicLocale;
    const isArabic = locale === 'ar';
    const copy = publicCopy[locale].about;
    return (
        <PublicLayout active="/about">
            <Head title={isArabic ? 'عن مدرستي' : 'About Madrasati'} />
            <section className="mx-auto max-w-7xl px-5 pt-20 pb-24 sm:px-8">
                <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
                    <div>
                        <p className="text-sm font-black text-[#c56a3b]">
                            {copy.eyebrow}
                        </p>
                        <h1 className="mt-4 text-5xl leading-tight font-black tracking-tight sm:text-6xl">
                            {copy.title}
                        </h1>
                    </div>
                    <p className="max-w-xl text-lg leading-9 text-[#5d746c]">
                        {copy.text}
                    </p>
                </div>
                <div className="mt-16 grid gap-5 md:grid-cols-3">
                    {values[locale].map(({ icon: Icon, title, text }) => (
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
                <div className="mt-16 grid gap-8 rounded-[2rem] bg-[#0d5c4d] p-8 text-white sm:p-12 md:grid-cols-2">
                    <div>
                        <MapPinned className="text-[#f4c765]" size={28} />
                        <h2 className="mt-6 text-3xl font-black">
                            {isArabic
                                ? 'من السعودية، لكل مدرسة تريد أن تتقدم.'
                                : 'From Saudi Arabia, for every school ready to move forward.'}
                        </h2>
                    </div>
                    <p className="self-end leading-8 text-[#c9e0d0]">
                        {isArabic
                            ? 'نفهم السياق المحلي، من العربية وRTL إلى الفوترة والامتثال، ونمنح كل مؤسسة مرونة بناء تجربة تناسبها.'
                            : 'We understand the local context — from Arabic and RTL to billing and compliance — while giving every institution room to shape its own experience.'}
                    </p>
                </div>
            </section>
        </PublicLayout>
    );
}
