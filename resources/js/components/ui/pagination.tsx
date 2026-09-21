import { cn } from '@/lib/utils'

type PaginationProps = {
  page: number
  lastPage: number
  href: (page: number) => string
  className?: string
}

export function Pagination({ page, lastPage, href, className }: PaginationProps) {
  if (lastPage <= 1) return null

  return (
    <nav className={cn('flex items-center justify-between mt-6', className)}>
      <div className="flex-1 flex justify-between px-4">
        {page > 1 && (
          <a
            href={href(page - 1)}
            className="discrete-button"
          >
            ‹ Previous
          </a>
        )}
        <span className="px-3">
          Page {page} of {lastPage}
        </span>
        {page < lastPage && (
          <a
            href={href(page + 1)}
            className="discrete-button"
          >
            Next ›
          </a>
        )}
      </div>
    </nav>
  )
}