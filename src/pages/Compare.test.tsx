import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { Compare } from './Compare'
import { benchmarks, models } from '../data/index.ts'
import type { Model } from '../data/index.ts'
import { formatPrice, formatTokens } from '../lib/format.ts'
import { exportComparison } from '../lib/export.ts'

const posthogCapture = vi.fn()

vi.mock('../lib/posthog-react.ts', () => ({
  usePostHog: () => ({ capture: posthogCapture }),
}))

vi.mock('../lib/export.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/export.ts')>()
  return { ...actual, exportComparison: vi.fn() }
})

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname + location.search}</div>
}

function renderCompare(initialEntry = '/compare') {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Compare />
      <LocationProbe />
    </MemoryRouter>,
  )
}

// View-mode and bookmark state persist in localStorage; isolate tests from each other.
beforeEach(() => {
  localStorage.clear()
  posthogCapture.mockClear()
})

test('renders a row for every model in the dataset', () => {
  renderCompare()
  const table = screen.getByRole('table')
  for (const m of models) {
    expect(within(table).getByText(m.name)).toBeInTheDocument()
  }
})

test('card model names are level-two headings under the page heading', () => {
  renderCompare('/compare?view=cards')
  expect(screen.getByRole('heading', { level: 2, name: models[0].name })).toBeInTheDocument()
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
  // The highlight class lives on the enclosing cell, not the score text itself.
  const cells = screen.getAllByText(`${best.toFixed(1)}%`)
  expect(cells.some((c) => c.closest('td')?.className.includes('text-accent-deep'))).toBe(true)
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
  const modelHeader = screen.getByRole('button', { name: /^Model\./ })
  expect(modelHeader).toBeInTheDocument()
  // Both arrows always render so the column reads as sortable; the accessible
  // name is what announces the direction the next click applies.
  expect(modelHeader.textContent).toMatch(/▲/)
  expect(modelHeader.textContent).toMatch(/▼/)
  expect(modelHeader).toHaveAccessibleName('Model. Sort ascending')
  // Click to sort ascending
  await user.click(modelHeader)
  expect(modelHeader).toHaveAccessibleName('Model. Sort descending')
  // Click again to sort descending
  await user.click(modelHeader)
  expect(modelHeader).toHaveAccessibleName('Model. Sort ascending')
})

test('sorting by name reorders models alphabetically', async () => {
  const user = userEvent.setup()
  renderCompare()
  const modelHeader = screen.getByRole('button', { name: /^Model\./ })
  await user.click(modelHeader)
  const table = screen.getByRole('table')
  const rows = within(table).getAllByRole('row')
  // Skip the header and read the visible model name, excluding the date,
  // provider, and capability text that share its table cell.
  const names = rows.slice(1).map((row) =>
    models.find((model) => within(row).queryByText(model.name))!.name,
  )
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
  const sortButton = screen.getByRole('button', { name: /^Model\./ })
  // aria-sort is only valid on the columnheader, not on the button inside it.
  const modelHeader = screen.getByRole('columnheader', { name: /Model/ })
  // Initial state
  expect(modelHeader).toHaveAttribute('aria-sort', 'none')
  // After sorting
  await user.click(sortButton)
  expect(modelHeader).toHaveAttribute('aria-sort', 'ascending')
  await user.click(sortButton)
  expect(modelHeader).toHaveAttribute('aria-sort', 'descending')
})

test('benchmark headers use short labels, are sortable, and keep their source link', async () => {
  const user = userEvent.setup()
  renderCompare()

  const gpqa = benchmarks.find((b) => b.id === 'gpqa-diamond')!
  const header = screen.getByRole('columnheader', { name: new RegExp(gpqa.shortName!) })

  // Short label instead of the full name; that is what stopped the wrapping.
  expect(header).toHaveClass('whitespace-nowrap')
  const sortButton = within(header).getByRole('button')
  expect(sortButton.textContent).toContain(gpqa.shortName)
  expect(sortButton.textContent).not.toContain(gpqa.eli5)
  // The long explanation lives in the tooltip.
  expect(sortButton).toHaveAttribute('title', expect.stringContaining(gpqa.eli5))

  expect(header).toHaveAttribute('aria-sort', 'none')
  await user.click(sortButton)
  expect(header).toHaveAttribute('aria-sort', 'ascending')

  // The source link stays beside the button, reachable on its own.
  const sourceLink = within(header).getByRole('link', { name: `View ${gpqa.name} source` })
  expect(sourceLink.getAttribute('href')).toContain('utm_source=www.models.wtf')
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
  expect(localStorage.getItem('models-wtf-view-mode')).toBe('cards')
})

