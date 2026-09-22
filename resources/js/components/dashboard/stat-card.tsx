import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { ReactNode } from 'react';

type StatCardProps = {
    title: string;
    value: string | number | ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    description?: string;
    className?: string;
    icon?: React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;
    href?: string;
};

export function StatCard({
    title,
    value,
    trend,
    description,
    className,
    icon,
    href,
}: StatCardProps) {
    const trendClass = cn(
        'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium',
        trend === 'up' && 'bg-success/20 text-success',
        trend === 'down' && 'bg-destructive/20 text-destructive',
        trend === 'neutral' && 'bg-muted/20 text-muted-foreground',
    );

    return (
        <div
            className={cn(
                'bg-background rounded-lg border border-border/20 p-6 shadow-sm hover:shadow-md transition-shadow duration-200',
                className,
            )}
        >
            {href ? (
                <a
                    href={href}
                    className="block hover:bg-background/50 rounded-lg p-6 transition-all duration-200"
                >
                    <div className="flex items-between justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {icon && (
                                <icon className="h-5 w-5 text-primary-foreground" />
                            )}
                            <h3 className="text-muted-foreground text-sm font-medium w-full">
                                {title}
                            </h3>
                        </div>
                        {trend && <Badge className={trendClass}>{trend}</Badge>}
                    </div>
                    <p className="text-foreground text-2xl font-bold">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </p>
                    {description && (
                        <p className="text-muted-foreground mt-2 text-sm">
                            {description}
                        </p>
                    )}
                </a>
            ) : (
                <>
                    <div className="flex items-between justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {icon && (
                                <icon className="h-5 w-5 text-primary-foreground" />
                            )}
                            <h3 className="text-muted-foreground text-sm font-medium w-full">
                                {title}
                            </h3>
                        </div>
                        {trend && <Badge className={trendClass}>{trend}</Badge>}
                    </div>
                    <p className="text-foreground text-2xl font-bold">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </p>
                    {description && (
                        <p className="text-muted-foreground mt-2 text-sm">
                            {description}
                        </p>
                    )}
                </>
            )}
        </div>
    );
}
