import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { GraphModelSelector, GraphScatter } from './GraphScatter.tsx'
import type { AxisOption, GraphRow } from '../lib/graph.ts'

const xAxis: AxisOption = {
  id: 'price',
  label: 'Price',
  axisTitle: 'Price ($)',
  getValue: () => undefined,
}
const yAxis: AxisOption = {
  id: 'score',
  label: 'Score',
  axisTitle: 'Score (%)',
  getValue: () => undefined,
  domainCap: 100,
}
const rows: GraphRow[] = [
  { model: 'Alpha', provider: 'OpenAI', family: 'Alpha', series: 'OpenAI', x: 2, y: 80 },
  { model: 'Beta', provider: 'OpenAI', family: 'Beta', series: 'OpenAI', x: 4, y: 90 },
  { model: 'Gamma', provider: 'Google', family: 'Gamma', series: 'Google', x: 3, y: 85 },
]

function renderScatter(overrides: Partial<React.ComponentProps<typeof GraphScatter>> = {}) {
  const onPointSelected = vi.fn()
  const result = render(
    <GraphScatter
      rows={rows}
      xAxis={xAxis}
      yAxis={yAxis}
      connections="provider"
      onPointSelected={onPointSelected}
      {...overrides}
    />,
  )
  return { onPointSelected, ...result }
}

test('renders named model points with axis values', () => {
  renderScatter()
  expect(screen.getByRole('figure', { name: /price.*score/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /alpha, openai.*price.*2.*score.*80/i })).toBeInTheDocument()
  expect(screen.getAllByRole('button')).toHaveLength(rows.length)
})

test('selects a point by click, Enter, and Space', async () => {
  const user = userEvent.setup()
  const { onPointSelected } = renderScatter()
  const point = screen.getByRole('button', { name: /alpha, openai/i })

  await user.click(point)
  point.focus()
  await user.keyboard('{Enter}')
  await user.keyboard(' ')

  expect(onPointSelected).toHaveBeenCalledTimes(3)
  expect(onPointSelected).toHaveBeenLastCalledWith(rows[0])
})

test('draws decorative connections only when enabled', () => {
  const { container, rerender } = renderScatter()
  expect(container.querySelectorAll('line')).toHaveLength(1)
  expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')

  rerender(
    <GraphScatter
      rows={rows}
      xAxis={xAxis}
      yAxis={yAxis}
      connections="off"
      onPointSelected={() => {}}
    />,
  )
  expect(container.querySelector('svg')).not.toBeInTheDocument()
})

test('renders finite positions for a degenerate zero-value domain', () => {
  const zero = { ...rows[0], x: 0, y: 0 }
  const { container } = renderScatter({ rows: [zero], connections: 'off' })
  const point = screen.getByRole('button', { name: /alpha, openai/i })
  expect(point.style.left).toBe('0%')
  expect(point.style.top).toBe('100%')
  expect(container.innerHTML).not.toMatch(/NaN|Infinity/)
})

/** Percent value the component wrote into an inline style, as a number. */
const pct = (value: string) => Number(value.replace('%', ''))

test('points project onto a cropped linear domain, not a zero-anchored one', () => {
  // The scores sit in an 80-90 band; a zero-anchored axis put them all in the
  // top 10% of the plot and hid the differences (issue #81).
  renderScatter({ connections: 'off' })
  const top = (name: RegExp) => pct(screen.getByRole('button', { name }).style.top)
  const alpha = top(/alpha/i) // y = 80, the lowest score
  const beta = top(/beta/i) // y = 90, the highest
  expect(alpha).toBeGreaterThan(beta) // higher score sits higher on the plot
  // A 0-100 domain would separate them by only 10% of the plot height.
  expect(alpha - beta).toBeGreaterThan(50)
  // Every point stays inside the plot area.
  for (const point of screen.getAllByRole('button')) {
    expect(pct(point.style.top)).toBeGreaterThanOrEqual(0)
    expect(pct(point.style.top)).toBeLessThanOrEqual(100)
  }
})

