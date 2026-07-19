import { readFileSync } from 'node:fs'
import { routeMeta, metaFor, canonicalUrl, SITE_URL } from './routeMeta'
import { topics, levels } from '../pages/learn/topics'
import { models } from '../data/models'
import { providers } from '../data/providers'
import { glossaryTerms } from '../data/glossary'
import { releases } from '../data/releases'
import { faqs } from '../data/faqs'

type Node = Record<string, unknown>

/** The schema nodes on a route: a bare schema, or every node in its @graph. */
function nodesFor(path: string): Node[] {
  const data = metaFor(path).structuredData
  expect(data).toBeDefined()
  expect(data!['@context']).toBe('https://schema.org')
  const nested = data!['@graph'] as Node[] | undefined
  if (!nested) return [data as Node]
  // Nodes inside a @graph must not repeat @context — the graph carries it.
  for (const n of nested) expect(n['@context']).toBeUndefined()
  return nested
}

function nodeOfType(path: string, type: string): Node {
  const node = nodesFor(path).find((n) => n['@type'] === type)
  expect(node, `${path} has no ${type} node`).toBeDefined()
  return node!
}

test('covers every route in the sitemap, and nothing extra', () => {
  const sitemap = readFileSync('public/sitemap.xml', 'utf8')
  const sitemapPaths = [...sitemap.matchAll(/models\.fyi(\/[^<]*)<\/loc>/g)]
    .map((m) => (m[1] === '/' ? '/' : m[1].replace(/\/$/, '')))
    .sort()
  expect(routeMeta.map((r) => r.path).sort()).toEqual(sitemapPaths)
})

test('every route has a unique title and a real description', () => {
  const titles = new Set<string>()
  for (const r of routeMeta) {
    expect(r.title).toMatch(/Models\.fyi/i)
    expect(r.description.length).toBeGreaterThan(50)
    expect(titles.has(r.title)).toBe(false)
    titles.add(r.title)
  }
})

test('learn topics are all present', () => {
  for (const t of topics) {
    expect(metaFor(`/learn/${t.slug}`).title).toBe(t.metaTitle)
  }
})

test('every route has an og type and an absolute og:image URL', () => {
  // Social crawlers reject relative og:image paths, so these must be absolute.
  expect(SITE_URL).toMatch(/^https:\/\/[^/]/)
  expect(SITE_URL.endsWith('/')).toBe(false)
  for (const r of routeMeta) {
    expect(r.type).toBeDefined()
    expect(r.image).toBe(`${SITE_URL}/og-image.png`)
  }
})

test('metaFor throws on unknown paths', () => {
  expect(() => metaFor('/nope')).toThrow(/no route meta/i)
})

