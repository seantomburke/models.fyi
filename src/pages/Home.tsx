import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { usePageMeta } from '../lib/meta.ts'
import { metaFor } from '../lib/routeMeta.ts'
import { models, providers, providerById, releases } from '../data/index.ts'
import { loadBookmarks } from '../lib/bookmarks.ts'
import { ProviderLogo } from '../components/ProviderLogo.tsx'
import { formatTokens } from '../lib/format.ts'
import { capture } from '../lib/analytics.ts'

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

// Copy before sorting; sort() in place would mutate the shared module array.
const latestReleases = [...releases]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 4)

export function Home() {
  const meta = metaFor('/')
  usePageMeta({
    title: meta.title,
    description: meta.description,
    image: meta.image,
    type: meta.type,
    pathname: '/',
    structuredData: meta.structuredData,
  })

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    setBookmarkedIds(loadBookmarks())
  }, [])

  const openCount = models.filter((m) => m.openSource).length
  const bookmarkedModels = models.filter((m) => bookmarkedIds.has(m.id))

  return (
    <div className="space-y-12">
      <section className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Pick the right AI model,
          <br />
          <span className="text-accent-deep">no PhD required.</span>
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-fg-secondary">
          New AI models launch every month, each claiming to be the best. We track{' '}
          {models.length} models from {providers.length} companies, including {openCount} you
          can run yourself for free, and explain what the numbers mean.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/quiz"
          data-attr="home-cta-quiz"
          onClick={() => capture('home_cta_clicked', { destination: 'quiz' })}
          className="group rounded-xl border border-line bg-surface-raised p-6 transition-colors duration-150 hover:border-line-strong sm:col-span-2"
        >
          <span className="text-xs font-medium uppercase tracking-wide text-accent-deep">
            Start here
          </span>
          <h2 className="mt-2 text-lg font-semibold tracking-tight group-hover:text-accent-deep">
            Which model should I use? →
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-fg-secondary">
            Answer a few plain-language questions, like who you are, what you're doing, and what you
            want to spend, and get a recommendation with the reasoning spelled out.
          </p>
        </Link>

        <Link
          to="/compare"
          data-attr="home-cta-compare"
          onClick={() => capture('home_cta_clicked', { destination: 'compare' })}
          className="group rounded-xl border border-line bg-surface-raised p-6 transition-colors duration-150 hover:border-line-strong"
        >
          <h2 className="text-lg font-semibold tracking-tight group-hover:text-accent-deep">
            Compare models →
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-fg-secondary">
            Every flagship side by side: benchmark scores, prices, and context windows, with
            each benchmark explained like you're five.
          </p>
        </Link>

        <Link
          to="/graph"
          data-attr="home-cta-graph"
          onClick={() => capture('home_cta_clicked', { destination: 'graph' })}
          className="group rounded-xl border border-line bg-surface-raised p-6 transition-colors duration-150 hover:border-line-strong"
        >
          <h2 className="text-lg font-semibold tracking-tight group-hover:text-accent-deep">
            See it on a graph →
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-fg-secondary">
            Plot performance against price on axes you choose, and spot which models punch
            above their weight.
          </p>
        </Link>
      </section>

      {bookmarkedModels.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">Your saved models</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {bookmarkedModels.map((m) => {
              const provider = providerById.get(m.providerId)
              return (
                <Link
                  key={m.id}
                  to={`/models/${m.id}`}
                  data-attr="home-saved-model"
                  onClick={() => capture('home_saved_model_clicked', { model_id: m.id })}
                  className="group rounded-lg border border-line bg-surface-raised p-4 transition-colors duration-150 hover:border-line-strong hover:bg-surface-raised/80"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="flex items-center gap-2">
                        {provider && <ProviderLogo providerId={provider.id} size={16} />}
                        <h3 className="font-medium text-fg group-hover:text-accent-deep">{m.name}</h3>
                      </div>
                      {m.contextWindowTokens && (
                        <p className="text-xs text-fg-secondary">
                          {formatTokens(m.contextWindowTokens)} context window
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">Latest releases</h2>
          <Link
            to="/whats-new"
            data-attr="home-releases-see-all"
            onClick={() => capture('home_cta_clicked', { destination: 'whats-new' })}
            className="text-sm font-medium text-accent-deep transition-colors duration-150 hover:text-accent-deep/80"
          >
            See all releases →
          </Link>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-fg-secondary">
          These are the newest model launches and updates we track. You can open any model page
          to see how it compares.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {latestReleases.map((release) => {
            const model = release.modelId ? models.find((m) => m.id === release.modelId) : null
            return (
              <article
                key={release.id}
                className="rounded-xl border border-line bg-surface-raised p-4 transition-colors duration-150 hover:border-line-strong"
              >
                <p className="text-xs font-medium text-fg-muted">{formatReleaseDate(release.date)}</p>
                {model ? (
                  <Link
                    to={`/models/${model.id}`}
                    data-attr="home-release-model"
                    onClick={() => capture('home_release_clicked', { model_id: model.id })}
                    className="group mt-1 inline-flex items-center gap-2"
                  >
                    <ProviderLogo providerId={model.providerId} size={16} />
                    <h3 className="font-medium text-fg transition-colors duration-150 group-hover:text-accent-deep">
                      {release.title}
                    </h3>
                  </Link>
                ) : (
                  <h3 className="mt-1 font-medium text-fg">{release.title}</h3>
                )}
                <p className="mt-1 text-sm leading-relaxed text-fg-secondary">
                  {release.description}
                </p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="rounded-xl border border-line bg-accent-soft/60 p-6">
        <h2 className="text-lg font-semibold tracking-tight">
          New to all this?
        </h2>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-fg-secondary">
          Learn what an LLM is, what GPT stands for, what a context window means, and why some
          models "think" before answering.
        </p>
        <Link
          to="/learn"
          data-attr="home-cta-learn"
          onClick={() => capture('home_cta_clicked', { destination: 'learn' })}
          className="mt-4 inline-block rounded-lg bg-accent-deep px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-deep/90 dark:text-surface"
        >
          Learn the basics
        </Link>
      </section>
    </div>
  )
}
