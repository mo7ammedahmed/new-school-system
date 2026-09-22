import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type StatCardProps = {
    title: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    description?: string;
    className?: string;
};

export function StatCard({
    title,
    value,
    trend,
    description,
    className,
}: StatCardProps) {
    const trendClass = cn(
        'rounded px-2 py-0.5 text-xs font-medium',
        trend === 'up' && 'bg-success/20 text-success',
        trend === 'down' && 'bg-destructive/20 text-destructive',
        trend === 'neutral' && 'bg-muted/20 text-muted-foreground',
    );

    return (
        <div
            className={cn(
                'bg-background rounded-lg border p-4 shadow-sm',
                className,
            )}
        >
            <div className="items-between flex justify-between pb-2">
                <h3 className="text-muted-foreground text-sm font-medium">
                    {title}
                </h3>
                {trend && <Badge className={trendClass}>{trend}</Badge>}
            </div>
            <p className="text-foreground text-2xl font-bold">
                {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {description && (
                <p className="text-muted-foreground mt-1 text-sm">
                    {description}
                </p>
            )}
        </div>
    );
}
