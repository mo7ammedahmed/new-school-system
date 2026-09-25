import { Check, X } from 'lucide-react';
import { contrastRatio } from '@/lib/theme';
import type { ThemeMode, ThemeOverrides } from '@/lib/theme';
import type { TranslateFn } from '@/components/dashboard/types';
import type { ContrastPair } from './types';

type ThemeContrastPanelProps = {
    contrastPairs: ContrastPair[];
    mode: ThemeMode;
    values: ThemeOverrides;
    fieldLabel: (variable: string) => string;
    t: TranslateFn;
};

export function ThemeContrastPanel({
    contrastPairs,
    mode,
    values,
    fieldLabel,
    t,
}: ThemeContrastPanelProps) {
    return (
        <section className="border-outline-variant bg-card rounded-lg border p-4 md:p-6">
            <h2 className="text-on-surface text-lg font-semibold">
                {t('theme.contrast.title')}
            </h2>
            <p className="text-on-surface-variant mt-1 text-sm">
                {t('theme.contrast.hint')}
            </p>

            <ul className="mt-4 space-y-2">
                {contrastPairs.map((pair) => {
                    const ratio = contrastRatio(
                        values[mode][pair.text] ?? '',
                        values[mode][pair.on] ?? '',
                    );
                    const passes = ratio >= pair.min;

                    return (
                        <li
                            key={`${pair.text}-${pair.on}`}
                            className="border-outline-variant flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm"
                        >
                            <span className="text-on-surface min-w-0 truncate">
                                {fieldLabel(pair.text)}{' '}
                                <span className="text-on-surface-variant">
                                    {t('theme.contrast.on')}{' '}
                                    {fieldLabel(pair.on)}
                                </span>
                            </span>
                            <span
                                className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${
                                    passes
                                        ? 'border-success-border bg-success-container text-success-foreground'
                                        : 'border-danger-border bg-danger-container text-danger-foreground'
                                }`}
                            >
                                {passes ? <Check size={12} /> : <X size={12} />}
                                {`${ratio} / ${pair.min}`}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
