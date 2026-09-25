import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type StatCardProps = {
    title: string;
    value: string | number | ReactNode;
    /**
     * Colour intent for the trend chip. The chip only renders when `trendLabel`
     * carries a real comparison, so a card never shows a direction that no
     * measurement backs.
     */
    trend?: 'up' | 'down' | 'neutral';
    /** The measured comparison, e.g. "+4.2%" or "12 this week". */
    trendLabel?: string;
    /** Comparative baseline under the figure. */
    description?: string;
    className?: string;
    icon?: React.ComponentType<{
        size?: number;
        className?: string;
        'aria-hidden'?: boolean;
    }>;
    href?: string;
};

/**
 * Metric KPI widget: label-caps title, optional trend chip, 28px counter and a
 * comparative baseline, on an ambient card bounded by a hairline border.
 */
export function StatCard({
    title,
    value,
    trend,
    trendLabel,
    description,
    className,
    icon: Icon,
    href,
}: StatCardProps) {
    const trendClass =
        trend === 'down'
            ? 'border-danger-border bg-danger-container text-danger-foreground'
            : trend === 'neutral'
              ? 'border-border bg-muted text-muted-foreground'
              : 'border-success-border bg-success-container text-success-foreground';

    const body = (
        <>
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                    {Icon && (
                        <Icon
                            aria-hidden={true}
                            className="text-secondary size-4 shrink-0"
                        />
                    )}
                    <p className="label-caps truncate">{title}</p>
                </div>
                {trendLabel && (
                    <span
                        className={cn(
                            'shrink-0 rounded-sm border px-1.5 py-0.5 text-xs font-semibold',
                            trendClass,
                        )}
                    >
                        {trendLabel}
                    </span>
                )}
            </div>
            <p className="metric-display mt-3">
                {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {description && (
                <p className="text-muted-foreground mt-1 text-xs">
                    {description}
                </p>
            )}
        </>
    );

    const classes = cn(
        'bg-card border-border block rounded-lg border p-3 transition-colors sm:p-4',
        href && 'hover:border-input hover:bg-muted/50',
        className,
    );

    return href ? (
        <Link href={href} className={classes}>
            {body}
        </Link>
    ) : (
        <div className={classes}>{body}</div>
    );
}
