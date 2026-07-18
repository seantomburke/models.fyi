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
  type?: 'website' | 'article'
  image?: string
}

const ogImage = '/models.fyi/og-image.png'

export const routeMeta: RouteMeta[] = [
  {
    path: '/',
    title: 'Models.fyi — Which AI model should I use?',
    description:
      'Compare flagship AI models from OpenAI, Anthropic, Google, and xAI across benchmarks, cost, and capability. Plain language, no PhD required.',
    type: 'website',
    image: ogImage,
  },
  {
    path: '/compare',
    title: 'Compare AI models — Models.fyi',
    description:
      'Every flagship AI model side by side: benchmark scores, prices, and context windows from OpenAI, Anthropic, Google, xAI, and open source, explained in plain language.',
    type: 'website',
    image: ogImage,
  },
  {
    path: '/graph',
    title: 'AI models on a graph — Models.fyi',
    description:
      'Plot AI model performance against price on axes you choose. Compare GPT, Claude, Gemini, Grok, and open-source models visually.',
    type: 'website',
    image: ogImage,
  },
  {
    path: '/calculator',
    title: 'AI token cost calculator — Models.fyi',
    description:
      'Compare what AI models charge per million tokens, then paste your own text to calculate input, output, and thinking-token costs across GPT, Claude, Gemini, and Grok.',
    type: 'website',
    image: ogImage,
  },
  {
    path: '/quiz',
    title: 'Which AI model should I use? — Models.fyi',
    description:
      'Answer a few plain-language questions: who you are, what you want to do, and your budget, and get an AI model recommendation with the reasoning spelled out.',
    type: 'website',
    image: ogImage,
  },
  {
    path: '/search',
    title: 'Search AI models — Models.fyi',
    description:
      'Search and find AI models by name, provider, or capability. Quickly locate the model you\'re looking for from our comprehensive database.',
    type: 'website',
    image: ogImage,
  },
  {
    path: '/learn',
    title: 'Learn the basics of AI models — Models.fyi',
    description:
      'What is an AI model? What is an LLM, GPT, or a context window? The basics of AI, explained in plain language with simple analogies.',
    type: 'website',
    image: ogImage,
  },
  {
    path: '/faq',
    title: 'FAQ — Models.fyi',
    description:
      'Frequently asked questions about AI models, benchmarks, pricing, and model selection. Get answers to common questions in plain language.',
    type: 'website',
    image: ogImage,
  },
  ...topics.map((t) => ({
    path: `/learn/${t.slug}`,
    title: t.metaTitle,
    description: t.metaDescription,
    type: 'article' as const,
    image: ogImage,
  })),
]

export function metaFor(path: string): RouteMeta {
  const meta = routeMeta.find((r) => r.path === path)
  if (!meta) throw new Error(`No route meta for "${path}"`)
  return meta
}

/**
 * Generate Organization schema for JSON-LD.
 */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Models.fyi',
    url: 'https://models.fyi',
    description:
      'Compare flagship AI models from OpenAI, Anthropic, Google, and xAI across benchmarks, cost, and capability.',
    sameAs: ['https://github.com/seantomburke/models.fyi'],
  }
}

/**
 * Generate FAQ schema for Learn section (FAQPage).
 */
export function faqSchema(items: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

/**
 * Generate BreadcrumbList schema for navigation.
 */
export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  const basePath = '/models.fyi'
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://models.fyi${basePath}${item.path}`,
    })),
  }
}
