import { usePage } from '@inertiajs/react';
import { useCallback } from 'react';
import type { SharedPageProps } from '@/types/shared';

export function usePageContext() {
    const { locale, direction } = usePage<SharedPageProps>().props;

    const switchLocale = useCallback((nextLocale: string) => {
        const maxAge = 60 * 60 * 24 * 365;
        document.cookie = `locale=${nextLocale};path=/;max-age=${maxAge};SameSite=Lax`;
        window.location.reload();
    }, []);

    return { ...usePage<SharedPageProps>().props, locale, direction, switchLocale };
}
