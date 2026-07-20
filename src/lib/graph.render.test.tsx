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
import type { GraphRow } from './graph.ts'

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

function renderGraphChart(connections: 'off' | 'provider' | 'family') {
  const { rows } = buildGraphRows(x, y, connections)
  const spec = buildGraphSpec(x, y, rows, connections)
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
