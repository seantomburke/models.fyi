import { useMemo } from 'react'
import type { TrainingRun } from './gradientDescent'

const CHART_W = 480
const CHART_H = 220
const PAD_X = 8
const PAD_Y = 10

/**
 * Every one of the 64 weights drawn as its own line across the epochs, so the
 * viewer literally watches the weights converge: a tangle of near-zero noise
 * on the left that fans out and settles into steady bands on the right. The
 * epoch scrubber's position is marked with a sweep line, and the history to
 * the right of it is ghosted — the same past/future treatment as the loss
 * chart on the gradient descent page.
 */
export function WeightTrajectoryChart({ run, epoch }: { run: TrainingRun; epoch: number }) {
  const lastEpoch = run.history.length - 1

  const geometry = useMemo(() => {
    let min = 0
    let max = 0
    for (const snapshot of run.history) {
      for (const weight of snapshot.weights) {
        if (weight < min) min = weight
        if (weight > max) max = weight
      }
    }
    const span = Math.max(max - min, 0.5)
    const x = (e: number) => PAD_X + (e / Math.max(lastEpoch, 1)) * (CHART_W - PAD_X * 2)
    const y = (w: number) => PAD_Y + ((max - w) / span) * (CHART_H - PAD_Y * 2)
    const count = run.history[0].weights.length
    const paths = Array.from({ length: count }, (_, i) =>
      run.history.map((snapshot, e) => `${e === 0 ? 'M' : 'L'}${x(e).toFixed(1)} ${y(snapshot.weights[i]).toFixed(1)}`).join('')
    )
    // Color each line by where the weight ends up: green pulls toward 3, red toward E.
    const finals = run.finalWeights
    const extent = Math.max(...finals.map((w) => Math.abs(w)), 0.25)
    return { x, y, zeroY: y(0), paths, finals, extent }
  }, [run, lastEpoch])

  return (
    <div>
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="w-full rounded border border-line"
        role="img"
        aria-label={`All 64 weights over ${lastEpoch} training epochs, currently at epoch ${epoch}`}
      >
        <line x1={PAD_X} y1={geometry.zeroY} x2={CHART_W - PAD_X} y2={geometry.zeroY} stroke="var(--color-line-strong)" strokeWidth="1" strokeDasharray="4 4" />
        {geometry.paths.map((path, i) => {
          const final = geometry.finals[i]
          const alpha = 0.15 + (Math.abs(final) / geometry.extent) * 0.55
          return (
            <path
              key={i}
              d={path}
              fill="none"
              stroke={final >= 0 ? `rgba(34, 197, 94, ${alpha})` : `rgba(239, 68, 68, ${alpha})`}
              strokeWidth="1.1"
            />
          )
        })}
        {/* Ghost the future: a surface-colored veil over epochs not yet reached. */}
        <rect
          x={geometry.x(epoch)}
          y={0}
          width={Math.max(CHART_W - PAD_X - geometry.x(epoch), 0)}
          height={CHART_H}
          fill="var(--color-surface)"
          opacity="0.82"
        />
        <line x1={geometry.x(epoch)} y1={0} x2={geometry.x(epoch)} y2={CHART_H} stroke="var(--color-accent)" strokeWidth="2" />
      </svg>
      <p className="mt-2 text-xs text-fg-muted">
        Each line is one of the 64 weights. They start as random noise near zero, then gradient descent pulls the ones that matter apart — green lines end up voting for 3, red lines for E.
      </p>
    </div>
  )
}
