import type { ChartSpec } from '@opendata-ai/openchart-core'
import { models, providerById } from '../data/index.ts'
import type { Model } from '../data/index.ts'
import { formatCost } from './format.ts'
import { paddedDomain, paletteFor } from './graph.ts'
import type { CostRow } from './pricing.ts'

export interface PriceRow extends Record<string, unknown> {
  model: string
  provider: string
  series: 'Input' | 'Output'
  price: number
}

/** Input bars in a neutral stone, output bars in the site accent. */
const PRICE_SERIES_COLORS = ['#a8a29e', '#0d9488']

/**
 * Long-format rows for the price chart: two per priced model, models sorted
 * by output price descending. The Input row precedes the Output row so the
 * engine's first-appearance color order matches PRICE_SERIES_COLORS.
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
  const rows: PriceRow[] = []
  for (const m of priced) {
    const provider = providerById.get(m.providerId)?.name ?? m.providerId
    rows.push({ model: m.name, provider, series: 'Input', price: m.inputPricePerMTok })
    rows.push({ model: m.name, provider, series: 'Output', price: m.outputPricePerMTok })
  }
  return { rows, excluded }
}

/** Horizontal grouped bars: input and output price side by side per model. */
export function buildPriceSpec(rows: PriceRow[]): ChartSpec<PriceRow> {
  return {
    mark: { type: 'bar', orient: 'horizontal', tooltip: true },
    data: rows,
    legend: { position: 'top' },
    encoding: {
      // Rows are pre-sorted by output price; sort: null keeps that order.
      y: { field: 'model', type: 'nominal', title: 'Model', sort: null },
      x: {
        field: 'price',
        type: 'quantitative',
        title: 'USD per 1M tokens',
        axis: { title: 'USD per 1M tokens' },
        scale: { domain: paddedDomain(rows.map((r) => r.price)) },
        // Grouped (side-by-side) bars, never stacked: the two series share a
        // baseline so input and output prices stay directly comparable.
        stack: null,
      },
      color: { field: 'series', type: 'nominal', title: 'Token type' },
      tooltip: [
        { field: 'model', type: 'nominal', title: 'Model' },
        { field: 'series', type: 'nominal', title: 'Type' },
        { field: 'price', type: 'quantitative', title: '$ per 1M tokens' },
      ],
    },
    theme: { colors: { categorical: PRICE_SERIES_COLORS } },
    watermark: false,
    responsive: true,
  }
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
