import { cn } from "@/lib/utils";
import * as React from "react";

type TimelineProps = {
    className?: string
    children: React.ReactNode
};

type TimelineItemProps = {
    className?: string
    children: React.ReactNode
    variant?: "default" | "outlined"
};

type TimelineDotProps = {
    className?: string
    filled?: boolean
    color?: "default" | "success" | "destructive" | "warning"
};

type TimelineContentProps = {
    className?: string
    children: React.ReactNode
};

export function Timeline({
    className,
    children,
}: TimelineProps) {
    return (
        <div
            data-slot="timeline"
            className={cn(
                "relative flex w-full min-h-0",
                className
            )}
        >
            <div className="absolute inset-0 flex w-0.5 border-border/50" />
            <div className="flex flex-col flex-1 space-y-6 ps-4 pe-2">
                {children}
            </div>
        </div>
    );
}

export function TimelineItem({
    className,
    children,
    variant = "default",
}: TimelineItemProps) {
    return (
        <div
            data-slot="timeline-item"
            className={cn(
                "flex w-full items-start gap-4",
                className
            )}
        >
            <div className="flex flex-col items-center">
                <TimelineDot variant={variant} />
                <div className="w-px bg-border/50" />
            </div>
            <div className="flex flex-col space-y-2 w-full">
                <TimelineContent className={className}>{children}</TimelineContent>
            </div>
        </div>
    );
}

export function TimelineDot({
    className,
    filled = true,
    color = "default",
}: TimelineDotProps) {
    const baseClasses = "flex h-3 w-3 items-center justify-center";
    const colorClasses = cn(
        color === "success" && "bg-success",
        color === "destructive" && "bg-destructive",
        color === "warning" && "bg-warning",
        !filled && "bg-border",
        filled && !color && "bg-primary"
    );

    return (
        <span
            data-slot="timeline-dot"
            className={cn(
                baseClasses,
                colorClasses,
                className
            )}
        >
            {filled ? (
                <span className="h-1.5 w-1.5 bg-background" />
            ) : (
                <span className="h-2.5 w-2.5 border-2 border-current" />
            )}
        </span>
    );
}

export function TimelineContent({
    className,
    children,
}: TimelineContentProps) {
    return (
        <div
            data-slot="timeline-content"
            className={cn(
                "text-sm",
                className
            )}
        >
            {children}
        </div>
    );
}