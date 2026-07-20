import { useEffect, useMemo, useState } from 'react'
import {
  DIGIT_SEGMENTS,
  DIGITS,
  GRID_SIZE,
  OUTPUT_WEIGHTS,
  PIXEL_COUNT,
  SEGMENTS,
  classifyDigit,
} from './digitClassifierModel'
import { HoverableNode } from './NodePatternTooltip'

/**
 * Animated forward pass for the digit classifier: 64 pixel inputs on the
 * left, the 7 stroke detectors in the middle, the 10 digit outputs on the
 * right. Same stepped animation as the 3-vs-E diagram, one layer deeper.
 * Input→hidden edges wear each detector's color; hidden→output edges are
 * green (+1) or red (−1) like the rest of the site's weight visuals.
 */

const SVG_W = 640
const SVG_H = 420
const STEP_MS = 900
const CELL = 20

const GREEN = '#22c55e'
const RED = '#ef4444'

function inputX(col: number): number {
  return 46 + col * CELL
}

function inputY(row: number): number {
  return 140 + row * CELL
}

const HIDDEN_X = 400
function hiddenY(j: number): number {
  return 66 + j * 48
}

const OUTPUT_X = 578
function outputY(d: number): number {
  return 48 + d * 36
}

/** A detector's watched pixels as a full-grid boolean mask, for the hover card. */
function maskOf(indices: number[]): boolean[] {
  const mask = Array<boolean>(PIXEL_COUNT).fill(false)
  for (const i of indices) mask[i] = true
  return mask
}

/** Precomputed once: each stroke's mask and the digits that use it. */
const SEGMENT_PATTERNS = SEGMENTS.map((seg, j) => ({
  mask: maskOf(seg.pixels),
  digits: DIGITS.filter((d) => DIGIT_SEGMENTS[d].includes(j)),
}))

interface DigitNetworkDiagramProps {
  pixels: boolean[]
}

