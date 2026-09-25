import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useT } from '@/hooks/useT';

type DataTableToolbarProps = {
    searchable: boolean;
    searchPlaceholder: string;
    searchValue: string;
    onSearchChange: (value: string) => void;
    pageSize: number;
    pageSizeOptions: number[];
    onPageSizeChange: (value: string) => void;
    columnVisibilityControl: boolean;
    showColumnVisibility: boolean;
    exportable: boolean;
    onExport: () => void;
    compact: boolean;
};

export function DataTableToolbar({
    searchable,
    searchPlaceholder,
    searchValue,
    onSearchChange,
    pageSize,
    pageSizeOptions,
    onPageSizeChange,
    columnVisibilityControl,
    showColumnVisibility,
    exportable,
    onExport,
    compact,
}: DataTableToolbarProps) {
    const { t } = useT();

    if (
        !searchable &&
        !exportable &&
        !columnVisibilityControl &&
        pageSizeOptions.length <= 1
    ) {
        return null;
    }

    return (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            {/* Search */}
            {searchable && (
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className={cn(
                            'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-64 rounded-md border px-4 py-2 text-sm',
                            compact && 'h-8 px-3',
                            'file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
                        )}
                    />
                </div>
            )}

            {/* Controls */}
            <div className="flex items-center space-x-3">
                {/* Page size selector */}
                {pageSizeOptions.length > 1 && (
                    <>
                        <label className="text-muted-foreground sr-only text-xs">
                            {t('table.rowsPerPage')}
                        </label>
                        <select
                            value={pageSize.toString()}
                            onChange={(e) => onPageSizeChange(e.target.value)}
                            className={cn(
                                'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring rounded-md border px-3 py-1.5 text-sm',
                                compact && 'h-8 px-2',
                                'file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
                            )}
                        >
                            {pageSizeOptions.map((option) => (
                                <option key={option} value={option.toString()}>
                                    {t('table.perPage', { count: option })}
                                </option>
                            ))}
                        </select>
                    </>
                )}

                {/* Column visibility control */}
                {columnVisibilityControl && showColumnVisibility && (
                    <Button
                        variant="outline"
                        size={compact ? 'icon' : 'sm'}
                        asChild
                    >
                        <Button asChild>
                            <span className="sr-only">
                                {t('table.columnVisibility')}
                            </span>
                            ⋮
                        </Button>
                    </Button>
                )}

                {/* Export button */}
                {exportable && (
                    <Button
                        variant="outline"
                        size={compact ? 'icon' : 'sm'}
                        onClick={onExport}
                    >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">{t('table.export')}</span>
                    </Button>
                )}
            </div>
        </div>
    );
}
