import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  EPOCHS,
  GRID_SIZE,
  LEARNING_RATE,
  PIXEL_COUNT,
  SEED,
  TRAINING_RUN,
  TRAINING_SET,
  trainGradientDescent,
  type TrainingRun,
} from './gradientDescent'
import { LossSurface3D } from './LossSurface3D'
import { PolynomialDescent2D } from './PolynomialDescent2D'
import { TrainablePixelClassifier } from './TrainablePixelClassifier'

const CHART_W = 640
const CHART_H = 270
const LOSS_H = 150
const PAD_L = 46
const PAD_R = 14
const PAD_T = 14
const PAD_B = 30
const FPS = 24

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function randomSeed(): number {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    return crypto.getRandomValues(new Uint32Array(1))[0]
  }
  return Math.floor(Math.random() * 4294967296)
}

function pathFrom(points: Array<[number, number]>, end: number): string {
  return points
    .slice(0, end + 1)
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ')
}

function weightColor(finalWeight: number): string {
  return finalWeight >= 0 ? 'var(--color-seg-5)' : 'var(--color-seg-3)'
}

export function GradientDescentDemo() {
  const [run, setRun] = useState<TrainingRun>(TRAINING_RUN)
  const [seedText, setSeedText] = useState(String(SEED))
  const [trainedSeed, setTrainedSeed] = useState(SEED)
  const [seedError, setSeedError] = useState('')
  const [epoch, setEpoch] = useState(0)
  const [playing, setPlaying] = useState(false)
  const rafRef = useRef<number | null>(null)
  const lastEpoch = run.history.length - 1
  const snapshot = run.history[epoch]

  const chart = useMemo(() => {
    let minWeight = Infinity
    let maxWeight = -Infinity
    for (const moment of run.history) {
      for (const weight of moment.weights) {
        minWeight = Math.min(minWeight, weight)
        maxWeight = Math.max(maxWeight, weight)
      }
    }
    const weightPadding = Math.max((maxWeight - minWeight) * 0.06, 0.05)
    minWeight -= weightPadding
    maxWeight += weightPadding
    const maxLoss = Math.max(...run.lossCurve)
    const epochX = (value: number) =>
      PAD_L + (value / lastEpoch) * (CHART_W - PAD_L - PAD_R)
    const weightY = (value: number) =>
      CHART_H -
      PAD_B -
      ((value - minWeight) / (maxWeight - minWeight)) * (CHART_H - PAD_T - PAD_B)
    const lossY = (value: number) =>
      LOSS_H - PAD_B - (value / maxLoss) * (LOSS_H - PAD_T - PAD_B)
    return {
      minWeight,
      maxWeight,
      maxLoss,
      weightY,
      weights: Array.from({ length: PIXEL_COUNT }, (_, index) =>
        run.history.map((moment) => [epochX(moment.epoch), weightY(moment.weights[index])] as [number, number])
      ),
      loss: run.lossCurve.map((loss, index) => [epochX(index), lossY(loss)] as [number, number]),
    }
  }, [lastEpoch, run])

  const play = useCallback(() => {
    if (prefersReducedMotion()) {
      setEpoch(lastEpoch)
      setPlaying(false)
      return
    }
    setEpoch((current) => (current >= lastEpoch ? 0 : current))
    setPlaying(true)
  }, [lastEpoch])

  useEffect(() => {
    if (!playing) return
    let previous = performance.now()
    const tick = (now: number) => {
      if (now - previous >= 1000 / FPS) {
        previous = now
        setEpoch((current) => {
          if (current >= lastEpoch) {
            setPlaying(false)
            return lastEpoch
          }
          return current + 1
        })
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [lastEpoch, playing])

  const train = () => {
    if (seedText.trim() === '') {
      setSeedError('Enter a whole number from 0 to 4,294,967,295.')
      return
    }
    const seed = Number(seedText)
    if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) {
      setSeedError('Enter a whole number from 0 to 4,294,967,295.')
      return
    }
    const nextRun = trainGradientDescent({ seed })
    setRun(nextRun)
    setTrainedSeed(seed)
    setEpoch(0)
    setPlaying(false)
    setSeedError('')
  }

  const reset = () => {
    setPlaying(false)
    setEpoch(0)
  }

  const heatExtent = Math.max(...snapshot.weights.map((weight) => Math.abs(weight)), 0.25)
  const starting = run.history[0]
  const ending = run.history[lastEpoch]

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-line p-4" aria-labelledby="training-controls-title">
        <h2 id="training-controls-title" className="text-lg font-semibold tracking-tight">
          Train 64 weights in this browser
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-fg-secondary">
          A seed creates the starting noise. Reuse it to replay the same experiment, or generate a
          new one and train another model.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-sm font-medium">
            Random seed
            <input
              type="number"
              step="1"
              min="0"
              max="4294967295"
              value={seedText}
              aria-describedby={seedError ? 'seed-error' : 'seed-help'}
              onChange={(event) => setSeedText(event.target.value)}
              className="mt-1 block w-52 rounded border border-line bg-surface-raised px-3 py-2 font-mono tabular-nums"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setSeedText(String(randomSeed()))
              setSeedError('')
            }}
            className="rounded border border-line bg-surface-raised px-4 py-2 text-sm font-medium hover:border-line-strong"
          >
            Generate random seed
          </button>
          <button
            type="button"
            onClick={train}
            className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-deep"
          >
            Train model
          </button>
        </div>
        <p id="seed-help" className="mt-2 text-xs text-fg-muted">
          Current model seed: <span className="font-mono tabular-nums">{trainedSeed}</span>
        </p>
        {seedError && (
          <p id="seed-error" className="mt-2 text-sm text-seg-3" role="alert">
            {seedError}
          </p>
        )}
      </section>

      <section aria-labelledby="weight-chart-title">
        <h2 id="weight-chart-title" className="text-lg font-semibold tracking-tight">
          64 weights, converging
        </h2>
        <p className="mt-2 text-sm text-fg-secondary">
          Each line is one learned weight. The paths come from the training run above.
        </p>
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="mt-4 w-full min-w-[320px]"
          role="img"
          aria-label={`Chart of 64 weights over ${lastEpoch} epochs, showing epoch ${epoch}`}
        >
          <line x1={PAD_L} y1={chart.weightY(0)} x2={CHART_W - PAD_R} y2={chart.weightY(0)} stroke="var(--color-line-strong)" strokeDasharray="4 4" />
          {chart.weights.map((points, index) => (
            <path key={index} d={pathFrom(points, epoch)} fill="none" stroke={weightColor(run.finalWeights[index])} strokeWidth="1.2" opacity="0.55" />
          ))}
          {chart.weights.map((points, index) => (
            <circle key={`dot-${index}`} cx={points[epoch][0]} cy={points[epoch][1]} r="2" fill={weightColor(run.finalWeights[index])} opacity="0.85" />
          ))}
          <text x={CHART_W / 2} y={CHART_H - 7} textAnchor="middle" fill="var(--color-fg-muted)" className="text-[11px]">training epochs</text>
        </svg>
      </section>

      <section className="rounded-lg border border-line p-4" aria-label="Training playback">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={playing ? () => setPlaying(false) : play} className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-deep">
            {playing ? 'Pause training' : epoch >= lastEpoch ? 'Replay training' : 'Play training'}
          </button>
          <button type="button" onClick={reset} className="rounded border border-line bg-surface-raised px-4 py-2 text-sm font-medium hover:border-line-strong">
            Reset to random
          </button>
          <span className="text-sm text-fg-secondary" role="status">
            Epoch {epoch} of {lastEpoch} · loss {snapshot.loss.toFixed(3)} · accuracy {(snapshot.accuracy * 100).toFixed(0)}%
          </span>
        </div>
        <label className="mt-4 block text-xs text-fg-muted">
          Scrub through training
          <input
            type="range"
            min={0}
            max={lastEpoch}
            value={epoch}
            aria-label="Training epoch"
            onChange={(event) => {
              setPlaying(false)
              setEpoch(Number(event.target.value))
            }}
            className="mt-1 w-full accent-[var(--color-accent)]"
          />
        </label>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        <section aria-labelledby="weight-picture-title">
          <h2 id="weight-picture-title" className="text-sm font-semibold">The weights as an 8x8 picture</h2>
          <div className="mt-4 inline-grid gap-1 rounded border border-line p-3" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }} role="img" aria-label={`Learned weight heatmap at epoch ${epoch}`}>
            {snapshot.weights.map((weight, index) => {
              const intensity = Math.min(Math.abs(weight) / heatExtent, 1)
              const background = weight >= 0 ? `rgba(27, 175, 122, ${0.08 + intensity * 0.85})` : `rgba(232, 123, 164, ${0.08 + intensity * 0.85})`
              return <span key={index} className="h-6 w-6 rounded-sm border border-line sm:h-7 sm:w-7" style={{ background }} title={`Pixel ${index}: weight ${weight.toFixed(2)}`} />
            })}
          </div>
        </section>
        <section aria-labelledby="loss-chart-title">
          <h2 id="loss-chart-title" className="text-sm font-semibold">Loss falls as training improves</h2>
          <svg viewBox={`0 0 ${CHART_W} ${LOSS_H}`} className="mt-4 w-full" role="img" aria-label={`Loss curve at epoch ${epoch}: ${snapshot.loss.toFixed(3)}`}>
            <path d={pathFrom(chart.loss, lastEpoch)} fill="none" stroke="var(--color-fg-faint)" strokeWidth="1" strokeDasharray="3 3" />
            <path d={pathFrom(chart.loss, epoch)} fill="none" stroke="var(--color-accent)" strokeWidth="3" />
            <circle cx={chart.loss[epoch][0]} cy={chart.loss[epoch][1]} r="4" fill="var(--color-accent)" />
          </svg>
        </section>
      </div>

      <div className="rounded-lg border border-line p-4 text-sm text-fg-secondary">
        Seed <span className="font-mono tabular-nums">{trainedSeed}</span> moved from loss {starting.loss.toFixed(3)} to {ending.loss.toFixed(3)} over {EPOCHS} epochs at learning rate {LEARNING_RATE}. It correctly labels {(ending.accuracy * TRAINING_SET.length).toFixed(0)} of {TRAINING_SET.length} familiar training drawings.
      </div>

      <TrainablePixelClassifier run={run} />
      <PolynomialDescent2D />
      <LossSurface3D />
    </div>
  )
}
