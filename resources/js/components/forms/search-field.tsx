import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { SearchIcon } from 'lucide-react';

type SearchFieldProps = {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
};

export function SearchField({
    placeholder = 'Search...',
    value,
    onChange,
    className,
}: SearchFieldProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={cn('relative w-full', className)}>
            <Input
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={cn(
                    'w-full pr-4 pl-10',
                    isFocused ? 'ring-primary ring-offset-2' : '',
                )}
            />
            <button
                type="button"
                className={cn(
                    'pointer-events-none absolute top-0 bottom-0 left-0 flex h-full items-center pl-3',
                    isFocused ? 'text-primary' : 'text-muted-foreground',
                )}
                aria-hidden="true"
            >
                <SearchIcon className="h-4 w-4" />
            </button>
        </div>
    );
}
