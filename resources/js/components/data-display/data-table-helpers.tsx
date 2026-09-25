import * as React from 'react';

/** Renders a cell value without leaking `undefined` or `[object Object]`. */
export function renderValue(value: unknown): React.ReactNode {
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

export function sortableClass(sortable: boolean) {
    return sortable ? 'cursor-pointer hover:bg-accent/50' : '';
}
