/**
 * Reads a nested relation off a list row whose declared type may not include
 * it. Controllers send full models, so relations are present at runtime even
 * when the page's own prop type is narrower.
 */
export function related<T>(row: unknown, key: string): T | undefined {
    if (row === null || typeof row !== 'object') {
        return undefined;
    }

    const value = (row as Record<string, unknown>)[key];

    return value === null || value === undefined ? undefined : (value as T);
}

/**
 * Normalises the list payloads the server actually sends.
 *
 * Controllers in this app use three different shapes for a list prop:
 * a Laravel paginator (`data` + top-level `current_page`/`last_page`),
 * a resource-style collection (`data` + `meta`), and a plain array or null
 * when the viewer has no school yet. Pages should not have to care which.
 */
export type PaginatedList<T> = {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
    };
    isEmpty: boolean;
};

type PaginatorLike<T> = {
    data?: T[] | null;
    current_page?: number | null;
    last_page?: number | null;
    total?: number | null;
    meta?: {
        current_page?: number | null;
        last_page?: number | null;
        total?: number | null;
    } | null;
};

export function paginated<T>(value: unknown): PaginatedList<T> {
    if (Array.isArray(value)) {
        return {
            data: value as T[],
            meta: {
                current_page: 1,
                last_page: 1,
                total: value.length,
            },
            isEmpty: value.length === 0,
        };
    }

    if (value === null || typeof value !== 'object') {
        return {
            data: [],
            meta: { current_page: 1, last_page: 1, total: 0 },
            isEmpty: true,
        };
    }

    const payload = value as PaginatorLike<T>;
    const data = Array.isArray(payload.data) ? payload.data : [];
    const currentPage = payload.meta?.current_page ?? payload.current_page ?? 1;
    const lastPage = payload.meta?.last_page ?? payload.last_page ?? 1;
    const total = payload.meta?.total ?? payload.total ?? data.length;

    return {
        data,
        meta: {
            current_page: currentPage,
            last_page: lastPage,
            total,
        },
        isEmpty: data.length === 0,
    };
}
