import { Link } from 'react-router-dom'
import { usePageMeta } from '../lib/meta.ts'
import { models, providers } from '../data/index.ts'

export function Home() {
  usePageMeta(
    'Models.fyi — Which AI model should I use?',
    'Compare flagship AI models from OpenAI, Anthropic, Google, and xAI across benchmarks, cost, and capability — explained in plain language, no PhD required.',
  )

  const openCount = models.filter((m) => m.openSource).length

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
          {models.length} models from {providers.length} companies — including {openCount} you
          can run yourself for free — and explain what the numbers actually mean.
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
            Answer a few plain-language questions — who you are, what you're doing, what you
            want to spend — and get a recommendation with the reasoning spelled out.
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

      <section className="rounded-xl border border-line bg-accent-soft/60 p-6">
        <h2 className="text-lg font-semibold tracking-tight">
          New to all this?
        </h2>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-fg-secondary">
          What's an LLM? What does GPT stand for? What's a context window, and why do some
          models "think" before answering? Start with the basics.
        </p>
        <Link
          to="/learn"
          className="mt-4 inline-block rounded-lg bg-accent-deep px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent"
        >
          Learn the basics
        </Link>
      </section>
    </div>
  )
}
