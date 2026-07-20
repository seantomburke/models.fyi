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
