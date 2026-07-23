import type { ChartSpec, LayerSpec } from '@opendata-ai/openchart-core'
import { benchmarks, models, providers } from '../data/index.ts'
import type { Model } from '../data/index.ts'

/**
 * How related points are joined on the scatter plot. Defined here rather than
 * in graphUrlState so the dependency runs one way: graphUrlState imports the
 * axis/connection vocabulary from graph, never the reverse.
 */
export type GraphConnections = 'off' | 'provider' | 'family'

export interface AxisOption {
  id: string
  label: string
  /** Short axis title shown on the chart. */
  axisTitle: string
  getValue: (m: Model) => number | undefined
  /** Upper bound the padded domain must not exceed (100 for % benchmarks). */
  domainCap?: number
}

export const axisOptions: AxisOption[] = [
  ...benchmarks.map((b) => ({
    id: b.id,
    label: b.name,
    axisTitle: `${b.name} (${b.unit})`,
    getValue: (m: Model) => m.scores[b.id],
    domainCap: 100,
  })),
  {
    id: 'price-input',
    label: 'Price (input)',
    axisTitle: 'Input price ($ per 1M tokens)',
    getValue: (m) => m.inputPricePerMTok ?? undefined,
  },
  {
    id: 'price-output',
    label: 'Price (output)',
    axisTitle: 'Output price ($ per 1M tokens)',
    getValue: (m) => m.outputPricePerMTok ?? undefined,
  },
  {
    id: 'context',
    label: 'Context window',
    axisTitle: 'Context window (M tokens)',
    getValue: (m) => (m.contextWindowTokens === null ? undefined : m.contextWindowTokens / 1_000_000),
  },
]

export interface GraphRow extends Record<string, unknown> {
  model: string
  /** URL slug for the model's detail page (/models/:id). */
  modelId: string
  provider: string
  /** ISO release date, when the dataset reliably knows one. */
  releaseDate?: string
  x: number
  y: number
  /**
   * The release family a model belongs to (e.g. 'GPT-5.6' for Sol/Terra/Luna).
   * Models in a family are the same generation at different effort levels, so
   * joining them traces the provider's speed/quality curve.
   */
  family: string
  /** The series a connecting line is drawn for, given the active mode. */
  series: string
}

/**
 * Family key for a model: the shared generation prefix its variants hang off.
 *
 * Derived from the name rather than stored on the model because the dataset
 * has no effort-level field — variants are only ever distinguished by a
 * trailing tier word ('GPT-5.6 Sol', 'Llama 4 Maverick'). Stripping that word
 * groups the variants; a name with no trailing variant is its own family.
 * `graph.test.ts` pins the groupings this produces so a rename can't silently
 * merge two unrelated models into one line.
 */
export function familyOf(m: Model): string {
  const parts = m.name.split(' ')
  // A trailing all-alphabetic word is a variant name ('Sol', 'Flash', 'Pro');
  // a trailing token with digits is a version ('5.2', '4.5') and stays put.
  if (parts.length > 1 && /^[A-Za-z]+$/.test(parts[parts.length - 1])) {
    return parts.slice(0, -1).join(' ')
  }
  return m.name
}

/**
 * Short label for a point on the graph: the model name minus a leading
 * provider brand word, because the point's color already says who made it.
 * 'Claude Opus 4.8' → 'Opus 4.8', but 'GPT-5.6 Sol' keeps its GPT — the
 * brand word only comes off when it stands alone at the front of the name
 * and something distinctive remains after it. Word-by-word prefix matching
 * (not substring) so 'Geminix Prime' never loses letters to 'Gemini'.
 */
export function shortModelLabel(name: string, provider: string): string {
  const nameWords = name.split(' ')
  // Candidate brand prefixes, longest first, drawn from the provider name.
  // 'Moonshot AI' should strip 'Moonshot AI' before falling back to
  // 'Moonshot'; a parenthesized alias like 'Alibaba (Qwen)' offers both words.
  const providerWords = provider.replace(/[()]/g, '').split(' ').filter(Boolean)
  const candidates: string[][] = []
  for (let take = providerWords.length; take >= 1; take--) {
    candidates.push(providerWords.slice(0, take))
  }
  // Anthropic's models carry the product brand 'Claude', not the company
  // name, so brand words are candidates too.
  if (nameWords.length > 1 && nameWords[0] === 'Claude') candidates.push(['Claude'])

  for (const prefix of candidates) {
    if (prefix.length >= nameWords.length) continue
    const matches = prefix.every((word, i) => nameWords[i] === word)
    if (!matches) continue
    const rest = nameWords.slice(prefix.length).join(' ')
    if (rest.length > 0) return rest
  }
  return name
}

