import { parseCompareParams, serializeCompareParams } from './compareUrlState.ts'
import type { CompareUrlState } from './compareUrlState.ts'

test('empty params parse to the default state', () => {
  const state = parseCompareParams(new URLSearchParams())
  expect(state.filter).toBe('all')
  expect(state.capabilities.size).toBe(0)
  expect(state.searchQuery).toBe('')
  expect(state.sort).toEqual({ column: null, direction: 'asc' })
  expect(state.viewMode).toBeNull()
})

test('default state serializes to an empty query string', () => {
  const params = serializeCompareParams(parseCompareParams(new URLSearchParams()))
  expect(params.toString()).toBe('')
})

test('a fully populated state round-trips through the URL', () => {
  const state: CompareUrlState = {
    filter: 'anthropic',
    capabilities: new Set(['reasoning', 'vision']),
    searchQuery: 'claude',
    sort: { column: 'swe-bench-verified', direction: 'desc' },
    viewMode: 'cards',
  }
  const parsed = parseCompareParams(serializeCompareParams(state))
  expect(parsed).toEqual(state)
})

test('special filters open-source and bookmarked survive the round trip', () => {
  for (const filter of ['open-source', 'bookmarked'] as const) {
    const params = serializeCompareParams({
      filter,
      capabilities: new Set(),
      searchQuery: '',
      sort: { column: null, direction: 'asc' },
      viewMode: null,
    })
    expect(parseCompareParams(params).filter).toBe(filter)
  }
})

test('unknown filter, caps, sort, and view values fall back to defaults', () => {
  const state = parseCompareParams(
    new URLSearchParams('filter=not-a-provider&caps=flying,reasoning&sort=vibes&dir=down&view=hologram'),
  )
  expect(state.filter).toBe('all')
  // The one valid capability survives; the junk one is dropped.
  expect([...state.capabilities]).toEqual(['reasoning'])
  expect(state.sort).toEqual({ column: null, direction: 'asc' })
  expect(state.viewMode).toBeNull()
})

test('ascending sort omits the dir param', () => {
  const params = serializeCompareParams({
    filter: 'all',
    capabilities: new Set(),
    searchQuery: '',
    sort: { column: 'name', direction: 'asc' },
    viewMode: null,
  })
  expect(params.get('sort')).toBe('name')
  expect(params.has('dir')).toBe(false)
})

test('capabilities serialize in a stable order regardless of insertion order', () => {
  const a = serializeCompareParams({
    filter: 'all',
    capabilities: new Set(['vision', 'reasoning'] as const),
    searchQuery: '',
    sort: { column: null, direction: 'asc' },
    viewMode: null,
  })
  const b = serializeCompareParams({
    filter: 'all',
    capabilities: new Set(['reasoning', 'vision'] as const),
    searchQuery: '',
    sort: { column: null, direction: 'asc' },
    viewMode: null,
  })
  expect(a.get('caps')).toBe(b.get('caps'))
})
