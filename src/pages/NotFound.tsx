import { Link } from 'react-router-dom'
import { usePageMeta } from '../lib/meta.ts'
import { Breadcrumb } from '../components/Breadcrumb.tsx'
import { notFoundMeta } from '../lib/routeMeta.ts'

export function NotFound() {
  usePageMeta({
    ...notFoundMeta,
    pathname: null,
    robots: 'noindex',
  })

  return (
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { name: 'Home', path: '/' },
          { name: '404 Not Found' },
        ]}
        className="mb-4"
      />
      <section className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Page not found</h1>
        <p className="mt-4 text-lg leading-relaxed text-fg-secondary">
          The page you're looking for doesn't exist. Try one of these pages to get back on track.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/"
          className="group rounded-xl border border-line bg-surface-raised p-6 transition-colors duration-150 hover:border-line-strong"
        >
          <h2 className="text-lg font-semibold tracking-tight group-hover:text-accent-deep">
            Home →
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-fg-secondary">
            Start here to compare AI models and get personalized recommendations.
          </p>
        </Link>

        <Link
          to="/quiz"
          className="group rounded-xl border border-line bg-surface-raised p-6 transition-colors duration-150 hover:border-line-strong"
        >
          <h2 className="text-lg font-semibold tracking-tight group-hover:text-accent-deep">
            Which model should I use? →
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-fg-secondary">
            Answer a few questions and get a personalized model recommendation.
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
            Every flagship model side by side: benchmarks, prices, and capabilities.
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
            Plot performance against price and spot which models punch above their weight.
          </p>
        </Link>

        <Link
          to="/calculator"
          className="group rounded-xl border border-line bg-surface-raised p-6 transition-colors duration-150 hover:border-line-strong"
        >
          <h2 className="text-lg font-semibold tracking-tight group-hover:text-accent-deep">
            Token calculator →
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-fg-secondary">
            Calculate token costs for your text across different AI models.
          </p>
        </Link>

        <Link
          to="/learn"
          className="group rounded-xl border border-line bg-surface-raised p-6 transition-colors duration-150 hover:border-line-strong"
        >
          <h2 className="text-lg font-semibold tracking-tight group-hover:text-accent-deep">
            Learn the basics →
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-fg-secondary">
            Learn what an LLM is, what GPT stands for, and other key concepts.
          </p>
        </Link>
      </section>
    </div>
  )
}
