import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { MobileNav } from '@/components/mobile-nav';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types/navigation';
import type { LayoutProps } from '@/types/shared';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
    title,
    description,
    className,
    ...props
}: {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    title?: string;
    description?: string;
    className?: string;
} & LayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent
                variant="sidebar"
                className={cn('min-w-0 overflow-x-clip pb-16 md:pb-0', className)}
            >
                {title || description ? (
                    <AppSidebarHeader 
                        title={title} 
                        description={description} 
                        breadcrumbs={breadcrumbs} 
                    />
                ) : (
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                )}
                {children}
            </AppContent>
            <MobileNav />
        </AppShell>
    );
}
