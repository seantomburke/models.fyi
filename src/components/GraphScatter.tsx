import { connectionSegments, paddedDomain, providerColor } from '../lib/graph.ts'
import type {
  AxisOption,
  GraphConnections,
  GraphRow,
} from '../lib/graph.ts'

interface GraphScatterProps {
  rows: GraphRow[]
  xAxis: AxisOption
  yAxis: AxisOption
  connections: GraphConnections
  onPointSelected: (row: GraphRow) => void
}

interface GraphModelSelectorProps {
  rows: GraphRow[]
  xAxis: AxisOption
  yAxis: AxisOption
  onPointSelected: (row: GraphRow) => void
}

const TICK_COUNT = 5

function usableMaximum(values: number[], cap?: number): number {
  const [, maximum] = paddedDomain(values, cap)
  return maximum > 0 && Number.isFinite(maximum) ? maximum : 1
}

function tickValues(maximum: number): number[] {
  return Array.from({ length: TICK_COUNT }, (_, index) => (maximum * index) / (TICK_COUNT - 1))
}

/** Compact, locale-independent labels keep server and client markup identical. */
function formatValue(value: number): string {
  if (value === 0) return '0'
  if (Math.abs(value) >= 100) return String(Math.round(value))
  if (Math.abs(value) >= 10) return value.toFixed(1).replace(/\.0$/, '')
  if (Math.abs(value) >= 1) return value.toFixed(2).replace(/\.?0+$/, '')
  return value.toFixed(3).replace(/\.?0+$/, '')
}

function pointName(row: GraphRow, xAxis: AxisOption, yAxis: AxisOption): string {
  return `${row.model}, ${row.provider}. ${xAxis.axisTitle}: ${formatValue(row.x)}. ${yAxis.axisTitle}: ${formatValue(row.y)}.`
}

/**
 * The Graph page only needs a focused scatter plot, so render that directly
 * instead of making its first interaction wait for the full charting engine.
 * Percentage-based layout is deterministic during SSR and remains responsive
 * without reading browser dimensions during render.
 */
