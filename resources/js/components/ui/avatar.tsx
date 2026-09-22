import * as AvatarPrimitive from "@radix-ui/react-avatar"
import * as React from "react"

import { cn } from "@/lib/utils"

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
    src?: string;
    alt?: string;
    size?: number | string;
    name?: string;
}

function Avatar({
    className,
    src,
    alt,
    size = 32,
    name,
    ...props
}: AvatarProps) {
    const sizeClass = typeof size === 'number' ? `h-${size / 4} w-${size / 4}` : size;

    return (
        <AvatarPrimitive.Root
            data-slot="avatar"
            className={cn(
                "relative flex shrink-0 overflow-hidden rounded-full",
                sizeClass,
                className
            )}
            {...props}
        >
            {src ? (
                <AvatarPrimitive.Image
                    data-slot="avatar-image"
                    className={cn("aspect-square size-full", className)}
                    src={src}
                    alt={alt ?? name ?? ""}
                />
            ) : (
                <AvatarPrimitive.Fallback
                    data-slot="avatar-fallback"
                    className={cn(
                        "bg-muted flex size-full items-center justify-center rounded-full font-medium text-muted-foreground",
                        className
                    )}
                    delayMs={600}
                >
                    {name ? name.charAt(0).toUpperCase() : '?'}
                </AvatarPrimitive.Fallback>
            )}
        </AvatarPrimitive.Root>
    )
}

// Re-export for backward compatibility
export const AvatarImage = AvatarPrimitive.Image;
export const AvatarFallback = AvatarPrimitive.Fallback;

export { Avatar }