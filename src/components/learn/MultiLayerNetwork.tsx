import { useEffect, useMemo, useState } from 'react'
import { HoverableNode } from './NodePatternTooltip'

/**
 * Animated forward pass through a small deep network.
 * Real math (random weights, sigmoid activations) — the animation
 * steps layer by layer so you can watch values flow left to right.
 */

const LAYER_SIZES = [4, 5, 5, 2]
const SVG_W = 560
const SVG_H = 320
const STEP_MS = 900

type WeightMatrix = number[][] // [toNode][fromNode], values in [-1, 1]

function randomWeights(): WeightMatrix[] {
  return LAYER_SIZES.slice(1).map((size, l) =>
    Array.from({ length: size }, () =>
      Array.from({ length: LAYER_SIZES[l] }, () => Math.random() * 2 - 1)
    )
  )
}

function randomInputs(): number[] {
  return Array.from({ length: LAYER_SIZES[0] }, () => Math.round(Math.random() * 100) / 100)
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

/** Forward pass: returns activations for every layer, inputs included. */
function forward(inputs: number[], weights: WeightMatrix[]): number[][] {
  const layers = [inputs]
  for (const matrix of weights) {
    const prev = layers[layers.length - 1]
    layers.push(matrix.map((row) => sigmoid(row.reduce((sum, w, i) => sum + w * prev[i], 0))))
  }
  return layers
}

function nodeX(layer: number): number {
  return 60 + (layer * (SVG_W - 140)) / (LAYER_SIZES.length - 1)
}

function nodeY(layer: number, index: number): number {
  const count = LAYER_SIZES[layer]
  const spacing = (SVG_H - 60) / count
  return 30 + spacing * (index + 0.5)
}

export function MultiLayerNetwork() {
  const [weights, setWeights] = useState<WeightMatrix[]>(randomWeights)
  const [inputs, setInputs] = useState<number[]>(randomInputs)
  // Which layer the signal has reached: -1 = idle, LAYER_SIZES.length - 1 = done
  const [step, setStep] = useState(-1)
  const [running, setRunning] = useState(false)

  const activations = useMemo(() => forward(inputs, weights), [inputs, weights])

  useEffect(() => {
    if (!running) return
    if (step >= LAYER_SIZES.length - 1) {
      setRunning(false)
      return
    }
    const id = setTimeout(() => setStep(step + 1), STEP_MS)
    return () => clearTimeout(id)
  }, [running, step])

  const run = () => {
    setStep(0)
    setRunning(true)
  }

  const runWithNewInputs = () => {
    setInputs(randomInputs())
    setStep(0)
    setRunning(true)
  }

  const rerollWeights = () => {
    setWeights(randomWeights())
    setStep(0)
    setRunning(true)
  }

  const done = step >= LAYER_SIZES.length - 1
  const outputs = activations[activations.length - 1]
  const winner = outputs[0] >= outputs[1] ? 0 : 1
  const layerLabels = ['Inputs', 'Hidden 1', 'Hidden 2', 'Outputs']

  return (
    <div className="rounded-lg border border-line bg-bg-secondary p-6">
      <h3 className="text-lg font-semibold">Watch a signal travel through a deep network</h3>
      <p className="mt-2 text-sm text-fg-secondary">
        This network has {LAYER_SIZES.join(' → ')} neurons across {LAYER_SIZES.length} layers, and{' '}
        {weights.reduce((n, m) => n + m.length * m[0].length, 0)} weights in total. Press play and watch each
        layer compute its values from the layer before it.
      </p>

      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="mt-6 w-full" role="img" aria-label="Multi-layer neural network animation">
        {/* Edges */}
        {weights.map((matrix, l) =>
          matrix.map((row, to) =>
            row.map((w, from) => {
              const active = step > l
              const inFlight = step === l + 1 && running
              return (
                <line
                  key={`e-${l}-${from}-${to}`}
                  x1={nodeX(l)}
                  y1={nodeY(l, from)}
                  x2={nodeX(l + 1)}
                  y2={nodeY(l + 1, to)}
                  stroke={w >= 0 ? 'var(--color-accent)' : '#e0653f'}
                  strokeWidth={0.5 + Math.abs(w) * 2}
                  opacity={active || inFlight ? 0.15 + Math.abs(w) * 0.55 : 0.08}
                  style={{ transition: 'opacity 400ms ease' }}
                />
              )
            })
          )
        )}

        {/* Nodes */}
        {LAYER_SIZES.map((size, l) =>
          Array.from({ length: size }, (_, i) => {
            const reached = step >= l
            const value = activations[l][i]
            const isWinner = done && l === LAYER_SIZES.length - 1 && i === winner
            const marks = (
              <>
                <circle
                  cx={nodeX(l)}
                  cy={nodeY(l, i)}
                  r={l === LAYER_SIZES.length - 1 ? 20 : 15}
                  fill="var(--color-accent-deep)"
                  opacity={reached ? 0.25 + value * 0.75 : 0.12}
                  stroke={isWinner ? 'var(--color-accent-deep)' : 'none'}
                  strokeWidth="3"
                  style={{ transition: 'opacity 400ms ease' }}
                />
                {reached && (
                  <text
                    x={nodeX(l)}
                    y={nodeY(l, i) + 3.5}
                    textAnchor="middle"
                    className="text-[9px] font-semibold"
                    fill="white"
                  >
                    {value.toFixed(2)}
                  </text>
                )}
              </>
            )

            // Only the hidden layers get a hover card. These weights are random,
            // so a hidden node here has no name and no picture — what it does have
            // is the weight vector it applies, which is the honest answer to
            // "what pattern is this node looking for?" for an untrained network.
            const isHidden = l > 0 && l < LAYER_SIZES.length - 1
            if (!isHidden) return <g key={`n-${l}-${i}`}>{marks}</g>

            const incoming = weights[l - 1][i]
            return (
              <HoverableNode
                key={`n-${l}-${i}`}
                cx={nodeX(l)}
                cy={nodeY(l, i)}
                hitRadius={18}
                svgWidth={SVG_W}
                pattern={{
                  name: `${layerLabels[l]}, neuron ${i + 1}`,
                  color: 'var(--color-accent-deep)',
                  blurb: `Looks for this pattern in the layer before it: ${incoming
                    .map((w) => w.toFixed(2))
                    .join(', ')}. Positive weights excite it, negative ones dampen it.`,
                  activation: reached ? value : undefined,
                }}
              >
                {marks}
              </HoverableNode>
            )
          })
        )}

        {/* Layer labels */}
        {layerLabels.map((label, l) => (
          <text
            key={label}
            x={nodeX(l)}
            y={SVG_H - 8}
            textAnchor="middle"
            className="text-[11px] font-medium"
            fill={step >= l ? 'var(--color-fg)' : 'var(--color-fg-muted)'}
            style={{ transition: 'fill 400ms ease' }}
          >
            {label}
          </text>
        ))}
      </svg>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={run}
          disabled={running}
          className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-deep disabled:opacity-50"
        >
          {running ? 'Running…' : done ? 'Replay' : '▶ Run forward pass'}
        </button>
        <button
          onClick={runWithNewInputs}
          disabled={running}
          className="rounded border border-line bg-bg-tertiary px-4 py-2 text-sm font-medium hover:bg-bg-secondary disabled:opacity-50"
        >
          New inputs
        </button>
        <button
          onClick={rerollWeights}
          disabled={running}
          className="rounded border border-line bg-bg-tertiary px-4 py-2 text-sm font-medium hover:bg-bg-secondary disabled:opacity-50"
        >
          Random weights
        </button>
        {done && (
          <span className="text-sm text-fg-secondary" role="status">
            Output {winner + 1} wins with {outputs[winner].toFixed(2)}
          </span>
        )}
      </div>

      <p className="mt-4 text-xs text-fg-muted">
        Blue lines are positive weights (excite the next neuron), orange lines are negative (dampen it).
        Thicker = stronger. Each neuron squashes its weighted sum into 0–1, and brighter circles mean values
        closer to 1. Hit "Random weights" and the same inputs give a completely different answer.
        The knowledge is in the weights.
      </p>
    </div>
  )
}
