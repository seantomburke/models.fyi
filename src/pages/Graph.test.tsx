import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { Graph, SelectedPoint } from './Graph'
import { axisOptions } from '../lib/graph.ts'
import type { GraphRow } from '../lib/graph.ts'
import { graphPresets } from '../lib/graphUrlState.ts'

const xAxis = axisOptions.find((o) => o.id === 'price-input')!
const yAxis = axisOptions.find((o) => o.id === 'swe-bench-pro')!

const row: GraphRow = {
  model: 'Claude Opus 4.8',
  provider: 'Anthropic',
  x: 5,
  y: 69.2,
  family: 'Claude Opus',
  series: 'Anthropic',
}

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname + location.search}</div>
}

function renderGraph(initialEntry = '/graph') {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Graph />
      <LocationProbe />
    </MemoryRouter>,
  )
}

const search = () => screen.getByTestId('location').textContent!.split('?')[1] ?? ''

test('shows a hint until a point is tapped', () => {
  render(<SelectedPoint row={null} xAxis={xAxis} yAxis={yAxis} onDismiss={() => {}} />)
  expect(screen.getByText(/tap or click a point/i)).toBeInTheDocument()
})

test('the native graph is immediately interactive and pins a selected model', async () => {
  const user = userEvent.setup()
  renderGraph()
  const point = screen.getByRole('button', { name: /^claude opus 4\.8, anthropic/i })

  await user.click(point)

  expect(screen.getAllByText('Claude Opus 4.8')).toHaveLength(2)
  expect(screen.getByRole('button', { name: /clear pinned point/i })).toBeInTheDocument()
})

test('the compact model chooser can select a point hidden by an overlapping target', async () => {
  const user = userEvent.setup()
  renderGraph()

  await user.click(screen.getByText(/can’t tap a point.*choose a model/i))
  await user.click(screen.getByRole('button', { name: /select gpt-5\.6 sol, openai/i }))

  expect(screen.getAllByText('GPT-5.6 Sol')).toHaveLength(2)
  expect(screen.getByRole('button', { name: /clear pinned point/i })).toBeInTheDocument()
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

test('lands on the first preset with exactly one tab selected', () => {
  renderGraph()
  const tabs = screen.getAllByRole('tab')
  expect(tabs).toHaveLength(graphPresets.length)
  expect(tabs.filter((t) => t.getAttribute('aria-selected') === 'true')).toHaveLength(1)
  expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
})

test('the axis pickers are demoted into a collapsed Advanced section', () => {
  renderGraph()
  const advanced = screen.getByText(/advanced: choose your own axes/i)
  expect(advanced).toBeInTheDocument()
  // Closed by default, so a first-time visitor sees the tabs, not raw pickers.
  expect(advanced.closest('details')).not.toHaveAttribute('open')
})

test('each preset states the question it answers', async () => {
  renderGraph()
  expect(screen.getByText(graphPresets[0].question)).toBeInTheDocument()
  await userEvent.click(screen.getByRole('tab', { name: graphPresets[1].label }))
  expect(screen.getByText(graphPresets[1].question)).toBeInTheDocument()
})

test('choosing a preset puts it in the URL so the view is shareable', async () => {
  renderGraph()
  await userEvent.click(screen.getByRole('tab', { name: graphPresets[2].label }))
  expect(search()).toContain(`preset=${graphPresets[2].id}`)
})

test('the default preset keeps the canonical /graph URL clean', async () => {
  renderGraph()
  await userEvent.click(screen.getByRole('tab', { name: graphPresets[1].label }))
  await userEvent.click(screen.getByRole('tab', { name: graphPresets[0].label }))
  expect(search()).toBe('')
})

test('a shared preset link restores that tab', () => {
  renderGraph(`/graph?preset=${graphPresets[3].id}`)
  expect(screen.getByRole('tab', { name: graphPresets[3].label })).toHaveAttribute(
    'aria-selected',
    'true',
  )
})

test('tabs use a roving tabindex so the strip is one tab stop', () => {
  renderGraph()
  const tabs = screen.getAllByRole('tab')
  expect(tabs.filter((t) => t.getAttribute('tabindex') === '0')).toHaveLength(1)
  expect(tabs[0]).toHaveAttribute('tabindex', '0')
})

test('arrow keys move between tabs and select as they go', async () => {
  renderGraph()
  const tabs = screen.getAllByRole('tab')
  tabs[0].focus()
  await userEvent.keyboard('{ArrowRight}')
  expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
  expect(tabs[1]).toHaveFocus()
  // ArrowLeft from the first tab wraps to the last.
  tabs[0].focus()
  await userEvent.keyboard('{ArrowLeft}')
  expect(tabs[tabs.length - 1]).toHaveAttribute('aria-selected', 'true')
})

test('Home and End jump to the first and last tab', async () => {
  renderGraph()
  const tabs = screen.getAllByRole('tab')
  tabs[0].focus()
  await userEvent.keyboard('{End}')
  expect(tabs[tabs.length - 1]).toHaveAttribute('aria-selected', 'true')
  await userEvent.keyboard('{Home}')
  expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
})

test('the tab panel is labeled by the selected tab', () => {
  renderGraph()
  const panel = screen.getByRole('tabpanel')
  expect(panel).toHaveAttribute('aria-labelledby', `graph-tab-${graphPresets[0].id}`)
})

test('setting an axis by hand drops out of preset mode', async () => {
  renderGraph('/graph?adv=1')
  // Both axis pickers offer the same options, so scope to the x fieldset.
  const xPicker = screen.getByRole('group', { name: /horizontal axis/i })
  await userEvent.click(within(xPicker).getByRole('button', { name: 'Context window' }))
  expect(
    screen.queryAllByRole('tab').filter((t) => t.getAttribute('aria-selected') === 'true'),
  ).toHaveLength(0)
  expect(search()).toContain('x=')
  expect(search()).toContain('y=')
})

test('a manual axis link reopens the advanced section', () => {
  renderGraph('/graph?x=context&y=hle')
  expect(screen.getByText(/advanced: choose your own axes/i).closest('details')).toHaveAttribute(
    'open',
  )
})

test('the connection mode is shareable through the URL', async () => {
  renderGraph('/graph?adv=1')
  await userEvent.click(screen.getByRole('button', { name: 'By model family' }))
  expect(search()).toContain('conn=family')
})

test('connections default to joining models by company', () => {
  renderGraph('/graph?adv=1')
  expect(screen.getByRole('button', { name: 'By company' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})
