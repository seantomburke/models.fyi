/**
 * Prerenders every route in routeMeta to a static HTML file in dist/,
 * so GitHub Pages serves real 200s (issue #15) and crawlers see per-route
 * titles, descriptions, and content.
 *
 * Runs after `vite build` (client) + `vite build --ssr` (server bundle).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { render, routeMeta, canonicalUrl } from '../dist-server/entry-server.js'

const esc = (s) =>
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

const template = readFileSync('dist/index.html', 'utf8')

// 404 fallback for routes we did NOT prerender: keep the EMPTY root so the
// client renders from scratch (no hydration mismatch against wrong content).
writeFileSync('dist/404.html', template)

// Social crawlers (Slack, iMessage, X, Facebook) never run JS, so OG/Twitter
// tags and the canonical URL must be in the static head, not just set by
// usePageMeta at runtime.
const socialHead = ({ path, title, description, type, image }) => {
  const url = canonicalUrl(path)
  return [
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:type" content="${type ?? 'website'}" />`,
    `<meta property="og:site_name" content="Models.fyi" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ].join('\n    ')
}

// JSON-LD goes in the static head too — Google renders JS but most other
// crawlers (and LLM scrapers) read structured data only from raw HTML.
// Escape "<" so model text can never form a premature </script>.
const jsonLd = (data) =>
  `<script type="application/ld+json">${JSON.stringify(data).replaceAll('<', '\\u003c')}</script>`

let count = 0
for (const meta of routeMeta) {
  const { path, title, description, structuredData } = meta
  const body = await render(path)
  const headExtras = structuredData
    ? `${socialHead(meta)}\n    ${jsonLd(structuredData)}`
    : socialHead(meta)
  const out = template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(name="description"[\s\S]*?content=")[^"]*(")/, `$1${esc(description)}$2`)
    .replace('</head>', `  ${headExtras}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
  if (
    !out.includes(`<div id="root">${body}</div>`) ||
    !out.includes(esc(title)) ||
    !out.includes('og:image') ||
    (structuredData && !out.includes('application/ld+json'))
  ) {
    throw new Error(`prerender injection failed for ${path}`)
  }
  const file = path === '/' ? 'dist/index.html' : `dist${path}/index.html`
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, out)
  count++
}
console.log(`✓ prerendered ${count} routes (+ empty-root 404.html fallback)`)
