import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GradientDescentDemo } from './GradientDescentDemo'
import { PIXEL_COUNT, TRAINING_RUN } from './gradientDescent'

const LAST_EPOCH = TRAINING_RUN.history.length - 1

describe('GradientDescentDemo', () => {
  it('starts at the random epoch 0 with its untrained loss', () => {
    render(<GradientDescentDemo />)
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent(`Epoch 0 of ${LAST_EPOCH}`)
    expect(status).toHaveTextContent(TRAINING_RUN.lossCurve[0].toFixed(3))
  })

  it('draws one line and one playhead dot per weight', () => {
    const { container } = render(<GradientDescentDemo />)
    expect(container.querySelectorAll('path')).toHaveLength(PIXEL_COUNT + 2)
    expect(container.querySelectorAll('circle')).toHaveLength(PIXEL_COUNT + 1)
  })

  it('shows the 64-cell weight heatmap for the current epoch', () => {
    render(<GradientDescentDemo />)
    const heatmap = screen.getByRole('img', { name: 'Learned weight heatmap at epoch 0' })
    expect(heatmap.children).toHaveLength(PIXEL_COUNT)
  })

  it('scrubbing to the last epoch shows the converged, fully accurate model', () => {
    render(<GradientDescentDemo />)
    fireEvent.change(screen.getByLabelText('Training epoch'), {
      target: { value: String(LAST_EPOCH) },
    })
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent(`Epoch ${LAST_EPOCH} of ${LAST_EPOCH}`)
    expect(status).toHaveTextContent('accuracy 100%')
    expect(status).toHaveTextContent(TRAINING_RUN.lossCurve[LAST_EPOCH].toFixed(3))
  })

  it('resets back to the random starting weights', () => {
    render(<GradientDescentDemo />)
    const slider = screen.getByLabelText('Training epoch')
    fireEvent.change(slider, { target: { value: '40' } })
    expect(screen.getByRole('status')).toHaveTextContent('Epoch 40')

    fireEvent.click(screen.getByRole('button', { name: /Reset to random/ }))
    expect(screen.getByRole('status')).toHaveTextContent('Epoch 0')
  })

  it('offers a play control that toggles to pause', () => {
    render(<GradientDescentDemo />)
    const play = screen.getByRole('button', { name: /Play training/ })
    fireEvent.click(play)
    expect(screen.getByRole('button', { name: /Pause/ })).toBeInTheDocument()
  })
})
