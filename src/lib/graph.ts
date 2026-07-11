import type { ChartSpec } from '@opendata-ai/openchart-core'
import { benchmarks, models, providers } from '../data/index.ts'
import type { Model } from '../data/index.ts'

export interface AxisOption {
  id: string
  label: string
  /** Short axis title shown on the chart. */
  axisTitle: string
  getValue: (m: Model) => number | undefined
}

export const axisOptions: AxisOption[] = [
  ...benchmarks.map((b) => ({
    id: b.id,
    label: b.name,
    axisTitle: `${b.name} (%)`,
    getValue: (m: Model) => m.scores[b.id],
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
}

const providerName = new Map(providers.map((p) => [p.id, p.name]))
const providerColorByName = new Map(providers.map((p) => [p.name, p.color]))

/**
 * Brand colors ordered to match openchart's nominal color domain.
 * Verified empirically (headless-browser QA, issue #18): the engine assigns
 * categorical palette entries in FIRST-APPEARANCE order of the color field in
 * the data, not alphabetical order. Feed this to `theme.colors.categorical`.
 */
export function paletteFor(rows: GraphRow[]): string[] {
  const names = [...new Set(rows.map((r) => r.provider))]
  return names.map((n) => providerColorByName.get(n) ?? '#78716c')
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

/** Scatter spec for the chosen axes. Kept here so tests can validate it against the engine. */
export function buildGraphSpec(xAxis: AxisOption, yAxis: AxisOption, rows: GraphRow[]): ChartSpec<GraphRow> {
  return {
    mark: { type: 'point', tooltip: true },
    data: rows,
    encoding: {
      x: { field: 'x', type: 'quantitative', title: xAxis.axisTitle, axis: { title: xAxis.axisTitle } },
      y: { field: 'y', type: 'quantitative', title: yAxis.axisTitle, axis: { title: yAxis.axisTitle } },
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
): { rows: GraphRow[]; excluded: Model[] } {
  const rows: GraphRow[] = []
  const excluded: Model[] = []
  for (const m of models) {
    const x = xAxis.getValue(m)
    const y = yAxis.getValue(m)
    if (x === undefined || y === undefined) {
      excluded.push(m)
    } else {
      rows.push({ model: m.name, provider: providerName.get(m.providerId) ?? m.providerId, x, y })
    }
  }
  return { rows, excluded }
}
