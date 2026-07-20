export interface SearchUrlState {
  query: string
}

/**
 * Read Search page state out of a URL query string. A missing or empty `q`
 * falls back to the empty query, so a bare /search link still lands on the
 * full model list instead of breaking the page.
 */
export function parseSearchParams(params: URLSearchParams): SearchUrlState {
  return { query: params.get('q') ?? '' }
}

/**
 * Serialize Search page state into query params. An empty query is omitted so
 * the canonical /search URL stays clean.
 */
export function serializeSearchParams(state: SearchUrlState): URLSearchParams {
  const params = new URLSearchParams()
  if (state.query) params.set('q', state.query)
  return params
}
