import { Head } from '@inertiajs/react';
import { FileText, LockKeyhole } from 'lucide-react';
import PublicLayout from '@/layouts/public-layout';
import { usePublicLocale } from '@/hooks/use-public-locale';
const sections = {
    ar: [
        [
            'البيانات التي نعالجها',
            'نعالج بيانات الحسابات والمدارس والطلاب والعمليات اللازمة لتقديم الخدمة وتشغيلها بأمان.',
        ],
        [
            'لماذا نستخدمها؟',
            'لتشغيل المنصة، تحسين التجربة، إرسال التنبيهات التي يختارها المستخدم، وحماية الحسابات والبيانات.',
        ],
        [
            'الاحتفاظ والوصول',
            'نحتفظ بالبيانات وفق احتياج الخدمة والتزامات المؤسسة، ونقيد الوصول حسب الدور ونطاق المؤسسة.',
        ],
        [
            'تواصلكم معنا',
            'لأي طلب متعلق بالخصوصية أو البيانات، يمكنكم التواصل مع فريقنا عبر صفحة التواصل.',
        ],
    ],
    en: [
        [
            'Data we process',
            'We process account, school, student, and operational data required to provide and secure the service.',
        ],
        [
            'Why we use it',
            'To operate the platform, improve the experience, send chosen notifications, and protect accounts and data.',
        ],
        [
            'Retention and access',
            'We retain data for service needs and institutional obligations, limiting access by role and organization scope.',
        ],
        [
            'Contact us',
            'For privacy or data requests, contact our team through the contact page.',
        ],
    ],
};
export default function Privacy() {
    const { locale } = usePublicLocale();
    const isArabic = locale === 'ar';
    return (
        <PublicLayout>
            <Head
                title={isArabic ? 'الخصوصية — مدرستي' : 'Privacy — Madrasati'}
            />
            <section className="mx-auto max-w-4xl px-5 pt-20 pb-24 sm:px-8">
                <div className="flex items-center gap-4">
                    <div className="grid size-14 place-items-center rounded-2xl bg-[#e1efe2] text-[#0d5c4d]">
                        <LockKeyhole size={27} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-[#c56a3b]">
                            {isArabic ? 'الخصوصية' : 'Privacy'}
                        </p>
                        <h1 className="mt-1 text-4xl font-black tracking-tight">
                            {isArabic
                                ? 'بياناتكم أمانة.'
                                : 'Your data is entrusted to us.'}
                        </h1>
                    </div>
                </div>
                <div className="mt-12 space-y-4">
                    {sections[locale].map(([title, body]) => (
                        <article
                            key={title}
                            className="rounded-2xl border border-[#dbe8df] bg-white p-7"
                        >
                            <h2 className="text-xl font-black">{title}</h2>
                            <p className="mt-3 leading-8 text-[#5d746c]">
                                {body}
                            </p>
                        </article>
                    ))}
                </div>
                <p className="mt-8 flex items-center gap-2 text-xs text-[#789087]">
                    <FileText size={15} />{' '}
                    {isArabic
                        ? 'آخر تحديث: سبتمبر 2026'
                        : 'Last updated: September 2026'}
                </p>
            </section>
        </PublicLayout>
    );
}
