import { useEffect } from 'react';
import { usePageContext } from '@/hooks/use-page-context';

export default function LocaleDocument({ children }: { children: React.ReactNode }) {
    const { locale, direction } = usePageContext();

    useEffect(() => {
        document.documentElement.lang = locale;
        document.documentElement.dir = direction;
    }, [direction, locale]);

    return <>{children}</>;
}
