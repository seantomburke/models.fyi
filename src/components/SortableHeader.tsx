import type { SortConfig } from '../lib/sort.ts'

interface SortableHeaderProps {
  /** Column identifier (e.g., 'name', 'inputPrice', benchmark ID) */
  column: string
  /** Display text for the header */
  label: string
  /** Optional tooltip title */
  title?: string
  /** Current sort configuration */
  sort: SortConfig
  /** Callback when header is clicked */
  onSort: (column: string) => void
  /** Optional CSS class for the th element */
  className?: string
  /** Align right (for numeric columns) */
  textAlign?: 'left' | 'right'
}

/**
 * Reusable sortable table header button.
 * Displays label, shows sort indicator, and calls onSort when clicked.
 */
export function SortableHeader({
  column,
  label,
  title,
  sort,
  onSort,
  className = '',
  textAlign = 'left',
}: SortableHeaderProps) {
  const isActive = sort.column === column
  const isAscending = sort.direction === 'asc'

  return (
    <th
      title={title}
      // aria-sort belongs on the columnheader itself, not the button inside it —
      // it is not a supported attribute on a generic button role.
      aria-sort={isActive ? (isAscending ? 'ascending' : 'descending') : 'none'}
      className={`${textAlign === 'right' ? 'text-right' : 'text-left'} font-medium text-fg-muted px-2 sm:px-3 py-3 ${className}`}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={`flex cursor-pointer items-center ${textAlign === 'right' ? 'justify-end' : 'justify-start'} gap-1 ${textAlign === 'right' ? 'w-full' : ''} transition-colors hover:text-fg focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-accent-deep`}
      >
        {label}
        {isActive && (
          <span aria-hidden className="text-accent-deep">
            {isAscending ? '↑' : '↓'}
          </span>
        )}
      </button>
    </th>
  )
}
