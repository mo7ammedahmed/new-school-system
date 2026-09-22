import * as RadioPrimitive from "@radix-ui/react-radio-group"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const radioGroupVariants = cva(
  "inline-flex items-center justify-center gap-2 text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground [&_svg]:pointer-effects-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface RadioGroupProps extends React.ComponentProps<typeof RadioPrimitive.Root>, VariantProps<typeof radioGroupVariants> {
  children: React.ReactNode
}

function RadioGroup({
  className,
  variant,
  size,
  children,
  ...props
}: RadioGroupProps) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group"
      className={cn(radioGroupVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </RadioPrimitive.Root>
  )
}

interface RadioItemProps extends React.ComponentProps<typeof RadioPrimitive.Item>, VariantProps<typeof radioGroupVariants> {
  children: React.ReactNode
}

function RadioItem({
  className,
  variant,
  size,
  children,
  ...props
}: RadioItemProps) {
  return (
    <RadioPrimitive.Item
      data-slot="radio-item"
      className={cn(
        radioGroupVariants({
          variant: variant || "default",
          size: size || "default",
        }),
        "flex items-center gap-2 h-9 w-full rounded-md",
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator className="shrink-0 h-4 w-4" />
      <span className="flex-1">{children}</span>
    </RadioPrimitive.Item>
  )
}

export { RadioGroup, RadioItem, radioGroupVariants }
export type { RadioGroupProps, RadioItemProps }