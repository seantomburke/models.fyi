import { validateSpec } from '@opendata-ai/openchart-react'
import { axisOptions, buildGraphRows, buildGraphSpec, connectionSegments, defaultYAxisId, familyOf, paddedDomain, paletteFor, paletteForSeries, providerColor } from './graph'
import { benchmarks, models, providers } from '../data/index.ts'

const byId = (id: string) => axisOptions.find((o) => o.id === id)!

/** Narrows a spec to the plain scatter, failing loudly if it came back layered. */
function asChartSpec(spec: ReturnType<typeof buildGraphSpec>) {
  if ('layer' in spec) throw new Error('expected a plain ChartSpec, got a LayerSpec')
  return spec
}

/** Narrows a spec to the layered form, failing loudly if connections were off. */
function asLayerSpec(spec: ReturnType<typeof buildGraphSpec>) {
  if (!('layer' in spec)) throw new Error('expected a LayerSpec, got a plain ChartSpec')
  return spec.layer as Array<{ mark?: unknown; encoding?: Record<string, { field?: string; scale?: { domain?: unknown } }> }>
}

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

test('default y-axis is the benchmark with the most models plottable against price', () => {
  const yId = defaultYAxisId()
  const benchmarkIds = benchmarks.map((b) => b.id as string)
  expect(benchmarkIds).toContain(yId)
  const priceInput = axisOptions.find((o) => o.id === 'price-input')!
  const countFor = (id: string) =>
    buildGraphRows(priceInput, axisOptions.find((o) => o.id === id)!).rows.length
  const defaultCount = countFor(yId)
  for (const id of benchmarkIds) {
    expect(defaultCount).toBeGreaterThanOrEqual(countFor(id))
  }
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

test('paddedDomain gives headroom above the data but respects the cap', () => {
  expect(paddedDomain([10, 50])).toEqual([0, 54])
  expect(paddedDomain([95], 100)).toEqual([0, 100]) // 95 * 1.08 = 102.6, capped
  expect(paddedDomain([50], 100)).toEqual([0, 54]) // under the cap, pad applies
  expect(paddedDomain([], 100)).toEqual([0, 100])
})

test('spec pads both domains past the data, pins the legend on top, and draws no trendline', () => {
  const x = byId('price-input')
  const y = byId('swe-bench-pro')
  const { rows } = buildGraphRows(x, y)
  const spec = asChartSpec(buildGraphSpec(x, y, rows))
  expect(spec.mark).toMatchObject({ trendline: false })
  expect(spec.legend).toMatchObject({ position: 'top' })
  const xDomain = spec.encoding.x?.scale?.domain as [number, number]
  const yDomain = spec.encoding.y?.scale?.domain as [number, number]
  expect(xDomain[1]).toBeGreaterThan(Math.max(...rows.map((r) => r.x)))
  expect(yDomain[1]).toBeGreaterThanOrEqual(Math.max(...rows.map((r) => r.y)))
  expect(yDomain[1]).toBeLessThanOrEqual(100) // percentage axis never reads past 100
})

test('providerColor resolves brand colors by display name with a neutral fallback', () => {
  for (const p of providers) {
    expect(providerColor(p.name)).toBe(p.color)
  }
  expect(providerColor('Unknown Lab')).toBe('#78716c')
})

test('palette matches the first-appearance provider order (the engine domain order)', () => {
  const { rows } = buildGraphRows(byId('price-input'), byId('price-output'))
  const palette = paletteFor(rows)
  const namesInOrder = [...new Set(rows.map((r) => r.provider))]
  expect(palette).toHaveLength(namesInOrder.length)
  namesInOrder.forEach((name, i) => {
    const provider = providers.find((p) => p.name === name)
    expect(palette[i]).toBe(provider?.color)
  })
})

test('familyOf groups release variants and leaves standalone models alone', () => {
  const family = (name: string) => familyOf(models.find((m) => m.name === name)!)
  // Sol/Terra/Luna are one release at different effort levels.
  expect(family('GPT-5.6 Sol')).toBe('GPT-5.6')
  expect(family('GPT-5.6 Terra')).toBe('GPT-5.6')
  expect(family('GPT-5.6 Luna')).toBe('GPT-5.6')
  expect(family('Llama 4 Maverick')).toBe(family('Llama 4 Scout'))
  // A trailing version number is not a variant word, so these stay distinct.
  expect(family('Claude Opus 4.8')).not.toBe(family('Claude Fable 5'))
  expect(family('GLM-5.2')).toBe('GLM-5.2')
})

test('no two models from different companies land in one family', () => {
  const providerByFamily = new Map<string, string>()
  for (const m of models) {
    const f = familyOf(m)
    const seen = providerByFamily.get(f)
    expect(seen === undefined || seen === m.providerId).toBe(true)
    providerByFamily.set(f, m.providerId)
  }
})

test('rows carry the series implied by the connection mode', () => {
  const x = byId('price-input')
  const y = byId('swe-bench-verified')
  const byProvider = buildGraphRows(x, y, 'provider').rows
  expect(byProvider.every((r) => r.series === r.provider)).toBe(true)
  const byFamily = buildGraphRows(x, y, 'family').rows
  expect(byFamily.every((r) => r.series === r.family)).toBe(true)
})

test('connection segments join adjacent members and skip lone series', () => {
  const { rows } = buildGraphRows(byId('price-input'), byId('swe-bench-verified'), 'provider')
  const segments = connectionSegments(rows)
  expect(segments.length).toBeGreaterThan(0)

  // Each series contributes one fewer segment than it has models, and a
  // one-model series contributes none.
  const counts = new Map<string, number>()
  for (const r of rows) counts.set(r.series, (counts.get(r.series) ?? 0) + 1)
  const segCounts = new Map<string, number>()
  for (const seg of segments) segCounts.set(seg.series, (segCounts.get(seg.series) ?? 0) + 1)
  for (const [series, n] of counts) {
    expect(segCounts.get(series) ?? 0).toBe(Math.max(0, n - 1))
  }

  // Every segment runs left to right, so a series traces a curve rather than
  // zig-zagging back across the plot.
  for (const seg of segments) expect(seg.x2).toBeGreaterThanOrEqual(seg.x)
})

test('connection segments land on real model coordinates', () => {
  const { rows } = buildGraphRows(byId('price-input'), byId('swe-bench-verified'), 'family')
  const points = new Set(rows.map((r) => `${r.x},${r.y}`))
  for (const seg of connectionSegments(rows)) {
    expect(points.has(`${seg.x},${seg.y}`)).toBe(true)
    expect(points.has(`${seg.x2},${seg.y2}`)).toBe(true)
  }
})

test('connection lines inherit the color of the provider they join', () => {
  const { rows } = buildGraphRows(byId('price-input'), byId('swe-bench-verified'), 'family')
  const segments = connectionSegments(rows)
  const palette = paletteForSeries(segments, 'family')
  // First-appearance order, matching how the engine assigns the nominal domain.
  const seriesInOrder = [...new Set(segments.map((s) => s.series))]
  expect(palette).toHaveLength(seriesInOrder.length)
  seriesInOrder.forEach((series, i) => {
    const provider = segments.find((s) => s.series === series)!.provider
    expect(palette[i]).toBe(providerColor(provider))
  })
})

test('connections off returns a plain scatter, not a layered spec', () => {
  const x = byId('price-input')
  const y = byId('swe-bench-verified')
  const { rows } = buildGraphRows(x, y, 'off')
  const spec = buildGraphSpec(x, y, rows, 'off')
  expect('layer' in spec).toBe(false)
})

test('connections on layer dotted lines UNDER the points', () => {
  const x = byId('price-input')
  const y = byId('swe-bench-verified')
  const { rows } = buildGraphRows(x, y, 'provider')
  const layers = asLayerSpec(buildGraphSpec(x, y, rows, 'provider'))
  // Lines first so the points paint on top and stay readable (issue #75).
  expect((layers[0].mark as Record<string, unknown>).type).toBe('rule')
  expect((layers[1].mark as Record<string, unknown>).type).toBe('point')
  // Dash and opacity ride on data fields, not the mark def — the engine's
  // rule renderer only honors them through encodings. The rendered SVG is
  // asserted in graph.render.test.tsx.
  const encoding = layers[0].encoding!
  expect(encoding.strokeDash?.field).toBe('dash')
  expect(encoding.opacity?.field).toBe('lineOpacity')
})

test('the line layer shares the point layer domains so lines sit on their points', () => {
  const x = byId('price-input')
  const y = byId('swe-bench-verified')
  const { rows } = buildGraphRows(x, y, 'provider')
  const layers = asLayerSpec(buildGraphSpec(x, y, rows, 'provider'))
  expect(layers[0].encoding!.x.scale?.domain).toEqual(layers[1].encoding!.x.scale?.domain)
  expect(layers[0].encoding!.y.scale?.domain).toEqual(layers[1].encoding!.y.scale?.domain)
})

test('every connection mode produces a spec the chart engine accepts', () => {
  for (const connections of ['off', 'provider', 'family'] as const) {
    for (const x of axisOptions) {
      for (const y of axisOptions) {
        const { rows } = buildGraphRows(x, y, connections)
        if (rows.length === 0) continue
        const result = validateSpec(buildGraphSpec(x, y, rows, connections))
        expect(
          result.valid,
          `invalid for ${x.id} × ${y.id} (${connections}): ${JSON.stringify(result.errors)}`,
        ).toBe(true)
      }
    }
  }
})
