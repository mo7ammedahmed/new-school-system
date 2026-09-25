import { useCallback, useMemo, useState } from 'react';
import type { Column, DataTableProps } from './data-table-types';

type UseDataTableArgs<T> = Pick<
    DataTableProps<T>,
    | 'columns'
    | 'data'
    | 'pageSize'
    | 'pageSizeOptions'
    | 'rowKey'
    | 'searchable'
    | 'searchValue'
    | 'onSearchChange'
    | 'exportFileName'
>;

/**
 * Owns every piece of table state — search, sort, pagination, selection, and
 * column visibility — and returns the derived rows the view renders.
 */
export function useDataTable<T>({
    columns,
    data,
    pageSize: initialPageSize = 10,
    rowKey,
    searchable,
    searchValue,
    onSearchChange,
    exportFileName = 'export.csv',
}: UseDataTableArgs<T>) {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [sortConfig, setSortConfig] = useState<{
        key: keyof T;
        direction: 'asc' | 'desc';
    } | null>(null);
    const [internalSearchValue, setInternalSearchValue] = useState(
        searchValue ?? '',
    );
    // The toolbar's column-visibility control is still a placeholder, so this
    // set is derived from the columns once and never mutated after mount.
    const [visibleColumns] = useState<Set<keyof T>>(
        new Set(
            columns.filter((col) => !col.hidden).map((col) => col.accessorKey),
        ),
    );
    const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(
        new Set(),
    );

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

    // Build visible columns array
    const visibleColumnsArray = useMemo(
        () =>
            columns.filter(
                (col) => !col.hidden && visibleColumns.has(col.accessorKey),
            ),
        [columns, visibleColumns],
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

    return {
        pageIndex,
        setPageIndex,
        pageSize,
        sortConfig,
        selectedKeys,
        selectedRows,
        visibleColumns,
        visibleColumnsArray,
        effectiveSearchValue,
        handleSearchChange,
        handlePageSizeChange,
        requestSort,
        handleExport,
        filteredData,
        sortedData,
        paginatedData,
        totalPages,
        keyOf,
        isSelected,
        toggleRow,
        toggleAllOnPage,
        allOnPageSelected,
        clearSelection,
    };
}

export type { Column };
