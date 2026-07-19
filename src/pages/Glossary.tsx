import { useMemo, useState } from 'react'
import { usePageMeta } from '../lib/meta.ts'
import { metaFor } from '../lib/routeMeta.ts'
import { glossaryTerms } from '../data/index.ts'
import type { GlossaryTerm } from '../data/index.ts'
import { Breadcrumb } from '../components/Breadcrumb.tsx'

export function Glossary() {
  const meta = metaFor('/glossary')
  usePageMeta({
    title: meta.title,
    description: meta.description,
    image: meta.image,
    type: meta.type,
    pathname: '/glossary',
    structuredData: meta.structuredData,
  })

  const [search, setSearch] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    if (!search.trim()) return glossaryTerms
    const query = search.toLowerCase()
    return glossaryTerms.filter(
      (t) =>
        t.term.toLowerCase().includes(query) ||
        t.short.toLowerCase().includes(query) ||
        t.long.toLowerCase().includes(query),
    )
  }, [search])

  const grouped = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {}
    filtered.forEach((term) => {
      const letter = term.term[0].toUpperCase()
      if (!groups[letter]) groups[letter] = []
      groups[letter].push(term)
    })
    return Object.keys(groups)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = groups[key].sort((a, b) => a.term.localeCompare(b.term))
          return acc
        },
        {} as Record<string, GlossaryTerm[]>,
      )
  }, [filtered])

  const toggleExpanded = (id: string) => {
    const newSet = new Set(expandedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setExpandedIds(newSet)
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { name: 'Home', path: '/' },
          { name: 'Glossary' },
        ]}
        className="mb-4"
      />

      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Glossary</h1>
        <p className="mt-3 leading-relaxed text-fg-secondary">
          AI, benchmark, and model terminology explained in plain language. Search for a term
          below.
        </p>
      </div>

      <div className="relative max-w-xl">
        <input
          type="text"
          placeholder="Search glossary..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-fg placeholder-fg-muted transition-colors focus:border-accent-deep focus:outline-none focus:ring-2 focus:ring-accent-deep/20"
          aria-label="Search glossary terms"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="py-8 text-center text-fg-muted">
          <p>No terms found matching "{search}"</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([letter, terms]) => (
            <section key={letter}>
              <h2 className="mb-3 text-lg font-semibold text-fg-secondary">{letter}</h2>
              <div className="space-y-2">
                {terms.map((term) => {
                  const isExpanded = expandedIds.has(term.id)
                  return (
                    <details
                      key={term.id}
                      open={isExpanded}
                      className="group rounded-lg border border-line bg-surface-raised transition-colors hover:border-line-strong"
                    >
                      <summary
                        onClick={() => toggleExpanded(term.id)}
                        className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-fg transition-colors hover:text-accent-deep"
                      >
                        <span className="inline-flex items-center gap-2">
                          {term.term}
                          <span
                            aria-hidden
                            className="text-fg-muted transition-transform group-open:rotate-180"
                          >
                            ▼
                          </span>
                        </span>
                      </summary>
                      <div className="border-t border-line px-4 py-3">
                        <p className="text-sm text-fg-secondary">{term.short}</p>
                        <p className="mt-2 text-sm leading-relaxed text-fg-secondary">{term.long}</p>
                        {term.relatedLearnTopic && (
                          <div className="mt-3 text-xs">
                            <a
                              href={`/models.fyi/learn/${term.relatedLearnTopic}`}
                              className="inline-flex items-center gap-1 rounded bg-accent-soft px-2 py-1 font-medium text-accent-deep transition-colors hover:bg-accent-soft/80"
                            >
                              Learn more →
                            </a>
                          </div>
                        )}
                      </div>
                    </details>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="text-xs text-fg-muted">
        <p>
          Can't find a term? <a href="/models.fyi/search" className="text-accent-deep hover:underline">Search models</a> or <a href="/models.fyi/faq" className="text-accent-deep hover:underline">check the FAQ</a>.
        </p>
      </div>
    </div>
  )
}
