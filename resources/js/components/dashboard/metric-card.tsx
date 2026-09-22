import { cn } from "@/lib/utils";
import * as React from "react";

type MetricCardProps = {
    title: string;
    value: string | number | ReactNode;
    trend?: "up" | "down" | "neutral";
    description?: string;
    className?: string;
    showTrend?: boolean;
};

export function MetricCard({
    title,
    value,
    trend,
    description,
    className,
    showTrend = true,
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
                "bg-background rounded-lg border p-6 shadow-sm",
                className,
            )}
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
        </div>
    );
}