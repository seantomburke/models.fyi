import type { Model } from '../data/types.ts'
import { providerById } from '../data/index.ts'

export interface SearchResult {
  model: Model
  relevance: number
  matchType: 'name' | 'provider' | 'capability' | 'description' | 'all'
}

export function searchModels(query: string, models: Model[]): SearchResult[]
export function searchModels(models: Model[], query: string): SearchResult[]

export function searchModels(
  queryOrModels: string | Model[],
  modelsOrQuery: Model[] | string,
): SearchResult[] {
  // Handle both argument orders for backward compatibility
  let q: string
  let modelsList: Model[]

  if (typeof queryOrModels === 'string') {
    q = queryOrModels
    modelsList = modelsOrQuery as Model[]
  } else {
    modelsList = queryOrModels
    q = modelsOrQuery as string
  }

  const query_lower = q.toLowerCase().trim()
  if (!query_lower) return modelsList.map((m) => ({ model: m, relevance: 100, matchType: 'all' }))

  return modelsList
    .map((m) => {
      const nameLower = m.name.toLowerCase()
      const apiIdLower = (m.apiId || '').toLowerCase()
      const provider = providerById.get(m.providerId)
      const providerName = provider?.name.toLowerCase() || ''

      let relevance = 0
      let matchType: SearchResult['matchType'] = 'all'

      // Name matching (highest priority)
      if (nameLower.startsWith(query_lower)) {
        relevance = 100
        matchType = 'name'
      } else if (nameLower.includes(query_lower)) {
        relevance = 90
        matchType = 'name'
      }

      // API ID matching
      if (apiIdLower.includes(query_lower)) {
        relevance = Math.max(relevance, 85)
      }

      // Provider matching
      if (providerName.includes(query_lower)) {
        relevance = Math.max(relevance, 75)
        if (matchType === 'all') matchType = 'provider'
      }

      // Capability matching
      const hasReasoning = m.reasoning && 'reasoning'.includes(query_lower)
      const hasInternet = m.internetAccess && 'web search internet access'.includes(query_lower)
      if (hasReasoning || hasInternet) {
        relevance = Math.max(relevance, 70)
        if (matchType === 'all') matchType = 'capability'
      }

      return { model: m, relevance, matchType }
    })
    .filter((r) => r.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
}

export function groupSearchResults(
  results: SearchResult[],
): Record<'name' | 'provider' | 'capability' | 'description' | 'all', SearchResult[]> {
  return {
    name: results.filter((r) => r.matchType === 'name'),
    provider: results.filter((r) => r.matchType === 'provider'),
    capability: results.filter((r) => r.matchType === 'capability'),
    description: results.filter((r) => r.matchType === 'description'),
    all: results.filter((r) => r.matchType === 'all'),
  }
}
