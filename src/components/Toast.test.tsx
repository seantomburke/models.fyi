import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ToastProvider, useToast } from './Toast'

function TestComponent() {
  const { show } = useToast()

  return (
    <button type="button" onClick={() => show('Test message')}>
      Show Toast
    </button>
  )
}

describe('Toast', () => {
  it('renders without errors when wrapped in ToastProvider', () => {
    render(
      <ToastProvider>
        <div>Content</div>
      </ToastProvider>,
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('has correct provider structure', () => {
    const { container } = render(
      <ToastProvider>
        <div>Test</div>
      </ToastProvider>,
    )
    expect(container).toBeInTheDocument()
  })

  it('renders toast container with accessibility attributes', () => {
    const { container } = render(
      <ToastProvider>
        <div>Content</div>
      </ToastProvider>,
    )

    const toastContainer = container.querySelector('[aria-live="polite"]')
    expect(toastContainer).toHaveAttribute('aria-live', 'polite')
    expect(toastContainer).toHaveAttribute('aria-atomic', 'true')
  })

  it('throws error when useToast is used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useToast must be used within ToastProvider')

    spy.mockRestore()
  })

  it('renders correctly with children', () => {
    const { container } = render(
      <ToastProvider>
        <div data-testid="child">Child content</div>
      </ToastProvider>,
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument()
  })
})