test('canonical URLs use the trailing-slash form GitHub Pages serves with a 200', () => {
  // The slashless form 301-redirects (routes are served from <path>/index.html),
  // and canonical/og:url/sitemap entries must never point at a redirect.
  expect(canonicalUrl('/')).toBe(`${SITE_URL}/`)
  expect(canonicalUrl('/compare')).toBe(`${SITE_URL}/compare/`)
  expect(canonicalUrl('/models/kimi-k3')).toBe(`${SITE_URL}/models/kimi-k3/`)
  for (const r of routeMeta) {
    const url = canonicalUrl(r.path)
    expect(url.endsWith('/')).toBe(true)
    expect(url).not.toMatch(/(?<!:)\/\//)
  }
})

test('every model route carries valid SoftwareApplication JSON-LD', () => {
  for (const m of models) {
    const schema = metaFor(`/models/${m.id}`).structuredData
    expect(schema).toBeDefined()
    expect(schema!['@type']).toBe('SoftwareApplication')
    expect(schema!.url).toBe(canonicalUrl(`/models/${m.id}`))
    const provider = providers.find((p) => p.id === m.providerId)!
    expect((schema!.creator as { name: string }).name).toBe(provider.name)
    if (m.inputPricePerMTok !== null) {
      // schema.org price must be a bare number — unit text invalidates it.
      const offers = schema!.offers as { price: unknown; priceCurrency: string }
      expect(offers.price).toBe(m.inputPricePerMTok)
      expect(offers.priceCurrency).toBe('USD')
    } else {
      expect(schema!.offers).toBeUndefined()
    }
    if (m.releaseDate) expect(schema!.datePublished).toBe(m.releaseDate)
    if (m.license) expect(schema!.license).toBe(m.license)
  }
})

test('every prerendered route carries JSON-LD that survives a JSON round-trip', () => {
  for (const r of routeMeta) {
    expect(r.structuredData, `${r.path} has no structured data`).toBeDefined()
    // The prerenderer serialises this into the static head; anything that
    // cannot round-trip through JSON would ship as broken markup.
    expect(JSON.parse(JSON.stringify(r.structuredData))).toEqual(r.structuredData)
  }
})

test('home carries Organization and a WebSite whose SearchAction points at /search', () => {
  expect(nodeOfType('/', 'Organization').url).toBe(canonicalUrl('/'))
  const site = nodeOfType('/', 'WebSite')
  const action = site.potentialAction as { target: { urlTemplate: string } }
  expect(action.target.urlTemplate).toContain(canonicalUrl('/search'))
  expect(action.target.urlTemplate).toContain('{search_term_string}')
})

test('every learn topic carries LearningResource built from its own record', () => {
  for (const t of topics) {
    const node = nodeOfType(`/learn/${t.slug}`, 'LearningResource')
    expect(node.name).toBe(t.question)
    expect(node.headline).toBe(t.question)
    expect(node.description).toBe(t.metaDescription)
    expect(node.abstract).toBe(t.hook)
    expect(node.url).toBe(canonicalUrl(`/learn/${t.slug}`))
    expect(node.teaches).toEqual(t.sections.map((s) => s.heading))
    expect(node.educationalLevel).toBe(levels.find((l) => l.id === t.level)!.title)
    // No author or publication date exists in the topic data, so none is claimed.
    expect(node.author).toBeUndefined()
    expect(node.datePublished).toBeUndefined()
  }
})

test('glossary carries a DefinedTermSet with one DefinedTerm per real entry', () => {
  const set = nodeOfType('/glossary', 'DefinedTermSet')
  const terms = set.hasDefinedTerm as Node[]
  expect(terms).toHaveLength(glossaryTerms.length)
  for (const [i, t] of glossaryTerms.entries()) {
    expect(terms[i]['@type']).toBe('DefinedTerm')
    expect(terms[i].name).toBe(t.term)
    expect(terms[i].description).toBe(t.long)
    expect(terms[i].inDefinedTermSet).toBe(canonicalUrl('/glossary'))
  }
})

test("what's new lists every release newest-first with its real date-ordered title", () => {
  const list = nodeOfType('/whats-new', 'ItemList')
  const items = list.itemListElement as Node[]
  expect(list.numberOfItems).toBe(releases.length)
  expect(items).toHaveLength(releases.length)
  const expected = [...releases].sort((a, b) => b.date.localeCompare(a.date))
  for (const [i, r] of expected.entries()) {
    expect(items[i].position).toBe(i + 1)
    expect(items[i].name).toBe(r.title)
    expect(items[i].description).toBe(r.description)
    if (r.modelId && models.some((m) => m.id === r.modelId)) {
      expect(items[i].url).toBe(canonicalUrl(`/models/${r.modelId}`))
    }
  }
})

test('compare lists every model, each linked to its own detail page', () => {
  const list = nodeOfType('/compare', 'ItemList')
  const items = list.itemListElement as Node[]
  expect(list.numberOfItems).toBe(models.length)
  for (const [i, m] of models.entries()) {
    expect(items[i].name).toBe(m.name)
    expect(items[i].url).toBe(canonicalUrl(`/models/${m.id}`))
  }
})

test('the interactive tools are WebApplications with a name and description', () => {
  for (const path of ['/calculator', '/quiz', '/graph']) {
    const node = nodeOfType(path, 'WebApplication')
    expect(node.name).toBe(metaFor(path).title.replace(/ — Models\.fyi$/, ''))
    expect(node.url).toBe(canonicalUrl(path))
    expect(node.description).toBe(metaFor(path).description)
    expect(node.applicationCategory).toBeDefined()
  }
})

test('faq carries one Question per real FAQ entry', () => {
  const page = nodeOfType('/faq', 'FAQPage')
  const questions = page.mainEntity as Node[]
  expect(questions).toHaveLength(faqs.length)
  for (const q of questions) {
    expect(q['@type']).toBe('Question')
    expect((q.acceptedAnswer as Node).text).toBeTruthy()
  }
})

test('learn index links every topic', () => {
  const collection = nodeOfType('/learn', 'Collection')
  const parts = collection.hasPart as Node[]
  expect(parts.map((p) => p.url)).toEqual(topics.map((t) => canonicalUrl(`/learn/${t.slug}`)))
})

test('search carries a WebPage with the search action it implements', () => {
  const node = nodeOfType('/search', 'WebPage')
  expect(node.url).toBe(canonicalUrl('/search'))
  expect((node.potentialAction as Node)['@type']).toBe('SearchAction')
})

test('every page with a UI breadcrumb trail emits a matching BreadcrumbList', () => {
  // The trails here mirror the <Breadcrumb items={...}> each page renders, so
  // the markup can never claim a path users do not actually see.
  const trails: Record<string, Array<[string, string]>> = {
    '/compare': [['Home', '/'], ['Compare', '/compare']],
    '/graph': [['Home', '/'], ['Graph', '/graph']],
    '/calculator': [['Home', '/'], ['Calculator', '/calculator']],
    '/quiz': [['Home', '/'], ['Quiz', '/quiz']],
    '/learn': [['Home', '/'], ['Learn', '/learn']],
    '/faq': [['Home', '/'], ['FAQ', '/faq']],
    '/glossary': [['Home', '/'], ['Glossary', '/glossary']],
    '/whats-new': [['Home', '/'], ["What's New", '/whats-new']],
  }
  for (const t of topics) {
    trails[`/learn/${t.slug}`] = [
      ['Home', '/'],
      ['Learn', '/learn'],
      [t.question, `/learn/${t.slug}`],
    ]
  }
  for (const [path, expected] of Object.entries(trails)) {
    const crumbs = nodeOfType(path, 'BreadcrumbList').itemListElement as Node[]
    expect(crumbs.map((c) => [c.name, c.item])).toEqual(
      expected.map(([name, p]) => [name, canonicalUrl(p)]),
    )
    expect(crumbs.map((c) => c.position)).toEqual(expected.map((_, i) => i + 1))
  }
})

test('sitemap and robots.txt point at URLs that return 200', () => {
  const sitemap = readFileSync('public/sitemap.xml', 'utf8')
  for (const [, loc] of sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)) {
    expect(loc.endsWith('/')).toBe(true)
  }
  const robots = readFileSync('public/robots.txt', 'utf8')
  expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`)
})
