import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Calculator, SAMPLE_OUTPUT } from './Calculator.tsx'
import { models } from '../data/index.ts'

// Whitespace word count stands in for the real BPE tokenizer: deterministic,
// instant, and enough to exercise counting, costs, and the loaded/estimated flip.
vi.mock('../lib/tokenize.ts', () => {
  const count = (text: string) => (text.trim() === '' ? 0 : text.trim().split(/\s+/).length)
  return {
    estimateTokens: count,
    loadTokenizer: () => Promise.resolve(count),
  }
})

// The chart engine needs a real canvas; jsdom gets a placeholder instead.
vi.mock('@opendata-ai/openchart-react', () => ({
  Chart: () => <div data-testid="chart" />,
}))

/** Total-cost cell per model row, keyed by the row's model+provider text. */
function totalsByModel(): Map<string, number> {
  const totals = new Map<string, number>()
  for (const row of within(screen.getByRole('table')).getAllByRole('row').slice(1)) {
    const cells = row.querySelectorAll('td')
    totals.set(cells[0].textContent!, parseFloat(cells[3].textContent!.replace(/[$<,]/g, '')))
  }
  return totals
}

async function renderCalculator() {
  render(<Calculator debounceMs={0} />)
  // The mocked tokenizer resolves immediately; wait for the estimate label to clear.
  await waitFor(() => expect(screen.queryByText(/\(estimated\)/)).not.toBeInTheDocument())
}

test('prefills the editable example output and counts its tokens', async () => {
  await renderCalculator()
  const output = screen.getByLabelText('Example output')
  expect(output).toHaveValue(SAMPLE_OUTPUT)
  const words = SAMPLE_OUTPUT.trim().split(/\s+/).length
  expect(screen.getByText(`${words.toLocaleString()} tokens`)).toBeInTheDocument()
})

test('typing into the input updates its token count', async () => {
  await renderCalculator()
  const user = userEvent.setup()
  expect(screen.getByText('0 tokens')).toBeInTheDocument()
  await user.type(screen.getByLabelText('Your input'), 'hello brave new world')
  await waitFor(() => expect(screen.getByText('4 tokens')).toBeInTheDocument())
})

test('raising thinking effort raises every model total', async () => {
  await renderCalculator()
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: /Low/ }))
  const low = totalsByModel()
  await user.click(screen.getByRole('button', { name: /High/ }))
  const high = totalsByModel()
  expect(high.size).toBe(low.size)
  // Every priced model currently reasons, so every bill grows with effort.
  for (const [model, lowTotal] of low) {
    expect(high.get(model)!).toBeGreaterThan(lowTotal)
  }
})

test('table sorts by total cost ascending and toggles on header click', async () => {
  await renderCalculator()
  const user = userEvent.setup()
  const ascending = [...totalsByModel().values()]
  for (let i = 1; i < ascending.length; i++) {
    expect(ascending[i]).toBeGreaterThanOrEqual(ascending[i - 1])
  }
  await user.click(screen.getByRole('button', { name: /Total/ }))
  const descending = [...totalsByModel().values()]
  expect(descending).toEqual([...ascending].reverse())
})

test('open-source models are footnoted, not priced', async () => {
  await renderCalculator()
  const table = screen.getByRole('table')
  expect(within(table).queryByText('GLM-5.2')).not.toBeInTheDocument()
  expect(screen.getByText(/Not shown/).textContent).toContain('GLM-5.2')
  const pricedCount = models.filter((m) => m.inputPricePerMTok !== null).length
  expect(within(table).getAllByRole('row')).toHaveLength(pricedCount + 1) // + header
})

test('renders both the price chart and the total-cost chart', async () => {
  await renderCalculator()
  expect(screen.getAllByTestId('chart')).toHaveLength(2)
})
