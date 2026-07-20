import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { usePageMeta } from '../lib/meta.ts'
import { metaFor } from '../lib/routeMeta.ts'
import { models, providers, providerById } from '../data/index.ts'
import { loadBookmarks } from '../lib/bookmarks.ts'
import { ProviderLogo } from '../components/ProviderLogo.tsx'
import { formatTokens } from '../lib/format.ts'

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
          className="mt-4 inline-block rounded-lg bg-accent-deep px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-deep/90 dark:text-surface"
        >
          Learn the basics
        </Link>
      </section>
    </div>
  )
}
