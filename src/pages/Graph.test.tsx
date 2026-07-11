import { render, screen } from '@testing-library/react'
import { SelectedPoint } from './Graph'
import { axisOptions } from '../lib/graph.ts'
import type { GraphRow } from '../lib/graph.ts'

const xAxis = axisOptions.find((o) => o.id === 'price-input')!
const yAxis = axisOptions.find((o) => o.id === 'swe-bench-pro')!

const row: GraphRow = { model: 'Claude Opus 4.8', provider: 'Anthropic', x: 5, y: 69.2 }

test('shows a hint until a point is tapped', () => {
  render(<SelectedPoint row={null} xAxis={xAxis} yAxis={yAxis} />)
  expect(screen.getByText(/tap or click a point/i)).toBeInTheDocument()
})

test('shows the tapped model with both axis values', () => {
  render(<SelectedPoint row={row} xAxis={xAxis} yAxis={yAxis} />)
  expect(screen.getByText('Claude Opus 4.8')).toBeInTheDocument()
  expect(screen.getByText('Anthropic')).toBeInTheDocument()
  expect(screen.getByText(xAxis.label, { exact: false })).toBeInTheDocument()
  expect(screen.getByText('5')).toBeInTheDocument()
  expect(screen.getByText('69.2')).toBeInTheDocument()
})
