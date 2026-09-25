import * as React from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

type SwitchProps = Omit<
  React.ComponentProps<typeof Checkbox>,
  'className' | 'children'
> & {
  className?: string
}

/**
 * A boolean toggle. Callers pass `checked` / `onCheckedChange`, which the
 * checkbox primitive already provides, so this only restyles it as a switch.
 */
function Switch({ className, ...props }: SwitchProps) {
  return (
    <Checkbox
      role="switch"
      className={cn(
        'peer border-input relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border bg-input shadow-xs transition-colors outline-none',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
        'disabled:cursor-not-allowed disabled:opacity-50',
        '[&_[data-slot=checkbox-indicator]]:hidden',
        'before:pointer-events-none before:absolute before:inset-block-0 before:start-0.5 before:my-auto before:size-4 before:rounded-full before:bg-background before:shadow-sm before:transition-transform',
        'data-[state=checked]:before:translate-x-5 rtl:data-[state=checked]:before:-translate-x-5',
        className,
      )}
      {...props}
    />
  )
}

export { Switch }
export type { SwitchProps }
