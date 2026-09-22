import { cn } from "@/lib/utils"
import * as React from "react"

const emptyStateVariants = {
  default: "text-center py-12",
}

interface EmptyStateProps {
  className?: string
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
}

function EmptyState({
  className,
  title,
  description,
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(emptyStateVariants.default, className)}
    >
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="mb-3 text-lg font-semibold text-foreground">
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

export { EmptyState, emptyStateVariants }
export type { EmptyStateProps }