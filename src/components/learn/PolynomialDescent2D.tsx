import { useEffect, useMemo, useState } from 'react'
import { descendPolynomial, polynomialLoss, seededValue } from './lossLandscape'

const WIDTH = 640
const HEIGHT = 270
const PAD = 34
const X_MIN = -3.4
const X_MAX = 2.8
const Y_MAX = 5.3
const STEPS = 36
const MIN_RATE = 0.04
const MAX_RATE = 0.8

function chartX(x: number): number {
  return PAD + ((x - X_MIN) / (X_MAX - X_MIN)) * (WIDTH - PAD * 2)
}

function chartY(y: number): number {
  return HEIGHT - PAD - (y / Y_MAX) * (HEIGHT - PAD * 2)
}

const curve = Array.from({ length: 121 }, (_, index) => {
  const x = X_MIN + (index / 120) * (X_MAX - X_MIN)
  return { x, y: polynomialLoss(x) }
})

function svgPath(points: Array<{ x: number; y: number }>): string {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${chartX(point.x).toFixed(1)} ${chartY(point.y).toFixed(1)}`)
    .join(' ')
}

export function PolynomialDescent2D() {
  const [start, setStart] = useState(-0.4)
  const [seedText, setSeedText] = useState('7')
  const [learningRate, setLearningRate] = useState(0.08)
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState('')
  const path = useMemo(() => descendPolynomial(start, STEPS, learningRate), [learningRate, start])
  const current = path[step]
  const basin = current.x < 0 ? 'left valley' : 'right valley'

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => {
      setStep((value) => {
        if (value >= STEPS) {
          setPlaying(false)
          return STEPS
        }
        return value + 1
      })
    }, 75)
    return () => window.clearInterval(timer)
  }, [playing])

  const startTraining = () => {
    setStep(0)
    setPlaying(true)
  }

  const useSeed = () => {
    const seed = Number(seedText)
    if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) {
      setError('Enter a whole-number seed from 0 to 4,294,967,295.')
      return
    }
    setStart(seededValue(seed, X_MIN, X_MAX))
    setStep(0)
    setPlaying(false)
    setError('')
  }

  return (
    <section className="rounded-lg border border-line p-4" aria-labelledby="polynomial-descent-title">
      <h2 id="polynomial-descent-title" className="text-lg font-semibold tracking-tight">
        One weight, two valleys
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-fg-secondary">
        This polynomial is a teaching model, not Doodle-64's real loss. Pick a reproducible random
        start, change the stride, then watch the same downhill rule settle in a local minimum.
      </p>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-4 w-full"
        role="img"
        aria-label={`Polynomial loss curve. Gradient descent is at step ${step} of ${STEPS} in the ${basin}.`}
      >
        <line x1={PAD} y1={HEIGHT - PAD} x2={WIDTH - PAD} y2={HEIGHT - PAD} stroke="var(--color-line-strong)" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={HEIGHT - PAD} stroke="var(--color-line-strong)" />
        <path d={svgPath(curve)} fill="none" stroke="var(--color-fg-muted)" strokeWidth="2" />
        <path
          d={svgPath(path.slice(0, step + 1))}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="3"
        />
        {path.slice(0, step + 1).map((point, index) => (
          <circle
            key={index}
            cx={chartX(point.x)}
            cy={chartY(point.y)}
            r={index === step ? 5 : 2}
            fill="var(--color-accent)"
            opacity={index === step ? 1 : 0.45}
          />
        ))}
        <text x={WIDTH / 2} y={HEIGHT - 7} textAnchor="middle" fill="var(--color-fg-muted)" className="text-[11px]">
          weight value
        </text>
        <text x={10} y={20} fill="var(--color-fg-muted)" className="text-[11px]">
          loss
        </text>
      </svg>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Starting point">
        <button
          type="button"
          onClick={() => {
            setStart(-0.4)
            setStep(0)
            setPlaying(false)
          }}
          aria-pressed={start === -0.4}
          className="rounded border border-line bg-surface-raised px-3 py-2 text-sm font-medium hover:border-line-strong"
        >
          Start left of the ridge
        </button>
        <button
          type="button"
          onClick={() => {
            setStart(0.45)
            setStep(0)
            setPlaying(false)
          }}
          aria-pressed={start === 0.45}
          className="rounded border border-line bg-surface-raised px-3 py-2 text-sm font-medium hover:border-line-strong"
        >
          Start right of the ridge
        </button>
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="text-sm font-medium">
          Polynomial random seed
          <input
            type="number"
            min="0"
            max="4294967295"
            step="1"
            value={seedText}
            onChange={(event) => setSeedText(event.target.value)}
            className="mt-1 block w-44 rounded border border-line bg-surface-raised px-3 py-2 font-mono tabular-nums"
          />
        </label>
        <button type="button" onClick={useSeed} className="rounded border border-line bg-surface-raised px-3 py-2 text-sm font-medium hover:border-line-strong">
          Choose seeded start
        </button>
        <button type="button" onClick={startTraining} className="rounded bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-deep">
          {playing ? 'Training…' : 'Start training'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-seg-3" role="alert">{error}</p>}
      <label className="mt-4 block text-xs text-fg-muted">
        Learning rate: <span className="font-mono tabular-nums">{learningRate.toFixed(2)}</span>
        <input
          type="range"
          min={MIN_RATE}
          max={MAX_RATE}
          step="0.04"
          value={learningRate}
          aria-label="Polynomial learning rate"
          onChange={(event) => {
            setLearningRate(Number(event.target.value))
            setStep(0)
            setPlaying(false)
          }}
          className="mt-1 w-full accent-[var(--color-accent)]"
        />
      </label>
      <p className="mt-2 text-xs leading-relaxed text-fg-muted">
        A small rate creeps steadily downhill. Near the high end, each stride can leap over the
        valley and bounce back; this is overshooting, not a better route.
      </p>
      <label className="mt-4 block text-xs text-fg-muted">
        Descent step
        <input
          type="range"
          min={0}
          max={STEPS}
          value={step}
          onChange={(event) => setStep(Number(event.target.value))}
          className="mt-1 w-full accent-[var(--color-accent)]"
        />
      </label>
      <p className="mt-3 text-sm text-fg-secondary" role="status">
        Step {step}: weight {current.x.toFixed(2)}, loss {current.y.toFixed(2)}. This start reaches the{' '}
        {basin}; different starts can settle in different local minima.
      </p>
    </section>
  )
}
