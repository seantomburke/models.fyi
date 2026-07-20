/**
 * Prerenders every route in routeMeta to a static HTML file in dist/,
 * so GitHub Pages serves real 200s (issue #15) and crawlers see per-route
 * titles, descriptions, and content.
 *
 * Runs after `vite build` (client) + `vite build --ssr` (server bundle).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { render, routeMeta, canonicalUrl, faqs } from '../dist-server/entry-server.js'

const esc = (s) =>
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

const template = readFileSync('dist/index.html', 'utf8')
const manifest = JSON.parse(readFileSync('dist/.vite/manifest.json', 'utf8'))
const assetBase = template.match(/<script[^>]+src="([^"]*\/assets\/)/)?.[1]
if (!assetBase) throw new Error('could not determine the built asset base from dist/index.html')
const templateAssets = new Set(
  [...template.matchAll(/(?:href|src)="[^"]*\/assets\/([^"]+)"/g)].map((match) => `assets/${match[1]}`),
)

const entryByExactPath = {
  '/search': 'src/pages/Search.tsx',
  '/compare': 'src/pages/Compare.tsx',
  '/graph': 'src/pages/Graph.tsx',
  '/calculator': 'src/pages/Calculator.tsx',
  '/quiz': 'src/pages/Quiz.tsx',
  '/learn': 'src/pages/learn/Learn.tsx',
  '/faq': 'src/pages/FAQ.tsx',
  '/glossary': 'src/pages/Glossary.tsx',
  '/whats-new': 'src/pages/WhatsNew.tsx',
  '/models': 'src/pages/models/ModelsIndex.tsx',
}

function routePreloads(path) {
  const entryKey = entryByExactPath[path]
    ?? (path.startsWith('/learn/') ? 'src/pages/learn/LearnTopic.tsx' : undefined)
    ?? (path.startsWith('/models/') ? 'src/pages/models/ModelDetail.tsx' : undefined)
  if (!entryKey) return ''

  const modules = new Set()
  const styles = new Set()
  const visit = (key) => {
    const chunk = manifest[key]
    if (!chunk || templateAssets.has(chunk.file) || modules.has(chunk.file)) return
    modules.add(chunk.file)
    for (const css of chunk.css ?? []) styles.add(css)
    for (const dependency of chunk.imports ?? []) visit(dependency)
  }
  visit(entryKey)

  return [
    ...[...modules].map((file) => `<link rel="modulepreload" href="${assetBase}${file.replace(/^assets\//, '')}" />`),
    ...[...styles].map((file) => `<link rel="stylesheet" href="${assetBase}${file.replace(/^assets\//, '')}" />`),
  ].join('\n    ')
}

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
  // A collapsed accordion must still SHIP its answers. /faq rendered each answer
  // as `{isExpanded && ...}`, so the prerendered page carried all 23 questions
  // and zero answers: the page's entire substance was invisible to crawlers and
  // to anyone without JS, and it contradicted the JSON-LD, which did carry them.
  // Collapse must be a CSS concern, never an unmount.
  // Compare against decoded text: React escapes text nodes differently than
  // esc() escapes attributes (apostrophes become &#x27;), so matching the raw
  // HTML would report false failures.
  if (path === '/faq') {
    const decoded = main
      .replaceAll('&#x27;', "'")
      .replaceAll('&quot;', '"')
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
      .replaceAll('&amp;', '&')
    const missing = faqs.filter((faq) => !decoded.includes(faq.answer))
    if (missing.length > 0) {
      throw new Error(
        `prerender left ${missing.length} of ${faqs.length} FAQ answers out of <main> — collapsed accordion content must stay mounted and be hidden with CSS. First missing: ${missing[0].question}`,
      )
    }
  }
  const metadata = structuredData
    ? `${socialHead(meta)}\n    ${jsonLd(structuredData)}`
    : socialHead(meta)
  const preloads = routePreloads(path)
  const headExtras = preloads ? `${preloads}\n    ${metadata}` : metadata
  const out = template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace('</head>', `  ${headExtras}\n  </head>`)
    .replace(
      '<div id="root"></div>',
      `<div id="root" data-prerender-path="${esc(path)}">${body}</div>`,
    )
  // Assert every injection landed. The description check earns its keep: its
  // absence is invisible in the browser and in social previews, so only a
  // build-time guard catches it.
  if (
    !out.includes(`<div id="root" data-prerender-path="${esc(path)}">${body}</div>`) ||
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
