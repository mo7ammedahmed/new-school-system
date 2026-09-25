import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { useMemo, useState, useCallback } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/hooks/useT';

type Column<T> = {
    accessorKey: keyof T;
    header: string;
    className?: string;
    // Optional: custom rendering function
    cell?: (value: any, row: T) => React.ReactNode;
    // Optional: sortable
    sortable?: boolean;
    // Optional: hide column
    hidden?: boolean;
    // Optional: column width
    width?: string | number;
};

// Enhanced DataTableProps with additional features
type DataTableProps<T> = {
    columns: Column<T>[];
    data: T[];
    // Pagination
    pageSize?: number;
    // Initial page size options for page size selector
    pageSizeOptions?: number[];
    // Row actions: function that returns JSX for actions column
    renderRowActions?: (row: T) => React.ReactNode;
    // Show row selection checkboxes
    selectable?: boolean;
    // Stable identity for a row, required when selectable
    rowKey?: (row: T, index: number) => string | number;
    // Actions shown while rows are selected
    renderBulkActions?: (
        rows: T[],
        clearSelection: () => void,
    ) => React.ReactNode;
    // Show loading state
    loading?: boolean;
    // Empty state message
    emptyMessage?: string;
    // Empty state action (button)
    emptyAction?: React.ReactNode;
    // Enable global search
    searchable?: boolean;
    // Placeholder for global search
    searchPlaceholder?: string;
    // Current search term (controlled)
    searchValue?: string;
    // On search change callback
    onSearchChange?: (value: string) => void;
    // Enable column visibility toggling
    columnVisibilityControl?: boolean;
    // Enable export functionality
    exportable?: boolean;
    // Export filename
    exportFileName?: string;
    // Enable compact/dense mode
    compact?: boolean;
    // Show row numbers
    showRowNumbers?: boolean;
    // ClassName
    className?: string;
};

