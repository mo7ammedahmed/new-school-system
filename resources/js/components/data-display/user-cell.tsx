import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

type UserCellProps = {
  id: number
  name: string
  image?: string
  className?: string
}

export function UserCell({ id, name, image, className }: UserCellProps) {
  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <Avatar
        name={name}
        src={image}
        size={32}
        id={id}
      />
      <span className="text-sm font-medium">{name}</span>
    </div>
  )
}