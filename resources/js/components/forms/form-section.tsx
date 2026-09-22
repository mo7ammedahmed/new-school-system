import { cn } from '@/lib/utils';

type FormSectionProps = {
    title?: string;
    description?: string;
    className?: string;
    children?: React.ReactNode;
};

export function FormSection({
    title,
    description,
    className,
    children,
}: FormSectionProps) {
    return (
        <div className={cn('space-y-4', className)}>
            {(title || description) && (
                <div className="space-y-1">
                    {title && (
                        <h3 className="text-foreground text-base leading-6 font-semibold">
                            {title}
                        </h3>
                    )}
                    {description && (
                        <p className="text-muted-foreground text-sm">
                            {description}
                        </p>
                    )}
                </div>
            )}
            {children}
        </div>
    );
}
