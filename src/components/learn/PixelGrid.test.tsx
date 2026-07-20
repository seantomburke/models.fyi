import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import { PixelGrid } from './PixelGrid'

const GRID_SIZE = 4
const PIXEL_COUNT = GRID_SIZE * GRID_SIZE
const CELL = 20

/**
 * jsdom does no layout: every getBoundingClientRect is zeroed and elementFromPoint
 * finds nothing. Lay the cells out on a synthetic grid so the component's hit-testing
 * has real coordinates to resolve, and give each cell the center of its own square.
 */
function stubLayout() {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: Element
  ) {
    const index = Number((this as HTMLElement).dataset?.pixelIndex ?? NaN)
    if (Number.isNaN(index)) return new DOMRect(0, 0, 0, 0)
    const left = (index % GRID_SIZE) * CELL
    const top = Math.floor(index / GRID_SIZE) * CELL
    return new DOMRect(left, top, CELL, CELL)
  })
  // jsdom does not implement elementFromPoint at all, so it cannot be spied on.
  // Defining it as a no-op exercises the same path a real browser takes when the
  // pointer sits in a gap between cells: fall through to the rect hit-test.
  Object.defineProperty(document, 'elementFromPoint', {
    configurable: true,
    writable: true,
    value: () => null,
  })
}

/** The center point of the cell at `index`, in the synthetic layout above. */
function centerOf(index: number) {
  return {
    clientX: (index % GRID_SIZE) * CELL + CELL / 2,
    clientY: Math.floor(index / GRID_SIZE) * CELL + CELL / 2,
  }
}

function Harness({ initial }: { initial?: boolean[] }) {
  const [pixels, setPixels] = useState<boolean[]>(
    initial ?? Array(PIXEL_COUNT).fill(false)
  )
  return <PixelGrid pixels={pixels} onChange={setPixels} gridSize={GRID_SIZE} />
}

function pixel(index: number) {
  return screen.getByLabelText(`Pixel ${index}`)
}

function isOn(index: number) {
  return pixel(index).getAttribute('aria-pressed') === 'true'
}

/** Draw a stroke from the first index through the last, as a pointer would. */
function drag(indices: number[]) {
  const grid = pixel(indices[0]).parentElement as HTMLElement
  fireEvent.pointerDown(pixel(indices[0]), { button: 0, ...centerOf(indices[0]) })
  for (const index of indices.slice(1)) {
    fireEvent.pointerMove(grid, centerOf(index))
  }
  fireEvent.pointerUp(window)
}

describe('PixelGrid', () => {
  beforeEach(stubLayout)
  afterEach(() => vi.restoreAllMocks())

  it('toggles a single pixel on and back off with plain clicks', () => {
    render(<Harness />)
    expect(isOn(0)).toBe(false)

    fireEvent.click(pixel(0))
    expect(isOn(0)).toBe(true)

    fireEvent.click(pixel(0))
    expect(isOn(0)).toBe(false)
  })

  // A real mouse click is pointerdown -> pointerup -> click, and both pointerdown
  // and click reach the cell. It must come out toggled once, not twice.
  it('toggles exactly once for a full pointer click sequence', () => {
    render(<Harness />)

    fireEvent.pointerDown(pixel(0), { button: 0, ...centerOf(0) })
    fireEvent.pointerUp(window)
    fireEvent.click(pixel(0))
    expect(isOn(0)).toBe(true)

    fireEvent.pointerDown(pixel(0), { button: 0, ...centerOf(0) })
    fireEvent.pointerUp(window)
    fireEvent.click(pixel(0))
    expect(isOn(0)).toBe(false)
  })

  it('paints every cell a drag passes over', () => {
    render(<Harness />)
    drag([0, 1, 2, 3])

    for (const i of [0, 1, 2, 3]) expect(isOn(i)).toBe(true)
    expect(isOn(4)).toBe(false)
  })

  it('erases across the drag when the stroke starts on a lit pixel', () => {
    const initial = Array(PIXEL_COUNT).fill(false)
    for (const i of [0, 1, 2, 3]) initial[i] = true
    render(<Harness initial={initial} />)

    drag([0, 1, 2, 3])
    for (const i of [0, 1, 2, 3]) expect(isOn(i)).toBe(false)
  })

  it('does not flicker when the pointer re-enters a cell it already painted', () => {
    render(<Harness />)
    const grid = pixel(0).parentElement as HTMLElement

    fireEvent.pointerDown(pixel(0), { button: 0, ...centerOf(0) })
    fireEvent.pointerMove(grid, centerOf(1))
    fireEvent.pointerMove(grid, centerOf(0))
    fireEvent.pointerMove(grid, centerOf(1))
    fireEvent.pointerUp(window)

    expect(isOn(0)).toBe(true)
    expect(isOn(1)).toBe(true)
  })

  it('stops painting once the stroke has ended', () => {
    render(<Harness />)
    const grid = pixel(0).parentElement as HTMLElement

    drag([0, 1])
    fireEvent.pointerMove(grid, centerOf(2))

    expect(isOn(2)).toBe(false)
  })

  it('ends a stroke that is released outside the grid', () => {
    render(<Harness />)
    const grid = pixel(0).parentElement as HTMLElement

    fireEvent.pointerDown(pixel(0), { button: 0, ...centerOf(0) })
    fireEvent.pointerUp(window)
    fireEvent.pointerMove(grid, centerOf(5))

    expect(isOn(0)).toBe(true)
    expect(isOn(5)).toBe(false)
  })

  // The click that follows a pointerdown must be suppressed, but only for the cell
  // pointerdown actually painted. A click never fires when the pointer is released
  // somewhere other than the cell it went down on, so any suppression that outlives
  // the stroke eats the user's next real click instead.
  it('registers a fresh click after a stroke released off the grid', () => {
    render(<Harness />)

    fireEvent.pointerDown(pixel(0), { button: 0, ...centerOf(0) })
    fireEvent.pointerUp(window)

    fireEvent.click(pixel(2))
    expect(isOn(2)).toBe(true)
  })

  it('registers a fresh click after a multi-cell drag', () => {
    render(<Harness />)

    drag([0, 1, 2])
    fireEvent.click(pixel(8))

    expect(isOn(8)).toBe(true)
  })

  it('still suppresses the phantom click when a drag ends back on its origin cell', () => {
    render(<Harness />)
    const grid = pixel(0).parentElement as HTMLElement

    // Out to a neighbour and back, then released over the starting cell: the browser
    // does fire a click here, and it must not toggle cell 0 back off.
    fireEvent.pointerDown(pixel(0), { button: 0, ...centerOf(0) })
    fireEvent.pointerMove(grid, centerOf(1))
    fireEvent.pointerMove(grid, centerOf(0))
    fireEvent.pointerUp(window)
    fireEvent.click(pixel(0))

    expect(isOn(0)).toBe(true)
    expect(isOn(1)).toBe(true)
  })

  it('toggles a pixel from the keyboard', () => {
    render(<Harness />)
    const target = pixel(2)
    target.focus()

    // Enter and Space both dispatch a click on a native button.
    fireEvent.click(target)
    expect(isOn(2)).toBe(true)

    fireEvent.click(target)
    expect(isOn(2)).toBe(false)
  })

  it('keeps each cell an accessible button reflecting its state', () => {
    render(<Harness />)
    const target = pixel(0)
    expect(target.tagName).toBe('BUTTON')
    expect(target).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(target)
    expect(pixel(0)).toHaveAttribute('aria-pressed', 'true')
  })
})
