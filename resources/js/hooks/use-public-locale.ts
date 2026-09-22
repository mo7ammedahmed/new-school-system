import { usePage } from '@inertiajs/react';
import type { PublicLocale } from '@/lib/public-copy';

export function usePublicLocale() {
    const locale = (usePage<{ locale?: PublicLocale }>().props.locale ??
        'ar') as PublicLocale;
    return { locale, isArabic: locale === 'ar' };
}
