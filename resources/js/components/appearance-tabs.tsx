import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { useT } from '@/hooks/useT';
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();
    const { t } = useT();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: t('settings.light') },
        { value: 'dark', icon: Moon, label: t('settings.dark') },
        { value: 'system', icon: Monitor, label: t('settings.system') },
    ];

    return (
        <div
            className={cn(
                'bg-surface-container-low dark:bg-inverse-surface inline-flex gap-1 rounded-lg p-1',
                className,
            )}
            {...props}
        >
            {tabs.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => updateAppearance(value)}
                    className={cn(
                        'flex items-center rounded-md px-3.5 py-1.5 transition-colors',
                        appearance === value
                            ? 'bg-card dark:bg-inverse-surface dark:text-inverse-on-surface shadow-xs'
                            : 'text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface dark:text-on-surface-variant dark:hover:bg-inverse-surface/60',
                    )}
                >
                    <Icon className="-ml-1 h-4 w-4" />
                    <span className="ml-1.5 text-sm">{label}</span>
                </button>
            ))}
        </div>
    );
}