export function DigitNetworkDiagram({ pixels }: DigitNetworkDiagramProps) {
  // -1 = idle, 0 = inputs lit, 1 = stroke detectors computed, 2 = outputs computed
  const [step, setStep] = useState(-1)
  const [running, setRunning] = useState(false)

  const result = useMemo(() => classifyDigit(pixels), [pixels])
  const totalPixels = pixels.filter(Boolean).length
  const pixelKey = pixels.map((p) => (p ? '1' : '0')).join('')

  // Drawing something new resets the animation so the run always matches the grid.
  useEffect(() => {
    setStep(-1)
    setRunning(false)
  }, [pixelKey])

  useEffect(() => {
    if (!running) return
    if (step >= 2) {
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

  const hiddenDone = step >= 1
  const done = step >= 2

  return (
    <div>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full"
        role="img"
        aria-label="Neural network with 64 pixel inputs, 7 stroke detectors, and 10 digit outputs"
      >
        {/* Input→hidden edges: only the non-zero weights (each detector's own pixels) */}
        {SEGMENTS.map((seg, j) =>
          seg.pixels.map((i) => {
            const row = Math.floor(i / GRID_SIZE)
            const col = i % GRID_SIZE
            const carrying = pixels[i] && step >= 1
            const opacity = carrying ? 0.75 : step >= 1 ? 0.08 : 0.18
            return (
              <line
                key={`ih-${j}-${i}`}
                x1={inputX(col)}
                y1={inputY(row)}
                x2={HIDDEN_X}
                y2={hiddenY(j)}
                stroke={seg.color}
                strokeWidth={1.2}
                opacity={opacity}
                style={{ transition: 'opacity 400ms ease' }}
              />
            )
          })
        )}

        {/* Hidden→output edges: +1 green, -1 red, brightness follows the signal */}
        {OUTPUT_WEIGHTS.map((row, d) =>
          row.map((w, j) => {
            const strength = done ? 0.08 + result.hidden[j] * 0.5 : 0.08
            return (
              <line
                key={`ho-${d}-${j}`}
                x1={HIDDEN_X}
                y1={hiddenY(j)}
                x2={OUTPUT_X}
                y2={outputY(d)}
                stroke={w > 0 ? GREEN : RED}
                strokeWidth={1.2}
                opacity={strength}
                style={{ transition: 'opacity 400ms ease' }}
              />
            )
          })
        )}

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
              r={7}
              fill="var(--color-accent-deep)"
              opacity={lit ? 1 : active ? 0.45 : 0.1}
              style={{ transition: 'opacity 400ms ease' }}
            />
          )
        })}

        {/* Hidden nodes: the 7 stroke detectors */}
        {SEGMENTS.map((seg, j) => {
          const activation = result.hidden[j]
          const pattern = SEGMENT_PATTERNS[j]
          return (
            <HoverableNode
              key={`h-${j}`}
              cx={HIDDEN_X}
              cy={hiddenY(j)}
              hitRadius={16}
              svgWidth={SVG_W}
              pattern={{
                name: seg.name,
                color: seg.color,
                pixels: pattern.mask,
                blurb: `Fires when most of this stroke is drawn. Used by ${pattern.digits.join(', ')}.`,
                activation: hiddenDone ? activation : undefined,
              }}
            >
              <circle
                cx={HIDDEN_X}
                cy={hiddenY(j)}
                r={13}
                fill={seg.color}
                opacity={hiddenDone ? 0.2 + activation * 0.8 : 0.15}
                style={{ transition: 'opacity 400ms ease' }}
              />
              <text
                x={HIDDEN_X}
                y={hiddenY(j) + 26}
                textAnchor="middle"
                className="text-[9px] font-semibold"
                fill={hiddenDone ? 'var(--color-fg-secondary)' : 'var(--color-fg-muted)'}
              >
                {hiddenDone ? `${(activation * 100).toFixed(0)}%` : '?'}
              </text>
            </HoverableNode>
          )
        })}

        {/* Output nodes: the 10 digits */}
        {DIGITS.map((digit) => {
          const prob = result.probs[digit]
          const isWinner = done && digit === result.prediction
          return (
            <g key={`o-${digit}`}>
              <circle
                cx={OUTPUT_X}
                cy={outputY(digit)}
                r={14}
                fill="var(--color-accent-deep)"
                opacity={done ? 0.2 + prob * 0.8 : 0.12}
                stroke={isWinner ? 'var(--color-accent-deep)' : 'none'}
                strokeWidth="3"
                style={{ transition: 'opacity 400ms ease' }}
              />
              <text
                x={OUTPUT_X}
                y={outputY(digit) + 4}
                textAnchor="middle"
                className="text-[11px] font-bold"
                fill={done ? 'white' : 'var(--color-fg-muted)'}
              >
                {digit}
              </text>
              <text
                x={OUTPUT_X + 22}
                y={outputY(digit) + 4}
                textAnchor="start"
                className="text-[9px] font-semibold"
                fill={done ? 'var(--color-fg-secondary)' : 'var(--color-fg-muted)'}
              >
                {done ? `${(prob * 100).toFixed(0)}%` : ''}
              </text>
            </g>
          )
        })}

        {/* Layer labels */}
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
          x={HIDDEN_X}
          y={SVG_H - 8}
          textAnchor="middle"
          className="text-[11px] font-medium"
          fill={hiddenDone ? 'var(--color-fg)' : 'var(--color-fg-muted)'}
          style={{ transition: 'fill 400ms ease' }}
        >
          7 stroke detectors
        </text>
        <text
          x={OUTPUT_X}
          y={SVG_H - 8}
          textAnchor="middle"
          className="text-[11px] font-medium"
          fill={done ? 'var(--color-fg)' : 'var(--color-fg-muted)'}
          style={{ transition: 'fill 400ms ease' }}
        >
          10 digit outputs
        </text>
      </svg>

      {/* Which color is which detector */}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-muted">
        {SEGMENTS.map((seg) => (
          <span key={seg.name} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: seg.color }} />
            {seg.name}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={run}
          disabled={running || totalPixels === 0}
          className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-deep disabled:opacity-50"
        >
          {running ? 'Running…' : done ? 'Replay' : '▶ Run the network'}
        </button>
        {totalPixels === 0 && (
          <span className="text-sm text-fg-muted">Draw some pixels above first.</span>
        )}
        {done && (
          <span className="text-sm text-fg-secondary" role="status">
            The network says "{result.prediction}" with {(result.confidence * 100).toFixed(0)}%
            confidence
          </span>
        )}
      </div>

      <p className="mt-4 text-xs text-fg-muted">
        Each colored edge feeds one stroke detector; press run and watch your lit pixels wake up
        the detectors whose strokes you drew. Then green edges carry each firing detector's vote
        toward the digits that use that stroke, and red edges carry its vote against the digits
        that don't. The digit collecting the most evidence wins.
      </p>
    </div>
  )
}
