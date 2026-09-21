import { cn } from '@/lib/utils'
import { Alert } from '@/components/ui/alert'
import { useEffect } from 'react'

type ToastProps = {
  message: string
  type?: 'default' | 'success' | 'destructive' | 'warning'
  isVisible: boolean
  onClose: () => void
  className?: string
}

export function Toast({
  message,
  type = 'default',
  isVisible,
  onClose,
  className,
}: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className={cn('fixed bottom-4 right-4 w-96 z-50', className)}>
      <Alert variant={type} className="w-full">
        {message}
      </Alert>
    </div>
  )
}