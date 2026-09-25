import { cn } from '@/lib/utils';
import * as React from 'react';

type TimelineProps = {
    className?: string;
    children: React.ReactNode;
};

type TimelineItemProps = {
    className?: string;
    children: React.ReactNode;
    variant?: 'default' | 'outlined';
};

type TimelineDotProps = {
    className?: string;
    filled?: boolean;
    variant?: 'default' | 'outlined';
    color?: 'default' | 'success' | 'destructive' | 'warning';
    children?: React.ReactNode;
};

type TimelineContentProps = {
    className?: string;
    children: React.ReactNode;
};

export function Timeline({ className, children }: TimelineProps) {
    return (
        <div
            data-slot="timeline"
            className={cn(
                'border-border/50 relative flex min-h-0 w-full border-l pl-4',
                className,
            )}
        >
            <div className="flex flex-1 flex-col space-y-6 ps-4 pe-2">
                {children}
            </div>
        </div>
    );
}

export function TimelineItem({
    className,
    children,
    variant = 'default',
}: TimelineItemProps) {
    return (
        <div
            data-slot="timeline-item"
            className={cn('flex w-full items-start gap-4', className)}
        >
            <div className="flex flex-col items-center">
                <TimelineDot variant={variant} />
                <div className="bg-border/50 w-px" />
            </div>
            <div className="flex w-full flex-col space-y-2">
                <TimelineContent className={className}>
                    {children}
                </TimelineContent>
            </div>
        </div>
    );
}

export function TimelineDot({
    className,
    filled,
    variant = 'default',
    color = 'default',
    children,
}: TimelineDotProps) {
    const isFilled = filled ?? variant !== 'outlined';
    const baseClasses = 'flex h-3 w-3 items-center justify-center';
    const colorClasses = cn(
        color === 'success' && 'bg-success/20 text-success',
        color === 'destructive' && 'bg-destructive/20 text-destructive',
        color === 'warning' && 'bg-warning/20 text-warning',
        !isFilled && 'bg-border/50',
        isFilled && !color && 'bg-primary/20 text-primary',
    );

    return (
        <span
            data-slot="timeline-dot"
            className={cn(
                baseClasses,
                colorClasses,
                className,
                'flex h-4 w-4 items-center justify-center rounded-full',
            )}
        >
            {children ??
                (isFilled ? (
                    <span className="h-2.5 w-2.5 bg-current" />
                ) : (
                    <span className="h-3 w-3 border-2 border-current" />
                ))}
        </span>
    );
}

export function TimelineContent({ className, children }: TimelineContentProps) {
    return (
        <div data-slot="timeline-content" className={cn('text-sm', className)}>
            {children}
        </div>
    );
}