test.each(['table', 'cards'] as const)(
  'adding then removing a bookmark in %s view persists the UI state and captures accurate actions',
  async (view) => {
    const user = userEvent.setup()
    const model = models[0]
    renderCompare()
    if (view === 'cards') {
      await user.click(screen.getByRole('button', { name: 'cards' }))
      posthogCapture.mockClear()
    }
    const bookmark = screen.getByRole('button', { name: `Bookmark ${model.name}` })

    expect(bookmark).toHaveAttribute('title', 'Add bookmark')
    await user.click(bookmark)
    expect(bookmark).toHaveAttribute('title', 'Remove bookmark')
    expect(JSON.parse(localStorage.getItem('models-wtf-bookmarks')!)).toEqual([model.id])

    await user.click(bookmark)
    expect(bookmark).toHaveAttribute('title', 'Add bookmark')
    expect(JSON.parse(localStorage.getItem('models-wtf-bookmarks')!)).toEqual([])
    expect(posthogCapture).toHaveBeenNthCalledWith(1, 'compare_bookmark_toggled', {
      model_id: model.id,
      action: 'add',
    })
    expect(posthogCapture).toHaveBeenNthCalledWith(2, 'compare_bookmark_toggled', {
      model_id: model.id,
      action: 'remove',
    })
  },
)

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

  test('export honors the active filter', async () => {
    const user = userEvent.setup()
    renderCompare()
    await user.click(screen.getByRole('button', { name: 'Anthropic' }))
    await user.click(screen.getByRole('button', { name: 'Export comparison table as CSV' }))
    const exported = vi.mocked(exportComparison).mock.calls[0][0] as Model[]
    expect(exported.length).toBeGreaterThan(0)
    expect(exported.length).toBeLessThan(models.length)
    expect(exported.some((m) => m.name === 'Claude Opus 4.8')).toBe(true)
    expect(exported.some((m) => m.name === 'GPT-5.6 Sol')).toBe(false)
  })
})

describe('URL-shareable state', () => {
  test('a provider filter in the URL pre-applies on load', () => {
    renderCompare('/compare?filter=anthropic')
    const table = screen.getByRole('table')
    expect(within(table).getByText('Claude Opus 4.8')).toBeInTheDocument()
    expect(within(table).queryByText('GPT-5.6 Sol')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Anthropic' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  test('a search query in the URL pre-applies on load', () => {
    renderCompare('/compare?q=claude')
    expect(screen.getByRole('textbox', { name: 'Search models' })).toHaveValue('claude')
    const table = screen.getByRole('table')
    expect(within(table).getByText('Claude Opus 4.8')).toBeInTheDocument()
    expect(within(table).queryByText('Gemini 3 Pro')).not.toBeInTheDocument()
  })

  test('a sort in the URL orders the table on load', () => {
    renderCompare('/compare?sort=swe-bench-verified&dir=desc')
    const table = screen.getByRole('table')
    const rows = within(table).getAllByRole('row').slice(1) // skip header
    const topScorer = [...models]
      .filter((m) => m.scores['swe-bench-verified'] !== undefined)
      .sort((a, b) => b.scores['swe-bench-verified']! - a.scores['swe-bench-verified']!)[0]
    expect(within(rows[0]).getByText(topScorer.name)).toBeInTheDocument()
  })

  test('view=cards in the URL shows the card view', () => {
    renderCompare('/compare?view=cards')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Model cards' })).toBeInTheDocument()
  })

  test('junk params fall back to the default table', () => {
    renderCompare('/compare?filter=bogus&sort=bogus&view=bogus')
    const table = screen.getByRole('table')
    for (const m of models) {
      expect(within(table).getByText(m.name)).toBeInTheDocument()
    }
  })

  test('clicking a provider filter writes it to the URL', async () => {
    const user = userEvent.setup()
    renderCompare()
    await user.click(screen.getByRole('button', { name: 'Anthropic' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/compare?filter=anthropic')
  })

  test('toggling a capability and sorting both land in the URL', async () => {
    const user = userEvent.setup()
    renderCompare()
    await user.click(screen.getByRole('button', { name: /Reasoning/ }))
    await user.click(screen.getByRole('button', { name: /^Model\./ }))
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/compare?caps=reasoning&sort=name',
    )
  })

  test('clearing all filters cleans the URL back to /compare', async () => {
    const user = userEvent.setup()
    renderCompare('/compare?filter=anthropic&caps=reasoning')
    await user.click(screen.getByRole('button', { name: 'Clear all filters' }))
    expect(screen.getByTestId('location')).toHaveTextContent(/\/compare$/)
  })

  test('Copy link copies the current URL to the clipboard', async () => {
    const user = userEvent.setup()
    // Installed after userEvent.setup(), which stubs the clipboard itself.
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    renderCompare()
    await user.click(
      screen.getByRole('button', { name: 'Copy a shareable link to this comparison' }),
    )
    expect(writeText).toHaveBeenCalledWith(window.location.href)
    expect(screen.getByText('Link copied!')).toBeInTheDocument()
  })
})
