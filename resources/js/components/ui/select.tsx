import * as React from 'react';

import { cn } from '@/lib/utils';

type SelectProps = Omit<React.ComponentProps<'select'>, 'onChange' | 'value'> & {
    value?: string | number | null;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
};

/**
 * A dropdown backed by a native `<select>`. Every call site in this app passes
 * `value`/`onValueChange` and `<option>` children, and a native control keeps
 * keyboard behaviour, form semantics and Arabic/RTL layout for free.
 */
export function Select({
    value,
    onValueChange,
    placeholder,
    className,
    children,
    ...props
}: SelectProps) {
    const currentValue = value === null || value === undefined ? '' : String(value);

    const hasEmptyOption = React.Children.toArray(children).some(
        (child) =>
            React.isValidElement(child) &&
            child.type === 'option' &&
            String((child.props as { value?: unknown }).value ?? '') === '',
    );

    return (
        <select
            data-slot="select"
            className={cn(
                'border-input bg-background h-9 w-full min-w-40 rounded-md border px-3 text-sm shadow-xs',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            value={currentValue}
            onChange={(event) => onValueChange?.(event.target.value)}
            {...props}
        >
            {placeholder && !hasEmptyOption && (
                <option value="">{placeholder}</option>
            )}
            {children}
        </select>
    );
}
