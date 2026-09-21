import { usePage } from '@inertiajs/react';
import type { SharedPageProps } from '@/types/shared';

export function usePageContext() {
    return usePage<SharedPageProps>().props;
}
