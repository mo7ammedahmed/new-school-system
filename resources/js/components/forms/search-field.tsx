import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { SearchIcon } from 'lucide-react'

type SearchFieldProps = {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  className?: string
}

export function SearchField({
  placeholder = 'Search...',
  value,
  onChange,
  className,
}: SearchFieldProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className={cn('relative w-full', className)}>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={e => {
          onChange(e.target.value)
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          'w-full pl-10 pr-4',
          isFocused ? 'ring-primary ring-offset-2' : '',
        )}
      />
      <button
        type="button"
        className={cn(
          'absolute left-0 top-0 bottom-0 flex h-full items-center pl-3 pointer-events-none',
          isFocused ? 'text-primary' : 'text-muted-foreground',
        )}
        aria-hidden="true"
      >
        <SearchIcon className="h-4 w-4" />
      </button>
    </div>
  )
}