import { validateSpec } from '@opendata-ai/openchart-react'
import { axisOptions, axisScale, buildGraphRows, buildGraphSpec, connectionSegments, defaultYAxisId, familyOf, LOG_SCALE_RATIO, paddedDomain, paletteFor, paletteForSeries, providerColor, scaledAxisTitle, scaleFraction, scaleTicks, shortModelLabel } from './graph'
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

test('shortModelLabel strips a distinct brand prefix and keeps everything else', () => {
  // Anthropic models drop the Claude brand word — the color already says who.
  expect(shortModelLabel('Claude Opus 4.8', 'Anthropic')).toBe('Opus 4.8')
  expect(shortModelLabel('Claude Fable 5', 'Anthropic')).toBe('Fable 5')
  expect(shortModelLabel('Claude Sonnet 5', 'Anthropic')).toBe('Sonnet 5')
  expect(shortModelLabel('Claude Haiku 4.5', 'Anthropic')).toBe('Haiku 4.5')
  // GPT / Gemini / Grok are the product names themselves, not a company
  // prefix, so they stay whole.
  expect(shortModelLabel('GPT-5.6 Sol', 'OpenAI')).toBe('GPT-5.6 Sol')
  expect(shortModelLabel('Gemini 3.1 Pro', 'Google')).toBe('Gemini 3.1 Pro')
  expect(shortModelLabel('Grok 4.5', 'xAI')).toBe('Grok 4.5')
  expect(shortModelLabel('Kimi K3', 'Moonshot AI')).toBe('Kimi K3')
  // Stripping 'Qwen' would leave a bare version number; the full name stays.
  expect(shortModelLabel('Qwen 3.6', 'Alibaba (Qwen)')).toBe('Qwen 3.6')
  expect(shortModelLabel('GLM-5.2', 'Z.ai (GLM)')).toBe('GLM-5.2')
  expect(shortModelLabel('Llama 4 Maverick', 'Meta')).toBe('Llama 4 Maverick')
  expect(shortModelLabel('DeepSeek V4 Pro', 'DeepSeek')).toBe('V4 Pro')
})

test('shortModelLabel never returns an empty string for any real model', () => {
  const providerName = new Map(providers.map((p) => [p.id, p.name]))
  for (const m of models) {
    const label = shortModelLabel(m.name, providerName.get(m.providerId) ?? m.providerId)
    expect(label.length).toBeGreaterThan(0)
    // The short label is always a suffix of the full name — it only ever
    // strips a leading brand, never rewrites.
    expect(m.name.endsWith(label)).toBe(true)
  }
})

