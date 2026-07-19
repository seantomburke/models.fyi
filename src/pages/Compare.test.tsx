import { render, screen, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Compare } from './Compare'
import { benchmarks, models } from '../data/index.ts'
import type { Model } from '../data/index.ts'
import { formatPrice, formatTokens } from '../lib/format.ts'
import { exportComparison, EXPORT_SHORTCUT_EVENT } from '../lib/export.ts'

vi.mock('../lib/export.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/export.ts')>()
  return { ...actual, exportComparison: vi.fn() }
})

function renderCompare() {
  render(
    <MemoryRouter>
      <Compare />
    </MemoryRouter>,
  )
}

// View-mode and bookmark state persist in localStorage; isolate tests from each other.
beforeEach(() => {
  localStorage.clear()
})

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

test('displays model count "Showing X of Y models"', () => {
  renderCompare()
  expect(screen.getByText(`Showing ${models.length} of ${models.length} models`)).toBeInTheDocument()
})

test('clear filter button appears only when filter is not "all"', async () => {
  const user = userEvent.setup()
  renderCompare()
  // Initially, "Clear filter" should not be in the document
  expect(screen.queryByRole('button', { name: 'Clear filter' })).not.toBeInTheDocument()
  // After clicking a filter, "Clear filter" should appear
  await user.click(screen.getByRole('button', { name: 'Anthropic' }))
  expect(screen.getByRole('button', { name: 'Clear filter' })).toBeInTheDocument()
})

test('clear filter button resets to "all" and shows all models', async () => {
  const user = userEvent.setup()
  renderCompare()
  // Filter to Anthropic
  await user.click(screen.getByRole('button', { name: 'Anthropic' }))
  const initialText = screen.getByText(/Showing \d+ of \d+ models/)
  expect(initialText.textContent).toMatch(/Showing \d+ of \d+ models/)
  const [shown, total] = initialText.textContent!.match(/Showing (\d+) of (\d+) models/)!.slice(1).map(Number)
  expect(shown).toBeLessThan(total)
  // Click clear
  await user.click(screen.getByRole('button', { name: 'Clear filter' }))
  // All models should show
  expect(screen.getByText(`Showing ${models.length} of ${models.length} models`)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Clear filter' })).not.toBeInTheDocument()
})

test('table headers are clickable and show sort direction', async () => {
  const user = userEvent.setup()
  renderCompare()
  const modelHeader = screen.getByRole('button', { name: 'Model' })
  expect(modelHeader).toBeInTheDocument()
  // Initial state: no sort indicator
  expect(modelHeader.textContent).not.toMatch(/[↑↓]/)
  // Click to sort ascending
  await user.click(modelHeader)
  expect(modelHeader.textContent).toMatch(/↑/)
  // Click again to sort descending
  await user.click(modelHeader)
  expect(modelHeader.textContent).toMatch(/↓/)
})

test('sorting by name reorders models alphabetically', async () => {
  const user = userEvent.setup()
  renderCompare()
  const modelHeader = screen.getByRole('button', { name: /^Model/ })
  await user.click(modelHeader)
  const table = screen.getByRole('table')
  const rows = within(table).getAllByRole('row')
  // Skip header row, get model names from first column
  const names = rows.slice(1).map((row) => {
    const cells = within(row).getAllByRole('cell')
    const firstCellText = cells[0]?.textContent || ''
    // Extract first line (model name)
    return firstCellText.split('\n')[0] || ''
  })
  // Verify alphabetical order
  for (let i = 1; i < names.length; i++) {
    if (names[i] && names[i - 1]) {
      expect(names[i].toLowerCase() >= names[i - 1].toLowerCase()).toBe(true)
    }
  }
})

test('header has aria-sort attribute for accessibility', async () => {
  const user = userEvent.setup()
  renderCompare()
  const modelHeader = screen.getByRole('button', { name: 'Model' })
  // Initial state
  expect(modelHeader).toHaveAttribute('aria-sort', 'none')
  // After sorting
  await user.click(modelHeader)
  expect(modelHeader).toHaveAttribute('aria-sort', 'ascending')
  await user.click(modelHeader)
  expect(modelHeader).toHaveAttribute('aria-sort', 'descending')
})

test('view toggle switches from table to cards and back', async () => {
  const user = userEvent.setup()
  renderCompare()
  expect(screen.getByRole('table')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'cards' }))
  expect(screen.queryByRole('table')).not.toBeInTheDocument()
  const grid = screen.getByRole('list', { name: 'Model cards' })
  expect(within(grid).getAllByRole('listitem')).toHaveLength(models.length)
  expect(within(grid).getByText('Claude Opus 4.8')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'table' }))
  expect(screen.getByRole('table')).toBeInTheDocument()
  expect(screen.queryByRole('list', { name: 'Model cards' })).not.toBeInTheDocument()
})

