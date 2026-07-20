import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { models } from '../../data/models'
import { providers } from '../../data'
import type { Model } from '../../data/types'
import { usePageMeta } from '../../lib/meta'
import { metaFor } from '../../lib/routeMeta'
import { Breadcrumb } from '../../components/Breadcrumb'
import { formatPrice, formatTokens } from '../../lib/format'

/**
 * Browse index for every model detail page. Without it the 19 `/models/:id`
 * pages are orphans: they sit in the sitemap but nothing links to them, so
 * readers only arrive via search and crawlers only via the compare table.
 * Grouping by provider keeps the list scannable as the dataset grows.
 */
export function ModelsIndex() {
  const meta = metaFor('/models')
  usePageMeta({
    title: meta.title,
    description: meta.description,
    type: meta.type,
    image: meta.image,
    pathname: '/models',
    structuredData: meta.structuredData,
  })

  // Providers in dataset order, each with its models. Providers with no models
  // are dropped so the page never renders an empty heading.
  const groups = useMemo(() => {
    return providers
      .map((provider) => ({
        provider,
        items: models.filter((m) => m.providerId === provider.id),
      }))
      .filter((g) => g.items.length > 0)
  }, [])

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Models' }]} className="mb-4" />

      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Every model, one page each</h1>
        <p className="mt-3 leading-relaxed text-fg-secondary">
          {models.length} models from {groups.length} providers. Each page collects the benchmark
          scores, prices, and context window for one model, plus who it suits and what it trades
          away. Want them side by side instead?{' '}
          <Link
            to="/compare"
            className="text-accent-deep underline underline-offset-1 hover:text-accent"
          >
            Compare them all
          </Link>
          {'.'}
        </p>
      </div>

      {groups.map(({ provider, items }) => (
        <section key={provider.id} aria-labelledby={`provider-${provider.id}`}>
          <h2
            id={`provider-${provider.id}`}
            className="mb-3 flex items-center gap-2 text-lg font-semibold tracking-tight text-fg"
          >
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: provider.color }}
            />
            {provider.name}
          </h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {items.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function ModelCard({ model }: { model: Model }) {
  const scoreCount = Object.keys(model.scores).length
  const selfHosted = model.inputPricePerMTok === null || model.outputPricePerMTok === null

  return (
    <li>
      <Link
        to={`/models/${model.id}`}
        className="flex h-full flex-col rounded-lg border border-line bg-surface-raised p-4 transition-colors duration-150 hover:border-line-strong focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-medium text-fg">{model.name}</h3>
          {model.openSource && (
            <span className="rounded-lg bg-accent-soft px-1.5 py-0.5 text-xs text-accent-deep">
              Open source
            </span>
          )}
        </div>
        <span className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-fg-secondary">
          {model.blurb}
        </span>
        <span className="mt-3 text-xs text-fg-muted">
          {/* No fixed price means self-hosted open weights: "Free*" would need a
              footnote this card has no room for, so name the reason instead. */}
          {selfHosted
            ? 'Self-hosted pricing'
            : `${formatPrice(model.inputPricePerMTok)} in · ${formatPrice(model.outputPricePerMTok)} out`}{' '}
          · {formatTokens(model.contextWindowTokens)} context
          {scoreCount > 0 && ` · ${scoreCount} benchmark${scoreCount === 1 ? '' : 's'}`}
        </span>
      </Link>
    </li>
  )
}