const providerName = new Map(providers.map((p) => [p.id, p.name]))
const providerColorByName = new Map(providers.map((p) => [p.name, p.color]))

/** Brand color for a provider display name, with a neutral fallback. */
export function providerColor(name: string): string {
  return providerColorByName.get(name) ?? '#78716c'
}

/**
 * Brand colors ordered to match openchart's nominal color domain.
 * Verified empirically (headless-browser QA, issue #18): the engine assigns
 * categorical palette entries in FIRST-APPEARANCE order of the color field in
 * the data, not alphabetical order. Feed this to `theme.colors.categorical`.
 */
export function paletteFor(rows: Array<{ provider: string }>): string[] {
  const names = [...new Set(rows.map((r) => r.provider))]
  return names.map(providerColor)
}

/**
 * Colors for the connecting-line layer, in first-appearance order to match
 * openchart's nominal color assignment (see `paletteFor`).
 *
 * In provider mode a series IS a company, so it takes that company's brand
 * color. In family mode every model in a family shares one provider, so the
 * family inherits that provider's color too — which keeps a line the same
 * hue as the points it joins in both modes.
 */
export function paletteForSeries(
  items: Array<{ series: string; provider: string }>,
  connections: GraphConnections,
): string[] {
  if (connections === 'off') return []
  const providerBySeries = new Map<string, string>()
  for (const item of items) {
    if (!providerBySeries.has(item.series)) providerBySeries.set(item.series, item.provider)
  }
  return [...providerBySeries.values()].map(providerColor)
}

/**
 * Benchmark axis with the most models plottable against the default price
 * axis, so the landing view shows as much of the dataset as the data allows.
 * Ties break toward the earlier entry in `benchmarks`.
 */
export function defaultYAxisId(): string {
  const priceInput = axisOptions.find((o) => o.id === 'price-input')!
  let bestId = benchmarks[0].id as string
  let bestCount = -1
  for (const b of benchmarks) {
    const axis = axisOptions.find((o) => o.id === b.id)!
    const { rows } = buildGraphRows(priceInput, axis)
    if (rows.length > bestCount) {
      bestId = b.id
      bestCount = rows.length
    }
  }
  return bestId
}

/** Scale kind an axis is drawn on, decided from the data's dynamic range. */
export type AxisScaleType = 'linear' | 'log'

export interface AxisScale {
  type: AxisScaleType
  /** Bounds the axis is drawn between, already padded and rounded. */
  domain: [number, number]
  /** True when the axis starts at 0 and so needs no cropped-baseline notice. */
  zeroBased: boolean
}

/**
 * Ratio between the largest and smallest value at which a linear axis stops
 * being readable: the small values all collapse onto the low edge and the
 * differences the reader came for disappear (issue #81). Prices and context
 * windows span 50-100x, benchmarks span well under 2x, so a data-driven
 * threshold sorts them without a per-axis flag that would rot as data changes.
 */
export const LOG_SCALE_RATIO = 20

/** Fraction of the data span added as breathing room on each end. */
const PADDING_FRACTION = 0.08

/** 1, 2, 2.5 and 5 x 10^n — the step sizes people read fluently. */
function niceStep(rough: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const normalized = rough / magnitude
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10
  return step * magnitude
}

/** The 1/2/5 x 10^n stops a log axis is bounded and ticked on. */
const LOG_MULTIPLIERS = [1, 2, 5]

/** Nearest 1/2/5 x 10^n stop at or beyond `value` in the given direction. */
function logStop(value: number, direction: 'up' | 'down'): number {
  const exponent = Math.floor(Math.log10(value))
  const normalized = value / 10 ** exponent
  if (direction === 'up') {
    const m = LOG_MULTIPLIERS.find((candidate) => candidate >= normalized - 1e-9) ?? 10
    return Number((m * 10 ** exponent).toPrecision(12))
  }
  const m = [...LOG_MULTIPLIERS].reverse().find((candidate) => candidate <= normalized + 1e-9) ?? 1
  return Number((m * 10 ** exponent).toPrecision(12))
}

