import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { SelectedPoint } from './Graph'
import { axisOptions } from '../lib/graph.ts'
import type { GraphRow } from '../lib/graph.ts'

const xAxis = axisOptions.find((o) => o.id === 'price-input')!
const yAxis = axisOptions.find((o) => o.id === 'swe-bench-pro')!

const row: GraphRow = { model: 'Claude Opus 4.8', provider: 'Anthropic', x: 5, y: 69.2 }

test('shows a hint until a point is tapped', () => {
  render(<SelectedPoint row={null} xAxis={xAxis} yAxis={yAxis} onDismiss={() => {}} />)
  expect(screen.getByText(/tap or click a point/i)).toBeInTheDocument()
})

test('shows the tapped model with both axis values, labeled with units', () => {
  render(<SelectedPoint row={row} xAxis={xAxis} yAxis={yAxis} onDismiss={() => {}} />)
  expect(screen.getByText('Claude Opus 4.8')).toBeInTheDocument()
  expect(screen.getByText('Anthropic')).toBeInTheDocument()
  // Axis titles carry the units; bare labels like "Context window: 0.2"
  // would mislead a non-expert audience.
  expect(screen.getByText(xAxis.axisTitle, { exact: false })).toBeInTheDocument()
  expect(screen.getByText(yAxis.axisTitle, { exact: false })).toBeInTheDocument()
  expect(screen.getByText('5')).toBeInTheDocument()
  expect(screen.getByText('69.2')).toBeInTheDocument()
})

test('a pinned point can be dismissed', async () => {
  const onDismiss = vi.fn()
  render(<SelectedPoint row={row} xAxis={xAxis} yAxis={yAxis} onDismiss={onDismiss} />)
  await userEvent.click(screen.getByRole('button', { name: /clear pinned point/i }))
  expect(onDismiss).toHaveBeenCalledOnce()
})
