import { useState } from 'react'
import { PHRASES, rankByMeaning, type Phrase } from './embeddingModel'
import { prefersReducedMotion } from './useCardAnimation'

/**
 * Interactive "meaning-space" map for the embedding-models topic.
 *
 * The reader picks a phrase and watches the other phrases sort by how close
 * they sit in a hand-drawn 2D map. "quick vehicles" lands next to "fast cars"
 * even though they share no words, which is exactly what a keyword search
 * cannot do. Each result is tagged with whether a plain keyword search would
 * have caught it, so the gap between matching words and matching meaning is
 * visible at a glance.
 */

const CLUSTER_LABEL: Record<Phrase['cluster'], string> = {
  vehicles: 'vehicles',
  animals: 'animals',
  math: 'math',
}

/** How many nearest neighbours to call a "match" and draw a link to. */
const NEIGHBOUR_COUNT = 2

export function EmbeddingExplorer() {
  const [queryText, setQueryText] = useState(PHRASES[0].text)

  const query = PHRASES.find((p) => p.text === queryText) ?? PHRASES[0]
  const ranked = rankByMeaning(query.text)
  const neighbours = ranked.slice(0, NEIGHBOUR_COUNT)
  const neighbourTexts = new Set(neighbours.map((n) => n.text))
  const animate = !prefersReducedMotion()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-fg">Pick a phrase to search from</h3>
        <div className="flex flex-wrap gap-2" role="group" aria-label="phrase choices">
          {PHRASES.map((p) => (
            <button
              key={p.text}
              type="button"
              onClick={() => setQueryText(p.text)}
              aria-pressed={p.text === query.text}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
                p.text === query.text
                  ? 'border-accent-deep bg-accent-soft text-accent-deep'
                  : 'border-line bg-surface-raised text-fg hover:border-line-strong'
              }`}
            >
              {p.text}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-fg">
          Where every phrase sits in meaning-space
        </h3>
        <div className="rounded-lg border border-line bg-surface p-3">
          <svg
            viewBox="0 0 100 100"
            className="h-64 w-full"
            role="img"
            aria-label={`A map of phrases. "${query.text}" is highlighted, with lines drawn to its nearest neighbours ${neighbours
              .map((n) => `"${n.text}"`)
              .join(' and ')}.`}
          >
            {/* Links from the query to its nearest neighbours: meaning made
                visible as short lines. */}
            {neighbours.map((n) => (
              <line
                key={`link-${n.text}`}
                x1={query.x}
                y1={query.y}
                x2={n.x}
                y2={n.y}
                stroke="currentColor"
                strokeWidth={0.6}
                strokeDasharray="2 2"
                className="text-accent-deep/60"
              />
            ))}
            {PHRASES.map((p) => {
              const isQuery = p.text === query.text
              const isNeighbour = neighbourTexts.has(p.text)
              return (
                <g key={p.text}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isQuery ? 3 : 2}
                    className={
                      isQuery
                        ? 'fill-accent-deep'
                        : isNeighbour
                          ? 'fill-accent-deep/70'
                          : 'fill-fg-secondary/40'
                    }
                    style={animate ? { transition: 'r 150ms ease' } : undefined}
                  />
                  <text
                    x={p.x}
                    y={p.y - 4}
                    textAnchor="middle"
                    className={`fill-current text-[3.4px] ${
                      isQuery || isNeighbour ? 'text-fg' : 'text-fg-secondary'
                    }`}
                  >
                    {p.text}
                  </text>
                </g>
              )
            })}
          </svg>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-secondary">
            {(['vehicles', 'animals', 'math'] as const).map((c) => (
              <span key={c}>{CLUSTER_LABEL[c]} cluster together</span>
            ))}
          </div>
        </div>
        <p className="text-sm text-fg-secondary">
          Nothing here reads the words. Each phrase is just a point, and phrases with similar
          meaning land near each other. Distance is the only thing the search measures.
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-fg">
          Closest matches to "{query.text}"
        </h3>
        <ul className="space-y-1.5">
          {ranked.map((r) => (
            <li
              key={r.text}
              className="rounded-lg border border-line bg-surface px-3 py-2"
              aria-label={`${r.text}: ${
                r.keywordMatch
                  ? 'a keyword search would also find this'
                  : 'a keyword search would miss this'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-32 shrink-0 font-medium text-fg">{r.text}</span>
                <span className="relative h-2.5 grow overflow-hidden rounded-full bg-accent-soft">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-accent-deep/70"
                    style={{
                      // Closer phrases get a longer bar. The farthest phrase on
                      // the map is roughly 90 units away, so scale against that.
                      width: `${Math.max(4, Math.round((1 - r.distance / 90) * 100))}%`,
                      ...(animate ? { transition: 'width 200ms ease' } : {}),
                    }}
                  />
                </span>
                <span
                  className="w-40 shrink-0 text-right text-xs font-medium"
                  style={
                    r.keywordMatch
                      ? { color: '#166534' }
                      : { color: '#9a3412' }
                  }
                >
                  {r.keywordMatch ? 'keyword search finds it' : 'keyword search misses it'}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-sm text-fg-secondary">
          The top matches share meaning. Their words can be completely different. That is why
          searching "quick vehicles" can surface "fast cars." A keyword search, stuck on exact
          words, walks right past that match.
        </p>
      </div>
    </div>
  )
}
