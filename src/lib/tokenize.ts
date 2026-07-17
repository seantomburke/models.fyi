export type TokenCounter = (text: string) => number

/** ~4 characters per token — used during SSR and while the real tokenizer loads. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

let tokenizerPromise: Promise<TokenCounter> | null = null

/**
 * Lazy-loads gpt-tokenizer's o200k_base encoding. The BPE ranks are around a
 * megabyte, so the dynamic import keeps them in their own chunk, and the
 * memoized promise means every caller shares one download. Load errors
 * propagate to the caller — the page logs once and keeps the estimate.
 */
export function loadTokenizer(): Promise<TokenCounter> {
  tokenizerPromise ??= import('gpt-tokenizer/encoding/o200k_base').then(
    (m) => (text: string) => m.countTokens(text),
  )
  return tokenizerPromise
}
