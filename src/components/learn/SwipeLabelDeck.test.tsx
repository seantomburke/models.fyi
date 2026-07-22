import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import { SwipeLabelDeck, SWIPE_THRESHOLD } from './SwipeLabelDeck'

const card = { id: 0, name: 'Training 3 #2', pixels: Array(64).fill(false) }

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

/** Drag the face card from (0,0) by (dx,dy) and release, as one pointer. */
function swipe(dx: number, dy: number) {
  const face = screen.getByTestId('swipe-card')
  fireEvent.pointerDown(face, { button: 0, pointerId: 1, clientX: 0, clientY: 0 })
  fireEvent.pointerMove(face, { pointerId: 1, clientX: dx / 2, clientY: dy / 2 })
  fireEvent.pointerMove(face, { pointerId: 1, clientX: dx, clientY: dy })
  fireEvent.pointerUp(face, { pointerId: 1, clientX: dx, clientY: dy })
}

/** Let the fly-off animation finish so the queued action fires. */
function settle() {
  act(() => {
    vi.advanceTimersByTime(200)
  })
}

describe('SwipeLabelDeck', () => {
  it('labels 3 on a swipe right', () => {
    vi.useFakeTimers()
    const onLabel = vi.fn()
    const onDelete = vi.fn()
    render(<SwipeLabelDeck card={card} remaining={3} onLabel={onLabel} onDelete={onDelete} />)

    swipe(SWIPE_THRESHOLD + 20, 5)
    settle()

    expect(onLabel).toHaveBeenCalledWith('3')
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('labels E on a swipe left', () => {
    vi.useFakeTimers()
    const onLabel = vi.fn()
    render(<SwipeLabelDeck card={card} remaining={3} onLabel={onLabel} onDelete={() => {}} />)

    swipe(-(SWIPE_THRESHOLD + 20), -10)
    settle()

    expect(onLabel).toHaveBeenCalledWith('E')
  })

  it('deletes on a swipe up', () => {
    vi.useFakeTimers()
    const onLabel = vi.fn()
    const onDelete = vi.fn()
    render(<SwipeLabelDeck card={card} remaining={3} onLabel={onLabel} onDelete={onDelete} />)

    swipe(4, -(SWIPE_THRESHOLD + 20))
    settle()

    expect(onDelete).toHaveBeenCalledOnce()
    expect(onLabel).not.toHaveBeenCalled()
  })

  it('does nothing when the drag is released under the threshold', () => {
    vi.useFakeTimers()
    const onLabel = vi.fn()
    const onDelete = vi.fn()
    render(<SwipeLabelDeck card={card} remaining={3} onLabel={onLabel} onDelete={onDelete} />)

    swipe(SWIPE_THRESHOLD / 2, 0)
    settle()

    expect(onLabel).not.toHaveBeenCalled()
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('abandons the drag on pointercancel', () => {
    vi.useFakeTimers()
    const onLabel = vi.fn()
    render(<SwipeLabelDeck card={card} remaining={3} onLabel={onLabel} onDelete={() => {}} />)

    const face = screen.getByTestId('swipe-card')
    fireEvent.pointerDown(face, { button: 0, pointerId: 1, clientX: 0, clientY: 0 })
    fireEvent.pointerMove(face, { pointerId: 1, clientX: 200, clientY: 0 })
    fireEvent.pointerCancel(face, { pointerId: 1 })
    fireEvent.pointerUp(face, { pointerId: 1, clientX: 200, clientY: 0 })
    settle()

    expect(onLabel).not.toHaveBeenCalled()
  })

  it('fires the same actions from the accessible buttons', () => {
    vi.useFakeTimers()
    const onLabel = vi.fn()
    const onDelete = vi.fn()
    render(<SwipeLabelDeck card={card} remaining={3} onLabel={onLabel} onDelete={onDelete} />)

    fireEvent.click(screen.getByRole('button', { name: 'E' }))
    settle()
    expect(onLabel).toHaveBeenCalledWith('E')

    fireEvent.click(screen.getByRole('button', { name: '3' }))
    settle()
    expect(onLabel).toHaveBeenCalledWith('3')

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    settle()
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('commits immediately without animation under reduced motion', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: query.includes('prefers-reduced-motion'),
          media: query,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => true,
        }) as unknown as MediaQueryList
    )
    const onLabel = vi.fn()
    render(<SwipeLabelDeck card={card} remaining={3} onLabel={onLabel} onDelete={() => {}} />)

    fireEvent.click(screen.getByRole('button', { name: '3' }))
    expect(onLabel).toHaveBeenCalledWith('3')
  })

  it('can delete even the last remaining card', () => {
    vi.useFakeTimers()
    const onDelete = vi.fn()
    render(<SwipeLabelDeck card={card} remaining={0} onLabel={() => {}} onDelete={onDelete} />)

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    settle()

    expect(onDelete).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'E' })).toBeEnabled()
  })

  it('shows the all-done state and disables every button with no card', () => {
    render(<SwipeLabelDeck card={null} remaining={0} onLabel={() => {}} onDelete={() => {}} />)
    expect(screen.getByText(/Every remaining drawing has a label/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'E' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '3' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled()
  })

  it('names the face card for screen readers', () => {
    render(<SwipeLabelDeck card={card} remaining={1} onLabel={() => {}} onDelete={() => {}} />)
    expect(
      screen.getByRole('img', { name: 'Training 3 #2, an unlabelled 8 by 8 drawing' })
    ).toBeInTheDocument()
  })
})
