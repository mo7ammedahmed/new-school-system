import { cn } from "@/lib/utils";
import * as React from "react";

type DatePickerProps = {
    className?: string
    disabled?: boolean
    required?: boolean
    value: string | null
    onChange: (value: string | null) => void
    min?: string
    max?: string
    placeholder?: string
};

export function DatePicker({
    className,
    disabled = false,
    required = false,
    value,
    onChange,
    min,
    max,
    placeholder = "Select a date",
}: DatePickerProps) {
    return (
        <div className={cn("relative", className)}>
            <input
                type="date"
                className={cn(
                    "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-4 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                    disabled && "cursor-not-allowed opacity-50",
                )}
                value={value || ""}
                onChange={(e) => onChange(e.target.value || null)}
                min={min}
                max={max}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
            />
        </div>
    );
}