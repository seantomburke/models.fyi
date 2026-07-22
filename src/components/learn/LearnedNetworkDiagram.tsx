import { useEffect, useMemo, useState } from 'react'
import { GRID_SIZE, classifyWithLearnedWeights } from './gradientDescent'
import { prefersReducedMotion } from './useCardAnimation'

/**
 * Animated forward pass through the weights the visitor just trained: the 8x8
 * input matrix as 64 nodes on the left, the two output neurons ("3" and "E")
 * on the right, every edge colored by the learned weight's sign. Same visual
 * language as PixelNetworkDiagram, but wired to whatever the lab's gradient
 * descent run produced — invert the labels and the edge colors flip with them.
 */

const SVG_W = 560
const SVG_H = 340
const STEP_MS = 900
const CELL = 22

const GREEN = '#22c55e'
const RED = '#ef4444'

function inputX(col: number): number {
  return 60 + col * CELL
}

function inputY(row: number): number {
  return 93 + row * CELL
}

const OUTPUT_X = 460
const OUTPUT_Y = [115, 225]

interface LearnedNetworkDiagramProps {
  pixels: boolean[]
  weights: number[]
  bias: number
}

export function LearnedNetworkDiagram({ pixels, weights, bias }: LearnedNetworkDiagramProps) {
  // -1 = idle, 0 = inputs lit, 1 = outputs computed
  const [step, setStep] = useState(-1)
  const [running, setRunning] = useState(false)

  const result = useMemo(() => classifyWithLearnedWeights(weights, bias, pixels), [weights, bias, pixels])
  const totalPixels = pixels.filter(Boolean).length
  const pixelKey = pixels.map((p) => (p ? '1' : '0')).join('')

  // Drawing something new resets the animation so the run always matches the grid.
  useEffect(() => {
    setStep(-1)
    setRunning(false)
  }, [pixelKey, weights])

  useEffect(() => {
    if (!running) return
    if (step >= 1) {
      setRunning(false)
      return
    }
    const id = setTimeout(() => setStep(step + 1), prefersReducedMotion() ? 0 : STEP_MS)
    return () => clearTimeout(id)
  }, [running, step])

  const run = () => {
    setStep(0)
    setRunning(true)
  }

  const done = step >= 1
  const probs = [result.probThree, result.probE]
  const labels: Array<'3' | 'E'> = ['3', 'E']
  const winner = result.prediction === '3' ? 0 : 1

  return (
    <div>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full"
        role="img"
        aria-label="Your trained network: 64 pixel inputs connected to two outputs, 3 and E"
      >
        {/* Edges: every pixel connects to both outputs with its learned weight */}
        {pixels.map((active, i) => {
          const row = Math.floor(i / GRID_SIZE)
          const col = i % GRID_SIZE
          return OUTPUT_Y.map((oy, out) => {
            // The learned weight pushes toward "3" when positive; flip for "E".
            const w = out === 0 ? weights[i] : -weights[i]
            const carrying = active && step >= out
            const opacity = w === 0 ? 0.04 : carrying ? 0.65 : 0.12
            return (
              <line
                key={`e-${i}-${out}`}
                x1={inputX(col)}
                y1={inputY(row)}
                x2={OUTPUT_X}
                y2={oy}
                stroke={w > 0 ? GREEN : w < 0 ? RED : 'var(--color-fg-muted)'}
                strokeWidth={w === 0 ? 0.5 : 1.2}
                opacity={opacity}
                style={{ transition: 'opacity 400ms ease' }}
              />
            )
          })
        })}

        {/* Input nodes: the 64 pixels, laid out just like the drawing grid */}
        {pixels.map((active, i) => {
          const row = Math.floor(i / GRID_SIZE)
          const col = i % GRID_SIZE
          const lit = active && step >= 0
          return (
            <circle
              key={`i-${i}`}
              cx={inputX(col)}
              cy={inputY(row)}
              r={8}
              fill="var(--color-accent-deep)"
              opacity={lit ? 1 : active ? 0.45 : 0.1}
              style={{ transition: 'opacity 400ms ease' }}
            />
          )
        })}

        {/* Output nodes */}
        {OUTPUT_Y.map((oy, out) => {
          const isWinner = done && out === winner
          return (
            <g key={`o-${out}`}>
              <circle
                cx={OUTPUT_X}
                cy={oy}
                r={30}
                fill="var(--color-accent-deep)"
                opacity={done ? 0.25 + probs[out] * 0.75 : 0.12}
                stroke={isWinner ? 'var(--color-accent-deep)' : 'none'}
                strokeWidth="3"
                style={{ transition: 'opacity 400ms ease' }}
              />
              <text
                x={OUTPUT_X}
                y={oy + 2}
                textAnchor="middle"
                className="text-lg font-bold"
                fill={done ? 'white' : 'var(--color-fg-muted)'}
              >
                {labels[out]}
              </text>
              <text
                x={OUTPUT_X}
                y={oy + 18}
                textAnchor="middle"
                className="text-[10px] font-semibold"
                fill={done ? 'white' : 'var(--color-fg-muted)'}
              >
                {done ? `${(probs[out] * 100).toFixed(0)}%` : '?'}
              </text>
            </g>
          )
        })}

        {/* Section labels */}
        <text
          x={inputX(3.5)}
          y={SVG_H - 8}
          textAnchor="middle"
          className="text-[11px] font-medium"
          fill={step >= 0 ? 'var(--color-fg)' : 'var(--color-fg-muted)'}
          style={{ transition: 'fill 400ms ease' }}
        >
          64 pixel inputs
        </text>
        <text
          x={OUTPUT_X}
          y={SVG_H - 8}
          textAnchor="middle"
          className="text-[11px] font-medium"
          fill={done ? 'var(--color-fg)' : 'var(--color-fg-muted)'}
          style={{ transition: 'fill 400ms ease' }}
        >
          2 outputs
        </text>
      </svg>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={run}
          disabled={running || totalPixels === 0}
          className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-deep disabled:opacity-50"
        >
          {running ? 'Running…' : done ? 'Replay' : '▶ Predict'}
        </button>
        {totalPixels === 0 && (
          <span className="text-sm text-fg-muted">Draw some pixels above first.</span>
        )}
        {done && (
          <span className="text-sm text-fg-secondary" role="status">
            Your model says "{result.prediction}" with {(result.confidence * 100).toFixed(0)}%
            confidence
          </span>
        )}
      </div>

      <p className="mt-4 text-xs text-fg-muted">
        These are the exact weights your training run just learned. Green edges carry evidence
        toward an output, red edges against it. Press predict and watch your lit pixels send their
        signal down the weighted connections — the output with the bigger weighted sum wins.
      </p>
    </div>
  )
}
