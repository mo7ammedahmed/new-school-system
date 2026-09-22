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
        <label className="text-muted-foreground inline-flex items-center gap-2 text-sm">
            <span className="sr-only">Language</span>
            <select
                aria-label="Language"
                className="border-input bg-background text-foreground rounded-md border px-2 py-1"
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
