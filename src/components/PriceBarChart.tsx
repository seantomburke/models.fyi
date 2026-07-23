import { useEffect, useRef, useState } from 'react'
import { ProviderLogo } from './ProviderLogo.tsx'
import { priceTicks } from '../lib/priceChart.ts'
import type { PriceRow } from '../lib/priceChart.ts'

/** Input bars in a neutral stone, output bars in the site accent. */
const INPUT_COLOR = '#a8a29e'
const OUTPUT_COLOR = '#0d9488'

/** Whole dollars drop their cents ($50); fractional rates keep them ($1.25, $0.20). */
function formatPrice(price: number): string {
  return Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`
}

/**
 * Native vertical bar chart of per-token prices: one slot per model along the
 * x axis with its input and output rates as side-by-side bars, dollars on the
 * y axis, and the provider's logo capping each slot (issue #93). Same recipe
 * as GraphScatter: percent-positioned HTML/SVG styled by design tokens, so
 * dark mode and SSR come for free and no chart library is needed.
 *
 * The bars are decorative rendering of the sr-only table below the chart;
 * that table, not the aria-labels on 15 bars, is the screen-reader path.
 */
export function PriceBars({ rows }: { rows: PriceRow[] }) {
  const maxPrice = Math.max(...rows.map((r) => r.outputPrice), 1)
  const ticks = priceTicks(maxPrice)
  const top = ticks[ticks.length - 1]
  const heightPercent = (price: number) => (price / top) * 100

  return (
    <figure aria-label="Input and output price per million tokens, by model">
      <div aria-hidden="true" className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: INPUT_COLOR }} />
          Input
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: OUTPUT_COLOR }} />
          Output
        </span>
      </div>

      {/* The chart scrolls sideways on narrow screens instead of crushing
          fifteen slots into a phone width. */}
      <div className="overflow-x-auto">
        <div className="min-w-[52rem]" data-testid="price-bar-chart">
          <div className="mt-3 flex" aria-hidden="true">
            {/* Y axis: dollar ticks, top down. */}
            <div className="relative w-10 shrink-0 text-right text-xs tabular-nums text-fg-muted">
              {ticks.map((tick) => (
                <span
                  key={`tick-${tick}`}
                  className="absolute right-2 -translate-y-1/2"
                  style={{ top: `${100 - heightPercent(tick)}%` }}
                >
                  {formatPrice(tick)}
                </span>
              ))}
            </div>

            <div className="relative h-72 flex-1 border-b border-l border-line-strong">
              {/* Gridlines at each dollar tick. */}
              {ticks.slice(1).map((tick) => (
                <span
                  key={`grid-${tick}`}
                  className="absolute left-0 right-0 border-t border-line"
                  style={{ top: `${100 - heightPercent(tick)}%` }}
                />
              ))}

              <div className="absolute inset-0 flex items-end justify-around gap-1 px-1">
                {rows.map((row) => (
                  <div
                    key={row.modelId}
                    className="relative flex h-full w-full max-w-10 items-end justify-center gap-px"
                    title={`${row.model}: input ${formatPrice(row.inputPrice)}, output ${formatPrice(row.outputPrice)} per 1M tokens`}
                  >
                    {/* Logo rides the taller (output) bar. */}
                    <span
                      className="absolute left-1/2 -translate-x-1/2 text-fg-secondary"
                      style={{ bottom: `calc(${heightPercent(row.outputPrice)}% + 4px)` }}
                    >
                      <ProviderLogo providerId={row.providerId} size={14} />
                    </span>
                    <span
                      className="w-1/2 rounded-t-sm"
                      style={{ height: `${heightPercent(row.inputPrice)}%`, backgroundColor: INPUT_COLOR }}
                    />
                    <span
                      className="w-1/2 rounded-t-sm"
                      style={{ height: `${heightPercent(row.outputPrice)}%`, backgroundColor: OUTPUT_COLOR }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* X axis: model names under their slots, angled to fit. */}
          <div className="ml-10 flex justify-around gap-1 px-1" aria-hidden="true">
            {rows.map((row) => (
              <span
                key={`label-${row.modelId}`}
                className="h-20 w-full max-w-10 overflow-visible text-[10px] leading-tight text-fg-secondary"
              >
                <span className="block origin-top-left translate-x-1/2 rotate-45 whitespace-nowrap">
                  {row.model}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <figcaption className="sr-only">
        <table>
          <caption>USD per one million tokens, by model</caption>
          <thead>
            <tr>
              <th scope="col">Model</th>
              <th scope="col">Company</th>
              <th scope="col">Input price</th>
              <th scope="col">Output price</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`sr-${row.modelId}`}>
                <th scope="row">{row.model}</th>
                <td>{row.provider}</td>
                <td>{formatPrice(row.inputPrice)}</td>
                <td>{formatPrice(row.outputPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  )
}

/**
 * Defers the bars until the chart scrolls near the viewport, mirroring
 * ThemeAwareChart's gating: IntersectionObserver with a 200px margin and an
 * always-render fallback where the API is missing (SSR, jsdom), so the chart
 * can never get stuck hidden (see the scroll-gate trap, a4bddf0).
 */
export function PriceBarChart({ rows }: { rows: PriceRow[] }) {
  const [visible, setVisible] = useState(false)
  const placeholderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (visible) return
    const placeholder = placeholderRef.current
    if (typeof IntersectionObserver === 'undefined' || !placeholder) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect()
          setVisible(true)
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(placeholder)
    return () => observer.disconnect()
  }, [visible])

  if (!visible) {
    return (
      <div
        ref={placeholderRef}
        role="status"
        aria-label="Price chart not loaded"
        className="flex min-h-72 items-center justify-center text-sm text-fg-muted"
      >
        Chart ready to load.
      </div>
    )
  }

  return <PriceBars rows={rows} />
}
