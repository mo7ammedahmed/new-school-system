import { Slot } from "@radix-ui/react-slot"
import { Link } from "@inertiajs/react"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

  // Focus is the global :focus-visible ring (2px action blue, 2px offset).
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline:
          "border-border bg-card hover:border-input hover:bg-muted text-foreground border",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 has-[>svg]:px-3",
        /* 32px: the compact variant used inside data tables. */
        sm: "h-8 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    isLoading?: boolean
    /** When set, the button renders as a link so it actually navigates. */
    href?: string
  }

function Button({
  className,
  variant,
  size,
  asChild = false,
  isLoading = false,
  href,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, className }))

  if (href !== undefined) {
    return (
      <Link
        data-slot="button"
        href={href}
        className={cn(classes, isLoading && "pointer-events-none opacity-50")}
        {...(props as Omit<React.ComponentProps<typeof Link>, 'href'>)}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {props.children}
      </Link>
    )
  }

  // Slot requires exactly one element child, so the loading spinner cannot be
  // injected here without breaking `asChild` buttons.
  if (asChild && !isLoading) {
    return (
      <Slot data-slot="button" className={classes} {...props}>
        {props.children}
      </Slot>
    )
  }

  return (
    <button
      data-slot="button"
      className={classes}
      {...props}
      disabled={isLoading || props.disabled}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {props.children}
    </button>
  )
}

export { Button, buttonVariants }
