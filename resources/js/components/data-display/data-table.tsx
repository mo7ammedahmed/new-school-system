import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useT } from '@/hooks/useT';
import { renderValue, sortableClass } from './data-table-helpers';
import type { Column, BulkActions } from './data-table-types';
import { DataTableToolbar } from './data-table-toolbar';
import { DataTablePagination } from './data-table-pagination';
import { useDataTable } from './use-data-table';
import type { DataTableProps } from './data-table-types';

export type { Column, DataTableProps };

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
    const { t } = useT();

    const table = useDataTable<T>({
        columns,
        data,
        pageSize: initialPageSize,
        pageSizeOptions,
        rowKey,
        searchable,
        searchValue,
        onSearchChange,
        exportFileName,
    });

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

    if (table.sortedData.length === 0) {
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

    const bulkActions: BulkActions<T> | undefined = renderBulkActions;

    return (
        <div className={cn('data-table w-full', className)}>
            {/* Toolbar with search, export, and controls */}
            <DataTableToolbar
                searchable={searchable}
                searchPlaceholder={searchPlaceholder}
                searchValue={table.effectiveSearchValue}
                onSearchChange={table.handleSearchChange}
                pageSize={table.pageSize}
                pageSizeOptions={pageSizeOptions}
                onPageSizeChange={table.handlePageSizeChange}
                columnVisibilityControl={columnVisibilityControl}
                showColumnVisibility={table.visibleColumnsArray.length > 1}
                exportable={exportable}
                onExport={table.handleExport}
                compact={compact}
            />

            {selectable && table.selectedKeys.size > 0 && bulkActions && (
                <div className="border-border bg-muted mb-2 flex items-center gap-3 rounded-md border px-3 py-2">
                    <span className="label-caps">
                        {t('table.selectedCount', {
                            count: table.selectedKeys.size,
                        })}
                    </span>
                    {bulkActions(table.selectedRows, table.clearSelection)}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="ms-auto"
                        onClick={table.clearSelection}
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
                                        checked={table.allOnPageSelected}
                                        onCheckedChange={(value) =>
                                            table.toggleAllOnPage(
                                                value === true,
                                            )
                                        }
                                    />
                                </th>
                            )}
                            {table.visibleColumnsArray.map((column, index) => (
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
                                        table.requestSort(
                                            column.accessorKey as keyof T,
                                        )
                                    }
                                >
                                    {column.header}
                                    {column.sortable && (
                                        <span className="ms-1 text-xs">
                                            {table.sortConfig?.key ===
                                                column.accessorKey &&
                                                (table.sortConfig.direction ===
                                                'asc'
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
                        {table.paginatedData.map((row, rowIndex) => (
                            <tr
                                key={table.keyOf(row, rowIndex)}
                                className={cn(
                                    'border-border hover:bg-background border-b transition-colors',
                                    compact ? 'h-11' : 'h-13',
                                    table.isSelected(row, rowIndex) &&
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
                                        {table.pageIndex * table.pageSize +
                                            rowIndex +
                                            1}
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
                                            checked={table.isSelected(
                                                row,
                                                rowIndex,
                                            )}
                                            onCheckedChange={() =>
                                                table.toggleRow(row, rowIndex)
                                            }
                                        />
                                    </td>
                                )}
                                {table.visibleColumnsArray.map(
                                    (column, colIndex) => (
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
                                    ),
                                )}
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
                <DataTablePagination
                    pageIndex={table.pageIndex}
                    pageSize={table.pageSize}
                    totalPages={table.totalPages}
                    visibleCount={table.paginatedData.length}
                    totalCount={table.sortedData.length}
                    compact={compact}
                    onPageChange={table.setPageIndex}
                />
            </div>
        </div>
    );
}
