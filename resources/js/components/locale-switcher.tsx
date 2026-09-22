import { Globe2 } from 'lucide-react';
import { usePageContext } from '@/hooks/use-page-context';
import { cn } from '@/lib/utils';

type Props = {
    className?: string;
};

export default function LocaleSwitcher({ className }: Props) {
    const { locale, locales, switchLocale } = usePageContext();
    const available = Object.keys(locales ?? {});

    if (available.length < 2) {
        return null;
    }

    const nextLocale =
        available.length === 2
            ? available.find((l) => l !== locale) ?? locale
            : locale;

    return (
        <button
            type="button"
            onClick={() => switchLocale(nextLocale)}
            className={cn(
                'inline-flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                className,
            )}
            aria-label={
                locale === 'ar'
                    ? 'Switch language to English'
                    : 'التبديل إلى العربية'
            }
        >
            <Globe2 size={16} />
            <span className="uppercase">{locale ?? 'ar'}</span>
        </button>
    );
}
