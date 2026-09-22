import { cn } from '@/lib/utils'

type PaginationLabels = {
  previous: string
  next: string
  page: string
  of: string
}

type PaginationProps = {
  page: number
  lastPage: number
  href: (page: number) => string
  className?: string
  labels?: PaginationLabels
}

const DEFAULT_LABELS: PaginationLabels = {
  previous: 'Previous',
  next: 'Next',
  page: 'Page',
  of: 'of',
}

export function Pagination({ page, lastPage, href, className, labels }: PaginationProps) {
  if (lastPage <= 1) return null

  const text = labels ?? DEFAULT_LABELS

  return (
    <nav className={cn('flex items-center justify-between mt-6', className)}>
      <div className="flex-1 flex justify-between px-4">
        {page > 1 && (
          <a
            href={href(page - 1)}
            className="discrete-button"
          >
            ‹ {text.previous}
          </a>
        )}
        <span className="px-3">
          {text.page} {page} {text.of} {lastPage}
        </span>
        {page < lastPage && (
          <a
            href={href(page + 1)}
            className="discrete-button"
          >
            {text.next} ›
          </a>
        )}
      </div>
    </nav>
  )
}