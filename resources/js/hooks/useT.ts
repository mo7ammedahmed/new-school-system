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

const dictionaries: Record<Locale, Dictionary> = { en, ar } as Record<
    Locale,
    Dictionary
>;

function getNested(obj: Record<string, unknown>, path: string): unknown {
    return path
        .split('.')
        .reduce<unknown>(
            (acc, key) =>
                acc && typeof acc === 'object' && key in acc
                    ? (acc as Record<string, unknown>)[key]
                    : undefined,
            obj,
        );
}

/**
 * Wraps an interpolated value in Unicode isolates. Without them a Latin name
 * inside an Arabic sentence drags the punctuation after it to the wrong end of
 * the line.
 */
const RTL_ISOLATES = { start: '\u2068', end: '\u2069' };

export function useT() {
    const { props } = usePage<SharedPageProps>();
    const locale = (props.locale as Locale) ?? 'en';
    const fallback: Locale = 'en';

    const dict = dictionaries[locale] ?? dictionaries[fallback];

    const t = (
        key: string,
        params?: Record<string, string | number>,
    ): string => {
        let resolved = getNested(
            dict as unknown as Record<string, unknown>,
            key,
        );

        if (resolved === undefined) {
            resolved = getNested(
                dictionaries[fallback] as unknown as Record<string, unknown>,
                key,
            );
        }

        if (resolved === undefined) {
            return key;
        }

        if (typeof resolved !== 'string' && typeof resolved !== 'number') {
            return '';
        }

        if (params) {
            const isolate = (value: string): string =>
                locale === 'ar' && value !== ''
                    ? `${RTL_ISOLATES.start}${value}${RTL_ISOLATES.end}`
                    : value;

            return resolved
                .toString()
                .replace(/\{(\w+)\}/g, (_, k: string) =>
                    isolate(String(params[k] ?? `{${k}}`)),
                );
        }

        return resolved.toString();
    };

    const dayName = (day: number): string => {
        if (locale === 'ar') {
            return dict.arDays[day] ?? dictionaries[fallback].arDays[day] ?? '';
        }

        return dict.days[day] ?? dictionaries[fallback].days[day] ?? '';
    };

    return { t, dayName, locale, isArabic: locale === 'ar', dict };
}
