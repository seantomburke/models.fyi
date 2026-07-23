/**
 * Fails the build if the JS every page preloads grows past its budget.
 *
 * The homepage's preloaded JS is the floor for every route: a visitor pays it
 * before seeing anything, on any entry point. It is easy to regress by accident
 * because the cost is invisible in source review: a single top-level `import`
 * in a widely-imported module (routeMeta.ts is imported by every page) silently
 * pulls a whole dataset into the shared chunk. That is exactly how the FAQ,
 * glossary, and release corpora came to ship on all 58 routes.
 *
 * Measured gzipped, because that is what the network actually transfers.
 */
import { readFileSync, existsSync } from 'node:fs'
import { gzipSync } from 'node:zlib'

// Ceilings, not targets. Set with headroom over the measured size so ordinary
// feature work doesn't trip them, but a dataset-sized regression does.
const BUDGET_KB = {
  /** Total JS the homepage preloads before it can render. */
  entry: 140,
  /**
   * The shared chunk holding route metadata, imported by every page.
   * Raised 60 → 64 on 2026-07-23 for the 10 /providers/:id routes (their
   * titles, blurbs, and schema builders live in routeMeta like the model
   * pages' do); measured 60.5 kB after the change.
   */
  meta: 64,
}

const html = 'dist/index.html'
if (!existsSync(html)) {
  throw new Error(`${html} not found; run the client build before the budget check`)
}

const gzipKb = (path) => gzipSync(readFileSync(path)).length / 1024

// The homepage lists exactly what it preloads: its entry script plus every
// modulepreload. Reading them back off the built HTML keeps this honest if the
// chunking strategy changes.
const assets = [...new Set([...readFileSync(html, 'utf8').matchAll(/assets\/[\w.-]+\.js/g)].map((m) => m[0]))]
if (assets.length === 0) throw new Error(`no JS assets referenced from ${html}`)

let entryKb = 0
let metaKb = 0
for (const asset of assets) {
  const path = `dist/${asset}`
  if (!existsSync(path)) continue
  const kb = gzipKb(path)
  entryKb += kb
  if (/\/meta-/.test(asset)) metaKb += kb
}

const failures = []
const check = (name, actual, budget) => {
  const verdict = actual > budget ? 'OVER' : 'ok'
  console.log(`  ${name.padEnd(6)} ${actual.toFixed(1)} kB gzip / ${budget} kB budget  ${verdict}`)
  if (actual > budget) {
    failures.push(
      `${name} bundle is ${actual.toFixed(1)} kB gzip, over its ${budget} kB budget. ` +
        `Something large was probably pulled into a shared chunk. Check for a new ` +
        `top-level import in a module every page imports (src/lib/routeMeta.ts especially). ` +
        `If the growth is genuinely necessary, raise the budget in this script deliberately.`,
    )
  }
}

console.log('bundle budget:')
check('entry', entryKb, BUDGET_KB.entry)
if (metaKb > 0) check('meta', metaKb, BUDGET_KB.meta)

// KaTeX is ~70 kB gzip and belongs only in the lazy MathBlock chunk. If it
// ever appears in the homepage's preload list, a shared module started
// importing it eagerly.
if (assets.some((asset) => /katex/i.test(asset))) {
  failures.push('katex is preloaded by the homepage; it must stay in the lazy MathBlock chunk')
}

if (failures.length > 0) {
  throw new Error(failures.join('\n'))
}
console.log(`✓ bundle within budget (${assets.length} preloaded assets)`)
