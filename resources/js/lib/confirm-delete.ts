import { router } from '@inertiajs/react';

type DeleteOptions = {
    preserveScroll?: boolean;
    message?: string;
};

/**
 * Deletes only after the user confirms. Row-menu deletes used to fire straight
 * from `router.delete`, so a misplaced click destroyed the record.
 */
export function confirmDelete(url: string, options: DeleteOptions = {}): void {
    const confirmed = window.confirm(
        options.message ?? 'Delete this record? This cannot be undone.',
    );

    if (!confirmed) {
        return;
    }

    router.delete(url, { preserveScroll: options.preserveScroll ?? true });
}
