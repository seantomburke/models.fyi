import { useMemo, useState } from 'react'
import { descendPolynomial, polynomialLoss } from './lossLandscape'

const WIDTH = 640
const HEIGHT = 270
const PAD = 34
const X_MIN = -3.4
const X_MAX = 2.8
const Y_MAX = 5.3
const STEPS = 36

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
  const [step, setStep] = useState(STEPS)
  const path = useMemo(() => descendPolynomial(start, STEPS), [start])
  const current = path[step]
  const basin = current.x < 0 ? 'left valley' : 'right valley'

  return (
    <section className="rounded-lg border border-line p-4" aria-labelledby="polynomial-descent-title">
      <h2 id="polynomial-descent-title" className="text-lg font-semibold tracking-tight">
        One weight, two valleys
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-fg-secondary">
        This polynomial is a teaching model, not Doodle-64's real loss. Move the starting point and
        watch the same downhill rule settle in a different local minimum.
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
            setStep(STEPS)
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
            setStep(STEPS)
          }}
          aria-pressed={start === 0.45}
          className="rounded border border-line bg-surface-raised px-3 py-2 text-sm font-medium hover:border-line-strong"
        >
          Start right of the ridge
        </button>
      </div>
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
        {basin}.
      </p>
    </section>
  )
}
