import { cn } from '@/lib/utils'

type FormSectionProps = {
  title: string
  description?: string
  className?: string
}

export function FormSection({ title, description, className }: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-1">
        <h3 className="text-base font-semibold leading-6 text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}