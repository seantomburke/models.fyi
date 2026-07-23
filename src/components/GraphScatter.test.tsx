import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
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
  { model: 'Alpha', modelId: 'alpha', provider: 'OpenAI', releaseDate: '2026-03-15', family: 'Alpha', series: 'OpenAI', x: 2, y: 80 },
  { model: 'Beta', modelId: 'beta', provider: 'OpenAI', family: 'Beta', series: 'OpenAI', x: 4, y: 90 },
  { model: 'Gamma', modelId: 'gamma', provider: 'Google', family: 'Gamma', series: 'Google', x: 3, y: 85 },
]

function renderScatter(overrides: Partial<React.ComponentProps<typeof GraphScatter>> = {}) {
  const onPointSelected = vi.fn()
  const onDismiss = vi.fn()
  const result = render(
    <MemoryRouter>
      <GraphScatter
        rows={rows}
        xAxis={xAxis}
        yAxis={yAxis}
        connections="provider"
        selected={null}
        onPointSelected={onPointSelected}
        onDismiss={onDismiss}
        {...overrides}
      />
    </MemoryRouter>,
  )
  return { onPointSelected, onDismiss, ...result }
}

test('renders named model points with axis values', () => {
  renderScatter()
  expect(screen.getByRole('figure', { name: /price.*score/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /alpha, openai.*price.*2.*score.*80/i })).toBeInTheDocument()
  expect(screen.getAllByRole('button')).toHaveLength(rows.length)
})

test('every point shows an always-visible short label', () => {
  const { container } = renderScatter()
  // Labels are decorative duplicates of the accessible point names.
  const labels = [...container.querySelectorAll('span.pointer-events-none.absolute')]
    .map((el) => el.textContent)
  for (const row of rows) {
    expect(labels).toContain(row.model)
  }
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

test('hovering a point opens a rich card with values, date, and a details link', async () => {
  const user = userEvent.setup()
  renderScatter({ connections: 'off' })
  await user.hover(screen.getByRole('button', { name: /alpha, openai/i }))

  const card = screen.getByRole('link', { name: /model details/i }).parentElement!
  expect(within(card).getByText('Alpha')).toBeInTheDocument()
  expect(within(card).getByText('OpenAI')).toBeInTheDocument()
  expect(within(card).getByText('Price ($)')).toBeInTheDocument()
  expect(within(card).getByText('2')).toBeInTheDocument()
  expect(within(card).getByText('Score (%)')).toBeInTheDocument()
  expect(within(card).getByText('80')).toBeInTheDocument()
  expect(within(card).getByText('Mar 15, 2026')).toBeInTheDocument()
  const link = within(card).getByRole('link', { name: /model details/i })
  expect(link).toHaveAttribute('href', '/models/alpha')
  // Not pinned: a hover preview has no close button.
  expect(within(card).queryByRole('button', { name: /close details/i })).not.toBeInTheDocument()
})

test('a model without a release date omits the Released row gracefully', async () => {
  const user = userEvent.setup()
  renderScatter({ connections: 'off' })
  await user.hover(screen.getByRole('button', { name: /beta, openai/i }))
  expect(screen.queryByText('Released')).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: /model details/i })).toHaveAttribute('href', '/models/beta')
})

test('the card stays open while the pointer moves from the point into it', async () => {
  // user-event models this pointer trip as leaving to the window, which no
  // real browser does for a move within one wrapper, so drive the exact
  // boundary event: a mouseleave whose destination is the card's link.
  const user = userEvent.setup()
  renderScatter({ connections: 'off' })
  const point = screen.getByRole('button', { name: /alpha, openai/i })
  await user.hover(point)
  const link = screen.getByRole('link', { name: /model details/i })
  fireEvent.mouseLeave(point.parentElement!, { relatedTarget: link })
  expect(screen.getByRole('link', { name: /model details/i })).toBeInTheDocument()
  // Leaving the wrapper for elsewhere really does close the preview.
  fireEvent.mouseLeave(point.parentElement!, { relatedTarget: document.body })
  expect(screen.queryByRole('link', { name: /model details/i })).not.toBeInTheDocument()
})

test('a pinned point renders a dismissible dialog card and announces itself', async () => {
  const user = userEvent.setup()
  const { onDismiss } = renderScatter({ selected: rows[0], connections: 'off' })

  const card = screen.getByRole('dialog', { name: /alpha details/i })
  expect(within(card).getByRole('link', { name: /model details/i })).toBeInTheDocument()
  // Announced for assistive tech even though the card floats beside the point.
  expect(screen.getByText(/pinned alpha, openai/i)).toBeInTheDocument()

  await user.click(within(card).getByRole('button', { name: /close details/i }))
  expect(onDismiss).toHaveBeenCalledOnce()
})

