import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  axisScale,
  connectionSegments,
  providerColor,
  scaleFraction,
  scaledAxisTitle,
  scaleTicks,
  shortModelLabel,
} from '../lib/graph.ts'
import type {
  AxisOption,
  AxisScale,
  GraphConnections,
  GraphRow,
} from '../lib/graph.ts'
import { placeLabels } from '../lib/graphLabels.ts'

interface GraphScatterProps {
  rows: GraphRow[]
  xAxis: AxisOption
  yAxis: AxisOption
  connections: GraphConnections
  /** The pinned point, owned by the page so axis changes can clear it. */
  selected: GraphRow | null
  onPointSelected: (row: GraphRow) => void
  onDismiss: () => void
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

/** ISO date as readable text, without pulling in a locale-sensitive formatter. */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  const name = MONTHS[month - 1]
  if (!name || !day || !year) return iso
  return `${name} ${day}, ${year}`
}

function pointName(row: GraphRow, xTitle: string, yTitle: string): string {
  return `${row.model}, ${row.provider}. ${xTitle}: ${formatValue(row.x)}. ${yTitle}: ${formatValue(row.y)}.`
}

interface PointCardProps {
  row: GraphRow
  xTitle: string
  yTitle: string
  /** Point position in plot percent, used to pick the side the card opens on. */
  xPct: number
  yPct: number
  pinned: boolean
  onDismiss: () => void
}

/**
 * The detail card that opens beside a point — on hover as a preview, on
 * click/tap pinned until dismissed. It flips to whichever side of the point
 * has room: right half of the plot opens leftward, bottom half opens upward,
 * so the card never runs off the plot area.
 */
