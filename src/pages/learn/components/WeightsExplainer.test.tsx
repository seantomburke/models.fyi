import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WeightsExplainer } from './WeightsExplainer'

describe('WeightsExplainer', () => {
  it('names every input and weight slider for screen readers', () => {
    render(<WeightsExplainer />)
    for (let i = 1; i <= 4; i++) {
      expect(
        screen.getByRole('slider', { name: new RegExp(`^Input ${i} \\(a${i}\\)$`) })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('slider', { name: new RegExp(`^Weight ${i} \\(w${i}\\)$`) })
      ).toBeInTheDocument()
    }
  })

  it('starts every slider at the halfway default', () => {
    render(<WeightsExplainer />)
    expect(screen.getByRole('slider', { name: /^Input 1/ })).toHaveValue('0.5')
    expect(screen.getByRole('slider', { name: /^Weight 1/ })).toHaveValue('0.5')
    expect(screen.getAllByText('0.50 × 0.50 = 0.2500')).toHaveLength(4)
    expect(screen.getByText('1.0000')).toBeInTheDocument()
  })

  it('updates the product and total when an input slider moves', () => {
    render(<WeightsExplainer />)
    fireEvent.change(screen.getByRole('slider', { name: /^Input 1/ }), { target: { value: '1' } })
    expect(screen.getByText('1.00 × 0.50 = 0.5000')).toBeInTheDocument()
    expect(screen.getByText('1.2500')).toBeInTheDocument()
  })

  it('updates the product and total when a weight slider moves', () => {
    render(<WeightsExplainer />)
    fireEvent.change(screen.getByRole('slider', { name: /^Weight 2/ }), { target: { value: '0' } })
    expect(screen.getByText('0.50 × 0.00 = 0.0000')).toBeInTheDocument()
    expect(screen.getByText('0.7500')).toBeInTheDocument()
  })

  it('resets the sliders back to their defaults', () => {
    render(<WeightsExplainer />)
    const input = screen.getByRole('slider', { name: /^Input 3/ })
    fireEvent.change(input, { target: { value: '0.2' } })
    expect(input).toHaveValue('0.2')

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(input).toHaveValue('0.5')
    expect(screen.getByText('1.0000')).toBeInTheDocument()
  })

  it('lets a weight be picked for the output graph', () => {
    render(<WeightsExplainer />)
    fireEvent.click(screen.getByRole('button', { name: 'w3' }))
    expect(screen.getByRole('button', { name: 'w3' })).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('img', { name: 'Graph of output as weight 3 changes' })
    ).toBeInTheDocument()
  })
})
