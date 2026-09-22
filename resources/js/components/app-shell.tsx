import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import LocaleSwitcher from '@/components/locale-switcher';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { AppVariant } from '@/types';

type Props = {
    children: ReactNode;
    variant?: AppVariant;
};

export function AppShell({ children, variant = 'sidebar' }: Props) {
    const isOpen = usePage().props.sidebarOpen;

    const content = (
        <>
            <div className="fixed end-4 top-4 z-50">
                <LocaleSwitcher />
            </div>
            {children}
        </>
    );

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col">{content}</div>
        );
    }

    return <SidebarProvider defaultOpen={isOpen}>{content}</SidebarProvider>;
}
