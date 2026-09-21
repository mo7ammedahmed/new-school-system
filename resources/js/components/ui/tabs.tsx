import { createContext, useContext, useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type TabsContextType = {
  value: string
  setValue: (value: string) => void
}

const TabsContext = createContext<TabsContextType | null>(null)

type TabsProps = {
  defaultValue: string
  className?: string
  children: ReactNode
}

type TabsListProps = {
  className?: string
  children: ReactNode
}

type TabsTriggerProps = {
  value: string
  className?: string
  children: ReactNode
}

type TabsContentProps = {
  value: string
  className?: string
  children: ReactNode
}

export function Tabs({ defaultValue, className, children }: TabsProps) {
  const [value, setValue] = useState<string>(defaultValue)

  return (
        <TabsContext.Provider value={{ value, setValue }}>
          <div className={cn('tabs', className)}>
            {children}
          </div>
        </TabsContext.Provider>
  )
}

export function TabsList({ className, children }: TabsListProps) {
  return (
    <div className={cn('flex border-b mb-4', className)}>
      {children}
    </div>
  )
}

export function TabsTrigger({ value, className, children }: TabsTriggerProps) {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('TabsTrigger must be used within Tabs')
  }
  const { value: activeValue, setValue } = context
  const isActive = activeValue === value

  return (
    <button
      type="button"
      onClick={() => setValue(value)}
      className={cn(
        'inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
        {
          'bg-accent text-primary-foreground': isActive,
          'text-muted-foreground hover:bg-accent/50': !isActive,
        },
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, className, children }: TabsContentProps) {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('TabsContent must be used within Tabs')
  }
  const { value: activeValue } = context
  const show = activeValue === value

  if (!show) return null

  return (
    <div className={cn('mt-4', className)}>
      {children}
    </div>
  )
}