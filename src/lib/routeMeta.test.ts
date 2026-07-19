import { readFileSync } from 'node:fs'
import { routeMeta, metaFor, canonicalUrl, SITE_URL } from './routeMeta'
import { topics } from '../pages/learn/topics'
import { models } from '../data/models'
import { providers } from '../data/providers'

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

test('sitemap and robots.txt point at URLs that return 200', () => {
  const sitemap = readFileSync('public/sitemap.xml', 'utf8')
  for (const [, loc] of sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)) {
    expect(loc.endsWith('/')).toBe(true)
  }
  const robots = readFileSync('public/robots.txt', 'utf8')
  expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`)
})
