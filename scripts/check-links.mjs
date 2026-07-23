#!/usr/bin/env node

/**
 * Verify every internal link in the built site resolves to a real page or asset.
 * Runs after prerender.mjs, over dist/ rather than over source data.
 *
 * A unit test can only guard the link lists it knows about: glossary.test.ts
 * covers relatedLearnTopic, and nothing covers hrefs written inline in JSX or
 * prose. Those are where the dead glossary links in 776d619 came from, so the
 * check that catches the next rename has to read the rendered HTML.
 *
 * Anchors are resolved with and without the trailing slash: GitHub Pages 301s
 * /compare to /compare/, and both forms are written across the site.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const distDir = path.resolve(projectRoot, 'dist')
const BASE = '/models.wtf'

/** Every file under a directory, as paths relative to dist/. */
function walk(dir, onFile) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, onFile)
    else onFile(full)
  }
}

function main() {
  if (!fs.existsSync(distDir)) {
    console.error('✗ dist/ not found; run `npm run build` first')
    process.exit(1)
  }

  const htmlFiles = []
  const assets = new Set()
  walk(distDir, (full) => {
    const rel = '/' + path.relative(distDir, full)
    assets.add(rel)
    if (full.endsWith('.html')) htmlFiles.push(full)
  })

  // A route is servable if its directory holds an index.html.
  const pages = new Set(
    htmlFiles.map((f) => {
      const rel = '/' + path.relative(distDir, path.dirname(f))
      return rel === '/.' ? '/' : rel
    })
  )

  const broken = new Map()
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8')
    const from = '/' + path.relative(distDir, path.dirname(file))
    for (const match of html.matchAll(/href="([^"]+)"/g)) {
      const raw = match[1]
      // External links, mailto:, and in-page anchors are out of scope.
      if (!raw.startsWith(`${BASE}/`) && raw !== BASE) continue
      const href = raw.replace(BASE, '').split(/[#?]/)[0] || '/'
      const trimmed = href.endsWith('/') && href !== '/' ? href.slice(0, -1) : href
      if (pages.has(href) || pages.has(trimmed) || assets.has(href)) continue
      if (!broken.has(href)) broken.set(href, new Set())
      broken.get(href).add(from === '/.' ? '/' : from)
    }
  }

  if (broken.size > 0) {
    console.error(`✗ ${broken.size} dead internal link target(s):`)
    for (const [href, sources] of broken) {
      console.error(`  ${href}\n    linked from: ${[...sources].sort().join(', ')}`)
    }
    process.exit(1)
  }

  console.log(`✓ links valid: ${pages.size} pages, no dead internal links`)
}

main()