/**
 * Axis bounds and scale type derived from the values actually plotted.
 *
 * Cropping matters more than a zero baseline here: every benchmark axis holds
 * scores in a 20-45 point band, so anchoring at 0 spent more than half the
 * axis on empty space and squashed the differences (issue #81). The bounds are
 * padded on BOTH ends and snapped outward to round numbers so the ticks read
 * cleanly, then clamped to `cap` (percentage axes must not read past 100).
 *
 * A wide dynamic range switches the axis to log instead, which is the only way
 * a $0.20 model and a $50 model can share a readable axis. Log needs a strictly
 * positive domain, so a zero or negative value forces linear.
 */
export function axisScale(values: number[], cap?: number): AxisScale {
  if (values.length === 0) return { type: 'linear', domain: [0, cap ?? 1], zeroBased: true }

  const min = Math.min(...values)
  const max = Math.max(...values)

  if (min > 0 && max / min >= LOG_SCALE_RATIO) {
    // Pad in log space so the proportional margin is even at both ends, then
    // snap each bound out to the nearest 1/2/5 x 10^n stop — the same stops
    // scaleTicks labels, so the axis begins and ends on a printed tick.
    const span = Math.log10(max) - Math.log10(min)
    const low = logStop(10 ** (Math.log10(min) - span * PADDING_FRACTION), 'down')
    const highRaw = logStop(10 ** (Math.log10(max) + span * PADDING_FRACTION), 'up')
    const high = cap === undefined ? highRaw : Math.min(highRaw, cap)
    return { type: 'log', domain: [low, high > low ? high : low * 10], zeroBased: false }
  }

  // A single repeated value has no span to pad, so invent one around it;
  // otherwise the domain collapses and every projection divides by zero.
  const rawSpan = max - min
  const span = rawSpan > 0 ? rawSpan : Math.abs(max) || 1
  const step = niceStep(span * PADDING_FRACTION)
  // toPrecision trims the drift a fractional step leaves behind (0.1 * 3
  // is 0.30000000000000004), which would otherwise reach a tick label.
  const snap = (n: number) => Number(n.toPrecision(12))
  let low = snap(Math.floor((min - span * PADDING_FRACTION) / step) * step)
  let high = snap(Math.ceil((max + span * PADDING_FRACTION) / step) * step)
  // Never invent room below zero for data that has none — a negative price
  // axis is a lie, and the extra space is exactly what issue #81 is about.
  if (min >= 0 && low < 0) low = 0
  if (cap !== undefined && high > cap) high = cap
  if (high <= low) high = low + step
  return { type: 'linear', domain: [low, high], zeroBased: low === 0 }
}

/**
 * Domain only, for callers that just need bounds for a chart spec.
 * Bar charts pass through here too, which is why the zero-anchoring rule above
 * survives for data that starts at zero.
 */
export function paddedDomain(values: number[], cap?: number): [number, number] {
  return axisScale(values, cap).domain
}

/**
 * Position of `value` within a scale, as a 0-1 fraction of the axis length.
 * Shared by both renderers so the DOM scatter and the chart spec agree.
 */
export function scaleFraction(scale: AxisScale, value: number): number {
  const [low, high] = scale.domain
  if (scale.type === 'log') {
    // A non-positive value has no log position; pin it to the low edge rather
    // than emitting -Infinity into a style attribute.
    if (value <= 0) return 0
    const lo = Math.log10(low)
    return (Math.log10(value) - lo) / (Math.log10(high) - lo)
  }
  return (value - low) / (high - low)
}

/**
 * Tick values for a scale: whole decades on log axes, `count` evenly spaced
 * stops on linear ones. Log axes with a single decade of range get intermediate
 * 2/5 steps so the axis is not left with two lonely labels.
 */
export function scaleTicks(scale: AxisScale, count: number): number[] {
  const [low, high] = scale.domain
  if (scale.type === 'log') {
    // Over a wide range the 2/5 stops crowd the axis, so drop to bare decades.
    // Three decades is the widest any current axis reaches, and 1/2/5 stops
    // still fit there; beyond that the labels start colliding.
    const decades = Math.log10(high) - Math.log10(low)
    const multipliers = decades <= 3 ? LOG_MULTIPLIERS : [1]
    const ticks: number[] = []
    for (let e = Math.floor(Math.log10(low)); e <= Math.ceil(Math.log10(high)); e++) {
      for (const m of multipliers) {
        const tick = Number((m * 10 ** e).toPrecision(12))
        if (tick >= low * (1 - 1e-9) && tick <= high * (1 + 1e-9)) ticks.push(tick)
      }
    }
    return ticks
  }
  // Snap to a nice step rather than slicing the domain into `count` equal
  // parts: an arbitrary domain width divided by 4 yields labels like 58.125,
  // and floating-point remainders like 1.6500000000000001.
  const step = niceStep((high - low) / (count - 1))
  const ticks: number[] = []
  for (let tick = Math.ceil(low / step) * step; tick <= high + step * 1e-9; tick += step) {
    // Re-round each stop: repeated addition of a fractional step drifts.
    ticks.push(Number((Math.round(tick / step) * step).toPrecision(12)))
  }
  return ticks
}

