import { validateSpec } from '@opendata-ai/openchart-react'
import { buildPriceRows, buildTotalCostRows, buildTotalCostSpec, priceTicks } from './priceChart.ts'
import { buildCostRows } from './pricing.ts'
import { formatCost } from './format.ts'
import { models, providers } from '../data/index.ts'

const pricedCount = models.filter(
  (m) => m.inputPricePerMTok !== null && m.outputPricePerMTok !== null,
).length

test('price rows: one per priced model, output prices descending', () => {
  const { rows, excluded } = buildPriceRows()
  expect(rows).toHaveLength(pricedCount)
  expect(rows.length + excluded.length).toBe(models.length)
  for (let i = 1; i < rows.length; i++) {
    expect(rows[i].outputPrice).toBeLessThanOrEqual(rows[i - 1].outputPrice)
  }
  for (const row of rows) {
    expect(row.inputPrice).toBeGreaterThan(0)
    expect(row.outputPrice).toBeGreaterThan(0)
    expect(row.providerId).toBeTruthy()
  }
})

test('price ticks start at $0, step in round dollars, and cover the top bar', () => {
  const { rows } = buildPriceRows()
  const maxPrice = Math.max(...rows.map((r) => r.outputPrice))
  const ticks = priceTicks(maxPrice)
  expect(ticks[0]).toBe(0)
  expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(maxPrice)
  const step = ticks[1] - ticks[0]
  for (let i = 1; i < ticks.length; i++) {
    expect(ticks[i] - ticks[i - 1]).toBeCloseTo(step)
  }
  // A $50 ceiling should yield the familiar $10/$20/… ladder.
  expect(priceTicks(50)).toEqual([0, 10, 20, 30, 40, 50])
})

test('total-cost rows are cheapest-first with preformatted labels', () => {
  const { rows: costRows } = buildCostRows(1_000, 500, 3)
  const rows = buildTotalCostRows(costRows)
  expect(rows).toHaveLength(costRows.length)
  for (let i = 1; i < rows.length; i++) {
    expect(rows[i].cost).toBeGreaterThanOrEqual(rows[i - 1].cost)
  }
  for (const r of rows) {
    expect(r.costLabel).toBe(formatCost(r.cost))
  }
})

test('total-cost spec is engine-valid with brand colors in first-appearance order', () => {
  const rows = buildTotalCostRows(buildCostRows(1_000, 500, 3).rows)
  const spec = buildTotalCostSpec(rows)
  const result = validateSpec(spec)
  expect(result.valid, JSON.stringify(result.errors)).toBe(true)
  const palette = (spec.theme!.colors as { categorical: string[] }).categorical
  const providersInOrder = [...new Set(rows.map((r) => r.provider))]
  expect(palette).toHaveLength(providersInOrder.length)
  providersInOrder.forEach((name, i) => {
    expect(palette[i]).toBe(providers.find((p) => p.name === name)?.color)
  })
})
