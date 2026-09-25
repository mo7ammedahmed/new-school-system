import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export default function InputError({
    message,
    className = '',
    ...props
}: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
    return message ? (
        <p
            {...props}
            className={cn(
                'text-danger-foreground dark:text-danger-border text-sm',
                className,
            )}
        >
            {message}
        </p>
    ) : null;
}