test('graph rows carry the model id and release date for the detail card', () => {
  const { rows } = buildGraphRows(byId('price-input'), byId('swe-bench-pro'))
  const opus = rows.find((r) => r.model === 'Claude Opus 4.8')!
  expect(opus.modelId).toBe('claude-opus-4-8')
  const dated = models.find((m) => m.releaseDate !== undefined)!
  for (const r of rows) {
    const source = models.find((m) => m.id === r.modelId)!
    expect(r.releaseDate).toBe(source.releaseDate)
  }
  expect(dated).toBeDefined()
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

test('paddedDomain crops to the data instead of anchoring at zero', () => {
  // Issue #81: a 73-96 benchmark spread on a 0-100 axis used 23% of the plot.
  const [low, high] = paddedDomain([73.3, 96.2], 100)
  expect(low).toBeGreaterThan(50)
  expect(low).toBeLessThanOrEqual(73.3)
  expect(high).toBeGreaterThanOrEqual(96.2)
  expect(high).toBeLessThanOrEqual(100) // percentage axes never read past 100
  // The data must fill most of the axis, which is the whole point of the fix.
  expect((96.2 - 73.3) / (high - low)).toBeGreaterThan(0.6)
})

test('paddedDomain pads both ends and never invents room below zero', () => {
  const [low, high] = paddedDomain([10, 50])
  expect(low).toBeGreaterThan(0)
  expect(low).toBeLessThan(10)
  expect(high).toBeGreaterThan(50)
  // Data that starts at zero keeps its true baseline.
  expect(paddedDomain([0, 50])[0]).toBe(0)
  // Values close to zero must not pad into negative territory: a price axis
  // reading below $0 would be a lie.
  expect(paddedDomain([0.2, 1])[0]).toBeGreaterThanOrEqual(0)
})

test('paddedDomain survives empty, single-value, and all-zero inputs', () => {
  expect(paddedDomain([], 100)).toEqual([0, 100])
  expect(paddedDomain([])).toEqual([0, 1])
  const single = paddedDomain([42])
  expect(single[1]).toBeGreaterThan(single[0])
  expect(single[0]).toBeLessThanOrEqual(42)
  expect(single[1]).toBeGreaterThanOrEqual(42)
  const zeros = paddedDomain([0, 0])
  expect(zeros[1]).toBeGreaterThan(zeros[0])
  for (const n of [...single, ...zeros]) expect(Number.isFinite(n)).toBe(true)
})

test('axisScale switches to log exactly at the documented ratio threshold', () => {
  // Just under the threshold stays linear; at it, log takes over.
  expect(axisScale([1, LOG_SCALE_RATIO - 1]).type).toBe('linear')
  expect(axisScale([1, LOG_SCALE_RATIO]).type).toBe('log')
  expect(axisScale([0.5, 50]).type).toBe('log') // price-output, 100x spread
  expect(axisScale([73.3, 96.2], 100).type).toBe('linear') // benchmarks, 1.3x
  // Log needs a strictly positive domain, so a zero forces linear even at a
  // huge spread — Math.log10(0) would otherwise poison every projection.
  expect(axisScale([0, 1000]).type).toBe('linear')
  expect(axisScale([-5, 1000]).type).toBe('linear')
})

test('a log domain brackets the data with strictly positive bounds', () => {
  const scale = axisScale([0.5, 50])
  expect(scale.type).toBe('log')
  expect(scale.domain[0]).toBeGreaterThan(0)
  expect(scale.domain[0]).toBeLessThanOrEqual(0.5)
  expect(scale.domain[1]).toBeGreaterThanOrEqual(50)
  expect(scale.zeroBased).toBe(false)
})

test('scaleFraction projects a value to its position on either scale type', () => {
  const linear = axisScale([0, 100])
  expect(scaleFraction(linear, linear.domain[0])).toBe(0)
  expect(scaleFraction(linear, linear.domain[1])).toBe(1)
  // A log scale puts the geometric midpoint halfway along, which is the
  // property that unsquashes the cheap majority of a 100x price range.
  const log = axisScale([0.1, 100])
  expect(log.type).toBe('log')
  const [low, high] = log.domain
  expect(scaleFraction(log, Math.sqrt(low * high))).toBeCloseTo(0.5, 6)
  // Non-positive input has no log position; it pins to the low edge rather
  // than emitting -Infinity into a style attribute.
  expect(scaleFraction(log, 0)).toBe(0)
})

test('scaleTicks lands on readable stops inside the domain', () => {
  const linear = axisScale([73.3, 96.2], 100)
  const linearTicks = scaleTicks(linear, 5)
  expect(linearTicks.length).toBeGreaterThan(1)
  for (const tick of linearTicks) {
    expect(tick).toBeGreaterThanOrEqual(linear.domain[0])
    expect(tick).toBeLessThanOrEqual(linear.domain[1])
    // No 58.125 or 1.6500000000000001 reaching a label.
    expect(String(tick).replace('-', '').replace('.', '').length).toBeLessThanOrEqual(4)
  }
  // Log ticks are 1/2/5 x 10^n stops, never an even slice of the domain.
  const log = axisScale([0.2, 10])
  const logTicks = scaleTicks(log, 5)
  expect(logTicks.length).toBeGreaterThan(2)
  for (const tick of logTicks) {
    const normalized = tick / 10 ** Math.floor(Math.log10(tick))
    expect([1, 2, 5]).toContain(Math.round(normalized))
  }
})

test('a log axis says so in its title, a linear one leaves it alone', () => {
  const price = byId('price-output')
  expect(scaledAxisTitle(price, axisScale([0.5, 50]))).toBe(
    'Output price ($ per 1M tokens, log scale)',
  )
  expect(scaledAxisTitle(price, axisScale([5, 50]))).toBe(price.axisTitle)
  // A title with no trailing unit clause still gets the note appended.
  const bare = { ...price, axisTitle: 'Output price' }
  expect(scaledAxisTitle(bare, axisScale([0.5, 50]))).toBe('Output price (log scale)')
})

test('every axis pairing produces a finite, ordered domain', () => {
  for (const x of axisOptions) {
    for (const y of axisOptions) {
      const { rows } = buildGraphRows(x, y)
      if (rows.length === 0) continue
      for (const [axis, values] of [
        [x, rows.map((r) => r.x)],
        [y, rows.map((r) => r.y)],
      ] as const) {
        const scale = axisScale(values, axis.domainCap)
        const [low, high] = scale.domain
        expect(Number.isFinite(low) && Number.isFinite(high)).toBe(true)
        expect(high).toBeGreaterThan(low)
        // Every plotted point has to sit inside its own axis.
        for (const value of values) {
          expect(value).toBeGreaterThanOrEqual(low)
          expect(value).toBeLessThanOrEqual(high)
        }
        if (axis.domainCap !== undefined) expect(high).toBeLessThanOrEqual(axis.domainCap)
        if (scale.type === 'log') expect(low).toBeGreaterThan(0)
      }
    }
  }
})

test('the price and context axes go log while every benchmark stays linear', () => {
  const price = byId('price-input')
  const typeOf = (axis: (typeof axisOptions)[number], other: (typeof axisOptions)[number]) => {
    const { rows } = buildGraphRows(axis, other)
    return axisScale(rows.map((r) => r.x), axis.domainCap).type
  }
  // Priced models span 50-100x, so pairing the money axes against each other
  // (which keeps every priced model in the view) puts them all on log.
  expect(typeOf(price, byId('price-output'))).toBe('log')
  expect(typeOf(byId('price-output'), price)).toBe('log')
  // Context windows run 0.2M to 10M once the view isn't narrowed to priced
  // models, which is the 50x spread that earns a log axis.
  expect(typeOf(byId('context'), byId('gpqa-diamond'))).toBe('log')
  // Benchmark scores cluster far too tightly for a log axis to help.
  for (const b of benchmarks) {
    expect(typeOf(byId(b.id), price)).toBe('linear')
  }
})

test('spec crops both domains to the data, pins the legend on top, and draws no trendline', () => {
  const x = byId('price-input')
  const y = byId('swe-bench-pro')
  const { rows } = buildGraphRows(x, y)
  const spec = asChartSpec(buildGraphSpec(x, y, rows))
  expect(spec.mark).toMatchObject({ trendline: false })
  expect(spec.legend).toMatchObject({ position: 'top' })
  const yDomain = spec.encoding.y?.scale?.domain as [number, number]
  const yMin = Math.min(...rows.map((r) => r.y))
  expect(yDomain[1]).toBeGreaterThanOrEqual(Math.max(...rows.map((r) => r.y)))
  expect(yDomain[1]).toBeLessThanOrEqual(100) // percentage axis never reads past 100
  // Cropped, not zero-anchored — the readability fix in issue #81.
  expect(yDomain[0]).toBeGreaterThan(0)
  expect(yDomain[0]).toBeLessThanOrEqual(yMin)
})

test('a log axis carries its scale type and title into the spec', () => {
  const x = byId('price-output')
  const y = byId('price-input')
  const { rows } = buildGraphRows(x, y)
  const spec = asChartSpec(buildGraphSpec(x, y, rows))
  const scale = spec.encoding.x?.scale as { type?: string }
  expect(scale.type).toBe('log')
  // The engine renders the axis title verbatim, so the note has to live there.
  expect((spec.encoding.x?.axis as { title?: string }).title).toMatch(/log scale/)
  expect(spec.encoding.x?.title).toMatch(/log scale/)
  // A linear axis must not claim a scale type it doesn't have.
  const benchmark = byId('swe-bench-verified')
  const linearRows = buildGraphRows(benchmark, byId('gpqa-diamond')).rows
  const linearSpec = asChartSpec(buildGraphSpec(benchmark, byId('gpqa-diamond'), linearRows))
  const linearScale = linearSpec.encoding.x?.scale as { domain?: unknown; type?: string }
  expect(linearScale.domain).toBeDefined()
  expect(linearScale.type).toBeUndefined()
  expect((linearSpec.encoding.x?.axis as { title?: string }).title).not.toMatch(/log scale/)
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

test('the line layer shares the point layer scales so lines sit on their points', () => {
  // Every pairing, because a log x with a linear rule layer would slide the
  // connections clean off the points they join.
  for (const x of axisOptions) {
    for (const y of axisOptions) {
      const { rows } = buildGraphRows(x, y, 'provider')
      const spec = buildGraphSpec(x, y, rows, 'provider')
      if (!('layer' in spec)) continue
      const layers = asLayerSpec(spec)
      expect(layers[0].encoding!.x.scale).toEqual(layers[1].encoding!.x.scale)
      expect(layers[0].encoding!.y.scale).toEqual(layers[1].encoding!.y.scale)
    }
  }
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
