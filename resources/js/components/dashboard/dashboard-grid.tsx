import { cn } from '@/lib/utils';
import * as React from 'react';

type DashboardGridProps = {
    className?: string;
    children: React.ReactNode;
    // Number of columns for different breakpoints
    cols?: {
        base?: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
    };
    // Gap between widgets
    gap?: number | string;
};

export function DashboardGrid({
    className,
    children,
    cols = { base: 1, sm: 2, md: 3, lg: 4 },
    gap = 4,
}: DashboardGridProps) {
    return (
        <div
            className={cn(
                'grid gap-4',
                gap === 'none' && 'gap-0',
                typeof gap === 'number' && `gap-${gap}`,
                typeof gap === 'string' && gap,
                className,
            )}
            style={{
                gridTemplateColumns: `
                    repeat(${
                        typeof cols.base === 'number' ? cols.base : 1
                    }, 1fr)
                    @media (min-width: 640px) {
                        repeat(${
                            typeof cols.sm === 'number' ? cols.sm : 2
                        }, 1fr)
                    }
                    @media (min-width: 768px) {
                        repeat(${
                            typeof cols.md === 'number' ? cols.md : 3
                        }, 1fr)
                    }
                    @media (min-width: 1024px) {
                        repeat(${
                            typeof cols.lg === 'number' ? cols.lg : 4
                        }, 1fr)
                    }
                `,
            }}
        >
            {children}
        </div>
    );
}
