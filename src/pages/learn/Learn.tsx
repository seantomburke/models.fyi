import { Link } from 'react-router-dom'
import { usePageMeta } from '../../lib/meta.ts'
import { metaFor } from '../../lib/routeMeta.ts'
import { topics, levels } from './topics.ts'
import { Breadcrumb } from '../../components/Breadcrumb.tsx'
import { TopicCardAnimation } from '../../components/learn/TopicCardAnimation.tsx'
import { MOTIF_LABELS, motifFor } from '../../components/learn/topicMotifs.ts'

/**
 * Sidebar table of contents: every lesson under its level header, as plain
 * links. Desktop only — on small screens the card grid IS the overview, and
 * a second copy of thirty links would just push it below the fold.
 */
function LessonIndex() {
  return (
    <nav
      aria-label="All lessons"
      className="hidden lg:block lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto rounded-xl border border-line bg-surface-raised p-4"
    >
      {levels.map((level) => (
        <div key={level.id} className="mb-4 last:mb-0">
          <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">{level.title}</p>
          <ul className="mt-1.5 space-y-1">
            {topics
              .filter((t) => t.level === level.id)
              .map((t) => (
                <li key={t.slug}>
                  <Link
                    to={`/learn/${t.slug}`}
                    className="block text-sm leading-snug text-fg-secondary transition-colors duration-150 hover:text-accent-deep"
                  >
                    {t.question}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export function Learn() {
  const meta = metaFor('/learn')
  usePageMeta({
    title: meta.title,
    description: meta.description,
    image: meta.image,
    type: meta.type,
    pathname: '/learn',
    structuredData: meta.structuredData,
  })
  return (
    <div className="space-y-10">
      <Breadcrumb
        items={[
          { name: 'Home', path: '/' },
          { name: 'Learn' },
        ]}
        className="mb-4"
      />
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Learn how AI models work</h1>
        <p className="mt-3 leading-relaxed text-fg-secondary">
          A learning path in plain language: start with the basics, work up to the advanced machinery,
          then step into the model lab and play with real (tiny) models in your browser.
          Read in order or jump to the one you came for.
        </p>
      </div>
      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start lg:gap-10">
        <LessonIndex />
        <div className="space-y-10">
          {levels.map((level) => {
            const levelTopics = topics.filter((t) => t.level === level.id)
            return (
              <section key={level.id} aria-labelledby={`level-${level.id}`}>
                <h2 id={`level-${level.id}`} className="text-xl font-semibold tracking-tight">
                  {level.title}
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-fg-secondary">{level.blurb}</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {levelTopics.map((t, i) => {
                    const motif = motifFor(t.slug)
                    return (
                      <Link
                        key={t.slug}
                        to={`/learn/${t.slug}`}
                        className="group rounded-xl border border-line bg-surface-raised p-5 transition-colors duration-150 hover:border-line-strong"
                      >
                        <span className="flex items-baseline justify-between text-xs font-medium uppercase tracking-wide text-fg-muted">
                          <span>
                            {level.title} · Part {i + 1}
                          </span>
                          {t.modelSpec && <span className="text-accent-deep">{t.modelSpec.name}</span>}
                        </span>
                        <h3 className="mt-1 text-lg font-semibold tracking-tight group-hover:text-accent-deep">
                          {t.question}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-fg-secondary">{t.hook}</p>
                        <div className="mt-3">
                          <TopicCardAnimation motif={motif} label={MOTIF_LABELS[motif]} />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