test('a wide-ratio axis projects points and ticks logarithmically', () => {
  // 0.5 to 50 is a 100x spread, past the log threshold.
  const wide: GraphRow[] = [
    { model: 'Cheap', provider: 'OpenAI', family: 'Cheap', series: 'OpenAI', x: 0.5, y: 80 },
    { model: 'Mid', provider: 'OpenAI', family: 'Mid', series: 'OpenAI', x: 5, y: 85 },
    { model: 'Dear', provider: 'OpenAI', family: 'Dear', series: 'OpenAI', x: 50, y: 90 },
  ]
  renderScatter({ rows: wide, connections: 'off' })
  const left = (name: RegExp) => pct(screen.getByRole('button', { name }).style.left)
  // Equal 10x ratios, so equal spacing — the property a linear axis lacks.
  expect(left(/mid,/i) - left(/cheap/i)).toBeCloseTo(left(/dear/i) - left(/mid,/i), 4)

  // The axis title has to say it's a log scale or the reader is misled. It
  // appears on the axis and again in the cropped-baseline notice.
  expect(screen.getAllByText(/price \(\$, log scale\)/i).length).toBeGreaterThan(0)
  // And the accessible name of a point uses the same annotated title.
  expect(screen.getByRole('button', { name: /cheap.*log scale/i })).toBeInTheDocument()
})

test('a cropped axis is called out so a reader cannot assume a zero baseline', () => {
  renderScatter({ connections: 'off' })
  const notice = screen.getByText(/zoomed in to the data/i)
  expect(notice).toHaveTextContent(/score \(%\) starts at/i)
  expect(notice).toHaveTextContent(/not zero/i)
})

test('an axis that genuinely starts at zero gets no cropped-baseline notice', () => {
  const fromZero: GraphRow[] = [
    { model: 'Alpha', provider: 'OpenAI', family: 'Alpha', series: 'OpenAI', x: 0, y: 0 },
    { model: 'Beta', provider: 'OpenAI', family: 'Beta', series: 'OpenAI', x: 4, y: 90 },
  ]
  renderScatter({ rows: fromZero, connections: 'off' })
  expect(screen.queryByText(/zoomed in to the data/i)).not.toBeInTheDocument()
})

test('points carry an accessible name but no duplicate native tooltip', () => {
  renderScatter({ connections: 'off' })
  for (const point of screen.getAllByRole('button')) {
    // A `title` here would paint a browser tooltip over the styled UI (#81).
    expect(point).not.toHaveAttribute('title')
    expect(point.getAttribute('aria-label')).toMatch(/price.*score/i)
  }
})

test('uses semantic theme classes without reading browser theme state', () => {
  const { container } = renderScatter()
  document.documentElement.classList.add('dark')
  expect(container.querySelector('figure')).toHaveClass('text-fg-muted')
  expect(screen.getAllByRole('button')).toHaveLength(rows.length)
})

test('every overlapping model is independently selectable from the compact fallback', async () => {
  const user = userEvent.setup()
  const onPointSelected = vi.fn()
  const overlappingRows = rows.map((row) => ({ ...row, x: 2, y: 80 }))
  render(
    <GraphModelSelector
      rows={overlappingRows}
      xAxis={xAxis}
      yAxis={yAxis}
      onPointSelected={onPointSelected}
    />,
  )

  await user.click(screen.getByText(/can’t tap a point.*choose a model/i))
  for (const row of overlappingRows) {
    const model = screen.getByRole('button', { name: new RegExp(`select ${row.model}`, 'i') })
    expect(model).toHaveClass('min-h-11')
    await user.click(model)
    expect(onPointSelected).toHaveBeenLastCalledWith(row)
  }
  expect(onPointSelected).toHaveBeenCalledTimes(overlappingRows.length)
})

test('the model fallback supports keyboard selection through the same handler', async () => {
  const user = userEvent.setup()
  const onPointSelected = vi.fn()
  render(
    <GraphModelSelector
      rows={rows}
      xAxis={xAxis}
      yAxis={yAxis}
      onPointSelected={onPointSelected}
    />,
  )

  await user.click(screen.getByText(/can’t tap a point.*choose a model/i))
  const beta = screen.getByRole('button', { name: /select beta, openai/i })
  beta.focus()
  await user.keyboard('{Enter}')
  await user.keyboard(' ')

  expect(onPointSelected).toHaveBeenCalledTimes(2)
  expect(onPointSelected).toHaveBeenLastCalledWith(rows[1])
})