test('card view shows a View details button per model', async () => {
  const user = userEvent.setup()
  renderCompare()
  await user.click(screen.getByRole('button', { name: 'cards' }))
  expect(screen.getAllByRole('button', { name: 'View details' })).toHaveLength(models.length)
})

test('view mode preference persists to localStorage', async () => {
  const user = userEvent.setup()
  renderCompare()
  await user.click(screen.getByRole('button', { name: 'cards' }))
  expect(localStorage.getItem('models-fyi-view-mode')).toBe('cards')
})

test('filters still apply in card view', async () => {
  const user = userEvent.setup()
  renderCompare()
  await user.click(screen.getByRole('button', { name: 'cards' }))
  await user.click(screen.getByRole('button', { name: 'Anthropic' }))
  const grid = screen.getByRole('list', { name: 'Model cards' })
  expect(within(grid).getByText('Claude Opus 4.8')).toBeInTheDocument()
  expect(within(grid).queryByText('GPT-5.6 Sol')).not.toBeInTheDocument()
})

test('narrow viewports default to card view', () => {
  const originalWidth = window.innerWidth
  Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true, writable: true })
  try {
    renderCompare()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Model cards' })).toBeInTheDocument()
  } finally {
    Object.defineProperty(window, 'innerWidth', {
      value: originalWidth,
      configurable: true,
      writable: true,
    })
  }
})

describe('export', () => {
  beforeEach(() => {
    vi.mocked(exportComparison).mockClear()
  })

  test('Export CSV button exports the visible models', async () => {
    const user = userEvent.setup()
    renderCompare()
    await user.click(screen.getByRole('button', { name: 'Export comparison table as CSV' }))
    expect(exportComparison).toHaveBeenCalledOnce()
    const exported = vi.mocked(exportComparison).mock.calls[0][0] as Model[]
    expect(exported).toHaveLength(models.length)
  })

  test('claims the global export shortcut event', () => {
    renderCompare()
    const event = new CustomEvent(EXPORT_SHORTCUT_EVENT, { cancelable: true })
    act(() => {
      window.dispatchEvent(event)
    })
    expect(event.defaultPrevented).toBe(true)
    expect(exportComparison).toHaveBeenCalledOnce()
  })

  test('shortcut export honors the active filter', async () => {
    const user = userEvent.setup()
    renderCompare()
    await user.click(screen.getByRole('button', { name: 'Anthropic' }))
    act(() => {
      window.dispatchEvent(new CustomEvent(EXPORT_SHORTCUT_EVENT, { cancelable: true }))
    })
    const exported = vi.mocked(exportComparison).mock.calls[0][0] as Model[]
    expect(exported.length).toBeGreaterThan(0)
    expect(exported.length).toBeLessThan(models.length)
    expect(exported.some((m) => m.name === 'Claude Opus 4.8')).toBe(true)
    expect(exported.some((m) => m.name === 'GPT-5.6 Sol')).toBe(false)
  })
})
