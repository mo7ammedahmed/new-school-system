import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useMemo, useState } from 'react'

type Column<T> = {
  accessorKey: keyof T
  header: string
  className?: string
  // Optional: custom rendering function
  cell?: (value: any, row: T) => React.ReactNode
  // Optional: sortable
  sortable?: boolean
  // Optional: sort function
  sortFn?: (a: any, b: any) => number
}

type DataTableProps<T> = {
  columns: Column<T>[]
  data: T[]
  // Pagination
  pageSize?: number
  // Row actions: function that returns JSX for actions column
  renderRowActions?: (row: T) => React.ReactNode
  // Show row selection checkboxes
  selectable?: boolean
  // Show loading state
  loading?: boolean
  // Empty state message
  emptyMessage?: string
  // ClassName
  className?: string
}

export function DataTable<T>({
  columns,
  data,
  pageSize = 10,
  renderRowActions,
  selectable = false,
  loading = false,
  emptyMessage = 'No records found.',
  className,
}: DataTableProps<T>) {
  const [pageIndex, setPageIndex] = useState(0)
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null)

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return data
    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]
      if (sortConfig.sortFn) {
        return sortConfig.sortFn(aVal, bVal) * (sortConfig.direction === 'asc' ? 1 : -1)
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [data, sortConfig])

  // Paginate
  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, pageIndex, pageSize])

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize))

  // Handle sort toggle
  const requestSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  if (loading) {
    return (
      <div className={cn('data-table w-full', className)}>
        {/* Loading skeleton - simplified */}
        <div className="h-64 bg-muted/50 animate-pulse rounded"></div>
      </div>
    )
  }

  if (sortedData.length === 0) {
    return (
      <div className={cn('data-table w-full', className)}>
        <p className="text-center py-8 text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn('data-table w-full', className)}>
      <table className="w-full text-sm text-left rtl:text-right border-collapse">
        <thead>
          <tr className="border-b">
            {selectable && (
              <th className="w-4 p-2 text-left">
                <Checkbox />
              </th>
            )}
            {columns.map((column, index) => (
              <th
                key={index}
                className={cn(
                  'p-2 text-left font-medium text-muted-foreground uppercase tracking-wider',
                  column.className,
                  sortableClass(column.sortable ?? true)
                )}
                onClick={() => column.sortable && requestSort(column.accessorKey as keyof T)}
              >
                {column.header}
                {column.sortable && (
                  <span className="ml-1 text-xs">
                    {sortConfig?.key === column.accessorKey && (
                      sortConfig.direction === 'asc' ? '↑' : '↓'
                    )}
                  </span>
                )}
              </th>
            ))}
            {renderRowActions && (
              <th className="p-2 text-left font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedData.map((row, index) => (
            <tr key={index} className="hover:bg-muted">
              {selectable && (
                <td className="w-4 p-2 text-left">
                  <Checkbox />
                </td>
              )}
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={cn(
                    'p-2',
                    column.className,
                  )}
                >
                  {column.cell ? column.cell(column.accessorKey as any, row) : String(row[column.accessorKey as keyof T])}
                </td>
              ))}
              {renderRowActions && (
                <td className="p-2 text-left">{renderRowActions(row)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex mt-4 items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {paginatedData.length} of {sortedData.length} entries
        </p>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
            disabled={pageIndex === 0}
            className="discrete-button"
          >
            Previous
          </button>
          <span>
            Page {pageIndex + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPageIndex(Math.min(totalPages - 1, pageIndex + 1))}
            disabled={pageIndex >= totalPages - 1}
            className="discrete-button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper class for sortable columns
function sortableClass(sortable: boolean) {
  return sortable ? 'cursor-pointer hover:bg-accent/50' : ''
}