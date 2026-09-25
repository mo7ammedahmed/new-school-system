import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BellRing,
    BookOpenCheck,
    Check,
    CircleDollarSign,
    LayoutGrid,
    ShieldCheck,
} from 'lucide-react';
import PublicLayout from '@/layouts/public-layout';
import { usePageContext } from '@/hooks/use-page-context';
import { usePublicLocale } from '@/hooks/use-public-locale';

const content = {
    ar: {
        title: 'كل طبقة من تشغيل مدرستك، بوضوح.',
        eyebrow: 'منصة واحدة. أثر أكبر.',
        text: 'من أول تسجيل الطالب إلى آخر إيصال — أدوات مترابطة تجعل يوم المدرسة أبسط، وقراراتها أذكى.',
        cta: 'ابدأ الاستكشاف',
        plans: [
            {
                title: 'إدارة مدرسية مترابطة',
                points: [
                    'هيكل المؤسسات والفروع والمدارس',
                    'صلاحيات دقيقة حسب الدور',
                    'لوحات قيادة قابلة للتوسع',
                ],
            },
            {
                title: 'أثر تعلم واضح',
                points: [
                    'الحضور والانضباط في مكان واحد',
                    'التقييم والتقارير وبطاقات الأداء',
                    'مساحات عمل للمعلم وولي الأمر',
                ],
            },
            {
                title: 'مالية موثقة',
                points: [
                    'هياكل رسوم وأقساط مرنة',
                    'إيصالات غير قابلة للتلاعب',
                    'مدفوعات آمنة بإثبات webhook',
                ],
            },
            {
                title: 'تواصل في الوقت المناسب',
                points: [
                    'إشعارات عربية وإنجليزية',
                    'تفضيلات لكل مستخدم',
                    'مراقبة للتسليم والطوابير',
                ],
            },
        ],
    },
    en: {
        title: 'Every layer of school operations, made clear.',
        eyebrow: 'One platform. Greater impact.',
        text: 'From the first student record to the final receipt — connected tools make every school day simpler and every decision smarter.',
        cta: 'Explore the platform',
        plans: [
            {
                title: 'Connected school management',
                points: [
                    'Organizations, branches, and schools',
                    'Role-based permissions',
                    'Scalable leadership dashboards',
                ],
            },
            {
                title: 'Visible learning impact',
                points: [
                    'Attendance and discipline in one place',
                    'Assessment, reports, and scorecards',
                    'Workspaces for teachers and families',
                ],
            },
            {
                title: 'Trusted finance',
                points: [
                    'Flexible fee and installment structures',
                    'Immutable receipts',
                    'Webhook-verified payments',
                ],
            },
            {
                title: 'Timely communication',
                points: [
                    'Arabic and English notifications',
                    'Per-user preferences',
                    'Delivery and queue monitoring',
                ],
            },
        ],
    },
};
const icons = [LayoutGrid, BookOpenCheck, CircleDollarSign, BellRing];

export default function Features() {
    const { locale } = usePublicLocale();
    const { canRegister } = usePageContext();
    const copy = content[locale];
    return (
        <PublicLayout active="/features">
            <Head
                title={locale === 'ar' ? 'مزايا مدرستي' : 'Madrasati features'}
            />
            <section className="mx-auto max-w-7xl px-5 pt-20 pb-24 sm:px-8">
                <div className="max-w-3xl">
                    <p className="text-warning text-sm font-semibold">
                        {copy.eyebrow}
                    </p>
                    <h1 className="mt-4 text-5xl leading-tight font-semibold tracking-tight sm:text-6xl">
                        {copy.title}
                    </h1>
                    <p className="text-on-surface-variant mt-6 max-w-2xl text-lg leading-8">
                        {copy.text}
                    </p>
                </div>
                <div className="mt-14 grid gap-5 md:grid-cols-2">
                    {copy.plans.map(({ title, points }, index) => {
                        const Icon = icons[index];
                        return (
                            <article
                                key={title}
                                className="group border-outline-variant bg-card hover:shadow-outline-variant/60 rounded-lg border p-8 transition hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="bg-surface-container-low text-primary grid size-12 place-items-center rounded-lg">
                                        <Icon size={23} />
                                    </div>
                                    <ShieldCheck className="group-hover:text-primary text-[#cde5d3] transition" />
                                </div>
                                <h2 className="mt-7 text-2xl font-semibold">
                                    {title}
                                </h2>
                                <ul className="mt-5 space-y-3">
                                    {points.map((point) => (
                                        <li
                                            key={point}
                                            className="text-on-surface-variant flex items-center gap-3"
                                        >
                                            <span className="bg-surface-container-low text-primary grid size-5 place-items-center rounded-full">
                                                <Check size={12} />
                                            </span>
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </article>
                        );
                    })}
                </div>
                <div className="mt-12 text-center">
                    <Link
                        href={canRegister ? '/register' : '/contact'}
                        className="bg-primary text-primary-foreground inline-flex items-center gap-3 rounded-full px-7 py-4 font-semibold"
                    >
                        {copy.cta} <ArrowLeft size={18} />
                    </Link>
                </div>
            </section>
        </PublicLayout>
    );
}
