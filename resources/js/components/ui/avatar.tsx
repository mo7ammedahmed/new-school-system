import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as React from 'react';

import { cn } from '@/lib/utils';

interface AvatarProps
    extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
    /** Renders a single image instead of composing `AvatarImage`/`AvatarFallback`. */
    src?: string;
    alt?: string;
    size?: number | string;
    /** Initial shown when there is no image and no children. */
    name?: string;
}

// Tailwind only emits classes it can see, so sizes are named, not interpolated.
const SIZES: Record<number, string> = {
    24: 'size-6',
    28: 'size-7',
    32: 'size-8',
    36: 'size-9',
    40: 'size-10',
    48: 'size-12',
};

function Avatar({
    className,
    src,
    alt,
    size = 32,
    name,
    children,
    ...props
}: AvatarProps) {
    const sizeClass =
        typeof size === 'number' ? (SIZES[size] ?? 'size-8') : size;

    return (
        <AvatarPrimitive.Root
            data-slot="avatar"
            className={cn(
                'relative flex shrink-0 overflow-hidden rounded-full',
                sizeClass,
                className,
            )}
            {...props}
        >
            {children ??
                (src ? (
                    <AvatarImage src={src} alt={alt ?? name ?? ''} />
                ) : (
                    <AvatarFallback>
                        {name ? name.charAt(0).toUpperCase() : '?'}
                    </AvatarFallback>
                ))}
        </AvatarPrimitive.Root>
    );
}

/** Radix primitives plus the sizing and centring every avatar slot needs. */
const AvatarImage = React.forwardRef<
    React.ComponentRef<typeof AvatarPrimitive.Image>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Image
        ref={ref}
        data-slot="avatar-image"
        className={cn('aspect-square size-full', className)}
        {...props}
    />
));
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = React.forwardRef<
    React.ComponentRef<typeof AvatarPrimitive.Fallback>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Fallback
        ref={ref}
        data-slot="avatar-fallback"
        className={cn(
            'bg-muted text-muted-foreground flex size-full items-center justify-center rounded-full text-xs font-semibold',
            className,
        )}
        {...props}
    />
));
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarFallback, AvatarImage };