/** Axis title with the scale spelled out, so a log axis can't be misread. */
export function scaledAxisTitle(axis: AxisOption, scale: AxisScale): string {
  if (scale.type !== 'log') return axis.axisTitle
  // The unit already sits in parentheses, so extend that clause rather than
  // stacking a second pair of brackets on the end.
  return axis.axisTitle.endsWith(')')
    ? `${axis.axisTitle.slice(0, -1)}, log scale)`
    : `${axis.axisTitle} (log scale)`
}

/** Scale encoding for the chart engine: domain plus, on log axes, the type. */
function scaleSpec(scale: AxisScale): { domain: [number, number]; type?: AxisScaleType } {
  return scale.type === 'log' ? { domain: scale.domain, type: 'log' } : { domain: scale.domain }
}

/**
 * Scatter spec, layered with connecting lines when `connections` is on.
 *
 * The lines go in the FIRST layer so they paint under the points — drawn on
 * top, a dotted line reads as part of the marker and makes individual models
 * harder to pick out, which is the noise issue #75 warns about. They stay
 * thin and semi-transparent for the same reason: the points are the data,
 * the lines are only a hint at how they group.
 */
export function buildGraphSpec(
  xAxis: AxisOption,
  yAxis: AxisOption,
  rows: GraphRow[],
  connections: GraphConnections = 'off',
): ChartSpec<GraphRow> | LayerSpec<GraphRow> {
  const points = buildScatterSpec(xAxis, yAxis, rows)
  if (connections === 'off') return points

  const segments = connectionSegments(rows)
  // Nothing to join (every series is a lone model) — a bare scatter beats an
  // empty layer, which would still reserve its own legend entry.
  if (segments.length === 0) return points

  return {
    layer: [
      {
        mark: { type: 'rule', tooltip: null },
        // LayerSpec is parameterized on a single row type, but this layer
        // holds segments (x/y/x2/y2) rather than model points. Both are open
        // record types and the layer reads only its own fields, so the cast
        // is a limitation of the spec's typing, not a shape mismatch.
        data: segments as unknown as GraphRow[],
        // The lines repeat the scatter's companies; a second legend for them
        // would just duplicate it.
        legend: { show: false },
        encoding: {
          // Domains AND scale types are duplicated from the point layer, not
          // inherited: this layer holds derived rows, so letting it pick its
          // own scale would slide the connections off the points they join.
          x: {
            field: 'x',
            type: 'quantitative',
            scale: scaleSpec(axisScale(rows.map((r) => r.x), xAxis.domainCap)),
          },
          y: {
            field: 'y',
            type: 'quantitative',
            scale: scaleSpec(axisScale(rows.map((r) => r.y), yAxis.domainCap)),
          },
          x2: { field: 'x2', type: 'quantitative' },
          y2: { field: 'y2', type: 'quantitative' },
          color: { field: 'series', type: 'nominal' },
          // Dash and opacity reach the rule renderer only through encodings
          // bound to data fields (see CONNECTION_DASH).
          strokeDash: { field: 'dash', type: 'nominal' },
          opacity: { field: 'lineOpacity', type: 'quantitative' },
        },
        theme: { colors: { categorical: paletteForSeries(segments, connections) } },
      },
      points,
    ],
    resolve: { scale: { color: 'independent' } },
    watermark: false,
    responsive: true,
  }
}

