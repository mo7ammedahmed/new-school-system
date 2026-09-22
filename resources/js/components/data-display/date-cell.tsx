import { cn } from '@/lib/utils';

type DateCellProps = {
    value: string | Date | null;
    className?: string;
};

export function DateCell({ value, className }: DateCellProps) {
    if (!value) return <span className="text-muted-foreground">—</span>;

    const date = typeof value === 'string' ? new Date(value) : value;
    return (
        <span className={cn('text-sm', className)}>
            {date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })}
        </span>
    );
}