export function DataTable<T>({
    columns,
    data,
    pageSize: initialPageSize = 10,
    pageSizeOptions = [10, 25, 50, 100],
    renderRowActions,
    selectable = false,
    rowKey,
    renderBulkActions,
    loading = false,
    emptyMessage,
    emptyAction,
    searchable = false,
    searchPlaceholder = 'Search...',
    searchValue,
    onSearchChange,
    columnVisibilityControl = false,
    exportable = false,
    exportFileName = 'export.csv',
    compact = false,
    showRowNumbers = false,
    className,
}: DataTableProps<T>) {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [sortConfig, setSortConfig] = useState<{
        key: keyof T;
        direction: 'asc' | 'desc';
    } | null>(null);
    const [internalSearchValue, setInternalSearchValue] = useState(
        searchValue ?? '',
    );
    const [visibleColumns, setVisibleColumns] = useState<Set<keyof T>>(
        new Set(
            columns.filter((col) => !col.hidden).map((col) => col.accessorKey),
        ),
    );
    const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(
        new Set(),
    );
    const { t } = useT();

    const keyOf = useCallback(
        (row: T, index: number): string | number =>
            rowKey ? rowKey(row, index) : index,
        [rowKey],
    );

    const clearSelection = useCallback(() => setSelectedKeys(new Set()), []);

    // Handle controlled vs uncontrolled search
    const effectiveSearchValue =
        searchValue !== undefined ? searchValue : internalSearchValue;
    const handleSearchChange = useCallback(
        (value: string) => {
            setInternalSearchValue(value);
            if (onSearchChange) {
                onSearchChange(value);
            }
            // Reset to first page when search changes
            setPageIndex(0);
        },
        [onSearchChange],
    );

    // Filter data based on search
    const filteredData = useMemo(() => {
        if (!effectiveSearchValue || !searchable) return data;

        const searchTerm = effectiveSearchValue.toLowerCase();
        return data.filter((row) =>
            columns.some((column) => {
                if (visibleColumns.has(column.accessorKey)) {
                    const value = row[column.accessorKey];
                    return (
                        value &&
                        String(value).toLowerCase().includes(searchTerm)
                    );
                }
                return false;
            }),
        );
    }, [data, effectiveSearchValue, searchable, visibleColumns, columns]);

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortConfig) return filteredData;
        const sorted = [...filteredData].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [filteredData, sortConfig]);

    // Paginate
    const paginatedData = useMemo(() => {
        const start = pageIndex * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, pageIndex, pageSize]);

    const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));

    // Handle sort toggle
    const requestSort = useCallback((key: keyof T) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (
            sortConfig &&
            sortConfig.key === key &&
            sortConfig.direction === 'asc'
        ) {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    }, []);

    // Handle page size change
    const handlePageSizeChange = useCallback((value: string) => {
        setPageSize(Number(value));
        setPageIndex(0); // Reset to first page
    }, []);

    // Handle column visibility toggle
    const _toggleColumnVisibility = useCallback((key: keyof T) => {
        setVisibleColumns((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    }, []);

    // Export to CSV
    const handleExport = useCallback(() => {
        const header = [...visibleColumns]
            .map((key: keyof T) => {
                const col = columns.find((c) => c.accessorKey === key);
                return `"${col?.header ?? String(key)}"`;
            })
            .join(',');

        const rows = sortedData.map((row) => {
            return [...visibleColumns]
                .map((key: keyof T) => {
                    const value = row[key as keyof T];
                    const escaped = String(value ?? '')
                        .replace(/"/g, '""')
                        .replace(/,/g, ',');
                    return `"${escaped}"`;
                })
                .join(',');
        });

        const csvContent = [header, ...rows].join('\n');
        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', exportFileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [sortedData, visibleColumns, columns, exportFileName]);

    if (loading) {
        return (
            <div className={cn('data-table w-full', className)}>
                {/* Enhanced loading skeleton */}
                <div className="space-y-4">
                    <div className="bg-muted/50 h-4 w-1/2 animate-pulse rounded" />
                    <div className="bg-muted/50 h-4 w-3/4 animate-pulse rounded" />
                    <div className="bg-muted/50 h-4 w-2/3 animate-pulse rounded" />
                    <div className="bg-muted/50 h-4 w-full animate-pulse rounded" />
                </div>
            </div>
        );
    }

    if (sortedData.length === 0) {
        return (
            <div className={cn('data-table w-full', className)}>
                <div className="py-12 text-center">
                    <p className="text-muted-foreground">
                        {emptyMessage ?? t('table.noRecords')}
                    </p>
                    {emptyAction && <div className="mt-6">{emptyAction}</div>}
                </div>
            </div>
        );
    }

    // Build visible columns array
    const visibleColumnsArray = columns.filter(
        (col) => !col.hidden && visibleColumns.has(col.accessorKey),
    );

    const isSelected = (row: T, index: number) =>
        selectedKeys.has(keyOf(row, index));

    const toggleRow = (row: T, index: number) => {
        const key = keyOf(row, index);
        setSelectedKeys((previous) => {
            const next = new Set(previous);

            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }

            return next;
        });
    };

    const allOnPageSelected =
        paginatedData.length > 0 &&
        paginatedData.every((row, index) => isSelected(row, index));

    const toggleAllOnPage = (checked: boolean) => {
        setSelectedKeys((previous) => {
            const next = new Set(previous);

            paginatedData.forEach((row, index) => {
                const key = keyOf(row, index);

                if (checked) {
                    next.add(key);
                } else {
                    next.delete(key);
                }
            });

            return next;
        });
    };

    const selectedRows = paginatedData.filter((row, index) =>
        isSelected(row, index),
    );

    return (
        <div className={cn('data-table w-full', className)}>
            {/* Toolbar with search, export, and controls */}
            {(searchable ||
                exportable ||
                columnVisibilityControl ||
                pageSizeOptions.length > 1) && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    {/* Search */}
                    {searchable && (
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={effectiveSearchValue}
                                onChange={(e) =>
                                    handleSearchChange(e.target.value)
                                }
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
                                    onChange={(e) =>
                                        handlePageSizeChange(e.target.value)
                                    }
                                    className={cn(
                                        'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring rounded-md border px-3 py-1.5 text-sm',
                                        compact && 'h-8 px-2',
                                        'file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
                                    )}
                                >
                                    {pageSizeOptions.map((option) => (
                                        <option
                                            key={option}
                                            value={option.toString()}
                                        >
                                            {t('table.perPage', {
                                                count: option,
                                            })}
                                        </option>
                                    ))}
                                </select>
                            </>
                        )}

                        {/* Column visibility control */}
                        {columnVisibilityControl &&
                            visibleColumnsArray.length > 1 && (
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
                                onClick={handleExport}
                            >
                                <Download className="h-4 w-4" />
                                <span className="sr-only">
                                    {t('table.export')}
                                </span>
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {selectable && selectedKeys.size > 0 && renderBulkActions && (
                <div className="border-border bg-muted mb-2 flex items-center gap-3 rounded-md border px-3 py-2">
                    <span className="label-caps">
                        {t('table.selectedCount', { count: selectedKeys.size })}
                    </span>
                    {renderBulkActions(selectedRows, clearSelection)}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="ms-auto"
                        onClick={clearSelection}
                    >
                        {t('table.clearSelection')}
                    </Button>
                </div>
            )}

            <div className="relative">
                <table
                    className={cn(
                        'w-full border-collapse text-start text-sm',
                        compact && 'text-xs',
                        'border-separate',
                    )}
                >
                    <thead>
                        <tr className="border-border bg-muted/60 border-b">
                            {showRowNumbers && (
                                <th
                                    className={cn(
                                        'label-caps w-4 px-3 py-2 text-start',
                                        compact && 'px-2',
                                    )}
                                >
                                    #
                                </th>
                            )}
                            {selectable && (
                                <th
                                    className={cn(
                                        'w-4 px-3 py-2 text-start',
                                        compact && 'px-2',
                                    )}
                                >
                                    <Checkbox
                                        aria-label={t('table.selectAll')}
                                        checked={allOnPageSelected}
                                        onCheckedChange={(value) =>
                                            toggleAllOnPage(value === true)
                                        }
                                    />
                                </th>
                            )}
                            {visibleColumnsArray.map((column, index) => (
                                <th
                                    key={index}
                                    className={cn(
                                        'label-caps px-3 py-2 text-start',
                                        compact && 'px-2',
                                        column.className,
                                        sortableClass(column.sortable ?? true),
                                        column.width && `w-[${column.width}]`,
                                    )}
                                    onClick={() =>
                                        column.sortable &&
                                        requestSort(
                                            column.accessorKey as keyof T,
                                        )
                                    }
                                >
                                    {column.header}
                                    {column.sortable && (
                                        <span className="ms-1 text-xs">
                                            {sortConfig?.key ===
                                                column.accessorKey &&
                                                (sortConfig.direction === 'asc'
                                                    ? '↑'
                                                    : '↓')}
                                        </span>
                                    )}
                                </th>
                            ))}
                            {renderRowActions && (
                                <th
                                    className={cn(
                                        'label-caps px-3 py-2 text-start',
                                        compact && 'px-2',
                                    )}
                                >
                                    {t('common.actions')}
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-border bg-card divide-y">
                        {paginatedData.map((row, rowIndex) => (
                            <tr
                                key={keyOf(row, rowIndex)}
                                className={cn(
                                    'border-border hover:bg-background border-b transition-colors',
                                    compact ? 'h-11' : 'h-13',
                                    isSelected(row, rowIndex) &&
                                        'bg-muted border-secondary hover:bg-muted border-s-2',
                                )}
                            >
                                {showRowNumbers && (
                                    <td
                                        className={cn(
                                            'text-muted-foreground w-4 px-3 py-2 text-start',
                                            compact && 'px-2',
                                        )}
                                    >
                                        {pageIndex * pageSize + rowIndex + 1}
                                    </td>
                                )}
                                {selectable && (
                                    <td
                                        className={cn(
                                            'w-4 px-3 py-2 text-start',
                                            compact && 'px-2',
                                        )}
                                    >
                                        <Checkbox
                                            aria-label={t('table.selectRow')}
                                            checked={isSelected(row, rowIndex)}
                                            onCheckedChange={() =>
                                                toggleRow(row, rowIndex)
                                            }
                                        />
                                    </td>
                                )}
                                {visibleColumnsArray.map((column, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className={cn(
                                            'px-3 py-2',
                                            compact && 'px-2',
                                            column.className,
                                        )}
                                    >
                                        {column.cell
                                            ? column.cell(
                                                  row[
                                                      column.accessorKey as keyof T
                                                  ],
                                                  row,
                                              )
                                            : renderValue(
                                                  row[
                                                      column.accessorKey as keyof T
                                                  ],
                                              )}
                                    </td>
                                ))}
                                {renderRowActions && (
                                    <td
                                        className={cn(
                                            'px-3 py-2 text-start',
                                            compact && 'px-2',
                                        )}
                                    >
                                        {renderRowActions(row)}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Enhanced pagination info and controls */}
                {totalPages > 1 && (
                    <div
                        className={cn(
                            'text-muted-foreground mt-4 flex items-center justify-between text-sm',
                            compact && 'mt-2 text-xs',
                        )}
                    >
                        <div className="flex items-center space-x-3">
                            <p>
                                Showing {paginatedData.length} of{' '}
                                {sortedData.length} entries
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() =>
                                    setPageIndex(Math.max(0, pageIndex - 1))
                                }
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
                                    setPageIndex(
                                        Math.min(totalPages - 1, pageIndex + 1),
                                    )
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
                )}
            </div>
        </div>
    );
}

// Helper class for sortable columns
function sortableClass(sortable: boolean) {
    return sortable ? 'cursor-pointer hover:bg-accent/50' : '';
}

/** Renders a cell value without leaking `undefined` or `[object Object]`. */
function renderValue(value: unknown): React.ReactNode {
    if (value === null || value === undefined) {
        return '';
    }

    if (React.isValidElement(value) || Array.isArray(value)) {
        return value as React.ReactNode;
    }

    if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
    ) {
        return String(value);
    }

    return '';
}
