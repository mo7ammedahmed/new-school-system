import { Sparkles, Undo2 } from 'lucide-react';
import { contrastRatio, readableOn } from '@/lib/theme';
import type { TranslateFn } from '@/components/dashboard/types';
import type { ContrastPair } from './types';

type ThemeTokenFieldProps = {
    variable: string;
    contrast?: string;
    label: string;
    contrastLabel: string;
    value: string;
    background: string;
    draftKey: string;
    draftValue: string | undefined;
    baselineValue: string | undefined;
    pair: ContrastPair | undefined;
    onCommit: (variable: string, value: string) => void;
    onDraft: (key: string, variable: string, value: string) => void;
    onReset: (variable: string) => void;
    t: TranslateFn;
};

export function ThemeTokenField({
    variable,
    contrast,
    label,
    contrastLabel,
    value,
    background,
    draftKey,
    draftValue,
    baselineValue,
    pair,
    onCommit,
    onDraft,
    onReset,
    t,
}: ThemeTokenFieldProps) {
    const ratio = value && background ? contrastRatio(value, background) : 0;
    const min = pair?.min ?? 4.5;
    const edited = value !== baselineValue;

    return (
        <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
                <span className="min-w-0">
                    <span className="flex items-center gap-2">
                        <span className="text-on-surface text-body-sm truncate font-semibold">
                            {label}
                        </span>
                        {edited ? (
                            <span
                                aria-hidden="true"
                                className="bg-secondary size-1.5 shrink-0 rounded-full"
                            />
                        ) : null}
                    </span>
                    <span className="text-on-surface-variant/80 block truncate font-mono text-[10px]">
                        {variable}
                    </span>
                </span>

                <span className="flex shrink-0 items-center gap-1">
                    {contrast ? (
                        <>
                            <span
                                title={`${label} / ${contrastLabel}: ${ratio}`}
                                className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                                    ratio >= min
                                        ? 'border-success-border bg-success-container text-success-foreground'
                                        : 'border-danger-border bg-danger-container text-danger-foreground'
                                }`}
                            >
                                {ratio}
                            </span>
                            <button
                                type="button"
                                title={t('theme.auto')}
                                aria-label={`${t('theme.auto')}: ${label}`}
                                onClick={() =>
                                    onCommit(
                                        variable,
                                        readableOn(
                                            background || value || '#000000',
                                        ),
                                    )
                                }
                                className="text-on-surface-variant hover:text-on-surface rounded-md p-1"
                            >
                                <Sparkles size={14} />
                            </button>
                        </>
                    ) : null}

                    <button
                        type="button"
                        title={t('theme.resetToken')}
                        aria-label={`${t('theme.resetToken')}: ${label}`}
                        disabled={!edited}
                        onClick={() => onReset(variable)}
                        className="text-on-surface-variant hover:text-on-surface rounded-md p-1 disabled:opacity-30"
                    >
                        <Undo2 size={14} />
                    </button>
                </span>
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="color"
                    aria-label={label}
                    value={value}
                    onChange={(event) => onCommit(variable, event.target.value)}
                    className="border-outline-variant h-10 w-14 shrink-0 cursor-pointer rounded-md border bg-transparent"
                />
                <input
                    dir="ltr"
                    aria-label={label}
                    value={draftValue ?? value}
                    onChange={(event) =>
                        onDraft(draftKey, variable, event.target.value)
                    }
                    onBlur={() => onDraft(draftKey, variable, value)}
                    className="field font-mono text-xs"
                />
            </div>
        </div>
    );
}
