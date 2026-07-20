import { useId, useState } from 'react'

/**
 * The hover card behind every hidden-layer node in the network diagrams.
 *
 * A hidden neuron in these models is not an abstraction: each one watches a
 * named set of pixels (a stroke) or a named set of strokes (a shape). The
 * diagrams show that as a colored circle and a percentage, which tells you a
 * node fired but not what it was looking for. This component renders the
 * answer — the node's name, its detected pattern drawn on a mini 8x8 grid,
 * and its current activation — as a tooltip on hover and on keyboard focus.
 *
 * Rendered inside an <svg> via <foreignObject> so it can be plain HTML and
 * flow its own text, and so it escapes the SVG's own painting order by being
 * emitted last by the caller.
 */

export interface NodePattern {
  /** The neuron's human name, e.g. "Top bar" or "Bottom loop". */
  name: string
  /** The neuron's color, matching its circle in the diagram. */
  color: string
  /** Pixels the neuron fires on, as an 8x8 boolean grid, when it has one. */
  pixels?: boolean[]
  /** Plain-English description of what the neuron detects. */
  blurb?: string
  /**
   * Named inputs the neuron requires (all must be present) and vetoes
   * (any one present shuts it off). Used by the shape layer, whose inputs
   * are other neurons rather than pixels.
   */
  needs?: string[]
  forbids?: string[]
  /** Current activation in [0, 1], when the network has been run. */
  activation?: number
}

const MINI_CELL = 7
const MINI_GAP = 1

/** The node's pattern drawn as a small 8x8 grid of squares. */
function MiniPattern({ pixels, color, gridSize }: { pixels: boolean[]; color: string; gridSize: number }) {
  const span = MINI_CELL + MINI_GAP
  return (
    <svg
      width={gridSize * span}
      height={gridSize * span}
      viewBox={`0 0 ${gridSize * span} ${gridSize * span}`}
      className="shrink-0"
      role="img"
      aria-label="The pixels this neuron watches"
    >
      {pixels.map((on, i) => (
        <rect
          key={i}
          x={(i % gridSize) * span}
          y={Math.floor(i / gridSize) * span}
          width={MINI_CELL}
          height={MINI_CELL}
          rx={1}
          fill={on ? color : 'var(--color-fg-muted)'}
          opacity={on ? 1 : 0.18}
        />
      ))}
    </svg>
  )
}

/**
 * The tooltip body. Kept separate from the SVG plumbing so it can be
 * rendered on its own — in tests, or by any non-SVG caller.
 */
export function NodePatternCard({
  pattern,
  gridSize = 8,
  id,
}: {
  pattern: NodePattern
  gridSize?: number
  id?: string
}) {
  const { name, color, pixels, blurb, needs, forbids, activation } = pattern
  return (
    <div
      id={id}
      role="tooltip"
      className="pointer-events-none w-56 rounded-lg border border-line-strong bg-surface-raised p-3 text-left shadow-lg"
    >
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: color }} />
        <span className="text-xs font-semibold leading-tight text-fg">{name}</span>
      </div>

      <div className="mt-2 flex items-start gap-2">
        {pixels && <MiniPattern pixels={pixels} color={color} gridSize={gridSize} />}
        <div className="min-w-0">
          {blurb && <p className="text-[10px] leading-snug text-fg-secondary">{blurb}</p>}
          {needs && needs.length > 0 && (
            <p className="mt-1 text-[10px] leading-snug text-fg-secondary">
              <span className="font-semibold">Needs:</span> {needs.join(', ')}
            </p>
          )}
          {forbids && forbids.length > 0 && (
            <p className="mt-1 text-[10px] leading-snug text-fg-secondary">
              <span className="font-semibold">Vetoed by:</span> {forbids.join(', ')}
            </p>
          )}
        </div>
      </div>

      {activation !== undefined && (
        <p className="mt-2 text-[10px] font-semibold text-fg-secondary">
          Firing at {(activation * 100).toFixed(0)}%
        </p>
      )}
    </div>
  )
}

interface HoverableNodeProps {
  pattern: NodePattern
  gridSize?: number
  /** Center of the node's circle, in the parent SVG's viewBox coordinates. */
  cx: number
  cy: number
  /** Radius of the invisible hit target; make it at least the circle's radius. */
  hitRadius: number
  /** Width of the parent SVG's viewBox, so the card can flip before it clips. */
  svgWidth: number
  children: React.ReactNode
}

const CARD_W = 224
const CARD_H = 132

/**
 * Wraps a hidden node's own SVG marks in a hover/focus target and renders the
 * pattern card next to it. The card is positioned to the right of the node,
 * flipping left when the node sits close to the SVG's right edge — these
 * diagrams put their hidden layers at all sorts of x positions.
 */
export function HoverableNode({
  pattern,
  gridSize,
  cx,
  cy,
  hitRadius,
  svgWidth,
  children,
}: HoverableNodeProps) {
  const [open, setOpen] = useState(false)
  const tooltipId = useId()

  const flip = cx + CARD_W + hitRadius + 12 > svgWidth
  const cardX = flip ? cx - hitRadius - 12 - CARD_W : cx + hitRadius + 12
  const cardY = cy - CARD_H / 2

  return (
    <g>
      {children}
      {/* The hit target sits above the node's marks so hover is uniform across them. */}
      <circle
        cx={cx}
        cy={cy}
        r={hitRadius}
        fill="transparent"
        tabIndex={0}
        role="button"
        aria-label={`${pattern.name} detector`}
        aria-describedby={open ? tooltipId : undefined}
        className="cursor-help outline-none focus-visible:stroke-accent-deep"
        strokeWidth={2}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      />
      {open && (
        <foreignObject x={cardX} y={cardY} width={CARD_W} height={CARD_H} style={{ overflow: 'visible' }}>
          <NodePatternCard pattern={pattern} gridSize={gridSize} id={tooltipId} />
        </foreignObject>
      )}
    </g>
  )
}
