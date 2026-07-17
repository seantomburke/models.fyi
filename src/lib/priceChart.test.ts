import { validateSpec } from '@opendata-ai/openchart-react'
import { buildPriceRows, buildPriceSpec, buildTotalCostRows, buildTotalCostSpec } from './priceChart.ts'
import { buildCostRows } from './pricing.ts'
import { formatCost } from './format.ts'
import { models, providers } from '../data/index.ts'

const pricedCount = models.filter(
  (m) => m.inputPricePerMTok !== null && m.outputPricePerMTok !== null,
).length

test('price rows: two per priced model, output prices descending, Input first', () => {
  const { rows, excluded } = buildPriceRows()
  expect(rows).toHaveLength(pricedCount * 2)
  expect(rows.length / 2 + excluded.length).toBe(models.length)
  const outputPrices: number[] = []
  for (let i = 0; i < rows.length; i += 2) {
    expect(rows[i].series).toBe('Input')
    expect(rows[i + 1].series).toBe('Output')
    expect(rows[i].model).toBe(rows[i + 1].model)
    outputPrices.push(rows[i + 1].price)
  }
  for (let i = 1; i < outputPrices.length; i++) {
    expect(outputPrices[i]).toBeLessThanOrEqual(outputPrices[i - 1])
  }
})

test('price spec is engine-valid grouped bars with a padded domain', () => {
  const { rows } = buildPriceRows()
  const spec = buildPriceSpec(rows)
  const result = validateSpec(spec)
  expect(result.valid, JSON.stringify(result.errors)).toBe(true)
  expect(spec.mark).toMatchObject({ type: 'bar', orient: 'horizontal' })
  expect(spec.encoding.x?.stack).toBeNull()
  const domain = spec.encoding.x?.scale?.domain as [number, number]
  expect(domain[1]).toBeGreaterThan(Math.max(...rows.map((r) => r.price)))
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
