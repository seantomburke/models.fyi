import { useMemo, useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { usePostHog } from '@posthog/react'
import { usePageMeta } from '../lib/meta.ts'
import { metaFor } from '../lib/routeMeta.ts'
import { formatPrice, formatTokens, formatDateForDisplay } from '../lib/format.ts'
import { exportComparison, EXPORT_SHORTCUT_EVENT } from '../lib/export.ts'
import { benchmarks, models, providers, providerById, dataSourcedAt } from '../data/index.ts'
import type { ProviderId } from '../data/index.ts'
import { sortModels, toggleSort } from '../lib/sort.ts'
import { searchModels } from '../lib/search.ts'
import {
  captureFilterChange,
  captureFilterCleared,
  captureSortChange,
  captureExport,
  captureExportFailed,
  captureViewModeChange,
} from '../lib/posthog-events.ts'
import { ProviderLogo } from '../components/ProviderLogo.tsx'
import { SortableHeader } from '../components/SortableHeader.tsx'
import { Breadcrumb } from '../components/Breadcrumb.tsx'
import { BenchmarkSourceLink } from '../components/BenchmarkSourceLink.tsx'
import { BookmarkButton } from '../components/BookmarkButton.tsx'
import { SearchInput } from '../components/SearchInput.tsx'
import { BenchmarkCell } from '../components/BenchmarkCell.tsx'
import { provenanceFor } from '../lib/scoreProvenance.ts'
import { CopyButton } from '../components/CopyButton.tsx'
import { ModelCard } from '../components/ModelCard.tsx'
import { loadBookmarks, saveBookmarks, toggleBookmark, isBookmarked } from '../lib/bookmarks.ts'
import { capabilityOptions, filterByCapabilities, type CapabilityFilter } from '../lib/capabilityFilters.ts'
import { loadViewMode, saveViewMode, type ViewMode } from '../lib/viewMode.ts'
import {
  parseCompareParams,
  serializeCompareParams,
  type CompareFilter,
  type CompareUrlState,
} from '../lib/compareUrlState.ts'

type Filter = CompareFilter

/**
 * Copies the current URL — which carries the active filters, search, and sort —
 * so a comparison can be shared as-is. Reads location at click time because the
 * page is prerendered without a window.
 */
function ShareLinkButton() {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy share link:', error)
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-fg-secondary transition-colors duration-150 hover:border-line-strong hover:text-fg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-deep print:hidden"
      aria-label="Copy a shareable link to this comparison"
    >
      {copied ? 'Link copied!' : 'Copy link'}
    </button>
  )
}

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
  const navigate = useNavigate()
  const meta = metaFor('/compare')
  usePageMeta({
    title: meta.title,
    description: meta.description,
    image: meta.image,
    type: meta.type,
    pathname: '/compare',
    structuredData: meta.structuredData,
  })

  // The URL is the source of truth for filter/search/sort state, so any
  // comparison can be shared, bookmarked, or restored with the back button.
  const [searchParams, setSearchParams] = useSearchParams()
  const urlState = useMemo(() => parseCompareParams(searchParams), [searchParams])
  const { filter, capabilities, searchQuery, sort } = urlState

  const updateUrl = useCallback(
    (patch: Partial<CompareUrlState>) => {
      setSearchParams(
        (prev) => serializeCompareParams({ ...parseCompareParams(prev), ...patch }),
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  // 'table' during server prerender; the real preference loads client-side
  // below. A ?view= param in the URL overrides the stored preference.
  const [storedViewMode, setStoredViewMode] = useState<ViewMode>('table')
  const viewMode = urlState.viewMode ?? storedViewMode

  useEffect(() => {
    setBookmarks(loadBookmarks())
    setStoredViewMode(loadViewMode(window.innerWidth))
  }, [])

  const handleFilterChange = (id: Filter) => {
    updateUrl({ filter: id })
    captureFilterChange(posthog, id)
  }

  const handleClearFilter = () => {
    updateUrl({ filter: 'all' })
    captureFilterCleared(posthog)
  }

  const handleSortChange = (column: string) => {
    const newSort = toggleSort(sort, column)
    updateUrl({ sort: newSort })
    captureSortChange(posthog, newSort.column || '', newSort.direction)
  }

  const handleToggleBookmark = (modelId: string) => {
    const updated = toggleBookmark(bookmarks, modelId)
    setBookmarks(updated)
    saveBookmarks(updated)
  }

  const handleViewModeChange = (mode: ViewMode) => {
    setStoredViewMode(mode)
    saveViewMode(mode)
    updateUrl({ viewMode: mode })
    captureViewModeChange(posthog, mode)
  }

  const handleToggleCapability = (cap: CapabilityFilter) => {
    const updated = new Set(capabilities)
    if (updated.has(cap)) {
      updated.delete(cap)
    } else {
      updated.add(cap)
    }
    updateUrl({ capabilities: updated })
  }

  const filtered = useMemo(() => {
    let result = models
    if (filter === 'all') {
      result = models
    } else if (filter === 'open-source') {
      result = models.filter((m) => m.openSource)
    } else if (filter === 'bookmarked') {
      result = models.filter((m) => isBookmarked(bookmarks, m.id))
    } else {
      result = models.filter((m) => m.providerId === filter)
    }
    result = filterByCapabilities(result, capabilities)
    const searchResults = searchModels(searchQuery, result)
    result = searchResults.map((r) => r.model)
    return result
  }, [filter, bookmarks, capabilities, searchQuery])

  const visible = useMemo(() => {
    return sortModels(filtered, sort)
  }, [filtered, sort])

  const handleExport = useCallback(() => {
    try {
      exportComparison(visible)
      captureExport(posthog, visible.length)
    } catch (error) {
      console.error('Failed to export comparison table:', error)
      captureExportFailed(
        posthog,
        visible.length,
        error instanceof Error ? error.message : 'Unknown error',
      )
      // Optionally show user feedback (could use a toast library here)
      alert('Failed to export table. Please try again.')
    }
  }, [visible, posthog])

  // Claim the global `e` shortcut so the export honors this page's active
  // filters and sort instead of App's full-list fallback.
  useEffect(() => {
    const onExportShortcut = (event: Event) => {
      event.preventDefault()
      handleExport()
    }
    window.addEventListener(EXPORT_SHORTCUT_EVENT, onExportShortcut)
    return () => window.removeEventListener(EXPORT_SHORTCUT_EVENT, onExportShortcut)
  }, [handleExport])

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
    ...(bookmarks.size > 0 ? [{ id: 'bookmarked' as Filter, label: `Bookmarked (${bookmarks.size})` }] : []),
  ]

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { name: 'Home', path: '/' },
          { name: 'Compare' },
        ]}
        className="mb-4"
      />
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
        <SearchInput
          value={searchQuery}
          onChange={(q) => updateUrl({ searchQuery: q })}
          placeholder="Search models, capabilities..."
        />

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
        {/* Capability filters */}
        <div className="flex flex-wrap gap-2 sm:gap-1.5" role="group" aria-label="Filter by capability">
          {capabilityOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleToggleCapability(option.id)}
              aria-pressed={capabilities.has(option.id)}
              title={option.description}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 sm:py-1.5 text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-deep min-h-11 sm:min-h-auto ${
                capabilities.has(option.id)
                  ? 'bg-accent-soft font-medium text-accent-deep'
                  : 'border border-line text-fg-secondary hover:border-line-strong hover:text-fg'
              }`}
            >
              <span aria-hidden className="text-base">{option.emoji}</span>
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          ))}
          {capabilities.size > 0 && (
            <button
              type="button"
              onClick={() => updateUrl({ capabilities: new Set() })}
              className="inline-flex items-center rounded-lg px-3 py-2 sm:py-1.5 text-sm font-medium text-fg-secondary transition-colors duration-150 hover:text-fg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-deep min-h-11 sm:min-h-auto"
              aria-label="Clear capability filters"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-fg-muted">
            Showing {visible.length} of {models.length} models
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex rounded-lg border border-line p-0.5"
              role="group"
              aria-label="Switch between table and card view"
            >
              {(['table', 'cards'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleViewModeChange(mode)}
                  aria-pressed={viewMode === mode}
                  className={`rounded-md px-3 py-1 text-sm capitalize transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent-deep ${
                    viewMode === mode
                      ? 'bg-accent-soft font-medium text-accent-deep'
                      : 'text-fg-secondary hover:text-fg'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <ShareLinkButton />
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
      </div>

      {/* Sticky filter bar for scrolling context */}
      <div className="sticky top-14 z-20 -mx-4 -mb-6 bg-gradient-to-b from-surface via-surface to-transparent px-4 py-3 sm:mx-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-fg-muted">
          <div>
            Showing <span className="font-semibold text-fg">{visible.length}</span> of{' '}
            <span className="font-semibold text-fg">{models.length}</span> models
            {capabilities.size > 0 && (
              <span className="ml-2 font-medium text-accent-deep">
                {capabilities.size === 1 ? '(1 filter' : `(${capabilities.size} filters`} applied)
              </span>
            )}
          </div>
          {(filter !== 'all' || capabilities.size > 0) && (
            <button
              type="button"
              onClick={() => {
                updateUrl({ filter: 'all', capabilities: new Set() })
                captureFilterCleared(posthog)
              }}
              className="text-accent-deep hover:text-accent-deep/80 font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-deep rounded px-2 py-1"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label="Model cards"
        >
          {visible.map((m) => (
            <div key={m.id} role="listitem">
              <ModelCard
                model={m}
                isBookmarked={isBookmarked(bookmarks, m.id)}
                onBookmarkToggle={handleToggleBookmark}
                bestScores={bestScores}
                onViewDetails={(modelId) => navigate(`/models/${modelId}`)}
              />
            </div>
          ))}
        </div>
      ) : (
      <div className="overflow-x-auto rounded-xl border border-line bg-surface-raised">
        <table className="w-full min-w-[56rem] text-sm">
          <thead className="sticky top-0 z-10 bg-surface-raised">
            <tr className="border-b border-line text-left">
              <SortableHeader
                column="name"
                label="Model"
                sort={sort}
                onSort={handleSortChange}
                className="sticky left-0 z-20 bg-surface-raised"
              />
              {benchmarks.map((b) => (
                <th
                  key={b.id}
                  aria-sort={
                    sort.column === b.id
                      ? sort.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                  className="px-2 sm:px-3 py-3 text-right text-sm font-medium text-fg-muted"
                >
                  {/* The source link sits beside the sort button, not inside it —
                      nesting a link in a button hides it from keyboard users. */}
                  <span className="inline-flex w-full items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleSortChange(b.id)}
                      title={b.eli5}
                      className="hover:text-fg transition-colors duration-150 text-right"
                    >
                      {b.name}
                      {sort.column === b.id && (
                        <span aria-hidden className="ml-1">
                          {sort.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                    <BenchmarkSourceLink sourceUrl={b.sourceUrl} benchmarkName={b.name} />
                  </span>
                </th>
              ))}
              <SortableHeader
                column="inputPrice"
                label="Price in/out"
                title="USD per 1M input / output tokens"
                sort={sort}
                onSort={handleSortChange}
                textAlign="right"
              />
              <SortableHeader
                column="context"
                label="Context"
                title="How much text the model can consider at once"
                sort={sort}
                onSort={handleSortChange}
                textAlign="right"
              />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.map((m) => {
              const provider = providerById.get(m.providerId)
              return (
                <tr key={m.id}>
                  <td className="sticky left-0 z-10 bg-surface-raised px-3 sm:px-4 py-3">
                    <div className="flex items-center gap-2">
                      <BookmarkButton
                        isBookmarked={isBookmarked(bookmarks, m.id)}
                        onClick={() => handleToggleBookmark(m.id)}
                        aria={`Bookmark ${m.name}`}
                      />
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-fg">{m.name}</div>
                        <CopyButton text={m.name} label="Copy model name" size="sm" />
                      </div>
                    </div>
                    {m.releaseDate && (
                      <div className="mt-0.5 text-xs text-fg-faint">
                        {formatDateForDisplay(m.releaseDate)}
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
                      <BenchmarkCell
                        key={b.id}
                        benchmark={b}
                        score={score}
                        isBest={isBest}
                        provenance={score !== undefined ? provenanceFor(m, b.id) : undefined}
                      />
                    )
                  })}
                  <td className="px-3 py-3 text-right font-mono tabular-nums text-fg-secondary">
                    <div className="flex items-center justify-end gap-2">
                      <span>
                        {formatPrice(m.inputPricePerMTok)} / {formatPrice(m.outputPricePerMTok)}
                      </span>
                      <CopyButton
                        text={`${formatPrice(m.inputPricePerMTok)} / ${formatPrice(m.outputPricePerMTok)}`}
                        label="Copy price"
                        size="sm"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums text-fg-secondary">
                    <div className="flex items-center justify-end gap-2">
                      <span>{formatTokens(m.contextWindowTokens)}</span>
                      <CopyButton
                        text={formatTokens(m.contextWindowTokens)}
                        label="Copy context"
                        size="sm"
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      )}

      <p className="text-xs text-fg-muted">
        *Open-source models are free to download and run yourself; hosted-API pricing varies by
        vendor. Scores are provider-published evals where available, otherwise independent
        leaderboard runs, collected {dataSourcedAt}. The dot next to each score shows who measured
        it: <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" aria-hidden /> an
        independent run, <span className="inline-block w-2 h-2 rounded-full bg-slate-400" aria-hidden />{' '}
        the provider's own number, <span className="inline-block w-2 h-2 rounded-full bg-amber-500" aria-hidden />{' '}
        the provider's number where an independent run differs (hover for details). “reasoning”
        means the model thinks step by step before answering; “web” means the provider's assistant
        can search the live internet.
      </p>
    </div>
  )
}
