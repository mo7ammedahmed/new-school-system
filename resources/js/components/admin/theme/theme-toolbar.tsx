import { Search } from 'lucide-react';
import type { ThemeMode } from '@/lib/theme';
import type { TranslateFn } from '@/components/dashboard/types';

type ThemeToolbarProps = {
    mode: ThemeMode;
    onModeChange: (mode: ThemeMode) => void;
    query: string;
    onQueryChange: (query: string) => void;
    onlyChanged: boolean;
    onOnlyChangedChange: (value: boolean) => void;
    changedCount: number;
    onExpandAll: () => void;
    onCollapseAll: () => void;
    t: TranslateFn;
};

export function ThemeToolbar({
    mode,
    onModeChange,
    query,
    onQueryChange,
    onlyChanged,
    onOnlyChangedChange,
    changedCount,
    onExpandAll,
    onCollapseAll,
    t,
}: ThemeToolbarProps) {
    return (
        <div className="border-outline-variant bg-surface/90 sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 backdrop-blur">
            <div
                role="group"
                aria-label={t('theme.modeLabel')}
                className="border-outline-variant flex shrink-0 rounded-full border p-0.5"
            >
                {(['light', 'dark'] as const).map((candidate) => (
                    <button
                        key={candidate}
                        type="button"
                        onClick={() => onModeChange(candidate)}
                        aria-pressed={mode === candidate}
                        className={`text-body-sm rounded-full px-3 py-1.5 font-semibold transition ${
                            mode === candidate
                                ? 'bg-primary text-primary-foreground'
                                : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                    >
                        {candidate === 'light'
                            ? t('theme.mode.light')
                            : t('theme.mode.dark')}
                    </button>
                ))}
            </div>

            <label className="relative min-w-40 flex-1">
                <span className="sr-only">{t('theme.search')}</span>
                <Search
                    size={14}
                    aria-hidden="true"
                    className="text-on-surface-variant pointer-events-none absolute inset-y-0 start-3 my-auto"
                />
                <input
                    type="search"
                    value={query}
                    onChange={(event) => onQueryChange(event.target.value)}
                    placeholder={t('theme.search')}
                    className="field ps-8"
                />
            </label>

            <button
                type="button"
                aria-pressed={onlyChanged}
                onClick={() => onOnlyChangedChange(!onlyChanged)}
                className={`text-body-sm shrink-0 rounded-full border px-3 py-1.5 font-semibold transition ${
                    onlyChanged
                        ? 'border-secondary text-secondary bg-secondary/10'
                        : 'border-outline-variant text-on-surface-variant hover:text-on-surface'
                }`}
            >
                {t('theme.onlyChanged')}
            </button>

            <span className="text-on-surface-variant text-body-sm shrink-0">
                {t('theme.changed', { count: changedCount })}
            </span>

            <span className="flex shrink-0 gap-1">
                <button
                    type="button"
                    onClick={onExpandAll}
                    className="text-on-surface-variant hover:text-on-surface text-body-sm rounded-md px-2 py-1"
                >
                    {t('theme.expandAll')}
                </button>
                <button
                    type="button"
                    onClick={onCollapseAll}
                    className="text-on-surface-variant hover:text-on-surface text-body-sm rounded-md px-2 py-1"
                >
                    {t('theme.collapseAll')}
                </button>
            </span>
        </div>
    );
}
