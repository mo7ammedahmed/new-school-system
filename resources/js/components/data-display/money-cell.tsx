import { cn } from '@/lib/utils'

type MoneyCellProps = {
  value: number | string
  currency?: string
  className?: string
}

export function MoneyCell({ value, currency = 'USD', className }: MoneyCellProps) {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return <span className="text-muted-foreground">—</span>

  const formatted = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(num)

  return (
    <span className={cn('text-sm font-medium', className)}>
      {formatted}
    </span>
  )
}