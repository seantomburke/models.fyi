import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Home } from './Home'

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
    localStorage.setItem('models-fyi-bookmarks', JSON.stringify(['claude-opus-4-8']))

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )

    expect(screen.getByText(/Your saved models/i)).toBeInTheDocument()
    expect(screen.getByText(/Claude Opus 4.8/i)).toBeInTheDocument()
  })

  it('shows context window for bookmarked models', () => {
    localStorage.setItem('models-fyi-bookmarks', JSON.stringify(['claude-opus-4-8']))

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )

    const contextWindows = screen.getAllByText(/context window/i)
    expect(contextWindows.length).toBeGreaterThanOrEqual(1)
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
