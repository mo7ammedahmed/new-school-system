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
                    <div className="bg-surface-container-low text-primary grid size-14 place-items-center rounded-lg">
                        <LockKeyhole size={27} />
                    </div>
                    <div>
                        <p className="text-warning text-sm font-semibold">
                            {isArabic ? 'الخصوصية' : 'Privacy'}
                        </p>
                        <h1 className="mt-1 text-4xl font-semibold tracking-tight">
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
                            className="border-outline-variant bg-card rounded-lg border p-7"
                        >
                            <h2 className="text-xl font-semibold">{title}</h2>
                            <p className="text-on-surface-variant mt-3 leading-8">
                                {body}
                            </p>
                        </article>
                    ))}
                </div>
                <p className="text-on-surface-variant mt-8 flex items-center gap-2 text-xs">
                    <FileText size={15} />{' '}
                    {isArabic
                        ? 'آخر تحديث: سبتمبر 2026'
                        : 'Last updated: September 2026'}
                </p>
            </section>
        </PublicLayout>
    );
}
