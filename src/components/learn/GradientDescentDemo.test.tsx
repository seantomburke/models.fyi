import { afterEach, describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { GradientDescentDemo } from './GradientDescentDemo'
import { PIXEL_COUNT, TRAINING_RUN } from './gradientDescent'

const LAST_EPOCH = TRAINING_RUN.history.length - 1

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('GradientDescentDemo', () => {
  it('starts at the random epoch 0 with its untrained loss', () => {
    render(<GradientDescentDemo />)
    const status = screen.getByText(/^Epoch /)
    expect(status).toHaveTextContent(`Epoch 0 of ${LAST_EPOCH}`)
    expect(status).toHaveTextContent(TRAINING_RUN.lossCurve[0].toFixed(3))
  })

  it('draws one line and one playhead dot per weight', () => {
    render(<GradientDescentDemo />)
    const chart = screen.getByRole('img', { name: /Chart of 64 weights/ })
    expect(chart.querySelectorAll('path')).toHaveLength(PIXEL_COUNT)
    expect(chart.querySelectorAll('circle')).toHaveLength(PIXEL_COUNT)
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
    const status = screen.getByText(/^Epoch /)
    expect(status).toHaveTextContent(`Epoch ${LAST_EPOCH} of ${LAST_EPOCH}`)
    expect(status).toHaveTextContent('accuracy 100%')
    expect(status).toHaveTextContent(TRAINING_RUN.lossCurve[LAST_EPOCH].toFixed(3))
  })

  it('resets back to the random starting weights', () => {
    render(<GradientDescentDemo />)
    const slider = screen.getByLabelText('Training epoch')
    fireEvent.change(slider, { target: { value: '40' } })
    expect(screen.getByText(/^Epoch /)).toHaveTextContent('Epoch 40')

    fireEvent.click(screen.getByRole('button', { name: /Reset to random/ }))
    expect(screen.getByText(/^Epoch /)).toHaveTextContent('Epoch 0')
  })

  it('offers a play control that toggles to pause', () => {
    render(<GradientDescentDemo />)
    const play = screen.getByRole('button', { name: /Play training/ })
    fireEvent.click(play)
    expect(screen.getByRole('button', { name: /Pause/ })).toBeInTheDocument()
  })

  it('jumps to the trained result when reduced motion is requested', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    render(<GradientDescentDemo />)
    fireEvent.click(screen.getByRole('button', { name: 'Play training' }))
    expect(screen.getByText(/^Epoch /)).toHaveTextContent(`Epoch ${LAST_EPOCH}`)
    expect(screen.queryByRole('button', { name: 'Pause training' })).not.toBeInTheDocument()
  })

  it('trains a new seeded run and keeps reset tied to that run', () => {
    render(<GradientDescentDemo />)
    const seed = screen.getByRole('spinbutton', { name: 'Random seed' })
    fireEvent.change(seed, { target: { value: '7' } })
    fireEvent.click(screen.getByRole('button', { name: 'Train model' }))
    expect(screen.getByText(/Current model seed:/)).toHaveTextContent('7')

    fireEvent.change(screen.getByLabelText('Training epoch'), { target: { value: '30' } })
    fireEvent.click(screen.getByRole('button', { name: 'Reset to random' }))
    expect(screen.getByText(/^Epoch /)).toHaveTextContent('Epoch 0')
  })

  it('generates another seed and reports invalid seed input', () => {
    vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((array) => {
      const values = array as Uint32Array
      values[0] = 424242
      return array
    })
    render(<GradientDescentDemo />)
    const seed = screen.getByRole('spinbutton', { name: 'Random seed' })
    fireEvent.click(screen.getByRole('button', { name: 'Generate random seed' }))
    expect(seed).toHaveValue(424242)
    fireEvent.click(screen.getByRole('button', { name: 'Train model' }))
    expect(screen.getByText(/Current model seed:/)).toHaveTextContent('424242')

    fireEvent.change(seed, { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Train model' }))
    expect(screen.getByRole('alert')).toHaveTextContent(/Enter a whole number/)
  })

  it('uses the trained weights to predict the familiar examples', () => {
    render(<GradientDescentDemo />)
    const panel = screen.getByRole('heading', { name: 'Test the model you trained' }).parentElement!
    fireEvent.click(within(panel).getByRole('button', { name: 'Example: 3' }))
    expect(within(panel).getByText(/^3 ·/)).toBeInTheDocument()
    fireEvent.click(within(panel).getByRole('button', { name: 'Example: E' }))
    expect(within(panel).getByText(/^E ·/)).toBeInTheDocument()
  })

  it('offers keyboard controls and a text equivalent for the 3D surface', () => {
    render(<GradientDescentDemo />)
    const surface = screen.getByRole('img', { name: /Projected loss surface.*gradient vectors/ })
    fireEvent.keyDown(surface, { key: 'ArrowRight' })
    fireEvent.keyDown(surface, { key: 'Home' })
    expect(screen.getByRole('button', { name: 'Reset view' })).toBeInTheDocument()
    expect(screen.getByText(/small arrows show the local downhill direction/, { selector: 'p' })).toBeInTheDocument()
  })

  it('changes the polynomial basin when the starting side changes', () => {
    render(<GradientDescentDemo />)
    expect(screen.getByText(/This start reaches the left valley/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Start right of the ridge' }))
    expect(screen.getByText(/This start reaches the right valley/)).toBeInTheDocument()
  })

  it('lets learners choose seeded starts and learning rates for both loss landscapes', () => {
    render(<GradientDescentDemo />)
    const polynomialSeed = screen.getByRole('spinbutton', { name: 'Polynomial random seed' })
    fireEvent.change(polynomialSeed, { target: { value: '42' } })
    fireEvent.click(screen.getAllByRole('button', { name: 'Choose seeded start' })[0])
    expect(screen.getByText(/Step 0: weight/)).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Polynomial learning rate'), { target: { value: '0.8' } })
    expect(screen.getByText(/A small rate creeps steadily downhill/)).toBeInTheDocument()

    const surfaceSeed = screen.getByRole('spinbutton', { name: 'Surface random seed' })
    fireEvent.change(surfaceSeed, { target: { value: '99' } })
    fireEvent.click(screen.getAllByRole('button', { name: 'Choose seeded start' })[1])
    fireEvent.change(screen.getByLabelText('Surface learning rate'), { target: { value: '0.5' } })
    expect(screen.getByText(/Step 0 of 42/)).toBeInTheDocument()
  })
})
