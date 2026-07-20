import { useState, useRef, useEffect } from 'react'
import type { Benchmark } from '../data/types.ts'
import type { ProvenanceDisplay } from '../lib/scoreProvenance.ts'

interface BenchmarkCellProps {
  benchmark: Benchmark
  score: number | undefined
  isBest: boolean
  provenance?: ProvenanceDisplay
}

const provenanceDotColor: Record<ProvenanceDisplay['kind'], string> = {
  'independent': 'bg-emerald-500',
  'provider-reproduced': 'bg-emerald-500',
  'provider': 'bg-slate-400',
  'provider-diverging': 'bg-amber-500',
}

export function BenchmarkCell({ benchmark, score, isBest, provenance }: BenchmarkCellProps) {
  // Two independent reasons the card can be open. Hover is a preview that
  // disappears with the pointer; a click pins the card so the pointer can
  // travel into it and click the source link (issue #78).
  const [isPinned, setIsPinned] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const isOpen = isPinned || isHovered

  const scoreContent =
    score === undefined ? (
      <>
        <span aria-hidden>—</span>
        <span className="sr-only">no published score</span>
      </>
    ) : (
      `${score.toFixed(1)}%`
    )

  const provenanceDot =
    score !== undefined && provenance ? (
      <span
        className={`ml-1 inline-block w-2 h-2 rounded-full ${provenanceDotColor[provenance.kind]}`}
        title={provenance.detail}
        aria-hidden="true"
      />
    ) : null

  useEffect(() => {
    if (!isPinned) return

    // A click on another cell's score button is an outside click here, so this
    // one handler covers "click away" and "click a different number" both.
    const handlePointerDownOutside = (e: MouseEvent) => {
      if (
        !cardRef.current?.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setIsPinned(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setIsPinned(false)
      buttonRef.current?.focus()
    }

    document.addEventListener('mousedown', handlePointerDownOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isPinned])

  if (score === undefined && !benchmark.sourceUrl) {
    return (
      <td
        className="px-2 sm:px-3 py-3 text-right font-mono tabular-nums text-fg-faint"
        role="gridcell"
      >
        {scoreContent}
      </td>
    )
  }

  const interactive = score !== undefined && benchmark.sourceUrl
  const cardId = `benchmark-card-${benchmark.id}`

  return (
    <td
      className={`px-2 sm:px-3 py-3 text-right font-mono tabular-nums relative ${
        score === undefined
          ? 'text-fg-faint'
          : isBest
            ? 'font-semibold text-accent-deep'
            : 'text-fg-secondary'
      }`}
      role="gridcell"
    >
      {interactive ? (
        // The wrapper owns hover so moving the pointer from the number into the
        // card never crosses an unhovered gap — the card would otherwise close
        // mid-travel and the source link would be unclickable.
        <span
          className="relative inline-block"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          // Focus is tracked on the wrapper, not the button: tabbing from the
          // score into the card's source link must not close the card.
          onFocus={() => setIsHovered(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setIsHovered(false)
            }
          }}
        >
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setIsPinned((pinned) => !pinned)}
            className={`hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-deep rounded px-1 py-0.5 inline-flex items-center gap-1 ${
              isPinned ? 'ring-2 ring-accent-deep ring-offset-2' : ''
            }`}
            title={`${benchmark.name}: ${benchmark.eli5}`}
            aria-expanded={isPinned}
            aria-controls={isOpen ? cardId : undefined}
            aria-label={`${benchmark.name} score: ${score.toFixed(1)}%. ${
              isPinned ? 'Hide details' : 'Show details and source'
            }`}
          >
            {/* The score itself is not a link: nesting one inside this button made it
                unreachable by keyboard. The card below carries the source link. */}
            {scoreContent}
            {provenanceDot}
          </button>

          {isOpen && (
            <div
              ref={cardRef}
              id={cardId}
              className="absolute right-0 top-full z-40 mt-1 w-64 bg-surface-raised border border-line rounded-lg p-3 shadow-lg text-left"
              role={isPinned ? 'dialog' : 'tooltip'}
              aria-label={isPinned ? `${benchmark.name} details` : undefined}
            >
              <div className="text-sm font-sans">
                <div className="font-semibold text-fg">{benchmark.name}</div>
                <div className="mt-2 text-xs text-fg-secondary leading-relaxed">
                  {benchmark.eli5}
                </div>
                {benchmark.sourceOrganization && (
                  <div className="mt-2 text-xs text-fg-muted">
                    Source:{' '}
                    <span className="font-medium text-fg-secondary">
                      {benchmark.sourceOrganization}
                    </span>
                  </div>
                )}
                {provenance && (
                  <div className="mt-2 text-xs text-fg-muted">
                    This score:{' '}
                    <span className="font-medium text-fg-secondary">{provenance.detail}</span>
                  </div>
                )}
                <div className="mt-3">
                  <a
                    href={benchmark.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-deep hover:text-accent-deep/80 text-xs font-medium transition-colors"
                  >
                    View source →
                  </a>
                </div>
                {!isPinned && (
                  <div className="mt-2 text-[10px] text-fg-faint">
                    Click the score to keep this open
                  </div>
                )}
              </div>
            </div>
          )}
        </span>
      ) : (
        <>
          {scoreContent}
          {provenanceDot}
        </>
      )}
    </td>
  )
}
