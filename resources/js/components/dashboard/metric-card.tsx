import { cn } from "@/lib/utils";
import * as React from "react";

type MetricCardProps = {
    title: string;
    value: string | number | ReactNode;
    trend?: "up" | "down" | "neutral";
    description?: string;
    className?: string;
    showTrend?: boolean;
    icon?: React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;
    href?: string;
};

export function MetricCard({
    title,
    value,
    trend,
    description,
    className,
    showTrend = true,
    icon,
    href,
}: MetricCardProps) {
    const trendClass = cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
        trend === "up" && "bg-success/20 text-success",
        trend === "down" && "bg-destructive/20 text-destructive",
        trend === "neutral" && "bg-muted/20 text-muted-foreground",
    );

    return (
        <div
            className={cn(
                "bg-background rounded-lg border border-border/20 p-6 shadow-sm hover:shadow-md transition-shadow duration-200",
                className,
            )}
        >
            {href ? (
                <a
                    href={href}
                    className="block hover:bg-background/50 rounded-lg p-6 transition-all duration-200"
                >
                    <div className="mb-4 flex flex-col">
                        <h3 className="text-muted-foreground text-sm font-medium w-full">
                            {title}
                        </h3>
                        {showTrend && trend && (
                            <div className="mb-2 flex w-fit items-center">
                                <span className="w-3 h-3 bg-secondary rounded-full mr-1" />
                                <span className="text-xs font-medium">{trend}</span>
                            </div>
                        )}
                        <p className="text-foreground text-3xl font-bold">
                            {typeof value === "number" ? value.toLocaleString() : value}
                        </p>
                        {description && (
                            <p className="mt-2 text-muted-foreground text-sm">
                                {description}
                            </p>
                        )}
                    </div>
                </a>
            ) : (
                <div className="mb-4 flex flex-col">
                    <h3 className="text-muted-foreground text-sm font-medium w-full">
                        {title}
                    </h3>
                    {showTrend && trend && (
                        <div className="mb-2 flex w-fit items-center">
                            <span className="w-3 h-3 bg-secondary rounded-full mr-1" />
                            <span className="text-xs font-medium">{trend}</span>
                        </div>
                    )}
                    <p className="text-foreground text-3xl font-bold">
                        {typeof value === "number" ? value.toLocaleString() : value}
                    </p>
                    {description && (
                        <p className="mt-2 text-muted-foreground text-sm">
                            {description}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}