import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
    title,
    description,
}: {
    breadcrumbs?: BreadcrumbItemType[];
    title?: string;
    description?: string;
}) {
    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                {title || description ? (
                    <div className="flex-1 flex-col">
                        {title && (
                            <span className="text-foreground text-sm font-bold">
                                {title}
                            </span>
                        )}
                        {description && (
                            <span className="text-muted-foreground text-xs">
                                {description}
                            </span>
                        )}
                    </div>
                ) : null}
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
        </header>
    );
}
