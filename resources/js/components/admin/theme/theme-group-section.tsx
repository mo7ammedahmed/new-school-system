import { ChevronDown } from 'lucide-react';
import type { ThemeMode, ThemeOverrides } from '@/lib/theme';
import type { TranslateFn } from '@/components/dashboard/types';
import type { ContrastPair, Field, ThemeSection } from './types';
import { ThemeTokenField } from './theme-token-field';

type ThemeGroupSectionProps = {
    section: ThemeSection;
    open: boolean;
    onToggle: (key: string, open: boolean) => void;
    title: string;
    mode: ThemeMode;
    values: ThemeOverrides;
    drafts: Record<string, string>;
    baseline: ThemeOverrides | null;
    pairsByText: Record<string, ContrastPair>;
    fieldLabel: (variable: string) => string;
    onCommit: (variable: string, value: string) => void;
    onDraft: (key: string, variable: string, value: string) => void;
    onReset: (variable: string) => void;
    t: TranslateFn;
};

export function ThemeGroupSection({
    section,
    open,
    onToggle,
    title,
    mode,
    values,
    drafts,
    baseline,
    pairsByText,
    fieldLabel,
    onCommit,
    onDraft,
    onReset,
    t,
}: ThemeGroupSectionProps) {
    return (
        <section className="border-outline-variant bg-card rounded-lg border">
            <button
                type="button"
                aria-expanded={open}
                onClick={() => onToggle(section.key, !open)}
                className="flex w-full items-center gap-3 px-4 py-3 text-start md:px-6 md:py-4"
            >
                <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className={`text-on-surface-variant shrink-0 transition-transform ${
                        open ? '' : '-rotate-90'
                    }`}
                />
                <span className="text-on-surface min-w-0 flex-1 truncate text-lg font-semibold">
                    {title}
                </span>
                {section.changed > 0 ? (
                    <span className="border-secondary text-secondary shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold">
                        {section.changed}
                    </span>
                ) : null}
            </button>

            {open ? (
                <div className="grid gap-4 px-4 pb-4 sm:grid-cols-2 md:px-6 md:pb-6 xl:grid-cols-3">
                    {section.fields.map((field: Field) => {
                        const value = values[mode][field.var] ?? '';
                        const background = field.contrast
                            ? (values[mode][field.contrast] ?? '')
                            : '';
                        const draftKey = `${mode}:${field.var}`;

                        return (
                            <ThemeTokenField
                                key={field.var}
                                variable={field.var}
                                contrast={field.contrast}
                                label={fieldLabel(field.var)}
                                contrastLabel={
                                    field.contrast
                                        ? fieldLabel(field.contrast)
                                        : ''
                                }
                                value={value}
                                background={background}
                                draftKey={draftKey}
                                draftValue={drafts[draftKey]}
                                baselineValue={baseline?.[mode][field.var]}
                                pair={
                                    field.contrast
                                        ? pairsByText[field.var]
                                        : undefined
                                }
                                onCommit={onCommit}
                                onDraft={onDraft}
                                onReset={onReset}
                                t={t}
                            />
                        );
                    })}
                </div>
            ) : null}
        </section>
    );
}
