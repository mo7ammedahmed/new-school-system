import { usePage } from '@inertiajs/react';
import type { SharedPageProps } from '@/types/shared';
import { en } from '@/i18n/en';
import { ar } from '@/i18n/ar';

type Locale = 'en' | 'ar';

type DayNames = Record<number, string>;

type Dictionary = {
    [key: string]: unknown;
    days: DayNames;
    arDays: DayNames;
};

const dictionaries: Record<Locale, Dictionary> = { en, ar } as Record<Locale, Dictionary>;

function getNested(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce<unknown>(
        (acc, key) => (acc && typeof acc === 'object' && key in acc
            ? (acc as Record<string, unknown>)[key]
            : undefined),
        obj,
    );
}

export function useT() {
    const { props } = usePage<SharedPageProps>();
    const locale = (props.locale as Locale) ?? 'en';
    const fallback: Locale = 'en';

    const dict = dictionaries[locale] ?? dictionaries[fallback];

    const t = (key: string, params?: Record<string, string | number>): string => {
        let resolved = getNested(dict as unknown as Record<string, unknown>, key);

        if (resolved === undefined) {
            resolved = getNested(dictionaries[fallback] as unknown as Record<string, unknown>, key);
        }

        if (resolved === undefined) {
            return key;
        }

        if (params) {
            return String(resolved).replace(/\{(\w+)\}/g, (_, k: string) =>
                String(params[k] ?? `{${k}}`),
            );
        }

        return String(resolved);
    };

    const dayName = (day: number): string => {
        if (locale === 'ar') {
            return dict.arDays[day] ?? (dictionaries[fallback].arDays[day] ?? '');
        }

        return dict.days[day] ?? (dictionaries[fallback].days[day] ?? '');
    };

    return { t, dayName, locale, isArabic: locale === 'ar', dict };
}
