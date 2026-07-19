import { topics } from '../pages/learn/topics.ts'
import { models } from '../data/models.ts'
import { providers } from '../data/providers.ts'
import type { Model } from '../data/types.ts'

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
  /** JSON-LD for this route. Injected into static HTML by scripts/prerender.mjs. */
  structuredData?: Record<string, unknown>
}

/** Absolute base URL of the deployed site — og:image and canonical URLs must be absolute. */
export const SITE_URL = 'https://seantomburke.github.io/models.fyi'

/**
 * The canonical absolute URL for a route path, always with a trailing slash.
 * GitHub Pages serves each prerendered route from `<path>/index.html`, so the
 * slashless form 301-redirects to the trailing-slash form. Canonical tags,
 * og:url, sitemap entries, and JSON-LD must all use the URL that returns 200.
 */
export function canonicalUrl(path: string): string {
  return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}/`
}

const ogImage = `${SITE_URL}/og-image.png`

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
    title: 'Learn how AI models work — Models.fyi',
    description:
      'A plain-language learning path for AI models: basics, intermediate, and advanced explainers, plus a model lab with tiny interactive models you can play with in your browser.',
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
  {
    path: '/glossary',
    title: 'Glossary — Models.fyi',
    description:
      'AI and model terminology explained in plain language. Search for terms like LLM, token, context window, hallucination, and more.',
    type: 'website',
    image: ogImage,
  },
  {
    path: '/whats-new',
    title: "What's New — latest AI model releases — Models.fyi",
    description:
      'The latest AI model releases, updates, and announcements from OpenAI, Anthropic, Google, xAI, and the open-source community, in one chronological feed.',
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
  ...models.map((m) => ({
    path: `/models/${m.id}`,
    title: `${m.name} — benchmarks, pricing, and specs — Models.fyi`,
    description: m.blurb,
    type: 'article' as const,
    image: ogImage,
    structuredData: modelSchema(m),
  })),
]

export function metaFor(path: string): RouteMeta {
  const meta = routeMeta.find((r) => r.path === path)
  if (!meta) throw new Error(`No route meta for "${path}"`)
  return meta
}

/**
 * Generate SoftwareApplication schema for a model detail page.
 * schema.org requires a bare numeric `price`, so the per-1M-token unit is
 * expressed through a UnitPriceSpecification instead of appended as text.
 */
export function modelSchema(model: Model): Record<string, unknown> {
  const provider = providers.find((p) => p.id === model.providerId)
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: model.name,
    url: canonicalUrl(`/models/${model.id}`),
    description: model.blurb,
    applicationCategory: 'DeveloperApplication',
    creator: {
      '@type': 'Organization',
      name: provider?.name ?? model.providerId,
    },
  }
  if (model.releaseDate) schema.datePublished = model.releaseDate
  if (model.license) schema.license = model.license
  if (model.inputPricePerMTok !== null) {
    schema.offers = {
      '@type': 'Offer',
      price: model.inputPricePerMTok,
      priceCurrency: 'USD',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: model.inputPricePerMTok,
        priceCurrency: 'USD',
        referenceQuantity: {
          '@type': 'QuantitativeValue',
          value: 1_000_000,
          unitText: 'input tokens',
        },
      },
    }
  } else if (model.openSource) {
    // Open-weight models with no fixed API price: the weights are free to run.
    schema.isAccessibleForFree = true
  }
  return schema
}

/**
 * Generate Organization schema for JSON-LD.
 */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Models.fyi',
    url: canonicalUrl('/'),
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
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  }
}
