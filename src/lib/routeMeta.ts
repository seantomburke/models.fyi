import { topics, levels } from '../pages/learn/topics.ts'
import type { Topic } from '../pages/learn/topics.ts'
import { models } from '../data/models.ts'
import { providers } from '../data/providers.ts'
import { glossaryTerms } from '../data/glossary.ts'
import { releases } from '../data/releases.ts'
import { faqs } from '../data/faqs.ts'
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

/**
 * Bundle several schemas into one JSON-LD block via @graph.
 * A page usually has both a page-level type and the BreadcrumbList that
 * matches the trail rendered in the UI; @graph is how schema.org expresses
 * "these describe the same page" without emitting two script tags.
 * The inner @context keys are dropped — the graph carries one for all of them.
 */
function graph(...nodes: Array<Record<string, unknown>>): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes.map(({ '@context': _context, ...node }) => node),
  }
}

/**
 * The breadcrumb trail a page renders, as schema. Every page that passes items
 * to <Breadcrumb> gets the same trail here, so the markup matches what users see.
 */
function trail(...items: Array<{ name: string; path: string }>) {
  return breadcrumbSchema([{ name: 'Home', path: '/' }, ...items])
}

/**
 * Generate WebSite schema for the home page, including the on-site search
 * action that /search actually implements (it reads the `q` query param).
 */
export function websiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Models.fyi',
    url: canonicalUrl('/'),
    description: metaFor('/').description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${canonicalUrl('/search')}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Generate LearningResource schema for a Learn topic.
 * LearningResource (not Article) is the honest type: these are explainers on a
 * levelled learning path, and we have no author or publication date for them,
 * so none is claimed. Every field below comes from the topic record itself.
 */
export function learnTopicSchema(topic: Topic): Record<string, unknown> {
  const level = levels.find((l) => l.id === topic.level)
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: topic.question,
    headline: topic.question,
    url: canonicalUrl(`/learn/${topic.slug}`),
    description: topic.metaDescription,
    abstract: topic.hook,
    inLanguage: 'en',
    learningResourceType: 'Explainer',
    isPartOf: {
      '@type': 'Collection',
      name: 'Learn how AI models work',
      url: canonicalUrl('/learn'),
    },
    // The section headings are the real teaching outline of the page.
    teaches: topic.sections.map((s) => s.heading),
  }
  if (level) schema.educationalLevel = level.title
  return schema
}

/**
 * Generate DefinedTermSet schema for the glossary, from the real entries.
 * Each term's `short` is the definition users see collapsed; `long` is the
 * expanded one, so the long form is the description.
 */
export function glossarySchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: 'AI model glossary',
    url: canonicalUrl('/glossary'),
    description: metaFor('/glossary').description,
    inLanguage: 'en',
    hasDefinedTerm: glossaryTerms.map((t) => ({
      '@type': 'DefinedTerm',
      '@id': `${canonicalUrl('/glossary')}#${t.id}`,
      name: t.term,
      termCode: t.id,
      description: t.long,
      inDefinedTermSet: canonicalUrl('/glossary'),
    })),
  }
}

/**
 * Generate ItemList schema for the What's New feed, newest first.
 * Dates are the release records' own ISO dates — nothing is inferred.
 */
export function releasesSchema(): Record<string, unknown> {
  const ordered = [...releases].sort((a, b) => b.date.localeCompare(a.date))
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: "What's New in AI models",
    url: canonicalUrl('/whats-new'),
    description: metaFor('/whats-new').description,
    numberOfItems: ordered.length,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    itemListElement: ordered.map((r, index) => {
      const item: Record<string, unknown> = {
        '@type': 'ListItem',
        position: index + 1,
        name: r.title,
        description: r.description,
      }
      if (r.modelId && models.some((m) => m.id === r.modelId)) {
        item.url = canonicalUrl(`/models/${r.modelId}`)
      }
      return item
    }),
  }
}

