import type { Model } from '../data/types.ts'
import { formatPrice, formatTokens } from '../lib/format.ts'
import { providerById } from '../data/index.ts'
import { ProviderLogo } from './ProviderLogo.tsx'
import { BookmarkButton } from './BookmarkButton.tsx'

interface ModelCardProps {
  model: Model
  isBookmarked: boolean
  onBookmarkToggle: (modelId: string) => void
  bestScores?: Partial<Record<string, number>>
  onViewDetails?: (modelId: string) => void
}

export function ModelCard({
  model,
  isBookmarked,
  onBookmarkToggle,
  bestScores = {},
  onViewDetails,
}: ModelCardProps) {
  const provider = providerById.get(model.providerId)
  const topBenchmarks = Object.entries(model.scores)
    .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
    .slice(0, 3)

  return (
    <div className="rounded-lg border border-line bg-surface-raised p-4 transition-all duration-200 hover:border-line-strong hover:shadow-sm">
      {/* Header with bookmark */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-fg text-base leading-tight truncate">{model.name}</h3>
          {model.releaseDate && (
            <p className="mt-1 text-xs text-fg-faint">
              Released {new Date(model.releaseDate).toLocaleDateString()}
            </p>
          )}
        </div>
        <BookmarkButton
          isBookmarked={isBookmarked}
          onClick={() => onBookmarkToggle(model.id)}
          aria={`Bookmark ${model.name}`}
        />
      </div>

      {/* Provider and tier */}
      <div className="flex items-center gap-2 mb-3 text-xs text-fg-muted">
        {provider && (
          <>
            <ProviderLogo providerId={model.providerId} size={12} />
            <span>{provider.name}</span>
          </>
        )}
        <span className="capitalize rounded bg-fg-muted/10 px-2 py-0.5">{model.tier}</span>
      </div>

      {/* Key specs */}
      <div className="mb-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-fg-secondary">Context:</span>
          <span className="text-fg font-mono tabular-nums">
            {model.contextWindowTokens ? formatTokens(model.contextWindowTokens) : '—'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-fg-secondary">Price:</span>
          <span className="text-fg font-mono tabular-nums">
            {model.inputPricePerMTok !== null ? formatPrice(model.inputPricePerMTok) : '—'}
          </span>
        </div>
      </div>

      {/* Capabilities */}
      <div className="mb-3 flex flex-wrap gap-1">
        {model.reasoning && (
          <span
            title="Reasoning model: thinks step by step before answering"
            className="rounded border border-green-200 bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:border-green-800 dark:bg-green-900 dark:text-green-200"
          >
            🧠 reasoning
          </span>
        )}
        {model.internetAccess && (
          <span
            title="The provider's assistant can search the live internet"
            className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-200"
          >
            🌐 web
          </span>
        )}
        {model.vision && (
          <span
            title="Can understand and analyze images"
            className="rounded border border-purple-200 bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 dark:border-purple-800 dark:bg-purple-900 dark:text-purple-200"
          >
            👁️ vision
          </span>
        )}
        {model.openSource && (
          <span
            title={model.license ? `License: ${model.license}` : undefined}
            className="rounded border border-accent-default bg-accent-soft px-1.5 py-0.5 text-[10px] font-medium text-accent-deep"
          >
            open
          </span>
        )}
      </div>

      {/* Top benchmark scores */}
      {topBenchmarks.length > 0 && (
        <div className="mb-3 space-y-1 text-xs">
          <p className="font-medium text-fg-secondary">Top benchmarks:</p>
          {topBenchmarks.map(([benchId, score]) => {
            const isBest = score !== undefined && score === bestScores[benchId]
            return (
              <div key={benchId} className="flex justify-between">
                <span className="text-fg-secondary capitalize">
                  {benchId.replace(/-/g, ' ')}
                </span>
                <span
                  className={`font-mono tabular-nums ${
                    isBest ? 'font-semibold text-accent-deep' : 'text-fg'
                  }`}
                >
                  {score?.toFixed(1)}%
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {onViewDetails && (
          <button
            type="button"
            onClick={() => onViewDetails(model.id)}
            className="flex-1 rounded-lg bg-accent-soft px-3 py-2 text-sm font-medium text-accent-deep transition-colors duration-150 hover:bg-accent-soft/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-deep"
          >
            View details
          </button>
        )}
      </div>
    </div>
  )
}