/** The plain scatter layer: one point per model, colored by company. */
function buildScatterSpec(xAxis: AxisOption, yAxis: AxisOption, rows: GraphRow[]): ChartSpec<GraphRow> {
  const xScale = axisScale(rows.map((r) => r.x), xAxis.domainCap)
  const yScale = axisScale(rows.map((r) => r.y), yAxis.domainCap)
  const xTitle = scaledAxisTitle(xAxis, xScale)
  const yTitle = scaledAxisTitle(yAxis, yScale)
  return {
    // No trendline: a regression line on price-vs-benchmark scatter would
    // imply a relationship claim the site doesn't make.
    mark: { type: 'point', tooltip: true, trendline: false },
    data: rows,
    legend: { position: 'top', maxRows: 2 },
    encoding: {
      // The engine skips its nice/zero adjustments whenever an explicit
      // domain is set, so axisScale is the whole story for both scales — and
      // the title carries the scale type so a log axis can't be misread.
      x: {
        field: 'x',
        type: 'quantitative',
        title: xTitle,
        axis: { title: xTitle },
        scale: scaleSpec(xScale),
      },
      y: {
        field: 'y',
        type: 'quantitative',
        title: yTitle,
        axis: { title: yTitle },
        scale: scaleSpec(yScale),
      },
      color: { field: 'provider', type: 'nominal', title: 'Company' },
      detail: { field: 'model', type: 'nominal' },
      tooltip: [
        { field: 'model', type: 'nominal', title: 'Model' },
        { field: 'x', type: 'quantitative', title: xAxis.label },
        { field: 'y', type: 'quantitative', title: yAxis.label },
      ],
    },
    theme: { colors: { categorical: paletteFor(rows) } },
    watermark: false,
    responsive: true,
  }
}

/**
 * Rows for the scatter plot: only models with a value on BOTH axes.
 * Returns the rows plus the models that had to be left out.
 */
export function buildGraphRows(
  xAxis: AxisOption,
  yAxis: AxisOption,
  connections: GraphConnections = 'off',
): { rows: GraphRow[]; excluded: Model[] } {
  const rows: GraphRow[] = []
  const excluded: Model[] = []
  for (const m of models) {
    const x = xAxis.getValue(m)
    const y = yAxis.getValue(m)
    if (x === undefined || y === undefined) {
      excluded.push(m)
    } else {
      const provider = providerName.get(m.providerId) ?? m.providerId
      const family = familyOf(m)
      rows.push({
        model: m.name,
        modelId: m.id,
        provider,
        ...(m.releaseDate !== undefined && { releaseDate: m.releaseDate }),
        x,
        y,
        family,
        series: connections === 'family' ? family : provider,
      })
    }
  }
  return { rows, excluded }
}

/**
 * SVG dash pattern for the connecting lines.
 *
 * Carried per row rather than on the mark: the engine's rule renderer reads
 * its dash from a `strokeDash` ENCODING (a data field), and ignores a
 * `strokeDash` set on the mark definition. Verified by asserting the rendered
 * stroke-dasharray in graph.render.test.tsx.
 */
export const CONNECTION_DASH = '3 4'

/**
 * Connecting lines sit well under full strength so the points stay the
 * focus — the readability requirement in issue #75. Like the dash, this is
 * read from a data field via the opacity encoding.
 */
export const CONNECTION_OPACITY = 0.45

/** One drawn segment joining two adjacent models in the same series. */
export interface ConnectionSegment extends Record<string, unknown> {
  series: string
  provider: string
  x: number
  y: number
  x2: number
  y2: number
  /** Dash pattern, read through the strokeDash encoding. */
  dash: string
  /** Line opacity, read through the opacity encoding. */
  lineOpacity: number
}

/**
 * Segments joining each series' models in ascending-x order.
 *
 * Emitted as discrete point-to-point segments rather than a `line` mark
 * because the engine's line mark requires a temporal or ordinal x axis
 * (see the channel rules in openchart-core) and both of our axes are
 * quantitative. A `rule` mark takes x/x2/y/y2 and has no such restriction,
 * so a chain of rules is how a scatter plot gets connected here.
 *
 * Series with a single model produce nothing: there is no pair to join.
 */
export function connectionSegments(rows: GraphRow[]): ConnectionSegment[] {
  const bySeries = new Map<string, GraphRow[]>()
  for (const r of rows) {
    bySeries.set(r.series, [...(bySeries.get(r.series) ?? []), r])
  }

  const segments: ConnectionSegment[] = []
  for (const [series, members] of bySeries) {
    if (members.length < 2) continue
    // Sorting matters: unsorted members zig-zag backwards across the plot
    // instead of tracing the series' price/quality curve.
    const sorted = [...members].sort((a, b) => a.x - b.x)
    for (let i = 0; i < sorted.length - 1; i++) {
      segments.push({
        series,
        provider: sorted[i].provider,
        x: sorted[i].x,
        y: sorted[i].y,
        x2: sorted[i + 1].x,
        y2: sorted[i + 1].y,
        dash: CONNECTION_DASH,
        lineOpacity: CONNECTION_OPACITY,
      })
    }
  }
  return segments
}
