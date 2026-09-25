import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type MetricCardProps = {
    title: string;
    value: string | number | ReactNode;
    /** Colour intent for the trend chip; see `trendLabel`. */
    trend?: 'up' | 'down' | 'neutral';
    /** The measured comparison. Without it no chip is rendered. */
    trendLabel?: string;
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
 * Same contract as StatCard, at the larger display size used for headline
 * totals. A trend is only ever shown when the caller measured one.
 */
export function MetricCard({
    title,
    value,
    trend,
    trendLabel,
    description,
    className,
    icon: Icon,
    href,
}: MetricCardProps) {
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
            <p className="font-display mt-3 text-4xl leading-10 font-bold tracking-[-0.025em]">
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
        'bg-card border-border block rounded-lg border p-4 transition-colors',
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
