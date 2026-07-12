import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Compare } from './Compare'
import { benchmarks, models } from '../data/index.ts'
import { formatPrice, formatTokens } from '../lib/format.ts'

function renderCompare() {
  render(
    <MemoryRouter>
      <Compare />
    </MemoryRouter>,
  )
}

test('renders a row for every model in the dataset', () => {
  renderCompare()
  const table = screen.getByRole('table')
  for (const m of models) {
    expect(within(table).getByText(m.name)).toBeInTheDocument()
  }
})

test('provider filter narrows the table', async () => {
  const user = userEvent.setup()
  renderCompare()
  await user.click(screen.getByRole('button', { name: 'Anthropic' }))
  const table = screen.getByRole('table')
  expect(within(table).getByText('Claude Opus 4.8')).toBeInTheDocument()
  expect(within(table).queryByText('GPT-5.6 Sol')).not.toBeInTheDocument()
})

test('open source filter shows only open models', async () => {
  const user = userEvent.setup()
  renderCompare()
  await user.click(screen.getByRole('button', { name: 'Open source' }))
  const table = screen.getByRole('table')
  expect(within(table).getByText('GLM-5.2')).toBeInTheDocument()
  expect(within(table).queryByText('Claude Opus 4.8')).not.toBeInTheDocument()
})

test('best score per benchmark is highlighted', () => {
  renderCompare()
  const best = Math.max(
    ...models.map((m) => m.scores['swe-bench-verified'] ?? -Infinity),
  )
  // Another column can legitimately display the same value; at least one
  // cell with this text must carry the highlight.
  const cells = screen.getAllByText(`${best.toFixed(1)}%`)
  expect(cells.some((c) => c.className.includes('text-accent-deep'))).toBe(true)
})

test('every model row carries its company logo', () => {
  renderCompare()
  const table = screen.getByRole('table')
  const nameCell = within(table).getByText('Claude Opus 4.8').closest('td')!
  expect(nameCell.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument()
})

test('capability badges are visible text, one per capable model', () => {
  renderCompare()
  const table = screen.getByRole('table')
  const reasoningCount = models.filter((m) => m.reasoning).length
  const webCount = models.filter((m) => m.internetAccess).length
  expect(within(table).getAllByText('reasoning')).toHaveLength(reasoningCount)
  expect(within(table).getAllByText('web')).toHaveLength(webCount)
})

test('missing scores tell screen readers there is no published score', () => {
  renderCompare()
  const table = screen.getByRole('table')
  const missingCount = models.reduce(
    (n, m) => n + benchmarks.filter((b) => m.scores[b.id] === undefined).length,
    0,
  )
  expect(within(table).getAllByText('no published score')).toHaveLength(missingCount)
})

test('formatters produce friendly units', () => {
  expect(formatTokens(1_000_000)).toBe('1M')
  expect(formatTokens(10_000_000)).toBe('10M')
  expect(formatTokens(200_000)).toBe('200K')
  expect(formatTokens(null)).toBe('—')
  expect(formatPrice(5)).toBe('$5')
  expect(formatPrice(2.5)).toBe('$2.50')
  expect(formatPrice(null)).toBe('Free*')
})
