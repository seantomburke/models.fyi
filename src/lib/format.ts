/** "1M", "200K", "10M" — context windows in friendly units. */
export function formatTokens(tokens: number | null): string {
  if (tokens === null) return '—'
  if (tokens >= 1_000_000) {
    const m = tokens / 1_000_000
    return `${Number.isInteger(m) ? m : m.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}M`
  }
  return `${Math.round(tokens / 1_000)}K`
}

/** "$5", "$2.50" — price per 1M tokens. */
export function formatPrice(price: number | null): string {
  if (price === null) return 'Free*'
  return `$${Number.isInteger(price) ? price : price.toFixed(2)}`
}

/**
 * "$1.24", "$0.50", "$0.0425", "< $0.0001" — computed conversation costs,
 * which are often fractions of a cent. Sub-dollar values keep up to four
 * decimals (trailing zeros trimmed, never fewer than two).
 */
export function formatCost(cost: number): string {
  if (cost === 0) return '$0.00'
  if (cost >= 1) return `$${cost.toFixed(2)}`
  if (cost < 0.0001) return '< $0.0001'
  const trimmed = cost.toFixed(4).replace(/0+$/, '')
  const [whole, frac = ''] = trimmed.split('.')
  return `$${whole}.${frac.padEnd(2, '0')}`
}

/** Initial letters whose spoken names start with a vowel ("aitch", "ex"). */
const AN_LETTER_NAMES = new Set(['A', 'E', 'F', 'H', 'I', 'L', 'M', 'N', 'O', 'R', 'S', 'X'])

/**
 * Prefix a noun phrase with the right article, lowercased for mid-sentence
 * use: "an everyday curious person", "a software engineer", "an HR / people ops".
 * All-caps initialisms keep their case and pick a/an by the letter's spoken name.
 */
export function withArticle(phrase: string): string {
  const words = phrase.split(' ')
  const lowered = words
    .map((w) => (/^[A-Z]{2,}$/.test(w) ? w : w.toLowerCase()))
    .join(' ')
  const first = words[0] ?? ''
  const an = /^[A-Z]{2,}$/.test(first)
    ? AN_LETTER_NAMES.has(first[0])
    : /^[aeiou]/i.test(first)
  return `${an ? 'an' : 'a'} ${lowered}`
}

/**
 * Plain-language cost line with the exact rates tucked into a parenthetical.
 * null prices mean open source: free to download, you pay for hardware.
 */
export function describePricing(
  inputPerMTok: number | null,
  outputPerMTok: number | null,
): string {
  if (inputPerMTok === null || outputPerMTok === null) {
    return 'Free to download and run on your own computer. You pay for the hardware, not per message.'
  }
  const exact = `(${formatPrice(inputPerMTok)} in / ${formatPrice(outputPerMTok)} out per million tokens, roughly 750,000 words)`
  if (inputPerMTok < 0.5) return `Very cheap to run. A long conversation costs well under a penny ${exact}.`
  if (inputPerMTok < 2) return `Cheap to run. Even heavy daily use costs pocket change ${exact}.`
  if (inputPerMTok < 5) return `Mid-priced. Costs stay small unless you automate a lot of work ${exact}.`
  return `Premium pricing. Best saved for work that earns it ${exact}.`
}
