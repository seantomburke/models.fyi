import { useEffect, useRef, useState } from 'react'

/**
 * Drives the /learn index card animations.
 *
 * The index renders 27 cards. Giving each one its own requestAnimationFrame
 * loop would mean 27 loops competing every frame, so this hook does two things
 * to keep the route cheap:
 *
 * 1. One shared rAF loop for the whole page. Cards subscribe to it and are
 *    handed a clock; the loop only runs while at least one card is visible,
 *    and shuts itself down when the last subscriber leaves.
 * 2. IntersectionObserver gating. A card off-screen is not subscribed at all,
 *    so scrolling past the fold costs nothing.
 *
 * Under prefers-reduced-motion the clock never advances: the hook returns a
 * fixed phase so every card paints one still, representative frame instead.
 */

type Subscriber = (elapsedMs: number) => void

const subscribers = new Set<Subscriber>()
let rafId: number | null = null
let startedAt = 0

function tick(now: number) {
  for (const notify of subscribers) notify(now - startedAt)
  rafId = subscribers.size > 0 ? requestAnimationFrame(tick) : null
}

function subscribe(fn: Subscriber): () => void {
  subscribers.add(fn)
  if (rafId === null) {
    startedAt = performance.now()
    rafId = requestAnimationFrame(tick)
  }
  return () => {
    subscribers.delete(fn)
    if (subscribers.size === 0 && rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** The still frame reduced-motion users see: mid-cycle, so nothing looks empty. */
const STILL_PHASE = 0.45

/**
 * Returns a ref to attach to the card, and a phase in [0, 1) that loops every
 * `periodMs`. The phase only advances while the card is on screen.
 */
export function useCardAnimation(periodMs: number): {
  ref: React.RefObject<HTMLDivElement | null>
  phase: number
} {
  const ref = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState(STILL_PHASE)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (prefersReducedMotion()) return

    // Without IntersectionObserver (jsdom, very old browsers) the still frame
    // is the safe outcome: correct-looking, and it costs no frames.
    if (typeof IntersectionObserver !== 'function') return

    let unsubscribe: (() => void) | null = null

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !unsubscribe) {
          unsubscribe = subscribe((elapsed) => setPhase((elapsed % periodMs) / periodMs))
        } else if (!entry.isIntersecting && unsubscribe) {
          unsubscribe()
          unsubscribe = null
        }
      },
      { rootMargin: '100px' }
    )
    observer.observe(element)

    return () => {
      observer.disconnect()
      unsubscribe?.()
    }
  }, [periodMs])

  return { ref, phase }
}
