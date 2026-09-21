import { router } from '@inertiajs/react';
import { usePageContext } from '@/hooks/use-page-context';

export default function LocaleSwitcher() {
    const { locale, locales } = usePageContext();

    if (Object.keys(locales).length < 2) {
        return null;
    }

    function changeLocale(nextLocale: string) {
        document.cookie = `locale=${encodeURIComponent(nextLocale)}; path=/; max-age=31536000; samesite=lax`;
        router.reload();
    }

    return (
        <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span className="sr-only">Language</span>
            <select
                aria-label="Language"
                className="rounded-md border border-input bg-background px-2 py-1 text-foreground"
                value={locale}
                onChange={(event) => changeLocale(event.target.value)}
            >
                {Object.entries(locales).map(([code, language]) => (
                    <option key={code} value={code}>
                        {language.label}
                    </option>
                ))}
            </select>
        </label>
    );
}
