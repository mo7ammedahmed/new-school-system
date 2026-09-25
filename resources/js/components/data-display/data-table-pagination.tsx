import { cn } from '@/lib/utils';

type DataTablePaginationProps = {
    pageIndex: number;
    pageSize: number;
    totalPages: number;
    visibleCount: number;
    totalCount: number;
    compact: boolean;
    onPageChange: (pageIndex: number) => void;
};

export function DataTablePagination({
    pageIndex,
    totalPages,
    visibleCount,
    totalCount,
    compact,
    onPageChange,
}: DataTablePaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div
            className={cn(
                'text-muted-foreground mt-4 flex items-center justify-between text-sm',
                compact && 'mt-2 text-xs',
            )}
        >
            <div className="flex items-center space-x-3">
                <p>
                    Showing {visibleCount} of {totalCount} entries
                </p>
            </div>
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => onPageChange(Math.max(0, pageIndex - 1))}
                    disabled={pageIndex === 0}
                    className={cn(
                        'discrete-button',
                        compact && 'h-8 px-3 text-xs',
                    )}
                >
                    Previous
                </button>
                <span>
                    Page {pageIndex + 1} of {totalPages}
                </span>
                <button
                    onClick={() =>
                        onPageChange(Math.min(totalPages - 1, pageIndex + 1))
                    }
                    disabled={pageIndex >= totalPages - 1}
                    className={cn(
                        'discrete-button',
                        compact && 'h-8 px-3 text-xs',
                    )}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
