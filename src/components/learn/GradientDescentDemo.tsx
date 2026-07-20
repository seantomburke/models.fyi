import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  GRID_SIZE,
  LEARNING_RATE,
  PIXEL_COUNT,
  TRAINING_RUN,
  TRAINING_SET,
} from './gradientDescent'

/**
 * The main event: all 64 weights, drawn as 64 lines, sweeping from random
 * starting values to the values training found. Plus a live 8x8 heatmap of the
 * same weights (noise → recognizable pattern) and the loss curve underneath.
 *
 * Everything is driven off the recorded history in gradientDescent.ts, so the
 * shapes on screen are the real training trajectory, not an easing curve.
 */

const { history, lossCurve } = TRAINING_RUN
const LAST_EPOCH = history.length - 1

const CHART_W = 640
const CHART_H = 300
const PAD_L = 46
const PAD_R = 14
const PAD_T = 14
const PAD_B = 30

const LOSS_H = 170

/** Frames per second the playhead advances at. */
const FPS = 24

const weightBounds = (() => {
  let min = Infinity
  let max = -Infinity
  for (const snap of history) {
    for (const w of snap.weights) {
      if (w < min) min = w
      if (w > max) max = w
    }
  }
  const pad = (max - min) * 0.06
  return { min: min - pad, max: max + pad }
})()

const maxLoss = Math.max(...lossCurve)

function epochX(epoch: number): number {
  return PAD_L + (epoch / LAST_EPOCH) * (CHART_W - PAD_L - PAD_R)
}

function weightY(w: number): number {
  const t = (w - weightBounds.min) / (weightBounds.max - weightBounds.min)
  return CHART_H - PAD_B - t * (CHART_H - PAD_T - PAD_B)
}

function lossY(loss: number): number {
  return LOSS_H - PAD_B - (loss / maxLoss) * (LOSS_H - PAD_T - PAD_B)
}

/**
 * One path per weight, precomputed once. Slicing a prebuilt point list per
 * frame is far cheaper than rebuilding 64 strings from the history each tick.
 */
const WEIGHT_POINTS: Array<Array<[number, number]>> = Array.from(
  { length: PIXEL_COUNT },
  (_, i) => history.map((snap) => [epochX(snap.epoch), weightY(snap.weights[i])] as [number, number])
)

const LOSS_POINTS: Array<[number, number]> = lossCurve.map((loss, epoch) => [
  epochX(epoch),
  lossY(loss),
])

function toPath(points: Array<[number, number]>, upTo: number): string {
  let d = ''
  for (let i = 0; i <= upTo; i++) {
    d += `${i === 0 ? 'M' : 'L'}${points[i][0].toFixed(1)} ${points[i][1].toFixed(1)}`
  }
  return d
}

