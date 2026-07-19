import { useMemo, useState } from 'react'
import { usePageMeta } from '../lib/meta.ts'
import { releases, type ReleaseType } from '../data/releases.ts'
import { models, providerById } from '../data/index.ts'
import { ProviderLogo } from '../components/ProviderLogo.tsx'
import { Breadcrumb } from '../components/Breadcrumb.tsx'

const releaseTypeLabels: Record<ReleaseType, string> = {
  new: '🆕 New',
  update: '🔄 Update',
  'price-change': '💰 Price',
  feature: '✨ Feature',
}

const releaseTypeColors: Record<ReleaseType, string> = {
  new: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  update: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'price-change': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  feature: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
}

function getRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export function WhatsNew() {
  const [filter, setFilter] = useState<ReleaseType | 'all'>('all')

  usePageMeta({
    title: "What's New",
    description: 'Latest model releases, updates, and feature announcements.',
    pathname: '/whats-new',
  })

  const sortedReleases = useMemo(() => {
    return releases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'all') return sortedReleases
    return sortedReleases.filter((r) => r.type === filter)
  }, [filter, sortedReleases])

  const filterOptions: Array<{ type: ReleaseType | 'all'; label: string }> = [
    { type: 'all', label: 'All' },
    { type: 'new', label: 'New Models' },
    { type: 'update', label: 'Updates' },
    { type: 'price-change', label: 'Pricing' },
    { type: 'feature', label: 'Features' },
  ]

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { name: 'Home', path: '/' },
          { name: "What's New" },
        ]}
        className="mb-4"
      />

      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">What's new</h1>
        <p className="mt-3 leading-relaxed text-fg-secondary">
          Latest model releases, feature announcements, and pricing updates. Check back regularly to stay informed about
          the latest developments in AI models.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterOptions.map(({ type, label }) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilter(type)}
            aria-pressed={filter === type}
            className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-deep ${
              filter === type
                ? 'bg-accent-soft text-accent-deep'
                : 'border border-line text-fg-secondary hover:border-line-strong hover:text-fg'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((release) => {
            const model = release.modelId ? models.find((m) => m.id === release.modelId) : null
            const provider = model ? providerById.get(model.providerId) : null

            return (
              <article
                key={release.id}
                className="rounded-lg border border-line bg-surface-raised p-4 transition-colors duration-150 hover:border-line-strong sm:p-6"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${releaseTypeColors[release.type]}`}
                      >
                        {releaseTypeLabels[release.type]}
                      </span>
                      {model && provider && (
                        <div className="flex items-center gap-1.5">
                          <ProviderLogo providerId={model.providerId} size={14} />
                          <span className="text-xs font-medium text-fg-muted">{model.name}</span>
                        </div>
                      )}
                    </div>
                    <h2 className="mt-2 text-lg font-semibold text-fg">{release.title}</h2>
                    <p className="mt-2 leading-relaxed text-fg-secondary">{release.description}</p>
                    {release.link && (
                      <div className="mt-3">
                        <a
                          href={release.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-accent-deep hover:text-accent-deep/80 transition-colors duration-150"
                        >
                          Read more →
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-xs font-medium text-fg-muted sm:text-right">
                    {getRelativeDate(release.date)}
                  </div>
                </div>
              </article>
            )
          })
        ) : (
          <div className="rounded-lg border border-line bg-surface-raised p-6 text-center">
            <p className="text-fg-secondary">No releases found for the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}
