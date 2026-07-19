import { benchmarks, providerById } from '../data/index.ts'
import type { ProviderId } from '../data/index.ts'
import { capabilityOptions, type CapabilityFilter } from './capabilityFilters.ts'
import type { SortConfig } from './sort.ts'
import type { ViewMode } from './viewMode.ts'

export type CompareFilter = 'all' | 'open-source' | 'bookmarked' | ProviderId

export interface CompareUrlState {
  filter: CompareFilter
  capabilities: Set<CapabilityFilter>
  searchQuery: string
  sort: SortConfig
  /** null = the URL doesn't pin a view; the stored preference applies. */
  viewMode: ViewMode | null
}

const capabilityIds = new Set<string>(capabilityOptions.map((o) => o.id))

const sortableColumns = new Set<string>([
  'name',
  'inputPrice',
  'outputPrice',
  'context',
  ...benchmarks.map((b) => b.id),
])

function parseFilter(value: string | null): CompareFilter {
  if (value === 'open-source' || value === 'bookmarked') return value
  if (value && providerById.has(value as ProviderId)) return value as ProviderId
  return 'all'
}

/**
 * Read Compare page state out of a URL query string. Unknown or malformed
 * values fall back to the defaults, so stale shared links degrade gracefully
 * instead of breaking the page.
 */
export function parseCompareParams(params: URLSearchParams): CompareUrlState {
  const capabilities = new Set<CapabilityFilter>(
    (params.get('caps') ?? '')
      .split(',')
      .filter((c): c is CapabilityFilter => capabilityIds.has(c)),
  )

  const sortColumn = params.get('sort')
  const sort: SortConfig =
    sortColumn && sortableColumns.has(sortColumn)
      ? { column: sortColumn, direction: params.get('dir') === 'desc' ? 'desc' : 'asc' }
      : { column: null, direction: 'asc' }

  const view = params.get('view')

  return {
    filter: parseFilter(params.get('filter')),
    capabilities,
    searchQuery: params.get('q') ?? '',
    sort,
    viewMode: view === 'cards' || view === 'table' ? view : null,
  }
}

/**
 * Serialize Compare page state into query params. Defaults are omitted so the
 * canonical /compare URL stays clean; capabilities keep a stable order.
 */
export function serializeCompareParams(state: CompareUrlState): URLSearchParams {
  const params = new URLSearchParams()
  if (state.filter !== 'all') params.set('filter', state.filter)
  if (state.capabilities.size > 0) {
    params.set(
      'caps',
      capabilityOptions
        .filter((o) => state.capabilities.has(o.id))
        .map((o) => o.id)
        .join(','),
    )
  }
  if (state.searchQuery) params.set('q', state.searchQuery)
  if (state.sort.column) {
    params.set('sort', state.sort.column)
    if (state.sort.direction === 'desc') params.set('dir', 'desc')
  }
  if (state.viewMode) params.set('view', state.viewMode)
  return params
}
