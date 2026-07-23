import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Home } from './Home'
import { releases } from '../data/index.ts'

const { capture } = vi.hoisted(() => ({ capture: vi.fn() }))

vi.mock('../lib/analytics.ts', () => ({ capture }))

describe('Home', () => {
  beforeEach(() => {
    localStorage.clear()
    capture.mockClear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('renders main sections', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )

    expect(screen.getByText(/Pick the right AI model/i)).toBeInTheDocument()
    expect(screen.getByText(/Which model should I use/i)).toBeInTheDocument()
    expect(screen.getByText(/Compare models/i)).toBeInTheDocument()
    expect(screen.getByText(/See it on a graph/i)).toBeInTheDocument()
  })

  it('does not show saved models section when no bookmarks', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )

    expect(screen.queryByText(/Your saved models/i)).not.toBeInTheDocument()
  })

  it('shows saved models section when bookmarks exist', () => {
    localStorage.setItem('models-wtf-bookmarks', JSON.stringify(['claude-opus-4-8']))

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )

    expect(screen.getByText(/Your saved models/i)).toBeInTheDocument()
    expect(screen.getByText(/Claude Opus 4.8/i)).toBeInTheDocument()
  })

  it('shows context window for bookmarked models', () => {
    localStorage.setItem('models-wtf-bookmarks', JSON.stringify(['claude-opus-4-8']))

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )

    const contextWindows = screen.getAllByText(/context window/i)
    expect(contextWindows.length).toBeGreaterThanOrEqual(1)
  })

  it('shows the newest releases with a link to the full list', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )

    expect(screen.getByRole('heading', { name: /latest releases/i })).toBeInTheDocument()

    const newest = [...releases].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )[0]
    expect(screen.getByText(newest.title)).toBeInTheDocument()
    expect(screen.getByText(newest.description)).toBeInTheDocument()

    const seeAll = screen.getByRole('link', { name: /see all releases/i })
    expect(seeAll).toHaveAttribute('href', '/whats-new')
  })

  it('links a release to its model page when the release names a model', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )

    const newestWithModel = [...releases]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .find((r) => r.modelId)
    if (!newestWithModel) throw new Error('expected at least one release with a modelId')

    const title = screen.getByText(newestWithModel.title)
    const link = title.closest('a')
    expect(link).toHaveAttribute('href', `/models/${newestWithModel.modelId}`)
  })

  it('identifies homepage destination choices without collecting visitor input', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )

    const quiz = screen.getByRole('link', { name: /which model should i use/i })
    expect(quiz).toHaveAttribute('data-attr', 'home-cta-quiz')
    await user.click(quiz)

    expect(capture).toHaveBeenCalledWith('home_cta_clicked', { destination: 'quiz' })
  })
})