/** Warm for weights that end up voting "3", cool for weights that vote "E". */
function weightColor(final: number): string {
  return final >= 0 ? 'var(--color-seg-5)' : 'var(--color-seg-3)'
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function GradientDescentDemo() {
  const [epoch, setEpoch] = useState(0)
  const [playing, setPlaying] = useState(false)
  const rafRef = useRef<number | null>(null)

  const snapshot = history[epoch]

  const play = useCallback(() => {
    if (prefersReducedMotion()) {
      // No sweep for readers who asked for stillness: jump to the trained model.
      setEpoch(LAST_EPOCH)
      return
    }
    setEpoch((e) => (e >= LAST_EPOCH ? 0 : e))
    setPlaying(true)
  }, [])

  useEffect(() => {
    if (!playing) return
    let last = performance.now()
    const tick = (now: number) => {
      if (now - last >= 1000 / FPS) {
        last = now
        setEpoch((e) => {
          if (e >= LAST_EPOCH) {
            setPlaying(false)
            return LAST_EPOCH
          }
          return e + 1
        })
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [playing])

  const reset = () => {
    setPlaying(false)
    setEpoch(0)
  }

  const gridExtent = useMemo(() => {
    const m = Math.max(...snapshot.weights.map((w) => Math.abs(w)), 0.25)
    return m
  }, [snapshot])

  const started = history[0]
  const progress = epoch / LAST_EPOCH

  return (
    <div className="space-y-8">
      {/* The 64 converging weights */}
      <div>
        <h4 className="text-sm font-semibold">64 weights, converging</h4>
        <p className="mt-1 text-sm text-fg-secondary">
          Every line is one weight. They all start scattered at random on the left, and gradient
          descent bends them toward the values that separate a 3 from an E. Press play and watch
          the fan close.
        </p>

        <div className="mt-4 overflow-x-auto">
          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            className="w-full min-w-[320px]"
            role="img"
            aria-label={`Chart of 64 weights over ${LAST_EPOCH} training epochs, currently showing epoch ${epoch}`}
          >
            {/* Zero line: weights above it argue for "3", below it for "E" */}
            <line
              x1={PAD_L}
              y1={weightY(0)}
              x2={CHART_W - PAD_R}
              y2={weightY(0)}
              stroke="var(--color-line-strong)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text
              x={PAD_L - 6}
              y={weightY(0) + 3}
              textAnchor="end"
              className="text-[10px]"
              fill="var(--color-fg-muted)"
            >
              0
            </text>
            <text
              x={PAD_L - 6}
              y={PAD_T + 8}
              textAnchor="end"
              className="text-[10px]"
              fill="var(--color-fg-muted)"
            >
              votes "3"
            </text>
            <text
              x={PAD_L - 6}
              y={CHART_H - PAD_B}
              textAnchor="end"
              className="text-[10px]"
              fill="var(--color-fg-muted)"
            >
              votes "E"
            </text>

            {WEIGHT_POINTS.map((points, i) => (
              <path
                key={i}
                d={toPath(points, epoch)}
                fill="none"
                stroke={weightColor(TRAINING_RUN.finalWeights[i])}
                strokeWidth="1.2"
                opacity="0.55"
              />
            ))}

            {/* Playhead dots: where each weight sits right now */}
            {WEIGHT_POINTS.map((points, i) => (
              <circle
                key={`d-${i}`}
                cx={points[epoch][0]}
                cy={points[epoch][1]}
                r="2"
                fill={weightColor(TRAINING_RUN.finalWeights[i])}
                opacity="0.85"
              />
            ))}

            <text
              x={(PAD_L + CHART_W - PAD_R) / 2}
              y={CHART_H - 6}
              textAnchor="middle"
              className="text-[11px] font-medium"
              fill="var(--color-fg-muted)"
            >
              training epochs →
            </text>
          </svg>
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-lg border border-line p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={playing ? () => setPlaying(false) : play}
            className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-deep"
          >
            {playing ? '❚❚ Pause' : epoch >= LAST_EPOCH ? '▶ Replay' : '▶ Play training'}
          </button>
          <button
            onClick={reset}
            className="rounded border border-line bg-surface-raised px-4 py-2 text-sm font-medium text-fg hover:bg-line"
          >
            Reset to random
          </button>
          <span className="text-sm text-fg-secondary" role="status">
            Epoch {epoch} of {LAST_EPOCH} · loss {snapshot.loss.toFixed(3)} · accuracy{' '}
            {(snapshot.accuracy * 100).toFixed(0)}%
          </span>
        </div>

        <label className="mt-4 block">
          <span className="text-xs text-fg-muted">Scrub through training</span>
          <input
            type="range"
            min={0}
            max={LAST_EPOCH}
            value={epoch}
            aria-label="Training epoch"
            onChange={(e) => {
              setPlaying(false)
              setEpoch(Number(e.target.value))
            }}
            className="mt-1 w-full accent-[var(--color-accent)]"
          />
        </label>
      </div>

      {/* Heatmap + loss curve, side by side on wide screens */}
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold">The same weights, as an 8x8 picture</h4>
          <p className="mt-1 text-sm text-fg-secondary">
            Noise at epoch 0. By the end, the E's left edge has gone pink and the 3's right curve
            has gone green — the model drew its own template.
          </p>
          <div
            className="mt-4 inline-grid gap-1 rounded border border-line p-3"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
            role="img"
            aria-label={`Learned weight heatmap at epoch ${epoch}`}
          >
            {snapshot.weights.map((w, i) => {
              const intensity = Math.min(Math.abs(w) / gridExtent, 1)
              const background =
                w >= 0
                  ? `rgba(27, 175, 122, ${0.08 + intensity * 0.85})`
                  : `rgba(232, 123, 164, ${0.08 + intensity * 0.85})`
              return (
                <div
                  key={i}
                  className="h-6 w-6 rounded-sm border border-line sm:h-7 sm:w-7"
                  style={{ background }}
                  title={`Pixel ${i}: weight ${w.toFixed(2)}`}
                />
              )
            })}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold">How wrong the model still is</h4>
          <p className="mt-1 text-sm text-fg-secondary">
            The loss: one number for "how badly are we doing right now". Gradient descent has
            exactly one job, and it's to push this line down.
          </p>
          <div className="mt-4 overflow-x-auto">
            <svg
              viewBox={`0 0 ${CHART_W} ${LOSS_H}`}
              className="w-full min-w-[280px]"
              role="img"
              aria-label={`Loss curve, currently ${snapshot.loss.toFixed(3)} at epoch ${epoch}`}
            >
              <line
                x1={PAD_L}
                y1={LOSS_H - PAD_B}
                x2={CHART_W - PAD_R}
                y2={LOSS_H - PAD_B}
                stroke="var(--color-line-strong)"
                strokeWidth="1"
              />
              <path
                d={toPath(LOSS_POINTS, LAST_EPOCH)}
                fill="none"
                stroke="var(--color-fg-faint)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <path
                d={toPath(LOSS_POINTS, epoch)}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="2.5"
              />
              <circle
                cx={LOSS_POINTS[epoch][0]}
                cy={LOSS_POINTS[epoch][1]}
                r="4"
                fill="var(--color-accent)"
              />
              <text
                x={PAD_L - 6}
                y={PAD_T + 8}
                textAnchor="end"
                className="text-[10px]"
                fill="var(--color-fg-muted)"
              >
                {maxLoss.toFixed(1)}
              </text>
              <text
                x={PAD_L - 6}
                y={LOSS_H - PAD_B}
                textAnchor="end"
                className="text-[10px]"
                fill="var(--color-fg-muted)"
              >
                0
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* What just happened */}
      <div className="rounded-lg border border-line p-4 text-sm text-fg-secondary">
        <p>
          Start: loss {started.loss.toFixed(3)}, accuracy {(started.accuracy * 100).toFixed(0)}% on{' '}
          {TRAINING_SET.length} training drawings, with 64 weights picked out of a hat. End: loss{' '}
          {history[LAST_EPOCH].loss.toFixed(3)}, accuracy{' '}
          {(history[LAST_EPOCH].accuracy * 100).toFixed(0)}%. Nobody told the model which pixels
          matter. It found them by taking {LAST_EPOCH} small steps downhill, each one the size of
          the learning rate ({LEARNING_RATE}).
        </p>
        <p className="mt-3">
          You are {(progress * 100).toFixed(0)}% of the way through that run.
        </p>
      </div>
    </div>
  )
}
