import { Link } from 'react-router-dom'
import { usePageMeta } from '../../lib/meta.ts'
import { topics } from './topics.ts'

export function Learn() {
  usePageMeta(
    'Learn the basics of AI models — Models.fyi',
    'What is an AI model? What is an LLM, GPT, or a context window? The basics of AI, explained in plain language with simple analogies.',
  )
  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Learn the basics</h1>
        <p className="mt-3 leading-relaxed text-fg-secondary">
          Six short explainers, no jargon, no math. Read them in order or jump to the one you
          came for.
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
