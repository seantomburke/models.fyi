import { useEffect, useRef, useState } from 'react'
import { GRID_SIZE } from './gradientDescent'
import { prefersReducedMotion } from './useCardAnimation'
import { resolveSwipe, type SwipeLabel } from './swipeLabel'

/** How far (px) a card must travel before release counts as a swipe. */
export const SWIPE_THRESHOLD = 72

interface SwipeCard {
  /** Stable key for the card being shown. */
  id: number
  name: string
  pixels: boolean[]
}

interface SwipeLabelDeckProps {
  /** The card facing the user; null renders the all-done state. */
  card: SwipeCard | null
  /** How many cards wait behind this one, for the stacked edges. */
  remaining: number
  onLabel: (label: SwipeLabel) => void
  onDelete: () => void
}

/**
 * One training drawing at a time, judged like a dating profile: drag right to
 * call it a 3, left to call it an E, up to throw it out of the training set.
 * Hand-rolled on pointer events (same family of tricks as PixelGrid) instead
 * of a swipe library, so it costs the bundle nothing and works identically for
 * mouse and touch. The three buttons underneath fire the exact same actions,
 * and are the whole interface for keyboard and screen-reader users.
 */
export function SwipeLabelDeck({ card, remaining, onLabel, onDelete }: SwipeLabelDeckProps) {
  const [drag, setDrag] = useState<{ dx: number; dy: number } | null>(null)
  // Where the pointer went down, in refs: pointermove fires between renders.
  const originRef = useRef<{ x: number; y: number; pointerId: number } | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  // A card flying off screen after a decisive swipe, so release feels physical.
  const [exit, setExit] = useState<{ dx: number; dy: number } | null>(null)
  const exitTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current)
    }
  }, [])

  const settle = (action: SwipeLabel | 'delete', dx: number, dy: number) => {
    // One decision per card: ignore input while the last card is still flying off.
    if (exit) return
    if (prefersReducedMotion()) {
      if (action === 'delete') onDelete()
      else onLabel(action)
      return
    }
    // Launch the card along its drag direction, then commit the action.
    const scale = 3
    setExit({ dx: dx * scale, dy: action === 'delete' ? -320 : dy * scale })
    exitTimerRef.current = window.setTimeout(() => {
      setExit(null)
      if (action === 'delete') onDelete()
      else onLabel(action)
    }, 180)
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || exit) return
    originRef.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId }
    // Capture keeps the drag alive when the pointer leaves the card, and jsdom
    // does not implement it — hence the guard.
    cardRef.current?.setPointerCapture?.(event.pointerId)
    setDrag({ dx: 0, dy: 0 })
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const origin = originRef.current
    if (!origin || origin.pointerId !== event.pointerId) return
    setDrag({ dx: event.clientX - origin.x, dy: event.clientY - origin.y })
  }

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const origin = originRef.current
    if (!origin || origin.pointerId !== event.pointerId) return
    originRef.current = null
    const dx = event.clientX - origin.x
    const dy = event.clientY - origin.y
    setDrag(null)
    const action = resolveSwipe(dx, dy, SWIPE_THRESHOLD)
    if (action) settle(action, dx, dy)
  }

  const cancelDrag = () => {
    originRef.current = null
    setDrag(null)
  }

  const dx = exit?.dx ?? drag?.dx ?? 0
  const dy = exit?.dy ?? drag?.dy ?? 0
  const leaning = resolveSwipe(dx, dy, SWIPE_THRESHOLD / 2)
  const transform = `translate(${dx}px, ${dy}px) rotate(${dx / 14}deg)`

  return (
    <div>
      <div className="relative mx-auto h-56 w-44 select-none" data-testid="swipe-deck">
        {/* The stacked edges: cards waiting their turn, purely decorative. */}
        {Array.from({ length: Math.min(remaining, 2) }, (_, index) => (
          <div
            key={index}
            aria-hidden="true"
            className="absolute inset-0 rounded-xl border border-line bg-surface-raised"
            style={{ transform: `translateY(${(index + 1) * 6}px) scale(${1 - (index + 1) * 0.045})`, zIndex: 1 - index }}
          />
        ))}
        {card ? (
          <div
            key={card.id}
            ref={cardRef}
            data-testid="swipe-card"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={cancelDrag}
            onDragStart={(event) => event.preventDefault()}
            className={`absolute inset-0 z-10 flex touch-none flex-col items-center justify-center gap-3 rounded-xl border bg-surface p-4 shadow-sm ${
              leaning === 'E' ? 'border-seg-3' : leaning === '3' ? 'border-seg-2' : leaning === 'delete' ? 'border-seg-6' : 'border-line'
            } ${drag ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{ transform, transition: drag ? 'none' : 'transform 180ms ease-out' }}
          >
            <span
              className="grid gap-px rounded border border-line bg-surface-raised p-1.5"
              style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
              role="img"
              aria-label={`${card.name}, an unlabelled 8 by 8 drawing`}
            >
              {card.pixels.map((on, index) => (
                <span key={index} className={`h-3 w-3 rounded-[1px] ${on ? 'bg-accent-deep' : 'bg-surface'}`} />
              ))}
            </span>
            <p className="text-xs text-fg-muted">{card.name}</p>
            <p className="text-[11px] text-fg-faint" aria-hidden="true">
              &larr; E &nbsp;&middot;&nbsp; &uarr; delete &nbsp;&middot;&nbsp; 3 &rarr;
            </p>
          </div>
        ) : (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl border border-dashed border-line p-4 text-center text-sm text-fg-muted">
            Every remaining drawing has a label. Ready to train.
          </div>
        )}
      </div>

      {/* The same three actions as buttons: the keyboard and screen-reader path. */}
      <div className="mt-4 flex justify-center gap-3" role="group" aria-label="Label this drawing">
        <button
          type="button"
          disabled={!card}
          onClick={() => card && settle('E', -SWIPE_THRESHOLD * 2, 0)}
          className="rounded-full border border-seg-3 px-5 py-2 text-sm font-semibold text-seg-3 enabled:hover:bg-seg-3/10 disabled:opacity-40"
        >
          E
        </button>
        <button
          type="button"
          disabled={!card}
          onClick={() => card && settle('delete', 0, -SWIPE_THRESHOLD * 2)}
          className="rounded-full border border-seg-6 px-5 py-2 text-sm font-medium text-seg-6 enabled:hover:bg-seg-6/10 disabled:opacity-40"
        >
          Delete
        </button>
        <button
          type="button"
          disabled={!card}
          onClick={() => card && settle('3', SWIPE_THRESHOLD * 2, 0)}
          className="rounded-full border border-seg-2 px-5 py-2 text-sm font-semibold text-seg-2 enabled:hover:bg-seg-2/10 disabled:opacity-40"
        >
          3
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-fg-muted">
        Swipe left for E, right for 3, up to delete it from the training set &mdash; or use the buttons.
      </p>
    </div>
  )
}
