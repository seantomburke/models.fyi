/**
 * Site-wide content search: glossary terms, Learn topics, and FAQs.
 *
 * Lives apart from search.ts on purpose. Compare imports searchModels, and
 * Rollup chunks at module granularity — importing the glossary and FAQ corpora
 * from search.ts pulled both datasets into /compare's preload graph. Only the
 * Search page imports this module, so the corpora stay in their own chunks.
 * topics.ts already ships in the shared meta chunk (routeMeta.ts imports it),
 * so reading it here adds no bundle weight.
 */
import { glossaryTerms } from '../data/glossary.ts'
import { faqs } from '../data/faqs.ts'
import { topics } from '../pages/learn/topics.ts'

export interface ContentResult {
  kind: 'glossary' | 'learn' | 'faq'
  title: string
  snippet: string
  /** Router path the result links to, including any query/hash. */
  to: string
  relevance: number
}

const SNIPPET_MAX = 140

/** Trim a snippet to ~140 chars without cutting a word in half. */
function clip(text: string): string {
  if (text.length <= SNIPPET_MAX) return text
  const cut = text.slice(0, SNIPPET_MAX)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : SNIPPET_MAX)}…`
}

/**
 * Search the site's educational content. Relevance tiers mirror searchModels —
 * a hit on the title/term/question outranks a hit buried in body copy — so
 * results interleave sensibly.
 */
export function searchContent(query: string): ContentResult[] {
  const q = query.toLowerCase().trim()
  if (!q) return []

  const results: ContentResult[] = []

  for (const term of glossaryTerms) {
    const termLower = term.term.toLowerCase()
    let relevance = 0
    if (termLower === q || termLower.startsWith(q)) relevance = 100
    else if (termLower.includes(q)) relevance = 90
    else if (term.short.toLowerCase().includes(q)) relevance = 70
    else if (term.long.toLowerCase().includes(q)) relevance = 50
    if (relevance > 0) {
      results.push({
        kind: 'glossary',
        title: term.term,
        snippet: clip(term.short),
        to: `/glossary?q=${encodeURIComponent(term.term)}`,
        relevance,
      })
    }
  }

  for (const topic of topics) {
    const titleLower = topic.question.toLowerCase()
    let relevance = 0
    if (titleLower.startsWith(q)) relevance = 100
    else if (titleLower.includes(q)) relevance = 90
    else if (topic.metaDescription.toLowerCase().includes(q)) relevance = 70
    else if (topic.sections.some((s) => s.heading.toLowerCase().includes(q))) relevance = 60
    if (relevance > 0) {
      results.push({
        kind: 'learn',
        title: topic.question,
        snippet: clip(topic.hook),
        to: `/learn/${topic.slug}`,
        relevance,
      })
    }
  }

  for (const faq of faqs) {
    const questionLower = faq.question.toLowerCase()
    let relevance = 0
    if (questionLower.startsWith(q)) relevance = 100
    else if (questionLower.includes(q)) relevance = 90
    else if (faq.answer.toLowerCase().includes(q)) relevance = 55
    if (relevance > 0) {
      results.push({
        kind: 'faq',
        title: faq.question,
        snippet: clip(faq.answer),
        to: `/faq?q=${encodeURIComponent(faq.question.slice(0, 60))}`,
        relevance,
      })
    }
  }

  return results.sort((a, b) => b.relevance - a.relevance)
}
