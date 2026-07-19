import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CopyButton } from './CopyButton'

describe('CopyButton', () => {
  it('renders copy button with label', () => {
    render(<CopyButton text="test" label="Copy" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('shows copy icon initially', () => {
    render(<CopyButton text="test" label="Copy" />)
    expect(screen.getByText('📋')).toBeInTheDocument()
  })

  it('respects size prop sm', () => {
    const { container } = render(<CopyButton text="test" size="sm" />)
    const button = container.querySelector('button')
    expect(button).toHaveClass('px-2')
  })

  it('respects size prop md', () => {
    const { container } = render(<CopyButton text="test" size="md" />)
    const button = container.querySelector('button')
    expect(button).toHaveClass('px-3')
  })

  it('respects size prop lg', () => {
    const { container } = render(<CopyButton text="test" size="lg" />)
    const button = container.querySelector('button')
    expect(button).toHaveClass('px-4')
  })

  it('has proper accessibility attributes', () => {
    render(<CopyButton text="test" label="Copy model" />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('title')
    expect(button).toHaveAttribute('aria-label')
  })

  it('displays label for md size', () => {
    render(<CopyButton text="test" size="md" label="Copy" />)
    expect(screen.getByText('Copy')).toBeInTheDocument()
  })

  it('displays label for lg size', () => {
    render(<CopyButton text="test" size="lg" label="Copy" />)
    expect(screen.getByText('Copy')).toBeInTheDocument()
  })

  it('does not display label for sm size', () => {
    render(<CopyButton text="test" size="sm" label="Copy" />)
    expect(screen.queryByText('Copy')).not.toBeInTheDocument()
  })

  it('has correct button border class', () => {
    const { container } = render(<CopyButton text="test" />)
    const button = container.querySelector('button')
    expect(button).toHaveClass('border-line')
  })

  it('has correct hover classes', () => {
    const { container } = render(<CopyButton text="test" />)
    const button = container.querySelector('button')
    expect(button).toHaveClass('hover:text-fg')
    expect(button).toHaveClass('hover:border-line-strong')
  })
})
