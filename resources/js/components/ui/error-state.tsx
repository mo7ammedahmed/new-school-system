import { cn } from "@/lib/utils"
import * as React from "react"

const errorStateVariants = {
  default: "text-center py-12",
}

interface ErrorStateProps {
  className?: string
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
}

function ErrorState({
  className,
  title,
  description,
  action,
  icon,
}: ErrorStateProps) {
  return (
    <div
      data-slot="error-state"
      className={cn(errorStateVariants.default, className)}
    >
      {icon && <div className="mb-4 text-destructive">{icon}</div>}
      <h3 className="mb-3 text-lg font-semibold text-destructive">
        {title}
      </h3>
      {description && (
        <p className="mb-6 text-muted-foreground max-w-xl">
          {description}
        </p>
      )}
      {action && <div className="mb-4">{action}</div>}
    </div>
  )
}

export { ErrorState, errorStateVariants }
export type { ErrorStateProps }