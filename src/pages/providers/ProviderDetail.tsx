import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { models } from '../../data/models'
import { benchmarks, providers, releases } from '../../data'
import type { Benchmark, Model, Provider } from '../../data/types'
import type { Release, ReleaseType } from '../../data/releases'
import { usePageMeta } from '../../lib/meta'
import { metaFor } from '../../lib/routeMeta'
import { formatPrice, formatTokens } from '../../lib/format'
import { formatBenchmarkScore } from '../../lib/benchmarkScore'
import { ProviderLogo } from '../../components/ProviderLogo'
import { Breadcrumb } from '../../components/Breadcrumb'
import { NotFound } from '../NotFound'
import { capture } from '../../lib/analytics'

export function ProviderDetail() {
  const { id } = useParams<{ id: string }>()
  const provider = providers.find((p) => p.id === id)

  if (!provider) {
    return <NotFound />
  }

  return <ProviderDetailContent provider={provider} />
}

/**
 * The releases relevant to a provider: every release entry whose model belongs
 * to it. Site-wide releases (no modelId) are news about Models.fyi itself, not
 * about any provider, so they stay off these pages.
 */
export function releasesForProvider(providerModels: Model[]): Release[] {
  const modelIds = new Set(providerModels.map((m) => m.id))
  return (
    releases
      .filter((r) => r.modelId !== undefined && modelIds.has(r.modelId))
      // filter() copies, so this sort() never touches the shared module array.
      .sort((a, b) => b.date.localeCompare(a.date))
  )
}

/**
 * The benchmark column for the lineup table: the one the most of this
 * provider's models have a score for, ties broken by dataset order.
 */
export function headlineBenchmark(providerModels: Model[]): Benchmark | undefined {
  let best: Benchmark | undefined
  let bestCount = 0
  for (const benchmark of benchmarks) {
    const count = providerModels.filter((m) => m.scores[benchmark.id] !== undefined).length
    if (count > bestCount) {
      best = benchmark
      bestCount = count
    }
  }
  return best
}

// Duplicated from ModelReleaseHistory rather than shared; the mapping is tiny
// and each surface can evolve its own labels independently.
const releaseTypeLabels: Record<ReleaseType, string> = {
  new: '🆕 New',
  update: '🔄 Update',
  'price-change': '💰 Price',
  feature: '✨ Feature',
}

// Release dates are date-only strings ("2026-07-15"), which parse as midnight
// UTC, so format in UTC and viewers west of Greenwich won't see the prior day.
function formatReleaseDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

function ProviderDetailContent({ provider }: { provider: Provider }) {
  const providerModels = useMemo(
    () => models.filter((m) => m.providerId === provider.id),
    [provider.id],
  )
  const history = useMemo(() => releasesForProvider(providerModels), [providerModels])
  const benchmark = useMemo(() => headlineBenchmark(providerModels), [providerModels])

  const meta = metaFor(`/providers/${provider.id}`)
  usePageMeta({
    title: meta.title,
    description: meta.description,
    type: meta.type,
    image: meta.image,
    pathname: `/providers/${provider.id}`,
    structuredData: meta.structuredData,
  })

  useEffect(() => {
    capture('provider_detail_viewed', {
      provider_id: provider.id,
      model_count: providerModels.length,
      is_open_source: provider.openSource,
    })
  }, [provider.id, provider.openSource, providerModels.length])

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <Breadcrumb
        items={[
          { name: 'Home', path: '/' },
          { name: 'Models', path: '/models' },
          { name: provider.name },
        ]}
        className="mb-4"
      />

      <header className="border-b border-line pb-8">
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <ProviderLogo providerId={provider.id} size={32} />
          <h1 className="text-4xl font-bold text-fg">{provider.name}</h1>
          {provider.openSource && (
            <span className="rounded-lg bg-accent-soft px-3 py-1 text-sm font-medium text-accent-deep">
              Open source
            </span>
          )}
        </div>
        <p className="text-lg text-fg-secondary">{provider.blurb}</p>
      </header>

      <section aria-labelledby="provider-lineup">
        <h2 id="provider-lineup" className="mb-4 text-2xl font-bold text-fg">
          {provider.name} models we track
        </h2>
        {providerModels.length === 0 ? (
          <p className="text-fg-secondary">
            We don't track any {provider.name} models yet. Check back soon.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-raised text-left text-fg-muted">
                  <th scope="col" className="px-4 py-3 font-medium">Model</th>
                  <th scope="col" className="px-4 py-3 font-medium">Context</th>
                  <th scope="col" className="px-4 py-3 font-medium">Input / output price</th>
                  {benchmark && (
                    <th scope="col" className="px-4 py-3 font-medium" title={benchmark.name}>
                      {benchmark.shortName ?? benchmark.name}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {providerModels.map((model) => (
                  <tr key={model.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3">
                      <Link
                        to={`/models/${model.id}`}
                        data-attr="provider-model-link"
                        onClick={() => capture('provider_model_clicked', {
                          provider_id: provider.id,
                          model_id: model.id,
                        })}
                        className="font-medium text-accent-deep hover:underline"
                      >
                        {model.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums text-fg">
                      {formatTokens(model.contextWindowTokens)}
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums text-fg">
                      {/* No fixed price means self-hosted open weights. */}
                      {model.inputPricePerMTok === null || model.outputPricePerMTok === null
                        ? 'Self-hosted'
                        : `${formatPrice(model.inputPricePerMTok)} / ${formatPrice(model.outputPricePerMTok)}`}
                    </td>
                    {benchmark && (
                      <td className="px-4 py-3 font-mono tabular-nums text-fg">
                        {model.scores[benchmark.id] !== undefined
                          ? formatBenchmarkScore(model.scores[benchmark.id]!, benchmark)
                          : '—'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {history.length > 0 && (
        <section aria-labelledby="provider-releases">
          <h2 id="provider-releases" className="mb-6 text-2xl font-bold text-fg">
            Recent {provider.name} releases
          </h2>
          <div className="space-y-4">
            {history.map((release) => (
              <article
                key={release.id}
                className="rounded-lg border border-line bg-surface-raised p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent-deep">
                    {releaseTypeLabels[release.type]}
                  </span>
                  <time dateTime={release.date} className="text-sm text-fg-muted">
                    {formatReleaseDate(release.date)}
                  </time>
                </div>
                <h3 className="mt-2 font-semibold text-fg">{release.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-fg-secondary">
                  {release.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      <nav
        aria-label="Compare links"
        className="flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-8"
      >
        {providerModels.length > 0 && (
          <Link
            to={`/compare?filter=${provider.id}`}
            data-attr="provider-compare-link"
            onClick={() => capture('provider_compare_clicked', { provider_id: provider.id })}
            className="text-sm font-medium text-accent-deep hover:underline"
          >
            Compare these models →
          </Link>
        )}
        <Link
          to="/models"
          data-attr="provider-all-models-link"
          className="text-sm font-medium text-accent-deep hover:underline"
        >
          Browse every model →
        </Link>
      </nav>
    </div>
  )
}
