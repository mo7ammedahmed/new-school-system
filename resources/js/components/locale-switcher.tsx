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
            ? (available.find((l) => l !== locale) ?? locale)
            : locale;

    return (
        <button
            type="button"
            onClick={() => switchLocale(nextLocale)}
            className={cn(
                'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex shrink-0 items-center gap-2 rounded-xl px-2 py-2 text-sm font-bold transition-colors sm:px-3',
                className,
            )}
            aria-label={
                locale === 'ar'
                    ? 'Switch language to English'
                    : 'التبديل إلى العربية'
            }
        >
            <Globe2 size={16} />
            <span className="hidden uppercase sm:inline">{locale ?? 'ar'}</span>
        </button>
    );
}
