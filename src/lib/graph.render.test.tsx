import { render } from '@testing-library/react'
import { Chart } from '@opendata-ai/openchart-react'
import {
  axisOptions,
  buildGraphRows,
  buildGraphSpec,
  connectionSegments,
  providerColor,
  CONNECTION_DASH,
  CONNECTION_OPACITY,
} from './graph.ts'
import type { AxisOption, GraphRow } from './graph.ts'

/**
 * These tests render the real chart engine, because the connection styling
 * is decided INSIDE it: the rule renderer reads its dash and opacity from
 * encoded data fields and ignores the same properties set on the mark
 * definition. A spec-shape assertion would have happily passed while the
 * lines drew solid, so the only honest check is the emitted SVG.
 */

// The engine measures its container, which jsdom does not lay out.
class StubResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  ;(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = StubResizeObserver
  Element.prototype.getBoundingClientRect = () =>
    ({ width: 800, height: 480, top: 0, left: 0, right: 800, bottom: 480, x: 0, y: 0 }) as DOMRect
})

const x = axisOptions.find((o) => o.id === 'price-input')!
const y = axisOptions.find((o) => o.id === 'swe-bench-verified')!

function renderGraphChart(
  connections: 'off' | 'provider' | 'family',
  xAxis: AxisOption = x,
  yAxis: AxisOption = y,
) {
  const { rows } = buildGraphRows(xAxis, yAxis, connections)
  const spec = buildGraphSpec(xAxis, yAxis, rows, connections)
  const { container } = render(
    <div style={{ width: 800, height: 480 }}>
      <Chart<GraphRow> spec={spec as never} darkMode="off" />
    </div>,
  )
  return { container, rows }
}

const ruleLines = (container: HTMLElement) =>
  [...container.querySelectorAll('line.oc-mark-rule')] as SVGLineElement[]

test('connections render as dotted, semi-transparent rule segments', () => {
  const { container } = renderGraphChart('provider')
  const lines = ruleLines(container)
  expect(lines.length).toBeGreaterThan(0)
  for (const line of lines) {
    // Dotted and faded: the points are the data, the lines only a hint.
    expect(line.getAttribute('stroke-dasharray')).toBe(CONNECTION_DASH)
    expect(line.getAttribute('opacity')).toBe(String(CONNECTION_OPACITY))
  }
})

test('each connection is drawn in its provider brand color', () => {
  const { container, rows } = renderGraphChart('provider')
  const expected = new Set(
    connectionSegments(rows).map((s) => providerColor(s.provider).toLowerCase()),
  )
  for (const line of ruleLines(container)) {
    expect(expected.has(line.getAttribute('stroke')!.toLowerCase())).toBe(true)
  }
})

test('turning connections off draws no rule segments at all', () => {
  const { container } = renderGraphChart('off')
  expect(ruleLines(container)).toHaveLength(0)
})

test('family mode draws fewer connections than company mode', () => {
  const { container: byProvider } = renderGraphChart('provider')
  const providerCount = ruleLines(byProvider).length
  const { container: byFamily } = renderGraphChart('family')
  // Families are subsets of companies, so they can only join fewer pairs.
  expect(ruleLines(byFamily).length).toBeLessThan(providerCount)
})

test('the points still render on top of the connections', () => {
  const { container } = renderGraphChart('provider')
  const circles = container.querySelectorAll('circle')
  expect(circles.length).toBeGreaterThan(0)
  const firstRule = container.querySelector('line.oc-mark-rule')!
  const firstCircle = circles[0]
  // DOCUMENT_POSITION_FOLLOWING: the circle comes after the rule, so it paints over it.
  expect(firstRule.compareDocumentPosition(firstCircle) & Node.DOCUMENT_POSITION_FOLLOWING)
    .toBeTruthy()
})

const priceOut = axisOptions.find((o) => o.id === 'price-output')!
const priceIn = axisOptions.find((o) => o.id === 'price-input')!
const gpqa = axisOptions.find((o) => o.id === 'gpqa-diamond')!

/** Numeric tick labels the engine drew on one axis, in document order. */
function axisTicks(container: HTMLElement, axis: 'x' | 'y'): number[] {
  const group = container.querySelector(`g.oc-axis-${axis}`)!
  return [...group.querySelectorAll('text.oc-axis-tick')]
    .map((n) => Number(n.textContent))
    .filter((n) => Number.isFinite(n))
}

const axisTitle = (container: HTMLElement, axis: 'x' | 'y') =>
  container.querySelector(`g.oc-axis-${axis} text.oc-axis-title`)!.textContent

/** Drawn x pixel per plotted x value, read off each point's accessible label. */
function drawnX(container: HTMLElement): Map<number, number> {
  const byValue = new Map<number, number>()
  for (const circle of container.querySelectorAll('circle')) {
    const label = circle.getAttribute('aria-label')
    const match = label?.match(/x=(-?[\d.]+)/)
    if (match) byValue.set(Number(match[1]), Number(circle.getAttribute('cx')))
  }
  return byValue
}

/**
 * A `scale.type` on a spec is only a request — the engine could ignore it the
 * way it ignores strokeDash on a mark def. These assert the geometry it
 * actually drew, which is the only proof the axis is really logarithmic.
 */
test('a wide-ratio axis renders with logarithmic point spacing', () => {
  const { container } = renderGraphChart('off', priceOut, priceIn)
  const byX = drawnX(container)
  for (const value of [5, 10, 25, 50]) expect(byX.has(value)).toBe(true)

  // Equal RATIOS must produce equal pixel gaps: that is what makes log a log.
  const gapHigh = byX.get(50)! - byX.get(25)!
  const gapLow = byX.get(10)! - byX.get(5)!
  expect(gapLow).toBeGreaterThan(0)
  expect(gapHigh).toBeCloseTo(gapLow, 6)
  // On a linear axis the 25-dollar jump would be five times the 5-dollar one,
  // so this is what fails if the log scale is dropped from the spec.
  expect(gapHigh).toBeLessThan(5 * gapLow)
})

test('a logarithmic axis announces itself in the rendered title and ticks', () => {
  const { container } = renderGraphChart('off', priceOut, priceIn)
  expect(axisTitle(container, 'x')).toBe('Output price ($ per 1M tokens, log scale)')
  // Decade ticks, not an even slice of the domain.
  const ticks = axisTicks(container, 'x')
  expect(ticks.length).toBeGreaterThan(1)
  for (const tick of ticks) {
    expect(Math.round(tick / 10 ** Math.floor(Math.log10(tick)))).toBeLessThanOrEqual(5)
  }
})

test('a cropped benchmark axis renders ticks that start well above zero', () => {
  const { container, rows } = renderGraphChart('off', gpqa, priceIn)
  const ticks = axisTicks(container, 'x')
  expect(ticks.length).toBeGreaterThan(1)
  // Issue #81: this axis used to run 0-100 with every point crushed into the
  // top half. The lowest label must now sit near the data instead.
  const lowest = Math.min(...rows.map((r) => r.x))
  expect(Math.min(...ticks)).toBeGreaterThan(lowest / 2)
  expect(ticks).not.toContain(0)
  // Linear ticks stay evenly spaced, so the axis can't be mistaken for a log.
  const spacings = ticks.slice(1).map((tick, i) => tick - ticks[i])
  for (const spacing of spacings) expect(spacing).toBeCloseTo(spacings[0], 6)
  // And a linear axis must not claim a log scale it doesn't have.
  expect(axisTitle(container, 'x')).not.toMatch(/log scale/)
})