export function GraphScatter({
  rows,
  xAxis,
  yAxis,
  connections,
  onPointSelected,
}: GraphScatterProps) {
  const xMaximum = usableMaximum(rows.map((row) => row.x), xAxis.domainCap)
  const yMaximum = usableMaximum(rows.map((row) => row.y), yAxis.domainCap)
  const xTicks = tickValues(xMaximum)
  const yTicks = tickValues(yMaximum)
  const providers = [...new Set(rows.map((row) => row.provider))]
  const segments = connections === 'off' ? [] : connectionSegments(rows)
  const xPercent = (value: number) => (value / xMaximum) * 100
  const yPercent = (value: number) => 100 - (value / yMaximum) * 100

  return (
    <figure
      aria-label={`${xAxis.axisTitle} compared with ${yAxis.axisTitle}`}
      className="relative h-full min-h-96 w-full text-fg-muted"
    >
      <figcaption className="sr-only">
        Interactive scatter plot. Select a model point to pin its details below the graph.
      </figcaption>

      <div aria-hidden="true" className="absolute inset-x-14 top-0 flex flex-wrap gap-x-4 gap-y-1 text-xs sm:left-16">
        {providers.map((provider) => (
          <span key={provider} className="inline-flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full border border-line-strong"
              style={{ backgroundColor: providerColor(provider) }}
            />
            {provider}
          </span>
        ))}
      </div>

      <div className="absolute inset-x-4 bottom-14 top-14 ml-10 sm:ml-12">
        <div aria-hidden="true" className="absolute inset-0 border-b border-l border-line-strong">
          {xTicks.slice(1).map((tick) => (
            <span
              key={`x-grid-${tick}`}
              className="absolute bottom-0 top-0 border-l border-line"
              style={{ left: `${xPercent(tick)}%` }}
            />
          ))}
          {yTicks.slice(1).map((tick) => (
            <span
              key={`y-grid-${tick}`}
              className="absolute left-0 right-0 border-t border-line"
              style={{ top: `${yPercent(tick)}%` }}
            />
          ))}
        </div>

        {segments.length > 0 && (
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            {segments.map((segment, index) => (
              <line
                key={`${segment.series}-${segment.x}-${segment.y}-${index}`}
                x1={xPercent(segment.x)}
                y1={yPercent(segment.y)}
                x2={xPercent(segment.x2)}
                y2={yPercent(segment.y2)}
                stroke={providerColor(segment.provider)}
                strokeDasharray={segment.dash}
                strokeOpacity={segment.lineOpacity}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
        )}

        {rows.map((row) => {
          const name = pointName(row, xAxis, yAxis)
          return (
            <button
              key={row.model}
              type="button"
              aria-label={name}
              title={name}
              onClick={() => onPointSelected(row)}
              className="group absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised"
              style={{ left: `${xPercent(row.x)}%`, top: `${yPercent(row.y)}%` }}
            >
              <span
                aria-hidden="true"
                className="h-3 w-3 rounded-full border border-line-strong ring-2 ring-surface-raised transition-transform duration-150 group-hover:scale-125 group-focus-visible:scale-125"
                style={{ backgroundColor: providerColor(row.provider) }}
              />
            </button>
          )
        })}

        {xTicks.map((tick) => (
          <span
            aria-hidden="true"
            key={`x-tick-${tick}`}
            className="absolute top-full mt-2 -translate-x-1/2 text-[11px] tabular-nums"
            style={{ left: `${xPercent(tick)}%` }}
          >
            {formatValue(tick)}
          </span>
        ))}
        {yTicks.map((tick) => (
          <span
            aria-hidden="true"
            key={`y-tick-${tick}`}
            className="absolute right-full mr-2 -translate-y-1/2 text-[11px] tabular-nums"
            style={{ top: `${yPercent(tick)}%` }}
          >
            {formatValue(tick)}
          </span>
        ))}
      </div>

      <div aria-hidden="true" className="absolute inset-x-14 bottom-1 text-center text-xs font-medium text-fg-secondary sm:left-16">
        {xAxis.axisTitle}
      </div>
      <div aria-hidden="true" className="absolute bottom-14 left-0 top-14 flex w-4 items-center justify-center">
        <span className="whitespace-nowrap text-xs font-medium text-fg-secondary [writing-mode:vertical-rl] rotate-180">
          {yAxis.axisTitle}
        </span>
      </div>
    </figure>
  )
}

/**
 * Collision-safe companion to the plotted points. Dense marks stay at their
 * exact coordinates, while every model remains independently reachable from
 * a compact disclosure with full-size native controls.
 */
export function GraphModelSelector({
  rows,
  xAxis,
  yAxis,
  onPointSelected,
}: GraphModelSelectorProps) {
  return (
    <details className="mt-2 border-t border-line pt-2">
      <summary className="flex min-h-11 cursor-pointer items-center rounded px-2 text-sm font-medium text-fg-secondary transition-colors duration-150 hover:bg-black/[0.04] hover:text-fg dark:hover:bg-white/[0.04]">
        Can’t tap a point? Choose a model
      </summary>
      <div className="grid gap-1 pt-2 sm:grid-cols-2" aria-label="Models on this graph">
        {rows.map((row) => (
          <button
            key={row.model}
            type="button"
            aria-label={`Select ${pointName(row, xAxis, yAxis)}`}
            onClick={() => onPointSelected(row)}
            className="flex min-h-11 items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-fg-secondary transition-colors duration-150 hover:bg-black/[0.04] hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:hover:bg-white/[0.04]"
          >
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 shrink-0 rounded-full border border-line-strong"
              style={{ backgroundColor: providerColor(row.provider) }}
            />
            <span className="min-w-0">
              <span className="block truncate font-medium text-fg">{row.model}</span>
              <span className="block truncate text-xs text-fg-muted">{row.provider}</span>
            </span>
          </button>
        ))}
      </div>
    </details>
  )
}
