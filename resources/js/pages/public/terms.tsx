import { Head } from '@inertiajs/react';
import { FileCheck2, Scale } from 'lucide-react';
import PublicLayout from '@/layouts/public-layout';
import { usePublicLocale } from '@/hooks/use-public-locale';
const sections = {
    ar: [
        [
            'استخدام الخدمة',
            'تلتزم المؤسسة باستخدام المنصة لأغراض تعليمية وإدارية مشروعة، وبحماية بيانات الدخول والصلاحيات.',
        ],
        [
            'مسؤولية الحساب',
            'تظل المؤسسة مسؤولة عن المستخدمين الذين تمنحهم الوصول، وعن دقة البيانات التي تدخلها إلى النظام.',
        ],
        [
            'استمرارية الخدمة',
            'نصمم المنصة للمراقبة والاعتمادية، وقد نحتاج إلى صيانة مجدولة أو تدخلات لحماية الخدمة.',
        ],
        [
            'التواصل والتحديثات',
            'قد نحدّث هذه الشروط عند تغير الخدمة، وسنوضح التغييرات الجوهرية عبر قنوات التواصل المناسبة.',
        ],
    ],
    en: [
        [
            'Using the service',
            'Institutions agree to use the platform for lawful educational and administrative purposes and protect credentials and permissions.',
        ],
        [
            'Account responsibility',
            'Each institution is responsible for the users it authorizes and the accuracy of the data entered into the system.',
        ],
        [
            'Service continuity',
            'We design for monitoring and reliability, while scheduled maintenance or protective interventions may be required.',
        ],
        [
            'Communication and updates',
            'We may update these terms as the service evolves and will communicate material changes through appropriate channels.',
        ],
    ],
};
export default function Terms() {
    const { locale } = usePublicLocale();
    const isArabic = locale === 'ar';
    return (
        <PublicLayout>
            <Head
                title={
                    isArabic ? 'شروط الاستخدام — مدرستي' : 'Terms — Madrasati'
                }
            />
            <section className="mx-auto max-w-4xl px-5 pt-20 pb-24 sm:px-8">
                <div className="flex items-center gap-4">
                    <div className="bg-surface-container-low text-primary grid size-14 place-items-center rounded-lg">
                        <Scale size={27} />
                    </div>
                    <div>
                        <p className="text-warning text-sm font-semibold">
                            {isArabic ? 'الشروط' : 'Terms'}
                        </p>
                        <h1 className="mt-1 text-4xl font-semibold tracking-tight">
                            {isArabic
                                ? 'قواعد واضحة لشراكة موثوقة.'
                                : 'Clear rules for a trusted partnership.'}
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
                    <FileCheck2 size={15} />{' '}
                    {isArabic
                        ? 'آخر تحديث: سبتمبر 2026'
                        : 'Last updated: September 2026'}
                </p>
            </section>
        </PublicLayout>
    );
}
