import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-card text-foreground flex h-9 w-full min-w-0 rounded-md border px-3 text-sm transition-[border-color,box-shadow] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        /* Focus shifts the hairline to action blue under a 15% ambient glow. */
        "focus-visible:border-secondary focus-visible:ring-secondary/15 outline-none focus-visible:ring-[3px]",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/15 aria-invalid:ring-[3px]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
