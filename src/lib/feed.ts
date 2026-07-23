import type { Release } from '../data/releases.ts'
import { SITE_URL, canonicalUrl } from './routeMeta.ts'

const esc = (s: string) =>
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

/**
 * Release dates are date-only ISO strings. Atom requires full RFC 3339
 * timestamps, so pin them to midnight UTC — stable across rebuilds, unlike
 * a per-build timestamp.
 */
function atomDate(isoDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate) || Number.isNaN(Date.parse(isoDate))) {
    throw new Error(`release date "${isoDate}" is not a valid YYYY-MM-DD date`)
  }
  return `${isoDate}T00:00:00Z`
}

/**
 * Each entry links back to our site: the model's page when the release is
 * about one model, /whats-new otherwise. External announcement links ride
 * along as rel="related".
 */
function entryLink(release: Release): string {
  return release.modelId ? canonicalUrl(`/models/${release.modelId}`) : canonicalUrl('/whats-new')
}

/**
 * Build the Atom feed for the release log. scripts/generate-feed.mjs writes
 * the result to dist/feed.xml; every prerendered page advertises it via
 * <link rel="alternate" type="application/atom+xml">.
 */
export function buildAtomFeed(releaseLog: readonly Release[]): string {
  if (releaseLog.length === 0) {
    throw new Error('release log is empty — refusing to publish an empty feed')
  }

  const sorted = [...releaseLog].sort((a, b) => b.date.localeCompare(a.date))
  const updated = atomDate(sorted[0].date)
  const pageUrl = canonicalUrl('/whats-new')

  const entries = sorted
    .map((release) => {
      const related = release.link ? `\n    <link rel="related" href="${esc(release.link)}" />` : ''
      return `  <entry>
    <id>${esc(pageUrl)}#${esc(release.id)}</id>
    <title>${esc(release.title)}</title>
    <link rel="alternate" href="${esc(entryLink(release))}" />${related}
    <updated>${atomDate(release.date)}</updated>
    <published>${atomDate(release.date)}</published>
    <category term="${esc(release.type)}" />
    <summary>${esc(release.description)}</summary>
  </entry>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${esc(pageUrl)}</id>
  <title>Models.fyi | What's new</title>
  <subtitle>Model releases, feature announcements, and pricing changes across AI models.</subtitle>
  <link rel="alternate" href="${esc(pageUrl)}" />
  <link rel="self" href="${esc(`${SITE_URL}/feed.xml`)}" />
  <updated>${updated}</updated>
  <author><name>Models.fyi</name></author>
${entries}
</feed>`
}
