import { readFileSync } from 'node:fs'
import { routeMeta, metaFor, SITE_URL } from './routeMeta'
import { topics } from '../pages/learn/topics'

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
