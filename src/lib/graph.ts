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
    axisTitle: `${b.name} (%)`,
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
  provider: string
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

/**
 * Domain with headroom above the data so points never sit on the plot edge,
 * clamped to `cap` when given (percentage axes must not read past 100).
 */
export function paddedDomain(values: number[], cap?: number): [number, number] {
  if (values.length === 0) return [0, cap ?? 1]
  const padded = Math.max(...values) * 1.08
  return [0, cap === undefined ? padded : Math.min(padded, cap)]
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
          // Domains are duplicated from the point layer, not inherited: this
          // layer holds derived rows, so letting it pick its own scale would
          // slide the connections off the points they join.
          x: {
            field: 'x',
            type: 'quantitative',
            scale: { domain: paddedDomain(rows.map((r) => r.x), xAxis.domainCap) },
          },
          y: {
            field: 'y',
            type: 'quantitative',
            scale: { domain: paddedDomain(rows.map((r) => r.y), yAxis.domainCap) },
          },
          x2: { field: 'x2', type: 'quantitative' },
          y2: { field: 'y2', type: 'quantitative' },
          color: { field: 'series', type: 'nominal' },
          // Dash and opacity reach the rule renderer only through encodings
          // bound to data fields — see CONNECTION_DASH.
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
  return {
    // No trendline: a regression line on price-vs-benchmark scatter would
    // imply a relationship claim the site doesn't make.
    mark: { type: 'point', tooltip: true, trendline: false },
    data: rows,
    legend: { position: 'top', maxRows: 2 },
    encoding: {
      // The engine skips its nice/zero adjustments whenever an explicit
      // domain is set, so paddedDomain (which anchors at 0) is the whole
      // story for both scales.
      x: {
        field: 'x',
        type: 'quantitative',
        title: xAxis.axisTitle,
        axis: { title: xAxis.axisTitle },
        scale: { domain: paddedDomain(rows.map((r) => r.x), xAxis.domainCap) },
      },
      y: {
        field: 'y',
        type: 'quantitative',
        title: yAxis.axisTitle,
        axis: { title: yAxis.axisTitle },
        scale: { domain: paddedDomain(rows.map((r) => r.y), yAxis.domainCap) },
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
        provider,
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
