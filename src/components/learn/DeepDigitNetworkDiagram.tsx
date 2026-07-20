import { useEffect, useMemo, useState } from 'react'
import {
  DIGIT_PRIMITIVES,
  DIGITS,
  GRID_SIZE,
  OUTPUT_SHAPE_WEIGHTS,
  PIXEL_COUNT,
  PRIMITIVES,
  SHAPES,
  SHAPE_WEIGHTS,
  classifyDigitDeep,
} from './deepDigitModel'
import { HoverableNode } from './NodePatternTooltip'

/**
 * Animated forward pass for Doodle-918, four columns wide: the 64 pixel
 * inputs, the 10 stroke primitives, the 8 shape detectors, the 10 digit
 * outputs. Same stepped animation as the two-layer diagram with one more
 * stop, so the extra layer is something you watch happen rather than read
 * about. Pixel→primitive edges wear each primitive's color; the two weight
 * layers after it are green for positive and red for negative, the site's
 * usual convention.
 */

const SVG_W = 760
const SVG_H = 440
const STEP_MS = 900
const CELL = 18

const GREEN = '#22c55e'
const RED = '#ef4444'

function inputX(col: number): number {
  return 40 + col * CELL
}

function inputY(row: number): number {
  return 150 + row * CELL
}

const PRIMITIVE_X = 320
function primitiveY(j: number): number {
  return 52 + j * 36
}

const SHAPE_X = 500
function shapeY(s: number): number {
  return 70 + s * 42
}

const OUTPUT_X = 682
function outputY(d: number): number {
  return 48 + d * 36
}

/** A detector's watched pixels as a full-grid boolean mask, for the hover card. */
function maskOf(indices: number[]): boolean[] {
  const mask = Array<boolean>(PIXEL_COUNT).fill(false)
  for (const i of indices) mask[i] = true
  return mask
}

/** Precomputed once: each primitive's mask and the digits that use it. */
const PRIMITIVE_PATTERNS = PRIMITIVES.map((prim, j) => ({
  mask: maskOf(prim.pixels),
  digits: DIGITS.filter((d) => DIGIT_PRIMITIVES[d].includes(j)),
}))

/**
 * A shape has no pixels of its own — it watches primitives. Its pattern is
 * the union of the pixels of every primitive it requires, which is exactly
 * the drawing that makes the shape appear.
 */
const SHAPE_PATTERNS = SHAPES.map((shape) => ({
  mask: maskOf(shape.needs.flatMap((j) => PRIMITIVES[j].pixels)),
  needs: shape.needs.map((j) => PRIMITIVES[j].name),
  forbids: shape.forbids.map((j) => PRIMITIVES[j].name),
}))

interface DeepDigitNetworkDiagramProps {
  pixels: boolean[]
}

