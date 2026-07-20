import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModelCard } from './ModelCard'
import type { Model } from '../data/types.ts'

const mockModel: Model = {
  id: 'test-model',
  name: 'Test Model Pro',
  providerId: 'anthropic',
  tier: 'flagship',
  openSource: false,
  inputPricePerMTok: 5,
  outputPricePerMTok: 15,
  contextWindowTokens: 1_000_000,
  reasoning: true,
  internetAccess: true,
  vision: false,
  scores: {
    'swe-bench-verified': 85.5,
    'gpqa-diamond': 92.0,
    'terminal-bench': 78.3,
  },
  blurb: 'A test model',
}

describe('ModelCard', () => {
  it('renders model name and tier', () => {
    render(
      <ModelCard
        model={mockModel}
        isBookmarked={false}
        onBookmarkToggle={vi.fn()}
      />
    )
    expect(screen.getByRole('heading', { level: 3, name: 'Test Model Pro' })).toBeInTheDocument()
    expect(screen.getByText('flagship')).toBeInTheDocument()
  })

  it('uses the heading level supplied by its page context', () => {
    render(
      <ModelCard
        model={mockModel}
        isBookmarked={false}
        onBookmarkToggle={vi.fn()}
        headingLevel={2}
      />,
    )
    expect(screen.getByRole('heading', { level: 2, name: 'Test Model Pro' })).toBeInTheDocument()
  })

  it('displays context window and price', () => {
    render(
      <ModelCard
        model={mockModel}
        isBookmarked={false}
        onBookmarkToggle={vi.fn()}
      />
    )
    expect(screen.getByText('1M')).toBeInTheDocument()
    expect(screen.getByText('$5')).toBeInTheDocument()
  })

  it('shows capability badges', () => {
    render(
      <ModelCard
        model={mockModel}
        isBookmarked={false}
        onBookmarkToggle={vi.fn()}
      />
    )
    expect(screen.getByText(/🧠 reasoning/)).toBeInTheDocument()
    expect(screen.getByText(/🌐 web/)).toBeInTheDocument()
  })

  it('displays top benchmark scores', () => {
    render(
      <ModelCard
        model={mockModel}
        isBookmarked={false}
        onBookmarkToggle={vi.fn()}
      />
    )
    expect(screen.getByText('Top benchmarks:')).toBeInTheDocument()
    expect(screen.getByText('92.0%')).toBeInTheDocument()
  })

  it('calls onBookmarkToggle when bookmark button clicked', async () => {
    const onBookmarkToggle = vi.fn()
    render(
      <ModelCard
        model={mockModel}
        isBookmarked={false}
        onBookmarkToggle={onBookmarkToggle}
      />
    )

    const bookmarkButton = screen.getByRole('button', { name: /Bookmark/ })
    await userEvent.click(bookmarkButton)

    expect(onBookmarkToggle).toHaveBeenCalledWith('test-model')
  })

  it('calls onViewDetails when view details button clicked', async () => {
    const onViewDetails = vi.fn()
    render(
      <ModelCard
        model={mockModel}
        isBookmarked={false}
        onBookmarkToggle={vi.fn()}
        onViewDetails={onViewDetails}
      />
    )

    const viewButton = screen.getByRole('button', { name: /View details/ })
    await userEvent.click(viewButton)

    expect(onViewDetails).toHaveBeenCalledWith('test-model')
  })

  it('shows open source badge when applicable', () => {
    const openSourceModel: Model = {
      ...mockModel,
      openSource: true,
      license: 'MIT',
    }

    render(
      <ModelCard
        model={openSourceModel}
        isBookmarked={false}
        onBookmarkToggle={vi.fn()}
      />
    )
    expect(screen.getByText('open')).toBeInTheDocument()
  })

  it('shows vision badge when model has vision capability', () => {
    const visionModel: Model = {
      ...mockModel,
      vision: true,
    }

    render(
      <ModelCard
        model={visionModel}
        isBookmarked={false}
        onBookmarkToggle={vi.fn()}
      />
    )
    expect(screen.getByText(/👁️ vision/)).toBeInTheDocument()
  })

  it('highlights best scores when provided', () => {
    const bestScores = {
      'gpqa-diamond': 92.0,
    }

    const { container } = render(
      <ModelCard
        model={mockModel}
        isBookmarked={false}
        onBookmarkToggle={vi.fn()}
        bestScores={bestScores}
      />
    )

    const bestScore = container.querySelector('.text-accent-deep')
    expect(bestScore).toHaveTextContent('92.0%')
  })

  it('renders release date when available', () => {
    const modelWithDate: Model = {
      ...mockModel,
      releaseDate: '2026-07-15',
    }

    render(
      <ModelCard
        model={modelWithDate}
        isBookmarked={false}
        onBookmarkToggle={vi.fn()}
      />
    )
    expect(screen.getByText(/Released/)).toBeInTheDocument()
  })
})
