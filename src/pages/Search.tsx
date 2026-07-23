import { useCallback, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { usePostHog } from '../lib/posthog-react.ts'
import { usePageMeta } from '../lib/meta.ts'
import { metaFor } from '../lib/routeMeta.ts'
import { searchModels, groupSearchResults } from '../lib/search.ts'
import { searchContent } from '../lib/contentSearch.ts'
import type { ContentResult } from '../lib/contentSearch.ts'
import { parseSearchParams, serializeSearchParams } from '../lib/searchUrlState.ts'
import { models, providerById } from '../data/index.ts'
import { SearchInput } from '../components/SearchInput.tsx'
import { Breadcrumb } from '../components/Breadcrumb.tsx'
import { ProviderLogo } from '../components/ProviderLogo.tsx'
import { formatPrice } from '../lib/format.ts'
import { captureSearchPerformed, captureSearchResultClicked } from '../lib/posthog-events.ts'

export function Search() {
  const posthog = usePostHog()
  const meta = metaFor('/search')
  usePageMeta({
    title: meta.title,
    description: meta.description,
    image: meta.image,
    type: meta.type,
    pathname: '/search',
    structuredData: meta.structuredData,
  })

  // The URL is the source of truth for the query, so any search can be shared,
  // bookmarked, or restored with the back button.
  const [searchParams, setSearchParams] = useSearchParams()
  const { query } = useMemo(() => parseSearchParams(searchParams), [searchParams])

  const setQuery = useCallback(
    (next: string) => {
      // Replace rather than push: typing a word shouldn't bury the previous
      // page under a dozen history entries.
      setSearchParams(serializeSearchParams({ query: next }), { replace: true })
      captureSearchPerformed(
        posthog,
        next ? searchModels(models, next).length + searchContent(next).length : models.length,
      )
    },
    [posthog, setSearchParams],
  )

  const results = useMemo(() => {
    if (query) {
      return searchModels(models, query)
    }
    return models.map((m) => ({ model: m, relevance: 100, matchType: 'name' as const }))
  }, [query])

  const grouped = useMemo(() => {
    return groupSearchResults(results)
  }, [results])

  const contentResults = useMemo(() => (query ? searchContent(query) : []), [query])
  const learnResults = contentResults.filter((r) => r.kind === 'learn')
  const glossaryResults = contentResults.filter((r) => r.kind === 'glossary')
  const faqResults = contentResults.filter((r) => r.kind === 'faq')

  return (
    <div className="space-y-6">
      <Breadcrumb items={[]} />

      <section>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Search</h1>
        <p className="mt-2 text-fg-secondary">
          Find models by name, provider, or capability — or search the glossary, Learn topics, and FAQ.
        </p>
      </section>

      <SearchInput value={query} onSearch={setQuery} className="max-w-lg" />

      {query && results.length === 0 && contentResults.length === 0 && (
        <div className="rounded-lg border border-line bg-surface-raised p-6 text-center">
          <p className="text-fg-secondary">No results found matching "{query}"</p>
          <p className="mt-2 text-sm text-fg-muted">
            Try a model name, provider (like "anthropic" or "openai"), capability, or a term like
            "context window".
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-6">
          {query && (
            <p className="text-sm text-fg-muted">
              Found {results.length + contentResults.length} result
              {results.length + contentResults.length !== 1 ? 's' : ''}
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
                  <SearchResultCard
                    key={result.model.id}
                    result={result}
                    onSelect={() => captureSearchResultClicked(posthog, result.model.id, result.matchType)}
                  />
                ))}
              </div>
            </section>
          )}

          {grouped.provider.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">By Provider</h2>
              <div className="space-y-2">
                {grouped.provider.map((result) => (
                  <SearchResultCard
                    key={result.model.id}
                    result={result}
                    onSelect={() => captureSearchResultClicked(posthog, result.model.id, result.matchType)}
                  />
                ))}
              </div>
            </section>
          )}

          {grouped.description.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">By Description</h2>
              <div className="space-y-2">
                {grouped.description.map((result) => (
                  <SearchResultCard
                    key={result.model.id}
                    result={result}
                    onSelect={() => captureSearchResultClicked(posthog, result.model.id, result.matchType)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {query && contentResults.length > 0 && (
        <div className="space-y-6">
          {learnResults.length > 0 && (
            <ContentSection
              title="Learn"
              results={learnResults}
              onSelect={(r) => captureSearchResultClicked(posthog, r.to, r.kind)}
            />
          )}
          {glossaryResults.length > 0 && (
            <ContentSection
              title="Glossary"
              results={glossaryResults}
              onSelect={(r) => captureSearchResultClicked(posthog, r.to, r.kind)}
            />
          )}
          {faqResults.length > 0 && (
            <ContentSection
              title="FAQ"
              results={faqResults}
              onSelect={(r) => captureSearchResultClicked(posthog, r.to, r.kind)}
            />
          )}
        </div>
      )}
    </div>
  )
}

const KIND_LABEL: Record<ContentResult['kind'], string> = {
  learn: 'Learn',
  glossary: 'Glossary',
  faq: 'FAQ',
}

function ContentSection({
  title,
  results,
  onSelect,
}: {
  title: string
  results: ContentResult[]
  onSelect: (result: ContentResult) => void
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <div className="space-y-2">
        {results.map((result) => (
          <Link
            key={result.to}
            to={result.to}
            onClick={() => onSelect(result)}
            className="block rounded-lg border border-line bg-surface-raised p-4 transition-colors hover:border-accent-deep hover:bg-surface"
          >
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{result.title}</h3>
              <span className="inline-block rounded bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent-deep">
                {KIND_LABEL[result.kind]}
              </span>
            </div>
            <p className="mt-1 text-sm text-fg-secondary">{result.snippet}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

interface SearchResultCardProps {
  result: ReturnType<typeof searchModels>[number]
  onSelect: () => void
}

function SearchResultCard({ result, onSelect }: SearchResultCardProps) {
  const { model } = result
  const provider = providerById.get(model.providerId)

  return (
    <Link
      to={`/models/${model.id}`}
      onClick={onSelect}
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