export function DeepDigitNetworkDiagram({ pixels }: DeepDigitNetworkDiagramProps) {
  // -1 = idle, 0 = inputs lit, 1 = primitives, 2 = shapes, 3 = digits
  const [step, setStep] = useState(-1)
  const [running, setRunning] = useState(false)

  const result = useMemo(() => classifyDigitDeep(pixels), [pixels])
  const totalPixels = pixels.filter(Boolean).length
  const pixelKey = pixels.map((p) => (p ? '1' : '0')).join('')

  // Drawing something new resets the animation so the run always matches the grid.
  useEffect(() => {
    setStep(-1)
    setRunning(false)
  }, [pixelKey])

  useEffect(() => {
    if (!running) return
    if (step >= 3) {
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

  const primitivesDone = step >= 1
  const shapesDone = step >= 2
  const done = step >= 3

  return (
    <div>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full"
        role="img"
        aria-label="Three-layer neural network with 64 pixel inputs, 10 stroke primitives, 8 shape detectors, and 10 digit outputs"
      >
        {/* Pixel→primitive edges: only the non-zero weights */}
        {PRIMITIVES.map((prim, j) =>
          prim.pixels.map((i) => {
            const row = Math.floor(i / GRID_SIZE)
            const col = i % GRID_SIZE
            const carrying = pixels[i] && primitivesDone
            const opacity = carrying ? 0.75 : primitivesDone ? 0.08 : 0.18
            return (
              <line
                key={`ip-${j}-${i}`}
                x1={inputX(col)}
                y1={inputY(row)}
                x2={PRIMITIVE_X}
                y2={primitiveY(j)}
                stroke={prim.color}
                strokeWidth={1.2}
                opacity={opacity}
                style={{ transition: 'opacity 400ms ease' }}
              />
            )
          })
        )}

        {/* Primitive→shape edges: green where the shape needs it, red where it forbids it */}
        {SHAPE_WEIGHTS.map((row, s) =>
          row.map((w, j) => {
            if (w === 0) return null
            const strength = shapesDone ? 0.1 + result.primitives[j] * 0.6 : 0.08
            return (
              <line
                key={`ps-${s}-${j}`}
                x1={PRIMITIVE_X}
                y1={primitiveY(j)}
                x2={SHAPE_X}
                y2={shapeY(s)}
                stroke={w > 0 ? GREEN : RED}
                strokeWidth={1.4}
                opacity={strength}
                style={{ transition: 'opacity 400ms ease' }}
              />
            )
          })
        )}

        {/* Shape→digit edges */}
        {OUTPUT_SHAPE_WEIGHTS.map((row, d) =>
          row.map((w, s) => {
            const strength = done ? 0.08 + result.shapes[s] * 0.5 : 0.08
            return (
              <line
                key={`sd-${d}-${s}`}
                x1={SHAPE_X}
                y1={shapeY(s)}
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
              r={6}
              fill="var(--color-accent-deep)"
              opacity={lit ? 1 : active ? 0.45 : 0.1}
              style={{ transition: 'opacity 400ms ease' }}
            />
          )
        })}

        {/* Layer 1 nodes: the 10 stroke primitives */}
        {PRIMITIVES.map((prim, j) => {
          const activation = result.primitives[j]
          const pattern = PRIMITIVE_PATTERNS[j]
          return (
            <HoverableNode
              key={`p-${j}`}
              cx={PRIMITIVE_X}
              cy={primitiveY(j)}
              hitRadius={14}
              svgWidth={SVG_W}
              pattern={{
                name: prim.name,
                color: prim.color,
                pixels: pattern.mask,
                blurb: `Fires when most of this stroke is drawn. Used by ${pattern.digits.join(', ')}.`,
                activation: primitivesDone ? activation : undefined,
              }}
            >
              <circle
                cx={PRIMITIVE_X}
                cy={primitiveY(j)}
                r={11}
                fill={prim.color}
                opacity={primitivesDone ? 0.2 + activation * 0.8 : 0.15}
                style={{ transition: 'opacity 400ms ease' }}
              />
              <text
                x={PRIMITIVE_X}
                y={primitiveY(j) + 22}
                textAnchor="middle"
                className="text-[8px] font-semibold"
                fill={primitivesDone ? 'var(--color-fg-secondary)' : 'var(--color-fg-muted)'}
              >
                {primitivesDone ? `${(activation * 100).toFixed(0)}%` : '?'}
              </text>
            </HoverableNode>
          )
        })}

        {/* Layer 2 nodes: the 8 shape detectors */}
        {SHAPES.map((shape, s) => {
          const activation = result.shapes[s]
          const pattern = SHAPE_PATTERNS[s]
          return (
            <HoverableNode
              key={`s-${s}`}
              cx={SHAPE_X}
              cy={shapeY(s)}
              hitRadius={16}
              svgWidth={SVG_W}
              pattern={{
                name: shape.name,
                color: shape.color,
                pixels: pattern.mask,
                blurb: shape.blurb,
                needs: pattern.needs,
                forbids: pattern.forbids,
                activation: shapesDone ? activation : undefined,
              }}
            >
              <circle
                cx={SHAPE_X}
                cy={shapeY(s)}
                r={13}
                fill={shape.color}
                opacity={shapesDone ? 0.2 + activation * 0.8 : 0.15}
                style={{ transition: 'opacity 400ms ease' }}
              />
              <text
                x={SHAPE_X}
                y={shapeY(s) + 25}
                textAnchor="middle"
                className="text-[8px] font-semibold"
                fill={shapesDone ? 'var(--color-fg-secondary)' : 'var(--color-fg-muted)'}
              >
                {shapesDone ? `${(activation * 100).toFixed(0)}%` : '?'}
              </text>
            </HoverableNode>
          )
        })}

        {/* Layer 3 nodes: the 10 digits */}
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
          64 pixels
        </text>
        <text
          x={PRIMITIVE_X}
          y={SVG_H - 8}
          textAnchor="middle"
          className="text-[11px] font-medium"
          fill={primitivesDone ? 'var(--color-fg)' : 'var(--color-fg-muted)'}
          style={{ transition: 'fill 400ms ease' }}
        >
          10 stroke primitives
        </text>
        <text
          x={SHAPE_X}
          y={SVG_H - 8}
          textAnchor="middle"
          className="text-[11px] font-medium"
          fill={shapesDone ? 'var(--color-fg)' : 'var(--color-fg-muted)'}
          style={{ transition: 'fill 400ms ease' }}
        >
          8 shapes
        </text>
        <text
          x={OUTPUT_X}
          y={SVG_H - 8}
          textAnchor="middle"
          className="text-[11px] font-medium"
          fill={done ? 'var(--color-fg)' : 'var(--color-fg-muted)'}
          style={{ transition: 'fill 400ms ease' }}
        >
          10 digits
        </text>
      </svg>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={run}
          disabled={running || totalPixels === 0}
          className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-deep disabled:opacity-50"
        >
          {running ? 'Running…' : done ? 'Replay' : '▶ Run all three layers'}
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
        Three hops instead of two. Your lit pixels wake up the stroke primitives they belong to;
        the primitives that fired combine into shapes, where green edges are strokes a shape needs
        and red edges are strokes that would break it; then the shapes vote on all ten digits. The
        middle column is the layer Doodle-525 doesn't have, and it's the reason this model can tell
        a loop from a corner instead of just counting strokes.
      </p>
    </div>
  )
}
