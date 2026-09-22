import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { useMemo, useState, useCallback } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    pageSize = 10,
    pageSizeOptions = [10, 25, 50, 100],
    renderRowActions,
    selectable = false,
    loading = false,
    emptyMessage = 'No records found.',
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
    const [sortConfig, setSortConfig] = useState<{
        key: keyof T;
        direction: 'asc' | 'desc';
    } | null>(null);
    const [internalSearchValue, setInternalSearchValue] = useState(searchValue ?? '');
    const [visibleColumns, setVisibleColumns] = useState<Set<keyof T>>(new Set(
        columns
            .filter(col => !col.hidden)
            .map(col => col.accessorKey)
    ));

    // Handle controlled vs uncontrolled search
    const effectiveSearchValue = searchValue !== undefined ? searchValue : internalSearchValue;
    const handleSearchChange = useCallback((value: string) => {
        setInternalSearchValue(value);
        if (onSearchChange) {
            onSearchChange(value);
        }
        // Reset to first page when search changes
        setPageIndex(0);
    }, [onSearchChange]);

    // Filter data based on search
    const filteredData = useMemo(() => {
        if (!effectiveSearchValue || !searchable) return data;

        const searchTerm = effectiveSearchValue.toLowerCase();
        return data.filter(row =>
            columns.some(column => {
                if (visibleColumns.has(column.accessorKey)) {
                    const value = row[column.accessorKey];
                    return value
                        && String(value).toLowerCase().includes(searchTerm);
                }
                return false;
            })
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
    const toggleColumnVisibility = useCallback((key: keyof T) => {
        setVisibleColumns(prev => {
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
        const header = visibleColumns
            .map(key => {
                const col = columns.find(c => c.accessorKey === key);
                return `"${col?.header ?? String(key)}"`;
            })
            .join(',');

        const rows = sortedData.map(row => {
            return visibleColumns
                .map(key => {
                    const value = row[key];
                    const escaped = String(value ?? '')
                        .replace(/"/g, '""')
                        .replace(/,/g, ',');
                    return `"${escaped}"`;
                })
                .join(',');
        });

        const csvContent = [header, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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
                    <div className="h-4 bg-muted/50 rounded w-1/2 animate-pulse" />
                    <div className="h-4 bg-muted/50 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-muted/50 rounded w-2/3 animate-pulse" />
                    <div className="h-4 bg-muted/50 rounded w-full animate-pulse" />
                </div>
            </div>
        );
    }

    if (sortedData.length === 0) {
        return (
            <div className={cn('data-table w-full', className)}>
                <div className="text-center py-12">
                    <p className="text-muted-foreground">
                        {emptyMessage}
                    </p>
                    {emptyAction && (
                        <div className="mt-6">
                            {emptyAction}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Build visible columns array
    const visibleColumnsArray = columns
        .filter(col => !col.hidden && visibleColumns.has(col.accessorKey));

    return (
        <div className={cn('data-table w-full', className)}>
            {/* Toolbar with search, export, and controls */}
            {(searchable || exportable || columnVisibilityControl || pageSizeOptions.length > 1) && (
                <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
                    {/* Search */}
                    {searchable && (
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={effectiveSearchValue}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className={cn(
                                    "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-64 rounded-md border px-4 py-2 text-sm",
                                    compact && "h-8 px-3",
                                    "file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                                )}
                            />
                        </div>
                    )}

                    {/* Controls */}
                    <div className="flex items-center space-x-3">
                        {/* Page size selector */}
                        {pageSizeOptions.length > 1 && (
                            <>
                                <label className="text-xs text-muted-foreground sr-only">Rows per page</label>
                                <select
                                    value={pageSize.toString()}
                                    onChange={(e) => handlePageSizeChange(e.target.value)}
                                    className={cn(
                                        "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring rounded-md border px-3 py-1.5 text-sm",
                                        compact && "h-8 px-2",
                                        "file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                                    )}
                                >
                                    {pageSizeOptions.map(option => (
                                        <option key={option} value={option.toString()}>
                                            {option} per page
                                        </option>
                                    ))}
                                </select>
                            </>
                        )}

                        {/* Column visibility control */}
                        {columnVisibilityControl && visibleColumnsArray.length > 1 && (
                            <Button
                                variant="outline"
                                size={compact ? "icon" : "sm"}
                                asChild
                            >
                                <Button asChild>
                                    <span className="sr-only">Column visibility</span>
                                    ⋮
                                </Button>
                            </Button>
                        )}

                        {/* Export button */}
                        {exportable && (
                            <Button
                                variant="outline"
                                size={compact ? "icon" : "sm"}
                                onClick={handleExport}
                            >
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Export data</span>
                            </Button>
                        )}
                    </div>
                </div>
            )}

            <div className="relative">
                <table className={cn(
                    "w-full border-collapse text-left text-sm rtl:text-right",
                    compact && "text-xs",
                    "border-separate"
                )}>
                    <thead>
                        <tr className={cn(
                            "border-b",
                            compact && "bg-muted/50"
                        )}>
                            {showRowNumbers && (
                                <th className={cn(
                                    "w-4 p-2 text-left",
                                    compact && "p-1"
                                )}>
                                    #
                                </th>
                            )}
                            {selectable && (
                                <th className={cn(
                                    "w-4 p-2 text-left",
                                    compact && "p-1"
                                )}>
                                    <Checkbox />
                                </th>
                            )}
                            {visibleColumnsArray.map((column, index) => (
                                <th
                                    key={index}
                                    className={cn(
                                        'text-muted-foreground p-2 text-left font-medium tracking-wider uppercase',
                                        compact && "p-1",
                                        column.className,
                                        sortableClass(column.sortable ?? true),
                                        column.width && `w-[${column.width}]`
                                    )}
                                    onClick={() =>
                                        column.sortable &&
                                        requestSort(column.accessorKey as keyof T)
                                    }
                                >
                                    {column.header}
                                    {column.sortable && (
                                        <span className="ml-1 text-xs">
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
                                <th className={cn(
                                    "text-muted-foreground p-2 text-left font-medium tracking-wider uppercase",
                                    compact && "p-1"
                                )}>
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className={cn(
                        "divide-border bg-card divide-y",
                        compact && "divide-y-2"
                    )}>
                        {paginatedData.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className={cn(
                                    "hover:bg-muted",
                                    compact && "hover:bg-muted/50",
                                    "border-b"
                                )}
                            >
                                {showRowNumbers && (
                                    <td className={cn(
                                        "w-4 p-2 text-left text-muted-foreground",
                                        compact && "p-1"
                                    )}>
                                        {pageIndex * pageSize + rowIndex + 1}
                                    </td>
                                )}
                                {selectable && (
                                    <td className={cn(
                                        "w-4 p-2 text-left",
                                        compact && "p-1"
                                    )}>
                                        <Checkbox />
                                    </td>
                                )}
                                {visibleColumnsArray.map((column, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className={cn('p-2', compact && "p-1", column.className)}
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
                                    <td className={cn(
                                        "p-2 text-left",
                                        compact && "p-1"
                                    )}>
                                        {renderRowActions(row)}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Enhanced pagination info and controls */}
                {totalPages > 1 && (
                    <div className={cn(
                        "text-muted-foreground mt-4 flex items-center justify-between text-sm",
                        compact && "mt-2 text-xs"
                    )}>
                        <div className="flex items-center space-x-3">
                            <p>
                                Showing {paginatedData.length} of {sortedData.length}{' '}
                                entries
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() =>
                                    setPageIndex(Math.max(0, pageIndex - 1))
                                }
                                disabled={pageIndex === 0}
                                className={cn(
                                    "discrete-button",
                                    compact && "h-8 px-3 text-xs"
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
                                    "discrete-button",
                                    compact && "h-8 px-3 text-xs"
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

    return String(value);
}
