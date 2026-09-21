export const publicCopy = {
    ar: {
        about: { eyebrow: 'من نحن', title: 'نؤمن أن المدرسة الجيدة تستحق نظاماً يليق بها.', text: 'مدرستي منصة سعودية أولاً، نبنيها مع قادة المدارس لنزيل الضوضاء من العمليات اليومية ونمنحهم مساحة أكبر لما يصنع الفرق: التعلم، الإنسان، والمجتمع.' },
        features: { eyebrow: 'منصة واحدة. أثر أكبر.', title: 'كل طبقة من تشغيل مدرستك، بوضوح.', text: 'من أول تسجيل الطالب إلى آخر إيصال — أدوات مترابطة تجعل يوم المدرسة أبسط، وقراراتها أذكى.' },
        contact: { eyebrow: 'نحن قريبون', title: 'لنبدأ من سؤال واحد: ما الذي تحتاجه مدرستك؟', text: 'سواء كنتم في مرحلة الاستكشاف أو جاهزين للانطلاق، نساعدكم على اختيار الطريق الأنسب.' },
    },
    en: {
        about: { eyebrow: 'About us', title: 'Great schools deserve an operating system built for them.', text: 'Madrasati is Saudi-first. We build with school leaders to remove operational noise and create more room for what matters: learning, people, and community.' },
        features: { eyebrow: 'One platform. Greater impact.', title: 'Every layer of school operations, made clear.', text: 'From the first student record to the final receipt — connected tools make every school day simpler and every decision smarter.' },
        contact: { eyebrow: 'We are close', title: 'Let’s start with one question: what does your school need?', text: 'Whether you are exploring or ready to launch, we will help you choose the right path.' },
    },
} as const;

export type PublicLocale = keyof typeof publicCopy;
