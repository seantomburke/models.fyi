import { useMemo, useState } from 'react'
import { usePostHog } from '@posthog/react'
import { usePageMeta } from '../lib/meta.ts'
import { metaFor } from '../lib/routeMeta.ts'
import { formatPrice, formatTokens } from '../lib/format.ts'
import { benchmarks, models, providers, providerById, dataSourcedAt } from '../data/index.ts'
import type { ProviderId } from '../data/index.ts'
import { sortModels, toggleSort, type SortConfig } from '../lib/sort.ts'
import { ProviderLogo } from '../components/ProviderLogo.tsx'

type Filter = 'all' | 'open-source' | ProviderId

/** Visible-word capability tag; hover title carries the fuller explanation. */
function CapabilityBadge({ label, title }: { label: string; title: string }) {
  return (
    <span
      title={title}
      className="rounded border border-line px-1 py-0.5 text-[10px] font-medium text-fg-muted"
    >
      {label}
    </span>
  )
}

export function Compare() {
  const posthog = usePostHog()
  const meta = metaFor('/compare')
  usePageMeta({
    title: meta.title,
    description: meta.description,
    image: meta.image,
    type: meta.type,
    pathname: '/compare',
  })

  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<SortConfig>({ column: null, direction: 'asc' })

  const handleFilterChange = (id: Filter) => {
    setFilter(id)
    posthog?.capture('compare_filter_changed', { filter: id })
  }

  const handleClearFilter = () => {
    setFilter('all')
    posthog?.capture('compare_filter_cleared')
  }

  const handleSortChange = (column: string) => {
    const newSort = toggleSort(sort, column)
    setSort(newSort)
    posthog?.capture('compare_table_sorted', { column: newSort.column, direction: newSort.direction })
  }

  const filtered = useMemo(() => {
    if (filter === 'all') return models
    if (filter === 'open-source') return models.filter((m) => m.openSource)
    return models.filter((m) => m.providerId === filter)
  }, [filter])

  const visible = useMemo(() => {
    return sortModels(filtered, sort)
  }, [filtered, sort])

  // Best published score per benchmark among the visible models.
  const bestScores = useMemo(() => {
    const best: Partial<Record<string, number>> = {}
    for (const b of benchmarks) {
      const scores = visible.map((m) => m.scores[b.id]).filter((s): s is number => s !== undefined)
      if (scores.length > 0) best[b.id] = Math.max(...scores)
    }
    return best
  }, [visible])

  const filters: Array<{ id: Filter; label: string }> = [
    { id: 'all', label: 'All' },
    ...providers
      .filter((p) => !p.openSource)
      .map((p) => ({ id: p.id as Filter, label: p.name })),
    { id: 'open-source', label: 'Open source' },
  ]

  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Compare models</h1>
        <p className="mt-3 leading-relaxed text-fg-secondary">
          Higher is better on every test, and the <span className="font-medium text-accent-deep">best published score</span>{' '}
          in each column is highlighted. A "—" means no score has been published yet, not that the model scored zero.
        </p>
      </div>

      <details className="rounded-xl border border-line bg-surface-raised">
        <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-fg-secondary transition-colors duration-150 hover:text-fg">
          What do these tests measure?
        </summary>
        <dl className="space-y-3 border-t border-line px-4 py-4">
          {benchmarks.map((b) => (
            <div key={b.id}>
              <dt className="text-sm font-semibold">{b.name}</dt>
              <dd className="mt-0.5 max-w-2xl text-sm leading-relaxed text-fg-secondary">
                {b.eli5}
              </dd>
            </div>
          ))}
        </dl>
      </details>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 sm:gap-1.5" role="group" aria-label="Filter by provider">
          {filters.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleFilterChange(id)}
              aria-pressed={filter === id}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 sm:py-1.5 text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-deep min-h-11 sm:min-h-auto ${
                filter === id
                  ? 'bg-accent-soft font-medium text-accent-deep'
                  : 'border border-line text-fg-secondary hover:border-line-strong hover:text-fg'
              }`}
            >
              {providerById.has(id as ProviderId) && (
                <ProviderLogo providerId={id as ProviderId} size={12} />
              )}
              {label}
            </button>
          ))}
          {filter !== 'all' && (
            <button
              type="button"
              onClick={handleClearFilter}
              className="inline-flex items-center rounded-lg px-3 py-2 sm:py-1.5 text-sm font-medium text-fg-secondary transition-colors duration-150 hover:text-fg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-deep min-h-11 sm:min-h-auto"
              aria-label="Clear filter"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-fg-muted">
            Showing {visible.length} of {models.length} models
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="rounded-lg bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent-deep transition-colors duration-150 hover:bg-accent-soft/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-deep print:hidden"
            aria-label="Export comparison table as CSV"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-surface-raised">
        <table className="w-full min-w-[56rem] text-sm">
          <thead className="sticky top-0 z-10 bg-surface-raised">
            <tr className="border-b border-line text-left">
              <th className="sticky left-0 z-20 bg-surface-raised px-3 sm:px-4 py-3 font-medium text-fg-muted">
                <button
                  type="button"
                  onClick={() => handleSortChange('name')}
                  className="flex cursor-pointer items-center gap-1 transition-colors hover:text-fg focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-accent-deep"
                  aria-sort={sort.column === 'name' ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Model
                  {sort.column === 'name' && (
                    <span aria-hidden className="text-accent-deep">
                      {sort.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              {benchmarks.map((b) => (
                <th
                  key={b.id}
                  title={b.eli5}
                  className="px-2 sm:px-3 py-3 text-right font-medium text-fg-muted"
                >
                  <button
                    type="button"
                    onClick={() => handleSortChange(b.id)}
                    className="flex cursor-pointer items-center justify-end gap-1 w-full transition-colors hover:text-fg focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-accent-deep"
                    aria-sort={sort.column === b.id ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    {b.name}
                    {sort.column === b.id && (
                      <span aria-hidden className="text-accent-deep">
                        {sort.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
              ))}
              <th className="px-2 sm:px-3 py-3 text-right font-medium text-fg-muted">
                <button
                  type="button"
                  onClick={() => handleSortChange('inputPrice')}
                  className="flex cursor-pointer items-center justify-end gap-1 w-full transition-colors hover:text-fg focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-accent-deep"
                  title="USD per 1M input / output tokens"
                  aria-sort={sort.column === 'inputPrice' ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Price in/out
                  {sort.column === 'inputPrice' && (
                    <span aria-hidden className="text-accent-deep">
                      {sort.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-2 sm:px-3 py-3 text-right font-medium text-fg-muted">
                <button
                  type="button"
                  onClick={() => handleSortChange('context')}
                  className="flex cursor-pointer items-center justify-end gap-1 w-full transition-colors hover:text-fg focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-accent-deep"
                  title="How much text the model can consider at once"
                  aria-sort={sort.column === 'context' ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Context
                  {sort.column === 'context' && (
                    <span aria-hidden className="text-accent-deep">
                      {sort.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.map((m) => {
              const provider = providerById.get(m.providerId)
              return (
                <tr key={m.id}>
                  <td className="sticky left-0 z-10 bg-surface-raised px-3 sm:px-4 py-3">
                    <div className="font-medium text-fg">{m.name}</div>
                    {m.releaseDate && (
                      <div className="mt-0.5 text-xs text-fg-faint">
                        {new Date(m.releaseDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                        })}
                      </div>
                    )}
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-fg-muted">
                      <ProviderLogo providerId={m.providerId} size={12} className="shrink-0" />
                      {provider?.name}
                      {m.reasoning && (
                        <CapabilityBadge
                          label="reasoning"
                          title="Reasoning model: thinks step by step before answering"
                        />
                      )}
                      {m.internetAccess && (
                        <CapabilityBadge
                          label="web"
                          title="The provider's assistant can search the live internet"
                        />
                      )}
                      {m.openSource && (
                        <span
                          title={m.license ? `License: ${m.license}` : undefined}
                          className="rounded bg-accent-soft px-1 py-0.5 text-[10px] font-medium text-accent-deep"
                        >
                          open
                        </span>
                      )}
                    </div>
                  </td>
                  {benchmarks.map((b) => {
                    const score = m.scores[b.id]
                    const isBest = score !== undefined && score === bestScores[b.id]
                    return (
                      <td
                        key={b.id}
                        className={`px-2 sm:px-3 py-3 text-right font-mono tabular-nums ${
                          score === undefined
                            ? 'text-fg-faint'
                            : isBest
                              ? 'font-semibold text-accent-deep'
                              : 'text-fg-secondary'
                        }`}
                      >
                        {score === undefined ? (
                          <>
                            <span aria-hidden>—</span>
                            <span className="sr-only">no published score</span>
                          </>
                        ) : (
                          `${score.toFixed(1)}%`
                        )}
                      </td>
                    )
                  })}
                  <td className="px-3 py-3 text-right font-mono tabular-nums text-fg-secondary">
                    {formatPrice(m.inputPricePerMTok)} / {formatPrice(m.outputPricePerMTok)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums text-fg-secondary">
                    {formatTokens(m.contextWindowTokens)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-fg-muted">
        *Open-source models are free to download and run yourself; hosted-API pricing varies by
        vendor. Scores are provider-published evals where available, otherwise independent
        leaderboard runs, collected {dataSourcedAt}. “reasoning” means the model thinks step by
        step before answering; “web” means the provider's assistant can search the live internet.
      </p>
    </div>
  )
}
