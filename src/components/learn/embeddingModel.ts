/**
 * Hardcoded "meaning-space" for the embedding demo.
 *
 * A real embedding model turns text into thousands of numbers. We can't draw a
 * thousand-dimensional point, so this file places a small vocabulary on a 2D
 * map by hand, in positions that mirror how a real model would cluster them:
 * vehicles in one corner, animals in another, math off on its own. The exact
 * coordinates are editorial, but the RELATIONSHIPS (near = related, far =
 * unrelated) are the whole lesson.
 *
 * Each phrase also carries the plain keywords a naive text search would index,
 * so the demo can contrast keyword matching (same words) with semantic
 * matching (same meaning, different words).
 */

export interface Phrase {
  /** The phrase as shown on the map and in the results. */
  text: string
  /** Position in the hand-drawn meaning-space, each axis 0..100. */
  x: number
  y: number
  /** Lowercased words a keyword search would index for this phrase. */
  keywords: string[]
  /** Which cluster this belongs to, used only for the map legend. */
  cluster: 'vehicles' | 'animals' | 'math'
}

export const PHRASES: Phrase[] = [
  { text: 'fast cars', x: 22, y: 24, keywords: ['fast', 'cars'], cluster: 'vehicles' },
  { text: 'quick vehicles', x: 25, y: 21, keywords: ['quick', 'vehicles'], cluster: 'vehicles' },
  { text: 'speedy trucks', x: 15, y: 32, keywords: ['speedy', 'trucks'], cluster: 'vehicles' },
  { text: 'racing bikes', x: 33, y: 34, keywords: ['racing', 'bikes'], cluster: 'vehicles' },
  { text: 'happy dogs', x: 74, y: 72, keywords: ['happy', 'dogs'], cluster: 'animals' },
  { text: 'playful puppies', x: 80, y: 66, keywords: ['playful', 'puppies'], cluster: 'animals' },
  { text: 'friendly cats', x: 70, y: 80, keywords: ['friendly', 'cats'], cluster: 'animals' },
  { text: 'linear algebra', x: 78, y: 20, keywords: ['linear', 'algebra'], cluster: 'math' },
  { text: 'calculus proofs', x: 84, y: 28, keywords: ['calculus', 'proofs'], cluster: 'math' },
]

export interface Ranked extends Phrase {
  /** Straight-line distance to the query in meaning-space. Smaller = closer. */
  distance: number
  /** True when the query and this phrase share at least one keyword. */
  keywordMatch: boolean
}

/** Distance in the 2D meaning-space (Euclidean; the map is only two axes). */
export function distanceBetween(a: Phrase, b: Phrase): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function sharesKeyword(a: Phrase, b: Phrase): boolean {
  return a.keywords.some((k) => b.keywords.includes(k))
}

/**
 * The other phrases ranked by nearness to `queryText`, nearest first. Each
 * result also reports whether a keyword search would have caught it, so the UI
 * can show which semantic matches keyword search misses.
 */
export function rankByMeaning(queryText: string): Ranked[] {
  const query = PHRASES.find((p) => p.text === queryText)
  if (!query) return []
  return PHRASES.filter((p) => p.text !== queryText)
    .map((p) => ({
      ...p,
      distance: distanceBetween(query, p),
      keywordMatch: sharesKeyword(query, p),
    }))
    .sort((a, b) => a.distance - b.distance)
}
