import { Link } from 'react-router-dom'
import { usePageMeta } from '../../lib/meta.ts'
import { metaFor } from '../../lib/routeMeta.ts'
import { topics } from './topics.ts'
import { Breadcrumb } from '../../components/Breadcrumb.tsx'

export function Learn() {
  const meta = metaFor('/learn')
  usePageMeta({
    title: meta.title,
    description: meta.description,
    image: meta.image,
    type: meta.type,
    pathname: '/learn',
  })
  return (
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { name: 'Home', path: '/' },
          { name: 'Learn' },
        ]}
        className="mb-4"
      />
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Learn the basics</h1>
        <p className="mt-3 leading-relaxed text-fg-secondary">
          Plain-language explainers on AI models, benchmarks, comparisons, and use cases. No jargon, no math. Read them in order or jump to the one you came for.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {topics.map((t, i) => (
          <Link
            key={t.slug}
            to={`/learn/${t.slug}`}
            className="group rounded-xl border border-line bg-surface-raised p-5 transition-colors duration-150 hover:border-line-strong"
          >
            <span className="text-xs font-medium uppercase tracking-wide text-fg-faint">
              Part {i + 1}
            </span>
            <h2 className="mt-1 text-lg font-semibold tracking-tight group-hover:text-accent-deep">
              {t.question}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-fg-secondary">{t.hook}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
