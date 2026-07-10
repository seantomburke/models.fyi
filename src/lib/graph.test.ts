import { validateSpec } from '@opendata-ai/openchart-react'
import { axisOptions, buildGraphRows, buildGraphSpec, paletteFor } from './graph'
import { models, providers } from '../data/index.ts'

const byId = (id: string) => axisOptions.find((o) => o.id === id)!

test('axis options cover every benchmark plus price and context', () => {
  const ids = axisOptions.map((o) => o.id)
  expect(ids).toEqual(
    expect.arrayContaining([
      'swe-bench-verified',
      'gpqa-diamond',
      'price-input',
      'price-output',
      'context',
    ]),
  )
})

test('only models with values on both axes are plotted; the rest are listed as excluded', () => {
  const { rows, excluded } = buildGraphRows(byId('price-input'), byId('swe-bench-pro'))
  // Opus 4.8 has both a price and a SWE-bench Pro score.
  expect(rows.map((r) => r.model)).toContain('Claude Opus 4.8')
  // Open-source models have no fixed price, so they can't sit on a price axis.
  expect(excluded.map((m) => m.name)).toContain('GLM-5.2')
  expect(rows.length + excluded.length).toBe(models.length)
})

test('context axis converts tokens to millions', () => {
  const { rows } = buildGraphRows(byId('context'), byId('gpqa-diamond'))
  const opus = rows.find((r) => r.model === 'Claude Opus 4.8')
  expect(opus?.x).toBe(1)
})

test('every non-empty axis combination produces a spec the chart engine accepts', () => {
  let validated = 0
  for (const x of axisOptions) {
    for (const y of axisOptions) {
      const { rows } = buildGraphRows(x, y)
      // The page renders an empty-state message instead of a chart when no
      // model has data on both axes — only non-empty specs reach the engine.
      if (rows.length === 0) continue
      const result = validateSpec(buildGraphSpec(x, y, rows))
      expect(result.valid, `spec invalid for ${x.id} × ${y.id}: ${JSON.stringify(result.errors)}`).toBe(true)
      validated++
    }
  }
  expect(validated).toBeGreaterThan(20) // most combos should be plottable
})

test('palette matches the alphabetically sorted provider domain', () => {
  const { rows } = buildGraphRows(byId('price-input'), byId('price-output'))
  const palette = paletteFor(rows)
  const sortedNames = [...new Set(rows.map((r) => r.provider))].sort()
  expect(palette).toHaveLength(sortedNames.length)
  sortedNames.forEach((name, i) => {
    const provider = providers.find((p) => p.name === name)
    expect(palette[i]).toBe(provider?.color)
  })
})
