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
// The description is INJECTED, not substituted: Vite strips the template's
// <meta name="description"> during the client build, so a replace-in-place
// regex silently matched nothing and every page shipped without a search
// snippet. Emit the tag here and assert it below.
const socialHead = ({ path, title, description, type, image }) => {
  const url = canonicalUrl(path)
  return [
    `<meta name="description" content="${esc(description)}" />`,
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
  // The point of prerendering is that a crawler reading raw HTML sees the real
  // page. An unresolved Suspense boundary defeats that completely: React emits
  // the shell with a `<!--$?-->` marker and the fallback, then streams the
  // actual content as trailing <template> blobs that only a browser splices in.
  // This shipped on 32 of 57 pages without anyone noticing, because the file
  // still *contained* the content — just after </main>, where no crawler looks.
  // Fail the build instead.
  const main = body.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? ''
  if (body.includes('<!--$?-->') || body.includes('<template id="B:')) {
    throw new Error(
      `prerender left an unresolved Suspense boundary in ${path} — the page ships its fallback, not its content. See ClientSuspense in src/components/Layout.tsx.`,
    )
  }
  if (main.includes('Loading…')) {
    throw new Error(`prerender emitted the loading fallback inside <main> for ${path}`)
  }
  const headExtras = structuredData
    ? `${socialHead(meta)}\n    ${jsonLd(structuredData)}`
    : socialHead(meta)
  const out = template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace('</head>', `  ${headExtras}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
  // Assert every injection landed. The description check earns its keep: its
  // absence is invisible in the browser and in social previews, so only a
  // build-time guard catches it.
  if (
    !out.includes(`<div id="root">${body}</div>`) ||
    !out.includes(esc(title)) ||
    !out.includes(`<meta name="description" content="${esc(description)}" />`) ||
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
