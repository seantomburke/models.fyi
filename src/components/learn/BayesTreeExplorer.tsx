import { useState } from 'react'
import {
  bayesTree,
  DEFAULT_PRIOR,
  DEFAULT_SENSITIVITY,
  DEFAULT_FALSE_POSITIVE_RATE,
} from './bayesModel'

/** Format a probability as a percentage with just enough precision. */
function pct(p: number): string {
  const v = p * 100
  if (v === 0 || v === 100) return `${v}%`
  return `${v < 10 ? v.toFixed(1) : v.toFixed(0)}%`
}

/**
 * The interactive probability tree: drag the three sliders (prior,
 * sensitivity, false-positive rate) and watch the branch probabilities,
 * the joint probabilities at the leaves, and the Bayes posterior update.
 * Plain SVG, computed at render time; SSR-safe by construction.
 */
export function BayesTreeExplorer() {
  const [prior, setPrior] = useState(DEFAULT_PRIOR)
  const [sensitivity, setSensitivity] = useState(DEFAULT_SENSITIVITY)
  const [fpr, setFpr] = useState(DEFAULT_FALSE_POSITIVE_RATE)

  const tree = bayesTree(prior, sensitivity, fpr)
  const leaf = (id: string) => tree.leaves.find((l) => l.id === id)!.joint

  // Per-1000-people counts make the joint probabilities concrete.
  const per1000 = (p: number) => {
    const n = p * 1000
    // Snap float noise (0.009 × 1000 = 9.000000000000002) to whole people.
    return Math.abs(n - Math.round(n)) < 1e-9 ? String(Math.round(n)) : n.toFixed(1)
  }

  // Tree geometry: root at left, two stage-1 nodes, four leaves at right.
  const W = 560
  const H = 320
  const rootX = 40
  const midX = 250
  const leafX = 460
  const rootY = H / 2
  const sickY = 90
  const healthyY = 230
  const leafYs = { sickPos: 40, sickNeg: 130, healthyPos: 190, healthyNeg: 285 }

  const branch = (
    x1: number, y1: number, x2: number, y2: number, label: string, p: number, key: string,
  ) => (
    <g key={key}>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="var(--color-accent)"
        strokeWidth={1 + p * 5}
        opacity={0.35 + p * 0.6}
      />
      <text
        x={(x1 + x2) / 2}
        y={(y1 + y2) / 2 - 7}
        textAnchor="middle"
        className="text-[11px] font-medium"
        fill="var(--color-fg-secondary)"
      >
        {label} {pct(p)}
      </text>
    </g>
  )

  const sliders: Array<{
    id: string
    label: string
    value: number
    set: (v: number) => void
    min: number
    max: number
    hint: string
  }> = [
    {
      id: 'bayes-prior',
      label: 'P(sick): the prior',
      value: prior,
      set: setPrior,
      min: 0.001,
      max: 0.5,
      hint: 'How common the illness is before anyone gets tested.',
    },
    {
      id: 'bayes-sensitivity',
      label: 'P(positive | sick): sensitivity',
      value: sensitivity,
      set: setSensitivity,
      min: 0.5,
      max: 1,
      hint: 'How often the test catches a sick person.',
    },
    {
      id: 'bayes-fpr',
      label: 'P(positive | healthy): false-positive rate',
      value: fpr,
      set: setFpr,
      min: 0,
      max: 0.5,
      hint: 'How often the test wrongly flags a healthy person.',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-line bg-bg-secondary p-6">
        <h3 className="text-lg font-semibold">The probability tree</h3>
        <p className="mt-2 text-sm text-fg-secondary">
          Two stages: first whether the person is sick, then how the test comes back. Each
          branch carries its probability, and multiplying along a path gives the joint
          probability at the leaf. Drag the sliders and watch every number move.
        </p>

        <div className="mt-6 space-y-5">
          {sliders.map((s) => (
            <div key={s.id}>
              <div className="flex items-center justify-between">
                <label htmlFor={s.id} className="text-sm font-medium">
                  {s.label}
                </label>
                <span className="font-mono text-sm text-accent">{pct(s.value)}</span>
              </div>
              <input
                id={s.id}
                type="range"
                min={s.min}
                max={s.max}
                step="0.001"
                value={s.value}
                onChange={(e) => s.set(parseFloat(e.target.value))}
                className="mt-2 w-full"
              />
              <p className="mt-1 text-xs text-fg-muted">{s.hint}</p>
            </div>
          ))}
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="mt-6 w-full"
          role="img"
          aria-label={`Probability tree: prior ${pct(prior)}, sensitivity ${pct(sensitivity)}, false-positive rate ${pct(fpr)}, posterior ${pct(tree.posterior)}`}
        >
          {/* Stage 1 branches */}
          {branch(rootX + 8, rootY, midX - 34, sickY, 'sick', prior, 's1-sick')}
          {branch(rootX + 8, rootY, midX - 34, healthyY, 'healthy', 1 - prior, 's1-healthy')}
          {/* Stage 2 branches */}
          {branch(midX + 32, sickY, leafX - 8, leafYs.sickPos, '+', sensitivity, 's2-sick-pos')}
          {branch(midX + 32, sickY, leafX - 8, leafYs.sickNeg, '−', 1 - sensitivity, 's2-sick-neg')}
          {branch(midX + 32, healthyY, leafX - 8, leafYs.healthyPos, '+', fpr, 's2-healthy-pos')}
          {branch(midX + 32, healthyY, leafX - 8, leafYs.healthyNeg, '−', 1 - fpr, 's2-healthy-neg')}

          {/* Root */}
          <circle cx={rootX} cy={rootY} r="8" fill="var(--color-accent-deep)" />
          <text x={rootX} y={rootY + 24} textAnchor="middle" className="text-[11px]" fill="var(--color-fg-muted)">
            1000 people
          </text>

          {/* Stage-1 nodes */}
          <text x={midX} y={sickY + 4} textAnchor="middle" className="text-[12px] font-semibold" fill="var(--color-fg)">
            sick
          </text>
          <text x={midX} y={healthyY + 4} textAnchor="middle" className="text-[12px] font-semibold" fill="var(--color-fg)">
            healthy
          </text>

          {/* Leaves: joint probabilities */}
          {(
            [
              ['sickPos', 'sick & positive', true],
              ['sickNeg', 'sick & negative', false],
              ['healthyPos', 'healthy & positive', true],
              ['healthyNeg', 'healthy & negative', false],
            ] as const
          ).map(([id, label, positive]) => (
            <g key={id}>
              <text
                x={leafX}
                y={leafYs[id]}
                className={`text-[11px] ${positive ? 'font-semibold' : ''}`}
                fill={positive ? 'var(--color-fg)' : 'var(--color-fg-muted)'}
              >
                {label}
              </text>
              <text x={leafX} y={leafYs[id] + 14} className="font-mono text-[11px]" fill={positive ? 'var(--color-accent-deep)' : 'var(--color-fg-muted)'}>
                {pct(leaf(id))} · {per1000(leaf(id))} people
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="rounded-lg border border-line bg-accent-soft/60 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-fg-secondary">
          Bayes' theorem, with these numbers
        </h3>
        <p className="mt-3 font-mono text-sm leading-relaxed">
          P(sick | positive) = P(positive | sick) · P(sick) / P(positive)
        </p>
        <p className="mt-2 font-mono text-sm leading-relaxed text-fg-secondary">
          = ({pct(sensitivity)} × {pct(prior)}) / ({pct(leaf('sickPos'))} + {pct(leaf('healthyPos'))})
          {' '}= {pct(leaf('sickPos'))} / {pct(tree.evidence)}
        </p>
        <p className="mt-4 text-center text-4xl font-bold text-accent" data-testid="bayes-posterior">
          {pct(tree.posterior)}
        </p>
        <p className="mt-1 text-center text-sm text-fg-secondary">
          chance of actually being sick, given a positive test
        </p>
        <p className="mt-4 border-t border-line pt-3 text-sm leading-relaxed text-fg-secondary">
          In people terms: of 1000 tested, {per1000(leaf('sickPos'))} are sick and test positive,
          while {per1000(leaf('healthyPos'))} are healthy and test positive anyway. A positive
          result puts you in a group of {per1000(tree.evidence)} people, and only{' '}
          {per1000(leaf('sickPos'))} of them are sick.
        </p>
      </div>
    </div>
  )
}
