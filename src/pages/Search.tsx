import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePageMeta } from '../lib/meta.ts'
import { metaFor } from '../lib/routeMeta.ts'
import { searchModels, groupSearchResults } from '../lib/search.ts'
import { models, providerById } from '../data/index.ts'
import { SearchInput } from '../components/SearchInput.tsx'
import { Breadcrumb } from '../components/Breadcrumb.tsx'
import { ProviderLogo } from '../components/ProviderLogo.tsx'
import { formatPrice } from '../lib/format.ts'

export function Search() {
  const meta = metaFor('/search')
  usePageMeta({
    title: meta.title,
    description: meta.description,
    image: meta.image,
    type: meta.type,
    pathname: '/search',
    structuredData: meta.structuredData,
  })

  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (query) {
      return searchModels(models, query)
    }
    return models.map((m) => ({ model: m, relevance: 100, matchType: 'name' as const }))
  }, [query])

  const grouped = useMemo(() => {
    return groupSearchResults(results)
  }, [results])

  return (
    <div className="space-y-6">
      <Breadcrumb items={[]} />

      <section>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Search Models</h1>
        <p className="mt-2 text-fg-secondary">Find the right model by name, provider, or capability.</p>
      </section>

      <SearchInput onSearch={setQuery} className="max-w-lg" />

      {query && results.length === 0 && (
        <div className="rounded-lg border border-line bg-surface-raised p-6 text-center">
          <p className="text-fg-secondary">No models found matching "{query}"</p>
          <p className="mt-2 text-sm text-fg-muted">
            Try searching for a model name, provider (like "anthropic" or "openai"), or capability.
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-6">
          {query && (
            <p className="text-sm text-fg-muted">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
          )}

          {!query && (
            <p className="text-sm text-fg-muted">
              Showing all {results.length} models
            </p>
          )}

          {grouped.name.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">By Name</h2>
              <div className="space-y-2">
                {grouped.name.map((result) => (
                  <SearchResultCard key={result.model.id} result={result} />
                ))}
              </div>
            </section>
          )}

          {grouped.provider.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">By Provider</h2>
              <div className="space-y-2">
                {grouped.provider.map((result) => (
                  <SearchResultCard key={result.model.id} result={result} />
                ))}
              </div>
            </section>
          )}

          {grouped.description.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">By Description</h2>
              <div className="space-y-2">
                {grouped.description.map((result) => (
                  <SearchResultCard key={result.model.id} result={result} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

interface SearchResultCardProps {
  result: ReturnType<typeof searchModels>[number]
}

function SearchResultCard({ result }: SearchResultCardProps) {
  const { model } = result
  const provider = providerById.get(model.providerId)

  return (
    <Link
      to="/compare"
      className="block rounded-lg border border-line bg-surface-raised p-4 transition-colors hover:border-accent-deep hover:bg-surface"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <ProviderLogo providerId={model.providerId} size={16} />
            <h3 className="font-semibold">{model.name}</h3>
            {model.openSource && (
              <span className="inline-block rounded bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent-deep">
                Open Source
              </span>
            )}
          </div>
          {model.blurb && (
            <p className="mt-1 text-sm text-fg-secondary">{model.blurb}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-fg-muted">
            <span>{provider?.name || 'Unknown'}</span>
            {model.inputPricePerMTok !== null && model.outputPricePerMTok !== null && (
              <span>
                ${formatPrice(model.inputPricePerMTok)}/{formatPrice(model.outputPricePerMTok)}
              </span>
            )}
            {model.contextWindowTokens !== null && <span>{model.contextWindowTokens.toLocaleString()} tokens</span>}
          </div>
        </div>
        <span className="text-xs font-medium text-accent-deep">{Math.round(result.relevance)}%</span>
      </div>
    </Link>
  )
}
