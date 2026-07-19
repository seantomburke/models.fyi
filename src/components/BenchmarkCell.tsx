import { useState, useRef, useEffect } from 'react'
import type { Benchmark } from '../data/types.ts'
import { BenchmarkSourceLink } from './BenchmarkSourceLink.tsx'

interface BenchmarkCellProps {
  benchmark: Benchmark
  score: number | undefined
  isBest: boolean
}

export function BenchmarkCell({ benchmark, score, isBest }: BenchmarkCellProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const scoreContent =
    score === undefined ? (
      <>
        <span aria-hidden>—</span>
        <span className="sr-only">no published score</span>
      </>
    ) : (
      `${score.toFixed(1)}%`
    )

  const confidenceBadge =
    score !== undefined && benchmark.confidence ? (
      <span
        className={`ml-1 inline-block w-2 h-2 rounded-full ${
          benchmark.confidence === 'published'
            ? 'bg-green-500'
            : benchmark.confidence === 'independent'
              ? 'bg-blue-500'
              : 'bg-yellow-500'
        }`}
        title={
          benchmark.confidence === 'published'
            ? 'Published by provider'
            : benchmark.confidence === 'independent'
              ? 'Independent run'
              : 'Mixed sources'
        }
        aria-hidden="true"
      />
    ) : null

  useEffect(() => {
    if (!showTooltip) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setShowTooltip(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showTooltip])

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
      {score !== undefined && benchmark.sourceUrl ? (
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setShowTooltip(!showTooltip)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-deep rounded px-1 py-0.5 inline-flex items-center gap-1"
          title={`${benchmark.name}: ${benchmark.eli5}`}
          aria-label={`${benchmark.name} score: ${scoreContent}. Click for details`}
        >
          <BenchmarkSourceLink
            sourceUrl={benchmark.sourceUrl}
            benchmarkName={benchmark.name}
            variant="wrapper"
            className={isBest ? 'text-accent-deep' : 'text-fg-secondary'}
          >
            {scoreContent}
          </BenchmarkSourceLink>
          {confidenceBadge}
        </button>
      ) : (
        <>
          {scoreContent}
          {confidenceBadge}
        </>
      )}

      {showTooltip && benchmark.sourceUrl && (
        <div
          ref={tooltipRef}
          className="absolute right-0 top-full z-40 mt-1 w-64 bg-surface-raised border border-line rounded-lg p-3 shadow-lg"
          role="tooltip"
        >
          <div className="text-sm">
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
            {benchmark.confidence && (
              <div className="mt-2 text-xs text-fg-muted">
                Type:{' '}
                <span className="font-medium text-fg-secondary">
                  {benchmark.confidence === 'published'
                    ? 'Provider published'
                    : benchmark.confidence === 'independent'
                      ? 'Independent'
                      : 'Mixed sources'}
                </span>
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
          </div>
        </div>
      )}
    </td>
  )
}
