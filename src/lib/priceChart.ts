import type { ChartSpec } from '@opendata-ai/openchart-core'
import { models, providerById } from '../data/index.ts'
import type { Model, ProviderId } from '../data/index.ts'
import { formatCost } from './format.ts'
import { paddedDomain, paletteFor } from './graph.ts'
import type { CostRow } from './pricing.ts'

export interface PriceRow {
  modelId: string
  model: string
  provider: string
  providerId: ProviderId
  inputPrice: number
  outputPrice: number
}

/**
 * One row per priced model for the native price bar chart, sorted by output
 * price descending so the expensive end anchors the left of the chart.
 */
export function buildPriceRows(): { rows: PriceRow[]; excluded: Model[] } {
  const priced = models.filter(
    (m): m is Model & { inputPricePerMTok: number; outputPricePerMTok: number } =>
      m.inputPricePerMTok !== null && m.outputPricePerMTok !== null,
  )
  const excluded = models.filter(
    (m) => m.inputPricePerMTok === null || m.outputPricePerMTok === null,
  )
  priced.sort((a, b) => b.outputPricePerMTok - a.outputPricePerMTok)
  const rows: PriceRow[] = priced.map((m) => ({
    modelId: m.id,
    model: m.name,
    provider: providerById.get(m.providerId)?.name ?? m.providerId,
    providerId: m.providerId,
    inputPrice: m.inputPricePerMTok,
    outputPrice: m.outputPricePerMTok,
  }))
  return { rows, excluded }
}

/**
 * Dollar tick values for the price chart's y axis: whole-dollar steps from
 * zero up past the priciest bar, sized so the axis lands on 4-6 round ticks
 * ($10/$20/… for frontier prices, finer steps if prices ever drop).
 */
export function priceTicks(maxPrice: number): number[] {
  const targetSteps = 5
  const rawStep = maxPrice / targetSteps
  // Round the step to 1/2/5 × 10^n, the usual "nice number" ladder.
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(rawStep, 0.1)))
  const residual = rawStep / magnitude
  const step = (residual > 5 ? 10 : residual > 2 ? 5 : residual > 1 ? 2 : 1) * magnitude
  const top = Math.ceil(maxPrice / step) * step
  const ticks: number[] = []
  for (let v = 0; v <= top; v += step) ticks.push(v)
  return ticks
}

export interface TotalCostRow extends Record<string, unknown> {
  model: string
  provider: string
  cost: number
  /** Preformatted for the tooltip — d3 number formats mangle sub-cent values. */
  costLabel: string
}

/** Chart rows from calculator results, cheapest model first. */
export function buildTotalCostRows(costRows: CostRow[]): TotalCostRow[] {
  return [...costRows]
    .sort((a, b) => a.totalCost - b.totalCost)
    .map((r) => ({
      model: r.model,
      provider: r.provider,
      cost: r.totalCost,
      costLabel: formatCost(r.totalCost),
    }))
}

/** Horizontal bars of total conversation cost, brand-colored by provider. */
export function buildTotalCostSpec(rows: TotalCostRow[]): ChartSpec<TotalCostRow> {
  return {
    mark: { type: 'bar', orient: 'horizontal', tooltip: true },
    data: rows,
    legend: { position: 'top', maxRows: 2 },
    encoding: {
      y: { field: 'model', type: 'nominal', title: 'Model', sort: null },
      x: {
        field: 'cost',
        type: 'quantitative',
        title: 'Total cost (USD)',
        axis: { title: 'Total cost (USD)' },
        scale: { domain: paddedDomain(rows.map((r) => r.cost)) },
      },
      color: { field: 'provider', type: 'nominal', title: 'Company' },
      tooltip: [
        { field: 'model', type: 'nominal', title: 'Model' },
        { field: 'costLabel', type: 'nominal', title: 'Total cost' },
      ],
    },
    theme: { colors: { categorical: paletteFor(rows) } },
    watermark: false,
    responsive: true,
  }
}
