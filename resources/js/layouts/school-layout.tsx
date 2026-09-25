import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { AppTopbar } from '@/components/app-topbar';
import { MobileNav } from '@/components/mobile-nav';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types/navigation';
import type { LayoutProps } from '@/types/shared';

export default function SchoolLayout({
    children,
    breadcrumbs = [],
    title,
    description,
    className,
    ..._props
}: {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    title?: string;
    description?: string;
    className?: string;
} & LayoutProps) {
    return (
        <AppShell variant="sidebar">
            {/* Sidebar */}
            <AppSidebar />

            {/* Main content area */}
            <AppContent
                variant="sidebar"
                className={cn(
                    'min-w-0 overflow-x-clip pb-16 md:pb-0',
                    className,
                )}
            >
                {/* Topbar */}
                <AppTopbar />

                {/* Header with title, description, breadcrumbs */}
                {title || description ? (
                    <div className="border-b px-6 pb-4">
                        {title && (
                            <h1 className="text-foreground mb-2 text-xl font-bold">
                                {title}
                            </h1>
                        )}
                        {description && (
                            <p className="text-muted-foreground text-sm">
                                {description}
                            </p>
                        )}
                    </div>
                ) : (
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                )}

                {/* Page content */}
                {children}
            </AppContent>

            {/* Mobile navigation */}
            <MobileNav />
        </AppShell>
    );
}
