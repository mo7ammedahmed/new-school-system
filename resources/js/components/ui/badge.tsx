import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Compact status chip: 22px tall, 4px radius, 12px at weight 600.
 *
 * The semantic variants carry the exact container/text/border triples from the
 * design system, so attendance, billing and grading states read the same on
 * every screen.
 */
const badgeVariants = cva(
  "inline-flex h-[22px] w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-sm border px-2 text-xs font-semibold [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-border bg-muted text-muted-foreground",
        outline: "border-border text-foreground",
        success:
          "border-success-border bg-success-container text-success-foreground",
        warning:
          "border-warning-border bg-warning-container text-warning-foreground",
        destructive: "border-danger-border bg-danger-container text-danger-foreground",
        academic:
          "border-academic-border bg-academic-container text-academic-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
