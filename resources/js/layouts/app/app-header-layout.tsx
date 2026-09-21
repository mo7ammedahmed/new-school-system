import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppTopbar } from '@/components/app-topbar';
import type { AppLayoutProps } from '@/types';

export default function AppHeaderLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="header">
            <AppContent variant="header">
                <AppTopbar breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}