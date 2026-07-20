import {
  axisScale,
  connectionSegments,
  providerColor,
  scaleFraction,
  scaledAxisTitle,
  scaleTicks,
} from '../lib/graph.ts'
import type {
  AxisOption,
  AxisScale,
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

/**
 * Percentage offset for a value along a scale, clamped to the plot area.
 * A domain that somehow collapses would otherwise emit NaN into a style
 * attribute, which React happily renders and the browser silently drops.
 */
function percentOf(scale: AxisScale, value: number): number {
  const fraction = scaleFraction(scale, value)
  if (!Number.isFinite(fraction)) return 0
  return Math.min(100, Math.max(0, fraction * 100))
}

/** Compact, locale-independent labels keep server and client markup identical. */
function formatValue(value: number): string {
  if (value === 0) return '0'
  if (Math.abs(value) >= 100) return String(Math.round(value))
  if (Math.abs(value) >= 10) return value.toFixed(1).replace(/\.0$/, '')
  if (Math.abs(value) >= 1) return value.toFixed(2).replace(/\.?0+$/, '')
  return value.toFixed(3).replace(/\.?0+$/, '')
}

function pointName(row: GraphRow, xTitle: string, yTitle: string): string {
  return `${row.model}, ${row.provider}. ${xTitle}: ${formatValue(row.x)}. ${yTitle}: ${formatValue(row.y)}.`
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
  const xScale = axisScale(rows.map((row) => row.x), xAxis.domainCap)
  const yScale = axisScale(rows.map((row) => row.y), yAxis.domainCap)
  const xTitle = scaledAxisTitle(xAxis, xScale)
  const yTitle = scaledAxisTitle(yAxis, yScale)
  const xTicks = scaleTicks(xScale, TICK_COUNT)
  const yTicks = scaleTicks(yScale, TICK_COUNT)
  const providers = [...new Set(rows.map((row) => row.provider))]
  const segments = connections === 'off' ? [] : connectionSegments(rows)
  const xPercent = (value: number) => percentOf(xScale, value)
  const yPercent = (value: number) => 100 - percentOf(yScale, value)
  // A cropped axis is only honest if the reader is told: without this a
  // baseline of 70% reads exactly like a baseline of 0 (issue #81).
  const cropped = [
    !xScale.zeroBased ? xTitle : null,
    !yScale.zeroBased ? yTitle : null,
  ].filter((title): title is string => title !== null)

  return (
    <figure
      aria-label={`${xTitle} compared with ${yTitle}`}
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
          // No `title` alongside the aria-label: the browser would paint its
          // own tooltip on top of the styled detail panel (issue #81). The
          // accessible name still carries the same text.
          const name = pointName(row, xTitle, yTitle)
          return (
            <button
              key={row.model}
              type="button"
              aria-label={name}
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
        {xTitle}
      </div>
      <div aria-hidden="true" className="absolute bottom-14 left-0 top-14 flex w-4 items-center justify-center">
        <span className="whitespace-nowrap text-xs font-medium text-fg-secondary [writing-mode:vertical-rl] rotate-180">
          {yTitle}
        </span>
      </div>

      {cropped.length > 0 && (
        <p className="absolute inset-x-14 top-6 text-[11px] text-fg-muted sm:left-16">
          Zoomed in to the data:{' '}
          {cropped.map((title, index) => (
            <span key={title}>
              {index > 0 ? ' and ' : ''}
              {title} starts at{' '}
              <span className="tabular-nums">
                {formatValue((title === xTitle ? xScale : yScale).domain[0])}
              </span>
            </span>
          ))}
          , not zero.
        </p>
      )}
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
  // Same scale decision as the plot, so the spoken values match the labels.
  const xTitle = scaledAxisTitle(xAxis, axisScale(rows.map((row) => row.x), xAxis.domainCap))
  const yTitle = scaledAxisTitle(yAxis, axisScale(rows.map((row) => row.y), yAxis.domainCap))
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
            aria-label={`Select ${pointName(row, xTitle, yTitle)}`}
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
