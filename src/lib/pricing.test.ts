import { buildCostRows, effortPresets, thinkingTokensFor } from './pricing.ts'
import { models } from '../data/index.ts'

test('effort presets are low/medium/high with 1×/3×/8× multipliers', () => {
  expect(effortPresets.map((p) => [p.id, p.multiplier])).toEqual([
    ['low', 1],
    ['medium', 3],
    ['high', 8],
  ])
})

test('hand-computed cost for Claude Opus 4.8 ($5/$25) at medium effort', () => {
  // 1,000 in + 500 out at 3×: thinking = 500 × 2 = 1,000 tokens billed as output.
  const { rows } = buildCostRows(1_000, 500, 3)
  const opus = rows.find((r) => r.modelId === 'claude-opus-4-8')!
  expect(opus.thinkingTokens).toBe(1_000)
  expect(opus.inputCost).toBeCloseTo(0.005, 10)
  expect(opus.outputCost).toBeCloseTo(0.0375, 10)
  expect(opus.totalCost).toBeCloseTo(0.0425, 10)
})

test('thinking tokens require a reasoning model and a multiplier above 1', () => {
  expect(thinkingTokensFor(true, 500, 3)).toBe(1_000)
  expect(thinkingTokensFor(true, 500, 1)).toBe(0)
  expect(thinkingTokensFor(false, 500, 8)).toBe(0)
})

test('null-priced open-source models are excluded, everything else gets a row', () => {
  const { rows, excluded } = buildCostRows(100, 100, 1)
  expect(rows.length + excluded.length).toBe(models.length)
  expect(rows.length).toBeGreaterThan(0)
  for (const m of excluded) {
    expect(m.inputPricePerMTok === null || m.outputPricePerMTok === null).toBe(true)
  }
  expect(excluded.map((m) => m.name)).toContain('GLM-5.2')
})

test('zero tokens cost zero everywhere', () => {
  const { rows } = buildCostRows(0, 0, 8)
  for (const r of rows) {
    expect(r.totalCost).toBe(0)
    expect(r.thinkingTokens).toBe(0)
  }
})
