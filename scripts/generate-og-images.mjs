/**
 * Renders one 1200x630 OpenGraph PNG per route into dist/og/.
 *
 * Runs after prerender.mjs in the build. routeMeta builds each page's og:image
 * URL from the same ogImageKey() imported here (via the compiled dist-server
 * bundle), so the URL in the HTML and the file on disk cannot drift — and the
 * guard at the bottom fails the build if any route's image is missing anyway.
 *
 * Fonts are committed under scripts/assets/fonts/ (Inter, SIL OFL 1.1) so the
 * build never fetches from the network.
 */
import { mkdirSync, statSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'
import {
  routeMeta,
  ogImageKey,
  models,
  providers,
  topics,
  formatTokens,
  formatPrice,
  SITE_URL,
} from '../dist-server/entry-server.js'

const fontDir = join(dirname(fileURLToPath(import.meta.url)), 'assets/fonts')
const fontFiles = [join(fontDir, 'Inter-Regular.ttf'), join(fontDir, 'Inter-SemiBold.ttf')]
for (const f of fontFiles) {
  if (!existsSync(f)) throw new Error(`missing committed font file: ${f}`)
}

const esc = (s) =>
  String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

const WIDTH = 1200
const HEIGHT = 630
const MARGIN = 60
const MAX_TEXT_WIDTH = WIDTH - MARGIN * 2

// Inter has no fixed advance width, and resvg gives us no measurement API, so
// widths are estimated from an average glyph advance (semibold runs slightly
// wider). The 0.62 factor is deliberately pessimistic: a line that estimates
// wide gets wrapped or shrunk early, so real text can undershoot the canvas
// edge but never overflow it.
const AVG_CHAR_EM = 0.62
const estWidth = (text, fontSize) => text.length * fontSize * AVG_CHAR_EM

/** Greedy word wrap at an estimated pixel width. Overlong words get their own line. */
function wrapText(text, fontSize, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (estWidth(candidate, fontSize) <= maxWidth || !line) line = candidate
    else {
      lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  return lines
}

/**
 * Wrap a title into at most maxLines, shrinking the font until it fits.
 * Returns { fontSize, lines }. If even the smallest size cannot hold it,
 * the last line is ellipsised — nothing ever draws outside the canvas.
 */
function fitTitle(text, { startSize = 68, minSize = 40, maxLines = 3 } = {}) {
  for (let fontSize = startSize; fontSize >= minSize; fontSize -= 4) {
    const lines = wrapText(text, fontSize, MAX_TEXT_WIDTH)
    if (lines.length <= maxLines) return { fontSize, lines }
  }
  const lines = wrapText(text, minSize, MAX_TEXT_WIDTH).slice(0, maxLines)
  const last = lines[maxLines - 1]
  lines[maxLines - 1] = `${last.slice(0, Math.max(0, last.length - 1))}…`
  return { fontSize: minSize, lines }
}

/** Truncate a single line to the estimated width with an ellipsis. */
function truncateLine(text, fontSize, maxWidth = MAX_TEXT_WIDTH) {
  if (estWidth(text, fontSize) <= maxWidth) return text
  const maxChars = Math.floor(maxWidth / (fontSize * AVG_CHAR_EM)) - 1
  return `${text.slice(0, maxChars).trimEnd()}…`
}

const FONT = 'Inter'
const ACCENT = '#6c63ff'
const INK = '#1a1a1a'
const MUTED = '#666666'

const frame = (content) => `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#ffffff"/>
  <circle cx="100" cy="100" r="50" fill="${ACCENT}" opacity="0.1"/>
  <circle cx="1100" cy="530" r="70" fill="${ACCENT}" opacity="0.1"/>
${content}
  <text x="${MARGIN}" y="578" font-family="${FONT}" font-size="26" font-weight="600" fill="${INK}">models<tspan fill="${ACCENT}">.fyi</tspan></text>
</svg>`

const titleBlock = (kicker, title, subLines) => {
  const parts = []
  let y = 150
  if (kicker) {
    parts.push(
      `  <text x="${MARGIN}" y="${y}" font-family="${FONT}" font-size="28" font-weight="600" letter-spacing="4" fill="${ACCENT}">${esc(kicker.toUpperCase())}</text>`,
    )
    y += 60
  }
  const { fontSize, lines } = fitTitle(title)
  const lineHeight = Math.round(fontSize * 1.2)
  y += fontSize
  for (const line of lines) {
    parts.push(
      `  <text x="${MARGIN}" y="${y}" font-family="${FONT}" font-size="${fontSize}" font-weight="600" fill="${INK}">${esc(line)}</text>`,
    )
    y += lineHeight
  }
  y += 24
  // The wordmark sits at y=578; stop sub lines well above it so a tall title
  // (three wrapped lines plus a kicker) can never crowd or overlap it.
  const maxSubBaseline = 510
  for (const line of subLines) {
    if (y > maxSubBaseline) break
    parts.push(
      `  <text x="${MARGIN}" y="${y}" font-family="${FONT}" font-size="30" fill="${MUTED}">${esc(truncateLine(line, 30))}</text>`,
    )
    y += 44
  }
  return parts.join('\n')
}

/** Model pages: name large, provider kicker, and a row of key facts. */
const modelSvg = (model) => {
  const provider = providers.find((p) => p.id === model.providerId)
  const facts = []
  if (model.inputPricePerMTok !== null && model.outputPricePerMTok !== null) {
    facts.push(`${formatPrice(model.inputPricePerMTok)} in / ${formatPrice(model.outputPricePerMTok)} out per 1M tokens`)
  } else if (model.openSource) {
    facts.push('Open weights')
  }
  if (model.contextWindowTokens !== null) {
    facts.push(`${formatTokens(model.contextWindowTokens)} token context window`)
  }
  facts.push('Benchmarks, pricing, and specs')
  return frame(titleBlock(provider?.name ?? model.providerId, model.name, facts.slice(0, 3)))
}

/** Learn topics: topic question with a Learn kicker. */
const learnSvg = (topic) => frame(titleBlock('Learn', topic.question, [truncateLine(topic.metaDescription, 30)]))

/** Everything else: the page title (site suffix stripped) plus its description. */
const genericSvg = (meta) => {
  const title = meta.title.replace(/\s*\|\s*Models\.fyi$/, '')
  const allLines = wrapText(meta.description, 30, MAX_TEXT_WIDTH)
  const descLines = allLines.slice(0, 2)
  // Descriptions longer than two lines are cut — make the cut visible rather
  // than ending mid-sentence.
  if (allLines.length > 2) {
    descLines[1] = `${descLines[1].replace(/[,.;:]?$/, '')}…`
  }
  return frame(titleBlock('', title, descLines))
}

function svgFor(meta) {
  const model = meta.path.startsWith('/models/')
    ? models.find((m) => `/models/${m.id}` === meta.path)
    : undefined
  if (model) return modelSvg(model)
  const topic = meta.path.startsWith('/learn/')
    ? topics.find((t) => `/learn/${t.slug}` === meta.path)
    : undefined
  if (topic) return learnSvg(topic)
  return genericSvg(meta)
}

mkdirSync('dist/og', { recursive: true })

let count = 0
for (const meta of routeMeta) {
  const key = ogImageKey(meta.path)
  const svg = svgFor(meta)
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: WIDTH },
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: FONT },
  })
    .render()
    .asPng()
  const file = `dist/og/${key}.png`
  writeFileSync(file, png)
  const { size } = statSync(file)
  if (size === 0) throw new Error(`generated OG image is empty: ${file}`)
  count++
}

// Guard: every route's og:image URL must resolve to a file this run wrote,
// and the prerendered HTML must actually reference it.
for (const meta of routeMeta) {
  const expectedUrl = `${SITE_URL}/og/${ogImageKey(meta.path)}.png`
  if (meta.image !== expectedUrl) {
    throw new Error(
      `route ${meta.path} has og:image "${meta.image}" but the generator would write "${expectedUrl}" — ogImageKey drifted between routeMeta and this script`,
    )
  }
  const file = `dist/og/${ogImageKey(meta.path)}.png`
  if (!existsSync(file) || statSync(file).size === 0) {
    throw new Error(`route ${meta.path} references ${meta.image} but ${file} is missing or empty`)
  }
  const htmlFile = meta.path === '/' ? 'dist/index.html' : `dist${meta.path}/index.html`
  if (!readFileSync(htmlFile, 'utf8').includes(`content="${expectedUrl}"`)) {
    throw new Error(`${htmlFile} does not reference its OG image ${expectedUrl}`)
  }
}

console.log(`✓ generated ${count} OG images in dist/og/`)