test('Escape dismisses a pinned card', async () => {
  const user = userEvent.setup()
  const { onDismiss } = renderScatter({ selected: rows[0], connections: 'off' })
  await user.keyboard('{Escape}')
  expect(onDismiss).toHaveBeenCalledOnce()
})

test('clicking the already-pinned point dismisses instead of reselecting', async () => {
  const user = userEvent.setup()
  const { onDismiss, onPointSelected } = renderScatter({ selected: rows[0], connections: 'off' })
  await user.click(screen.getByRole('button', { name: /alpha, openai/i }))
  expect(onDismiss).toHaveBeenCalledOnce()
  expect(onPointSelected).not.toHaveBeenCalled()
})

test('draws decorative connections only when enabled', () => {
  const { container, rerender } = renderScatter()
  const connectionLines = container.querySelectorAll('svg:not([data-testid]) line')
  expect(connectionLines).toHaveLength(1)
  expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')

  rerender(
    <MemoryRouter>
      <GraphScatter
        rows={rows}
        xAxis={xAxis}
        yAxis={yAxis}
        connections="off"
        selected={null}
        onPointSelected={() => {}}
        onDismiss={() => {}}
      />
    </MemoryRouter>,
  )
  expect(container.querySelector('svg:not([data-testid="label-leaders"])')).not.toBeInTheDocument()
})

test('renders finite positions for a degenerate zero-value domain', () => {
  const zero = { ...rows[0], x: 0, y: 0 }
  const { container } = renderScatter({ rows: [zero], connections: 'off' })
  const point = screen.getByRole('button', { name: /alpha, openai/i }).parentElement!
  expect(point.style.left).toBe('0%')
  expect(point.style.top).toBe('100%')
  expect(container.innerHTML).not.toMatch(/NaN|Infinity/)
})

/** Percent value the component wrote into an inline style, as a number. */
const pct = (value: string) => Number(value.replace('%', ''))

/** The positioned wrapper that carries a point button's coordinates. */
const wrapperOf = (name: RegExp) => screen.getByRole('button', { name }).parentElement!

test('points project onto a cropped linear domain, not a zero-anchored one', () => {
  // The scores sit in an 80-90 band; a zero-anchored axis put them all in the
  // top 10% of the plot and hid the differences (issue #81).
  renderScatter({ connections: 'off' })
  const top = (name: RegExp) => pct(wrapperOf(name).style.top)
  const alpha = top(/alpha/i) // y = 80, the lowest score
  const beta = top(/beta/i) // y = 90, the highest
  expect(alpha).toBeGreaterThan(beta) // higher score sits higher on the plot
  // A 0-100 domain would separate them by only 10% of the plot height.
  expect(alpha - beta).toBeGreaterThan(50)
  // Every point stays inside the plot area.
  for (const row of rows) {
    const wrapper = wrapperOf(new RegExp(`${row.model}, `, 'i'))
    expect(pct(wrapper.style.top)).toBeGreaterThanOrEqual(0)
    expect(pct(wrapper.style.top)).toBeLessThanOrEqual(100)
  }
})

test('a wide-ratio axis projects points and ticks logarithmically', () => {
  // 0.5 to 50 is a 100x spread, past the log threshold.
  const wide: GraphRow[] = [
    { model: 'Cheap', modelId: 'cheap', provider: 'OpenAI', family: 'Cheap', series: 'OpenAI', x: 0.5, y: 80 },
    { model: 'Mid', modelId: 'mid', provider: 'OpenAI', family: 'Mid', series: 'OpenAI', x: 5, y: 85 },
    { model: 'Dear', modelId: 'dear', provider: 'OpenAI', family: 'Dear', series: 'OpenAI', x: 50, y: 90 },
  ]
  renderScatter({ rows: wide, connections: 'off' })
  const left = (name: RegExp) => pct(wrapperOf(name).style.left)
  // Equal 10x ratios, so equal spacing: the property a linear axis lacks.
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
  expect(notice).toHaveTextContent(/baseline is not zero/i)
})

test('an axis that genuinely starts at zero gets no cropped-baseline notice', () => {
  const fromZero: GraphRow[] = [
    { model: 'Alpha', modelId: 'alpha', provider: 'OpenAI', family: 'Alpha', series: 'OpenAI', x: 0, y: 0 },
    { model: 'Beta', modelId: 'beta', provider: 'OpenAI', family: 'Beta', series: 'OpenAI', x: 4, y: 90 },
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
