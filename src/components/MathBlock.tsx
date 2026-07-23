import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Renders a LaTeX equation with KaTeX, lazily.
 *
 * KaTeX (~70kB gzip JS plus CSS and fonts) never belongs in a shared chunk,
 * so this component renders the plain-text `fallback` immediately (that is
 * also what prerendered HTML ships, keeping the equation readable to
 * crawlers and no-JS readers) and only imports KaTeX once the equation is
 * about to scroll into view. The gating mirrors TokenVisualization: an
 * IntersectionObserver with an always-load fallback when IO is unavailable
 * (SSR, jsdom, old browsers), so the upgrade can never get stuck.
 */
interface MathBlockProps {
  /** The equation in LaTeX. */
  tex: string
  /** Plain-text form shown until KaTeX loads and served in prerendered HTML. */
  fallback: string
  /** Render as a centered display block (default) or inline. */
  display?: boolean
}

type Renderer = (tex: string) => string

export function MathBlock({ tex, fallback, display = true }: MathBlockProps) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const requestedRef = useRef(false)
  const mountedRef = useRef(true)
  const [render, setRender] = useState<Renderer | null>(null)

  const ensureKatex = useCallback(() => {
    if (requestedRef.current) return
    requestedRef.current = true
    Promise.all([import('katex'), import('katex/dist/katex.min.css')])
      .then(([katex]) => {
        if (!mountedRef.current) return
        setRender(() => (t: string) => katex.default.renderToString(t, { throwOnError: false, displayMode: display }))
      })
      .catch((err) => {
        requestedRef.current = false
        console.error('katex failed to load', err)
      })
  }, [display])

  useEffect(() => {
    mountedRef.current = true
    if (typeof IntersectionObserver === 'undefined') {
      ensureKatex()
      return () => {
        mountedRef.current = false
      }
    }

    const el = containerRef.current
    if (!el) {
      ensureKatex()
      return () => {
        mountedRef.current = false
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect()
          ensureKatex()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => {
      mountedRef.current = false
      observer.disconnect()
    }
  }, [ensureKatex])

  if (render) {
    return (
      <span
        ref={containerRef}
        role="math"
        aria-label={fallback}
        className={display ? 'block overflow-x-auto py-2 text-center' : ''}
        dangerouslySetInnerHTML={{ __html: render(tex) }}
      />
    )
  }

  return (
    <span ref={containerRef} role="math" aria-label={fallback} className={display ? 'block py-2 text-center font-mono text-sm' : 'font-mono'}>
      {fallback}
    </span>
  )
}
