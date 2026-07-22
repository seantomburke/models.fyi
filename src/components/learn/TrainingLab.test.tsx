import { describe, it, expect, afterEach, vi } from 'vitest'
import { fireEvent, render, screen, cleanup, act, within } from '@testing-library/react'
import { TrainingLab } from './TrainingLab'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

/** Wait out the deck's fly-off animation so its action commits. */
function settleDeck() {
  act(() => {
    vi.advanceTimersByTime(200)
  })
}

/** Step the learned-network animation through both of its stages. */
function runNetwork() {
  fireEvent.click(screen.getByRole('button', { name: /Predict/ }))
  act(() => {
    vi.advanceTimersByTime(2000)
  })
}

describe('TrainingLab', () => {
  it('requires at least one label before training', () => {
    render(<TrainingLab />)
    expect(screen.getByRole('button', { name: 'Start training' })).toBeDisabled()
    expect(screen.getByText('0 of 50 labelled')).toBeInTheDocument()
  })

  it('labels every generated drawing into the accessible trays', () => {
    render(<TrainingLab />)
    fireEvent.click(screen.getByRole('button', { name: 'Label all correctly' }))
    expect(screen.getByText('50 of 50 labelled')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Train on 50 labelled drawings' })).toBeEnabled()
    expect(screen.getByRole('list', { name: 'Drawings labelled E' }).children).toHaveLength(25)
    expect(screen.getByRole('list', { name: 'Drawings labelled 3' }).children).toHaveLength(25)
  })

  it('labels one card at a time through the swipe deck buttons', () => {
    vi.useFakeTimers()
    render(<TrainingLab />)
    // The deck opens on the first generated drawing.
    expect(screen.getByRole('img', { name: /Clean 3, an unlabelled/ })).toBeInTheDocument()

    fireEvent.click(within(screen.getByRole('group', { name: 'Label this drawing' })).getByRole('button', { name: '3' }))
    settleDeck()

    expect(screen.getByText('1 of 50 labelled')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Drawings labelled 3' }).children).toHaveLength(1)
    // The next card is up.
    expect(screen.getByRole('img', { name: /Clean E, an unlabelled/ })).toBeInTheDocument()
  })

  it('labels a card with a swipe gesture', () => {
    vi.useFakeTimers()
    render(<TrainingLab />)
    const face = screen.getByTestId('swipe-card')

    fireEvent.pointerDown(face, { button: 0, pointerId: 1, clientX: 0, clientY: 0 })
    fireEvent.pointerMove(face, { pointerId: 1, clientX: -160, clientY: 0 })
    fireEvent.pointerUp(face, { pointerId: 1, clientX: -160, clientY: 0 })
    settleDeck()

    expect(screen.getByText('1 of 50 labelled')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Drawings labelled E' }).children).toHaveLength(1)
  })

  it('deletes a card from the training set with the delete button', () => {
    vi.useFakeTimers()
    render(<TrainingLab />)
    expect(screen.getByRole('img', { name: /Clean 3, an unlabelled/ })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    settleDeck()

    expect(screen.getByText('0 of 49 labelled · 1 deleted')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Clean E, an unlabelled/ })).toBeInTheDocument()
    // The deleted card never comes back around.
    expect(screen.queryByRole('img', { name: /Clean 3, an unlabelled/ })).not.toBeInTheDocument()
  })

  it('deletes a card with an upward swipe', () => {
    vi.useFakeTimers()
    render(<TrainingLab />)
    const face = screen.getByTestId('swipe-card')

    fireEvent.pointerDown(face, { button: 0, pointerId: 1, clientX: 0, clientY: 0 })
    fireEvent.pointerMove(face, { pointerId: 1, clientX: 0, clientY: -160 })
    fireEvent.pointerUp(face, { pointerId: 1, clientX: 0, clientY: -160 })
    settleDeck()

    expect(screen.getByText('0 of 49 labelled · 1 deleted')).toBeInTheDocument()
  })

  it('returns a labelled card to the deck from its tray thumbnail', () => {
    vi.useFakeTimers()
    render(<TrainingLab />)
    fireEvent.click(screen.getByRole('button', { name: 'Label all correctly' }))
    expect(screen.getByText('50 of 50 labelled')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Clean E, labelled E/ }))

    expect(screen.getByText('49 of 50 labelled')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Clean E, an unlabelled/ })).toBeInTheDocument()
    // Training stays possible with the other 49 labels.
    expect(screen.getByRole('button', { name: 'Train on 49 labelled drawings' })).toBeEnabled()
  })

  it('trains on a handful of labels without needing the whole deck', () => {
    vi.useFakeTimers()
    render(<TrainingLab />)
    const buttons = () => within(screen.getByRole('group', { name: 'Label this drawing' }))

    fireEvent.click(buttons().getByRole('button', { name: '3' })) // Clean 3
    settleDeck()
    fireEvent.click(buttons().getByRole('button', { name: 'E' })) // Clean E
    settleDeck()

    fireEvent.click(screen.getByRole('button', { name: 'Train on 2 labelled drawings' }))
    expect(screen.getByText(/Epoch \d+ of 120/)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Learned 64-pixel weight heatmap' }).children).toHaveLength(64)
  })

  it('trains the assigned labels and animates the learned network on a fresh drawing', () => {
    vi.useFakeTimers()
    render(<TrainingLab />)
    fireEvent.click(screen.getByRole('button', { name: 'Label all correctly' }))
    fireEvent.click(screen.getByRole('button', { name: 'Train on 50 labelled drawings' }))
    expect(screen.getByText(/Epoch \d+ of 120/)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Learned 64-pixel weight heatmap' }).children).toHaveLength(64)
    expect(
      screen.getByRole('img', { name: 'All 64 weights over 120 training epochs, currently at epoch 0' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: 'Your trained network: 64 pixel inputs connected to two outputs, 3 and E' })
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Example: 3' }))
    runNetwork()
    expect(screen.getByText(/Your model says "3"/)).toBeInTheDocument()
  })

  it('learns the inverted rule when every label is reversed', () => {
    vi.useFakeTimers()
    render(<TrainingLab />)
    fireEvent.click(screen.getByRole('button', { name: 'Invert every label' }))
    fireEvent.click(screen.getByRole('button', { name: 'Train on 50 labelled drawings' }))
    fireEvent.click(screen.getByRole('button', { name: 'Example: 3' }))
    runNetwork()
    expect(screen.getByText(/Your model says "E"/)).toBeInTheDocument()
  })

  it('adds a custom drawing to the front of the deck and trains with it', () => {
    vi.useFakeTimers()
    render(<TrainingLab />)
    fireEvent.click(screen.getByRole('button', { name: 'Label all correctly' }))

    // The custom drawing section owns the only visible pixel grid before training.
    expect(screen.getByRole('button', { name: 'Add to deck' })).toBeDisabled()
    fireEvent.click(screen.getByLabelText('Pixel 0'))
    fireEvent.click(screen.getByLabelText('Pixel 9'))
    fireEvent.click(screen.getByRole('button', { name: 'Add to deck' }))

    // It joins the count and is the next card to judge.
    expect(screen.getByText('50 of 51 labelled')).toBeInTheDocument()
    expect(screen.getByText('1 of your drawings in the training set.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Your drawing #1, an unlabelled/ })).toBeInTheDocument()

    fireEvent.click(within(screen.getByRole('group', { name: 'Label this drawing' })).getByRole('button', { name: 'E' }))
    settleDeck()

    expect(screen.getByText('51 of 51 labelled')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Drawings labelled E' }).children).toHaveLength(26)

    fireEvent.click(screen.getByRole('button', { name: 'Train on 51 labelled drawings' }))
    expect(screen.getByText(/Epoch \d+ of 120/)).toBeInTheDocument()
  })

  it('leaves an unlabelled custom drawing in the deck when labelling all correctly', () => {
    vi.useFakeTimers()
    render(<TrainingLab />)
    fireEvent.click(screen.getByLabelText('Pixel 0'))
    fireEvent.click(screen.getByRole('button', { name: 'Add to deck' }))

    fireEvent.click(screen.getByRole('button', { name: 'Label all correctly' }))

    // Only its author knows what the custom drawing is.
    expect(screen.getByText('50 of 51 labelled')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Your drawing #1, an unlabelled/ })).toBeInTheDocument()
  })

  it('resets custom drawings when generating a new training set', () => {
    render(<TrainingLab />)
    fireEvent.click(screen.getByLabelText('Pixel 0'))
    fireEvent.click(screen.getByRole('button', { name: 'Add to deck' }))
    expect(screen.getByText('0 of 51 labelled')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Training random seed'), { target: { value: '7' } })
    fireEvent.click(screen.getByRole('button', { name: 'Make new drawings' }))

    expect(screen.getByText('0 of 50 labelled')).toBeInTheDocument()
  })
})
