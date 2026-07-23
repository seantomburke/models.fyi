import type { ReactNode } from 'react'
import type { SortConfig } from '../lib/sort.ts'

interface SortableHeaderProps {
  /** Column identifier (e.g., 'name', 'inputPrice', benchmark ID) */
  column: string
  /** Display text for the header. Keep it short enough to stay on one line. */
  label: string
  /** Longer explanation, shown as a tooltip on the header button */
  title?: string
  /** Current sort configuration */
  sort: SortConfig
  /** Callback when header is clicked */
  onSort: (column: string) => void
  /** Optional CSS class for the th element */
  className?: string
  /** Align right (for numeric columns) */
  textAlign?: 'left' | 'right'
  /**
   * Rendered after the sort button, e.g. a source link. Kept outside the
   * button so it stays reachable by keyboard.
   */
  trailing?: ReactNode
}

/**
 * Paired chevrons showing sort state. Both are always visible so the column
 * reads as sortable before anyone clicks it; the active direction is
 * highlighted and the inactive one fades back.
 */
function SortArrows({ state }: { state: 'asc' | 'desc' | 'none' }) {
  return (
    <span aria-hidden className="ml-1 inline-flex shrink-0 flex-col leading-none">
      <span className={`text-[8px] ${state === 'asc' ? 'text-accent-deep' : 'text-fg-faint'}`}>
        ▲
      </span>
      <span className={`text-[8px] ${state === 'desc' ? 'text-accent-deep' : 'text-fg-faint'}`}>
        ▼
      </span>
    </span>
  )
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
  trailing,
}: SortableHeaderProps) {
  const isActive = sort.column === column
  const isAscending = sort.direction === 'asc'
  const state = isActive ? (isAscending ? 'asc' : 'desc') : 'none'
  const nextDirection = isActive && isAscending ? 'descending' : 'ascending'
  const alignRight = textAlign === 'right'

  return (
    <th
      scope="col"
      // aria-sort belongs on the columnheader itself rather than the button inside it;
      // it is not a supported attribute on a generic button role.
      aria-sort={isActive ? (isAscending ? 'ascending' : 'descending') : 'none'}
      className={`${alignRight ? 'text-right' : 'text-left'} whitespace-nowrap px-2 sm:px-3 py-3 font-medium text-fg-muted ${className}`}
    >
      <span
        className={`inline-flex items-center gap-1 ${alignRight ? 'w-full justify-end' : 'justify-start'}`}
      >
        <button
          type="button"
          onClick={() => onSort(column)}
          title={title ? `${label}: ${title}` : undefined}
          aria-label={`${label}${title ? `. ${title}` : ''}. Sort ${nextDirection}`}
          className="inline-flex cursor-pointer items-center whitespace-nowrap rounded transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-deep"
        >
          <span className={title ? 'underline decoration-dotted underline-offset-2' : ''}>
            {label}
          </span>
          <SortArrows state={state} />
        </button>
        {trailing}
      </span>
    </th>
  )
}
