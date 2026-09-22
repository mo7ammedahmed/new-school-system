import { cn } from "@/lib/utils";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

type DashboardWidgetProps = {
    className?: string
    children: React.ReactNode
    title?: string
    showHeader?: boolean
    actions?: React.ReactNode
    // Widget-specific className for content
    contentClassName?: string
    // Show loading state
    loading?: boolean
    // Show error state
    error?: string | null
    // Error retry callback
    onRetry?: () => void
    // Show refresh button
    refreshable?: boolean
    // On refresh callback
    onRefresh?: () => void
    // Widget height constraint
    height?: number | string
};

export function DashboardWidget({
    className,
    children,
    title,
    showHeader = true,
    actions,
    contentClassName,
    loading = false,
    error = null,
    onRetry,
    refreshable = false,
    onRefresh,
    height,
}: DashboardWidgetProps) {
    return (
        <div
            className={cn(
                "bg-background border border-border rounded-lg shadow-sm",
                className
            )}
            style={{
                height: typeof height === "number" ? `${height}px` : height,
            }}
        >
            {showHeader && (
                <div className="flex flex-col border-b pb-4 pt-5 px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col space-y-1">
                            {title && (
                                <h3 className="text-lg font-semibold text-foreground">
                                    {title}
                                </h3>
                            )}
                        </div>
                        {actions || (refreshable && onRefresh) || (
                            <>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon" aria-label="Widget actions">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        {actions}
                                        {refreshable && onRefresh && (
                                            <DropdownMenuItem onClick={onRefresh}>
                                                Refresh
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className={cn(
                "p-4",
                contentClassName
            )}>
                {loading && (
                    <div className="text-center py-8">
                        <div className="h-4 w-24 bg-muted/50 rounded animate-pulse mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">Loading...</p>
                    </div>
                )}

                {error && (
                    <div className="text-center py-8 text-destructive">
                        <p className="mb-3">{error}</p>
                        {onRetry && (
                            <Button variant="outline" size="sm" onClick={onRetry}>
                                Retry
                            </Button>
                        )}
                    </div>
                )}

                {!loading && !error && children}
            </div>
        </div>
    );
}