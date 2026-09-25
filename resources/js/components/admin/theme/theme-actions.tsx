import { RotateCcw, Save } from 'lucide-react';
import type { TranslateFn } from '@/components/dashboard/types';

type ThemeActionsProps = {
    hint: string;
    canReset: boolean;
    canSave: boolean;
    processing: boolean;
    onReset: () => void;
    t: TranslateFn;
};

export function ThemeActions({
    hint,
    canReset,
    canSave,
    processing,
    onReset,
    t,
}: ThemeActionsProps) {
    return (
        <div className="border-outline-variant bg-card sticky bottom-2 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
            <p className="text-on-surface-variant text-sm">{hint}</p>

            <div className="flex flex-wrap gap-3">
                <button
                    type="button"
                    disabled={!canReset}
                    onClick={onReset}
                    className="border-outline-variant text-on-surface inline-flex items-center gap-2 rounded-full border px-5 py-3 font-semibold disabled:opacity-40"
                >
                    <RotateCcw size={16} />
                    {t('theme.reset')}
                </button>
                <button
                    type="submit"
                    disabled={!canSave || processing}
                    className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold disabled:opacity-40"
                >
                    <Save size={16} />
                    {t('theme.save')}
                </button>
            </div>
        </div>
    );
}
