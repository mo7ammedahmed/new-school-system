import * as React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import type { AppVariant } from '@/types';

type Props = React.ComponentProps<'main'> & {
    variant?: AppVariant;
};

export function AppContent({ variant = 'sidebar', children, ...props }: Props) {
    // The blade-level skip link targets #main-content, so every layout that
    // renders page content must expose that id.
    if (variant === 'sidebar') {
        return (
            <SidebarInset {...props} id="main-content">
                {children}
            </SidebarInset>
        );
    }

    return (
        <main
            className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4"
            {...props}
            id="main-content"
        >
            {children}
        </main>
    );
}
