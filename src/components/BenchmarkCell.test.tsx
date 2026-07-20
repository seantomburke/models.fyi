import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BenchmarkCell } from './BenchmarkCell'
import type { Benchmark } from '../data/types'
import type { ProvenanceDisplay } from '../lib/scoreProvenance'

const mockBenchmark: Benchmark = {
  id: 'gpqa-diamond',
  name: 'Test Benchmark',
  eli5: 'A test benchmark for testing',
  unit: '%',
  category: 'Reasoning',
  sourceUrl: 'https://example.com/test',
  sourceOrganization: 'Test Org',
}

const independentProvenance: ProvenanceDisplay = {
  kind: 'independent',
  label: 'independent run',
  detail: 'Independently measured by vals.ai.',
}

const providerProvenance: ProvenanceDisplay = {
  kind: 'provider',
  label: 'provider-reported',
  detail: 'Provider-reported; no independent run recorded yet.',
}

const divergingProvenance: ProvenanceDisplay = {
  kind: 'provider-diverging',
  label: 'provider-reported',
  detail: 'Provider-reported; an independent run by tbench.ai (Codex) lands at 75.7%.',
}

describe('BenchmarkCell', () => {
  it('renders score with percentage', () => {
    render(<BenchmarkCell benchmark={mockBenchmark} score={85.3} isBest={false} />)
    expect(screen.getByText('85.3%')).toBeInTheDocument()
  })

  it('renders dash for undefined score', () => {
    render(<BenchmarkCell benchmark={mockBenchmark} score={undefined} isBest={false} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('shows best score styling', () => {
    const { container } = render(
      <BenchmarkCell benchmark={mockBenchmark} score={95.0} isBest={true} />,
    )
    const td = container.querySelector('td')
    expect(td).toHaveClass('text-accent-deep')
    expect(td).toHaveClass('font-semibold')
  })

  it('renders green dot for independently measured scores', () => {
    render(
      <BenchmarkCell
        benchmark={mockBenchmark}
        score={75.0}
        isBest={false}
        provenance={independentProvenance}
      />,
    )
    const badge = screen.getByTitle('Independently measured by vals.ai.')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-emerald-500')
  })

  it('renders neutral dot for provider-reported scores', () => {
    render(
      <BenchmarkCell
        benchmark={mockBenchmark}
        score={80.0}
        isBest={false}
        provenance={providerProvenance}
      />,
    )
    const badge = screen.getByTitle('Provider-reported; no independent run recorded yet.')
    expect(badge).toHaveClass('bg-slate-400')
  })

  it('renders amber dot when an independent run diverges', () => {
    render(
      <BenchmarkCell
        benchmark={mockBenchmark}
        score={84.7}
        isBest={false}
        provenance={divergingProvenance}
      />,
    )
    const badge = screen.getByTitle(
      'Provider-reported; an independent run by tbench.ai (Codex) lands at 75.7%.',
    )
    expect(badge).toHaveClass('bg-amber-500')
  })

  it('has proper accessibility labels', () => {
    render(<BenchmarkCell benchmark={mockBenchmark} score={88.5} isBest={false} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label')
  })

  it('renders without source URL', () => {
    const benchmarkWithoutSource = { ...mockBenchmark, sourceUrl: undefined }
    render(<BenchmarkCell benchmark={benchmarkWithoutSource} score={75.0} isBest={false} />)
    expect(screen.getByText('75.0%')).toBeInTheDocument()
  })

  it('displays benchmark name with source URL', () => {
    render(<BenchmarkCell benchmark={mockBenchmark} score={90.0} isBest={false} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('title', expect.stringContaining('Test Benchmark'))
  })

  it('no dot without provenance', () => {
    const { container } = render(
      <BenchmarkCell benchmark={mockBenchmark} score={75.0} isBest={false} />,
    )
    expect(screen.getByText('75.0%')).toBeInTheDocument()
    expect(container.querySelector('span.rounded-full')).toBeNull()
  })
})

describe('BenchmarkCell pinned details card (issue #78)', () => {
  const secondBenchmark: Benchmark = {
    ...mockBenchmark,
    id: 'hle',
    name: 'Second Benchmark',
    sourceUrl: 'https://example.com/second',
  }

  function renderRow(children: React.ReactNode) {
    return render(
      <table>
        <tbody>
          <tr>{children}</tr>
        </tbody>
      </table>,
    )
  }

  it('previews the card on hover and hides it when the pointer leaves', async () => {
    const user = userEvent.setup()
    renderRow(<BenchmarkCell benchmark={mockBenchmark} score={85.3} isBest={false} />)

    expect(screen.queryByRole('link', { name: /view source/i })).not.toBeInTheDocument()

    await user.hover(screen.getByRole('button'))
    expect(screen.getByRole('link', { name: /view source/i })).toBeInTheDocument()

    await user.unhover(screen.getByRole('button'))
    await waitFor(() =>
      expect(screen.queryByRole('link', { name: /view source/i })).not.toBeInTheDocument(),
    )
  })

  it('keeps the card open after a click so the source link is clickable', async () => {
    const user = userEvent.setup()
    renderRow(<BenchmarkCell benchmark={mockBenchmark} score={85.3} isBest={false} />)

    const scoreButton = screen.getByRole('button')
    await user.click(scoreButton)
    expect(scoreButton).toHaveAttribute('aria-expanded', 'true')

    // Pointer leaves the score on its way into the card — it must stay open.
    await user.unhover(scoreButton)
    const link = screen.getByRole('link', { name: /view source/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://example.com/test')
  })

  it('unpins when the same score is clicked again', async () => {
    const user = userEvent.setup()
    renderRow(<BenchmarkCell benchmark={mockBenchmark} score={85.3} isBest={false} />)

    const scoreButton = screen.getByRole('button')
    await user.click(scoreButton)
    await user.click(scoreButton)

    expect(scoreButton).toHaveAttribute('aria-expanded', 'false')
    await user.unhover(scoreButton)
    await waitFor(() =>
      expect(screen.queryByRole('link', { name: /view source/i })).not.toBeInTheDocument(),
    )
  })

  it('unpins when clicking away', async () => {
    const user = userEvent.setup()
    renderRow(<BenchmarkCell benchmark={mockBenchmark} score={85.3} isBest={false} />)

    const scoreButton = screen.getByRole('button')
    await user.click(scoreButton)
    await user.click(document.body)

    expect(scoreButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('unpins the previous card when another score is clicked', async () => {
    const user = userEvent.setup()
    renderRow(
      <>
        <BenchmarkCell benchmark={mockBenchmark} score={85.3} isBest={false} />
        <BenchmarkCell benchmark={secondBenchmark} score={12.5} isBest={false} />
      </>,
    )

    const [first, second] = screen.getAllByRole('button')
    await user.click(first)
    expect(first).toHaveAttribute('aria-expanded', 'true')

    await user.click(second)
    expect(first).toHaveAttribute('aria-expanded', 'false')
    expect(second).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes a pinned card on Escape and returns focus to the score', async () => {
    const user = userEvent.setup()
    renderRow(<BenchmarkCell benchmark={mockBenchmark} score={85.3} isBest={false} />)

    const scoreButton = screen.getByRole('button')
    await user.click(scoreButton)
    await user.keyboard('{Escape}')

    expect(scoreButton).toHaveAttribute('aria-expanded', 'false')
    expect(scoreButton).toHaveFocus()
  })

  it('exposes the pinned card as a labelled dialog', async () => {
    const user = userEvent.setup()
    renderRow(<BenchmarkCell benchmark={mockBenchmark} score={85.3} isBest={false} />)

    await user.click(screen.getByRole('button'))
    const dialog = screen.getByRole('dialog', { name: 'Test Benchmark details' })
    expect(dialog).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('aria-controls', dialog.id)
  })

  it('keeps the card open while the source link is focused by keyboard', async () => {
    const user = userEvent.setup()
    renderRow(<BenchmarkCell benchmark={mockBenchmark} score={85.3} isBest={false} />)

    await user.tab()
    expect(screen.getByRole('button')).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('link', { name: /view source/i })).toHaveFocus()
  })
})
