import type * as React from 'react';

export type Column<T> = {
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

export type BulkActions<T> = (
    rows: T[],
    clearSelection: () => void,
) => React.ReactNode;

export type DataTableProps<T> = {
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
    renderBulkActions?: BulkActions<T>;
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
