import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppTopbar } from '@/components/app-topbar';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types/navigation';
import type { LayoutProps } from '@/types/shared';

export default function AppHeaderLayout({
    children,
    _breadcrumbs = [],
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
        <AppShell variant="header">
            <AppContent
                variant="header"
                className={cn(
                    'mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl',
                    className,
                )}
            >
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
                ) : null}
                <AppTopbar />
                {children}
            </AppContent>
        </AppShell>
    );
}
