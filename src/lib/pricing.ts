import { models, providerById } from '../data/index.ts'
import type { Model, ProviderId } from '../data/index.ts'

export type EffortId = 'low' | 'medium' | 'high'

export interface EffortPreset {
  id: EffortId
  label: string
  /** Billed output tokens = visible output × multiplier for reasoning models. */
  multiplier: number
  blurb: string
}

/**
 * How hard a reasoning model thinks before answering. Providers bill those
 * hidden thinking tokens at the output rate; the multipliers are rough
 * industry-typical ratios, not published per-model numbers.
 */
export const effortPresets: EffortPreset[] = [
  { id: 'low', label: 'Low', multiplier: 1, blurb: 'Quick answers, no extra thinking' },
  { id: 'medium', label: 'Medium', multiplier: 3, blurb: '~2 hidden tokens per visible one' },
  { id: 'high', label: 'High', multiplier: 8, blurb: '~7 hidden tokens per visible one' },
]

/** Hidden thinking tokens: reasoning models emit (multiplier − 1) × visible output. */
export function thinkingTokensFor(
  reasoning: boolean,
  outputTokens: number,
  multiplier: number,
): number {
  return reasoning ? Math.round(outputTokens * (multiplier - 1)) : 0
}

export interface CostRow extends Record<string, unknown> {
  modelId: string
  model: string
  provider: string
  providerId: ProviderId
  inputPricePerMTok: number
  outputPricePerMTok: number
  thinkingTokens: number
  inputCost: number
  outputCost: number
  totalCost: number
}

/**
 * What running `inputTokens` in and `outputTokens` out costs on every model
 * with published API pricing. Reasoning models add thinking tokens billed at
 * the output rate. Open-source models have no fixed per-token price, so they
 * land in `excluded` for the caller to footnote.
 */
export function buildCostRows(
  inputTokens: number,
  outputTokens: number,
  effortMultiplier: number,
): { rows: CostRow[]; excluded: Model[] } {
  const rows: CostRow[] = []
  const excluded: Model[] = []
  for (const m of models) {
    if (m.inputPricePerMTok === null || m.outputPricePerMTok === null) {
      excluded.push(m)
      continue
    }
    const thinkingTokens = thinkingTokensFor(m.reasoning, outputTokens, effortMultiplier)
    const inputCost = (inputTokens * m.inputPricePerMTok) / 1_000_000
    const outputCost = ((outputTokens + thinkingTokens) * m.outputPricePerMTok) / 1_000_000
    rows.push({
      modelId: m.id,
      model: m.name,
      provider: providerById.get(m.providerId)?.name ?? m.providerId,
      providerId: m.providerId,
      inputPricePerMTok: m.inputPricePerMTok,
      outputPricePerMTok: m.outputPricePerMTok,
      thinkingTokens,
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
    })
  }
  return { rows, excluded }
}
