import { useCallback, useEffect, useRef } from 'react'

type PixelGridProps = {
  pixels: boolean[]
  onChange: (next: boolean[]) => void
  gridSize: number
}

/**
 * An on/off pixel grid you can click, or draw across with a mouse drag or a finger.
 *
 * Touch pointers retarget every event after pointerdown to the element that was first
 * touched, so pointerenter never fires on the sibling cells a finger slides over. The
 * fix is to watch pointermove on the container and work out which cell is under the
 * pointer ourselves, from the data-pixel-index attribute.
 */
export function PixelGrid({ pixels, onChange, gridSize }: PixelGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // Refs, not state: a stroke paints many cells between renders, and reading `pixels`
  // from the closure would hand us the value from the render the drag started in.
  const paintValueRef = useRef(false)
  const isDrawingRef = useRef(false)
  // A pointer click fires pointerdown then click on the same cell. pointerdown has
  // already painted it, so the click that follows must be ignored; only keyboard
  // activation reaches click without a preceding pointerdown.
  //
  // This records WHICH cell the pointer handled rather than a bare "handled" flag.
  // A click only fires when the pointer is released over the cell it went down on,
  // so a drag that ends anywhere else - across cells, off the grid, off the window -
  // produces no click at all. A sticky boolean would survive that stroke and swallow
  // the user's next genuine click; an index only ever suppresses its own cell, and
  // the next pointerdown overwrites it.
  const pointerHandledIndexRef = useRef<number | null>(null)
  const workingPixelsRef = useRef(pixels)
  workingPixelsRef.current = pixels

  const paint = useCallback(
    (index: number) => {
      const current = workingPixelsRef.current
      if (index < 0 || index >= current.length) return
      if (current[index] === paintValueRef.current) return

      const next = [...current]
      next[index] = paintValueRef.current
      workingPixelsRef.current = next
      onChange(next)
    },
    [onChange]
  )

  const cellIndexAt = (clientX: number, clientY: number): number | null => {
    const container = containerRef.current
    if (!container) return null

    const target = document.elementFromPoint(clientX, clientY)
    const fromPoint = target?.closest<HTMLElement>('[data-pixel-index]')
    if (fromPoint && container.contains(fromPoint)) {
      return Number(fromPoint.dataset.pixelIndex)
    }

    // elementFromPoint misses when the pointer is over a gap between cells, and
    // returns nothing at all in environments without layout. Hit-test directly.
    const cells = container.querySelectorAll<HTMLElement>('[data-pixel-index]')
    for (const cell of cells) {
      const rect = cell.getBoundingClientRect()
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        return Number(cell.dataset.pixelIndex)
      }
    }
    return null
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>, index: number) => {
    // Let the browser handle keyboard-driven activation as a plain click.
    if (event.button !== 0) return
    isDrawingRef.current = true
    pointerHandledIndexRef.current = index
    paintValueRef.current = !workingPixelsRef.current[index]
    paint(index)
  }

  const handleContainerPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawingRef.current) return
    const index = cellIndexAt(event.clientX, event.clientY)
    if (index !== null) paint(index)
  }

  // A stroke can end anywhere, including off the grid or off the window entirely.
  useEffect(() => {
    const stopDrawing = () => {
      isDrawingRef.current = false
    }
    window.addEventListener('pointerup', stopDrawing)
    window.addEventListener('pointercancel', stopDrawing)
    return () => {
      window.removeEventListener('pointerup', stopDrawing)
      window.removeEventListener('pointercancel', stopDrawing)
    }
  }, [])

  const handleClick = (index: number) => {
    // Only the exact cell pointerdown already painted is suppressed.
    if (pointerHandledIndexRef.current === index) {
      pointerHandledIndexRef.current = null
      return
    }
    pointerHandledIndexRef.current = null
    paintValueRef.current = !workingPixelsRef.current[index]
    paint(index)
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handleContainerPointerMove}
      // select-none stops a desktop drag from text-selecting the grid and the prose
      // around it; onDragStart cancels the browser's native drag of the cell itself.
      onDragStart={(event) => event.preventDefault()}
      className="grid touch-none select-none gap-1 rounded border border-line p-3 sm:p-4"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
      }}
    >
      {pixels.map((isActive, i) => (
        <button
          key={i}
          data-pixel-index={i}
          onPointerDown={(event) => handlePointerDown(event, i)}
          onClick={() => handleClick(i)}
          className={`aspect-square w-full rounded-sm border transition-colors ${
            isActive ? 'border-accent bg-accent' : 'border-line bg-bg-primary hover:bg-bg-secondary'
          }`}
          aria-label={`Pixel ${i}`}
          aria-pressed={isActive}
        />
      ))}
    </div>
  )
}