function PointCard({ row, xTitle, yTitle, xPct, yPct, pinned, onDismiss }: PointCardProps) {
  const horizontal = xPct > 55 ? 'right-full mr-3' : 'left-full ml-3'
  const vertical = yPct > 60 ? 'bottom-0' : yPct < 25 ? 'top-0' : 'top-1/2 -translate-y-1/2'
  return (
    <div
      role={pinned ? 'dialog' : undefined}
      aria-label={pinned ? `${row.model} details` : undefined}
      className={`absolute ${horizontal} ${vertical} z-20 w-56 rounded-lg border border-line bg-surface-raised p-3 text-left shadow-lg`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-medium text-fg">
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: providerColor(row.provider) }}
          />
          {row.model}
        </span>
        {pinned && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close details"
            className="-mr-1 -mt-1 rounded p-1 leading-none text-fg-muted transition-colors duration-150 hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            ✕
          </button>
        )}
      </div>
      <p className="mt-0.5 text-xs text-fg-muted">{row.provider}</p>
      <dl className="mt-2 space-y-1 text-xs">
        <div>
          <dt className="text-fg-muted">{xTitle}</dt>
          <dd className="font-medium tabular-nums text-fg">{formatValue(row.x)}</dd>
        </div>
        <div>
          <dt className="text-fg-muted">{yTitle}</dt>
          <dd className="font-medium tabular-nums text-fg">{formatValue(row.y)}</dd>
        </div>
        {row.releaseDate && (
          <div>
            <dt className="text-fg-muted">Released</dt>
            <dd className="font-medium text-fg">{formatDate(row.releaseDate)}</dd>
          </div>
        )}
      </dl>
      <Link
        to={`/models/${row.modelId}`}
        className="mt-2 inline-block text-xs font-medium text-accent-deep underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Model details →
      </Link>
    </div>
  )
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
  selected,
  onPointSelected,
  onDismiss,
}: GraphScatterProps) {
  // Hover preview state lives on the wrapper div, not CSS: the card holds a
  // link, so it must stay open while the pointer crosses the gap into it —
  // mouseenter/leave on a shared wrapper covers point and card together.
  const [hovered, setHovered] = useState<string | null>(null)

  // Escape dismisses the pinned card from anywhere on the page.
  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, onDismiss])

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

  // Always-visible short labels, collision-resolved in the same percent space
  // the points are positioned in. Pure and deterministic, so SSR markup
  // matches the client render exactly.
  const labels = placeLabels(
    rows.map((row) => ({
      id: row.model,
      text: shortModelLabel(row.model, row.provider),
      x: xPercent(row.x),
      y: yPercent(row.y),
    })),
  )
  const leaders = labels.filter((label) => label.leader)

  return (
    <figure
      aria-label={`${xTitle} compared with ${yTitle}`}
      className="relative h-full min-h-96 w-full text-fg-muted"
    >
      <figcaption className="sr-only">
        Interactive scatter plot. Select a model point to pin its details beside it.
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

        {leaders.length > 0 && (
          <svg
            aria-hidden="true"
            data-testid="label-leaders"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            {leaders.map((label) => {
              const row = rows.find((r) => r.model === label.id)!
              return (
                <line
                  key={`leader-${label.id}`}
                  x1={xPercent(row.x)}
                  y1={yPercent(row.y)}
                  x2={label.anchorX}
                  y2={label.anchorY}
                  className="stroke-line-strong"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              )
            })}
          </svg>
        )}

        {labels.map((label) => (
          <span
            aria-hidden="true"
            key={`label-${label.id}`}
            className="pointer-events-none absolute z-0 hidden whitespace-nowrap text-[10px] leading-tight text-fg-secondary sm:block"
            style={{ left: `${label.left}%`, top: `${label.top}%` }}
          >
            {label.text}
          </span>
        ))}

        {rows.map((row) => {
          // No `title` alongside the aria-label: the browser would paint its
          // own tooltip on top of the styled detail panel (issue #81). The
          // accessible name still carries the same text.
          const name = pointName(row, xTitle, yTitle)
          const isPinned = selected?.model === row.model
          const showCard = isPinned || hovered === row.model
          const xPct = xPercent(row.x)
          const yPct = yPercent(row.y)
          return (
            // The card holds a link, so it cannot live inside the button —
            // interactive content inside a button is invalid HTML. Point and
            // card are siblings in a wrapper that owns the hover state.
            <div
              key={row.model}
              className={`absolute h-11 w-11 -translate-x-1/2 -translate-y-1/2 ${showCard ? 'z-30' : 'z-10'}`}
              style={{ left: `${xPct}%`, top: `${yPct}%` }}
              onMouseEnter={() => setHovered(row.model)}
              onMouseLeave={(e) => {
                // A leave whose destination is still inside the wrapper is
                // the pointer crossing from the point into the card (or the
                // reverse) — the card must survive that trip or its link
                // could never be clicked. currentTarget can be gone when the
                // event lands on a wrapper React has already torn down.
                const next = e.relatedTarget instanceof Node ? e.relatedTarget : null
                if (!e.currentTarget?.contains(next)) setHovered(null)
              }}
              // Focus-driven preview mirrors hover, but only closes when
              // focus leaves the wrapper entirely — tabbing from the point
              // into the card's link must not tear the card down mid-move.
              onFocus={() => setHovered(row.model)}
              onBlur={(e) => {
                const next = e.relatedTarget instanceof Node ? e.relatedTarget : null
                if (!e.currentTarget?.contains(next)) setHovered(null)
              }}
            >
              <button
                type="button"
                aria-label={name}
                aria-expanded={isPinned}
                onClick={() => (isPinned ? onDismiss() : onPointSelected(row))}
                className="group flex h-11 w-11 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised"
              >
                <span
                  aria-hidden="true"
                  className="h-3 w-3 rounded-full border border-line-strong ring-2 ring-surface-raised transition-transform duration-150 group-hover:scale-125 group-focus-visible:scale-125"
                  style={{ backgroundColor: providerColor(row.provider) }}
                />
              </button>
              {showCard && (
                <PointCard
                  row={row}
                  xTitle={xTitle}
                  yTitle={yTitle}
                  xPct={xPct}
                  yPct={yPct}
                  pinned={isPinned}
                  onDismiss={onDismiss}
                />
              )}
            </div>
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

      {/* Spoken confirmation of the pinned model for assistive tech; the
          visual card floats out of DOM reading order beside its point. */}
      <div aria-live="polite" className="sr-only">
        {selected ? `Pinned ${pointName(selected, xTitle, yTitle)}` : ''}
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
