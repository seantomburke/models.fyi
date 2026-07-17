import { topics } from '../pages/learn/topics.ts'

/**
 * Canonical SEO metadata for every prerenderable route.
 * Single source of truth: pages read from here at runtime (via usePageMeta)
 * and scripts/prerender.mjs reads it at build time to emit static HTML,
 * so titles can never drift between the two.
 */
export interface RouteMeta {
  path: string
  title: string
  description: string
}

export const routeMeta: RouteMeta[] = [
  {
    path: '/',
    title: 'Models.fyi — Which AI model should I use?',
    description:
      'Compare flagship AI models from OpenAI, Anthropic, Google, and xAI across benchmarks, cost, and capability. Plain language, no PhD required.',
  },
  {
    path: '/compare',
    title: 'Compare AI models — Models.fyi',
    description:
      'Every flagship AI model side by side: benchmark scores, prices, and context windows from OpenAI, Anthropic, Google, xAI, and open source, explained in plain language.',
  },
  {
    path: '/graph',
    title: 'AI models on a graph — Models.fyi',
    description:
      'Plot AI model performance against price on axes you choose. Compare GPT, Claude, Gemini, Grok, and open-source models visually.',
  },
  {
    path: '/calculator',
    title: 'AI token cost calculator — Models.fyi',
    description:
      'Compare what AI models charge per million tokens, then paste your own text to calculate input, output, and thinking-token costs across GPT, Claude, Gemini, and Grok.',
  },
  {
    path: '/quiz',
    title: 'Which AI model should I use? — Models.fyi',
    description:
      'Answer a few plain-language questions: who you are, what you want to do, and your budget, and get an AI model recommendation with the reasoning spelled out.',
  },
  {
    path: '/learn',
    title: 'Learn the basics of AI models — Models.fyi',
    description:
      'What is an AI model? What is an LLM, GPT, or a context window? The basics of AI, explained in plain language with simple analogies.',
  },
  ...topics.map((t) => ({
    path: `/learn/${t.slug}`,
    title: t.metaTitle,
    description: t.metaDescription,
  })),
]

export function metaFor(path: string): RouteMeta {
  const meta = routeMeta.find((r) => r.path === path)
  if (!meta) throw new Error(`No route meta for "${path}"`)
  return meta
}