/**
 * Generate ItemList schema for the compare table: every model in the dataset,
 * in the order the table renders them, each pointing at its own detail page.
 */
export function compareSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'AI models compared',
    url: canonicalUrl('/compare'),
    description: metaFor('/compare').description,
    numberOfItems: models.length,
    itemListElement: models.map((m, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: canonicalUrl(`/models/${m.id}`),
      name: m.name,
    })),
  }
}

/**
 * Generate WebApplication schema for the interactive tools (calculator, quiz,
 * graph). These are real browser-only tools with no server and no price, so
 * `isAccessibleForFree` is a fact about them, not a marketing claim.
 */
export function toolSchema(path: string): Record<string, unknown> {
  const meta = metaFor(path)
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: meta.title.replace(/ — Models\.fyi$/, ''),
    url: canonicalUrl(path),
    description: meta.description,
    applicationCategory: 'UtilityApplication',
    browserRequirements: 'Requires JavaScript.',
    operatingSystem: 'Any',
    isAccessibleForFree: true,
  }
}

/** Generate plain WebPage schema for a route that has no richer honest type. */
export function webPageSchema(path: string, extra: Record<string, unknown> = {}) {
  const meta = metaFor(path)
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: meta.title.replace(/ — Models\.fyi$/, ''),
    url: canonicalUrl(path),
    description: meta.description,
    inLanguage: 'en',
    isPartOf: { '@type': 'WebSite', name: 'Models.fyi', url: canonicalUrl('/') },
    ...extra,
  }
}

/**
 * Structured data per route, attached after routeMeta is built so the builders
 * above can read titles and descriptions back out of it via metaFor.
 * Model routes already carry their SoftwareApplication schema inline.
 */
const pageSchemas: Record<string, () => Record<string, unknown>> = {
  '/': () => graph(organizationSchema(), websiteSchema()),
  '/compare': () => graph(compareSchema(), trail({ name: 'Compare', path: '/compare' })),
  '/graph': () => graph(toolSchema('/graph'), trail({ name: 'Graph', path: '/graph' })),
  '/calculator': () =>
    graph(toolSchema('/calculator'), trail({ name: 'Calculator', path: '/calculator' })),
  '/quiz': () => graph(toolSchema('/quiz'), trail({ name: 'Quiz', path: '/quiz' })),
  // /search renders an empty breadcrumb trail, so it gets no BreadcrumbList.
  '/search': () =>
    webPageSchema('/search', {
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${canonicalUrl('/search')}?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    }),
  '/learn': () =>
    graph(
      {
        '@context': 'https://schema.org',
        '@type': 'Collection',
        name: 'Learn how AI models work',
        url: canonicalUrl('/learn'),
        description: metaFor('/learn').description,
        inLanguage: 'en',
        hasPart: topics.map((t) => ({
          '@type': 'LearningResource',
          name: t.question,
          url: canonicalUrl(`/learn/${t.slug}`),
          abstract: t.hook,
        })),
      },
      trail({ name: 'Learn', path: '/learn' }),
    ),
  '/faq': () =>
    graph(
      faqSchema(faqs.map((f) => ({ question: f.question, answer: f.answer }))),
      trail({ name: 'FAQ', path: '/faq' }),
    ),
  '/glossary': () => graph(glossarySchema(), trail({ name: 'Glossary', path: '/glossary' })),
  '/whats-new': () =>
    graph(releasesSchema(), trail({ name: "What's New", path: '/whats-new' })),
  ...Object.fromEntries(
    topics.map((t) => [
      `/learn/${t.slug}`,
      () =>
        graph(
          learnTopicSchema(t),
          trail({ name: 'Learn', path: '/learn' }, { name: t.question, path: `/learn/${t.slug}` }),
        ),
    ]),
  ),
}

for (const meta of routeMeta) {
  const build = pageSchemas[meta.path]
  if (build) meta.structuredData = build()
}
