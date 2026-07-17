import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { usePostHog } from '@posthog/react'
import { usePageMeta } from '../../lib/meta.ts'
import { topics } from './topics.ts'

const crossLinks = [
  { to: '/compare', label: 'Compare all models side by side' },
  { to: '/graph', label: 'See performance vs price on a graph' },
  { to: '/quiz', label: 'Get a model recommendation in 4 questions' },
]

export function LearnTopic() {
  const posthog = usePostHog()
  const { slug } = useParams()
  const index = topics.findIndex((t) => t.slug === slug)
  const topic = topics[index]

  // Hooks must run unconditionally; harmless values for the not-found case.
  usePageMeta(
    topic?.metaTitle ?? 'Not found — Models.fyi',
    topic?.metaDescription ?? "That explainer doesn't exist.",
  )

  useEffect(() => {
    if (!topic) return
    posthog?.capture('learn_topic_viewed', { slug: topic.slug, title: topic.question, topic_index: index })
  }, [posthog, topic, index])

  if (!topic) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-3 text-fg-secondary">
          That explainer doesn't exist.{' '}
          <Link to="/learn" className="text-accent-deep underline underline-offset-2">
            See all topics
          </Link>
          .
        </p>
      </div>
    )
  }

  const next = topics[index + 1]

  return (
    <article className="max-w-2xl">
      <nav aria-label="Breadcrumb" className="text-sm text-fg-muted">
        <Link to="/learn" className="transition-colors duration-150 hover:text-fg-secondary">
          Learn
        </Link>{' '}
        / <span className="text-fg-secondary">{topic.question}</span>
      </nav>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{topic.question}</h1>
      <p className="mt-3 text-lg leading-relaxed text-fg-secondary">{topic.hook}</p>

      {topic.sections.map((s) => (
        <section key={s.heading} className="mt-8">
          <h2 className="text-xl font-semibold tracking-tight">{s.heading}</h2>
          {s.paragraphs.map((p) => (
            <p key={p.slice(0, 40)} className="mt-3 leading-relaxed text-fg-secondary">
              {p}
            </p>
          ))}
        </section>
      ))}

      <div className="mt-10 rounded-xl border border-line bg-accent-soft/60 p-5">
        <h2 className="text-sm font-semibold">Put it to use</h2>
        <ul className="mt-2 space-y-1.5 text-sm">
          {crossLinks.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="text-accent-deep underline decoration-accent/40 underline-offset-2 transition-colors duration-150 hover:decoration-accent"
              >
                {l.label} →
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {next && (
        <p className="mt-8 border-t border-line pt-4 text-sm text-fg-muted">
          Next up:{' '}
          <Link
            to={`/learn/${next.slug}`}
            className="font-medium text-accent-deep underline underline-offset-2"
          >
            {next.question}
          </Link>
        </p>
      )}
    </article>
  )
}
