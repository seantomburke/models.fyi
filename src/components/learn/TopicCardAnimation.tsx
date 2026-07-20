import { useCardAnimation } from './useCardAnimation'

/**
 * The little animated banner on every /learn index card.
 *
 * Design constraints, in priority order:
 *
 * - The index must stay fast. These are hand-drawn SVG motifs computed from a
 *   single number, not the lab's real models: importing PixelClassifier and
 *   friends into the index would pull the whole model lab into a route that is
 *   meant to be a list of links. Each motif is a handful of <rect>s and
 *   <circle>s whose attributes are a pure function of the animation phase.
 * - Only visible cards animate, on one shared frame loop. See useCardAnimation.
 * - prefers-reduced-motion pins the phase, so every motif still paints a
 *   representative frame — it just never moves.
 * - Colors come from theme custom properties, so light and dark both work
 *   without a second code path.
 */

export type Motif =
  | 'tokens'
  | 'weights'
  | 'pixels'
  | 'digits'
  | 'layers'
  | 'descent'
  | 'nextWord'
  | 'context'
  | 'compare'
  | 'pricing'
  | 'vision'
  | 'embedding'
  | 'reasoning'
  | 'search'
  | 'tuning'
  | 'prompt'
  | 'hallucination'
  | 'openSource'
  | 'chooser'

const W = 200
const H = 56

/** Smooth 0→1→0 ramp, for motifs that should breathe rather than jump. */
function pulse(phase: number): number {
  return (1 - Math.cos(phase * Math.PI * 2)) / 2
}

/** A phase offset per item, so a row of things ripples instead of blinking as one. */
function stagger(phase: number, index: number, count: number): number {
  return (phase + index / count) % 1
}

const ACCENT = 'var(--color-accent)'
const ACCENT_DEEP = 'var(--color-accent-deep)'
const MUTED = 'var(--color-fg-muted)'
const GREEN = 'var(--color-seg-2)'
const WARM = 'var(--color-seg-6)'

/** Text streaming through a tokenizer: a bar splits into colored chunks. */
function Tokens({ phase }: { phase: number }) {
  const widths = [26, 14, 34, 18, 22, 30, 16]
  const colors = [ACCENT, GREEN, ACCENT_DEEP, WARM, ACCENT, GREEN, ACCENT_DEEP]
  let x = 12
  return (
    <>
      {widths.map((w, i) => {
        const local = stagger(phase, i, widths.length)
        const on = local < 0.55
        const rect = (
          <rect
            key={i}
            x={x}
            y={20}
            width={w}
            height={16}
            rx={3}
            fill={on ? colors[i] : MUTED}
            opacity={on ? 0.85 : 0.2}
          />
        )
        x += w + 4
        return rect
      })}
    </>
  )
}

/** Weights on an 8-wide strip, swinging between positive (green) and negative (warm). */
function Weights({ phase }: { phase: number }) {
  const count = 16
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const v = Math.sin(phase * Math.PI * 2 + i * 0.5)
        const h = 6 + Math.abs(v) * 20
        return (
          <rect
            key={i}
            x={12 + i * 11.5}
            y={H / 2 - h / 2}
            width={8}
            height={h}
            rx={2}
            fill={v >= 0 ? GREEN : WARM}
            opacity={0.35 + Math.abs(v) * 0.55}
          />
        )
      })}
    </>
  )
}

/** An 8x8 grid drawing itself in, then clearing: the pixel classifier's input. */
function Pixels({ phase }: { phase: number }) {
  // A rough "3" on an 8x8 grid, the shape Doodle-64 is trained to read.
  const lit = new Set([1, 2, 3, 4, 12, 20, 18, 19, 21, 29, 37, 33, 34, 35, 36])
  const cell = 5.5
  const gap = 1
  const size = 8 * (cell + gap)
  const left = W / 2 - size / 2
  const top = H / 2 - size / 2
  const reveal = phase < 0.5 ? phase / 0.5 : 1 - (phase - 0.5) / 0.5
  return (
    <>
      {Array.from({ length: 64 }, (_, i) => {
        const on = lit.has(i) && i / 64 <= reveal
        return (
          <rect
            key={i}
            x={left + (i % 8) * (cell + gap)}
            y={top + Math.floor(i / 8) * (cell + gap)}
            width={cell}
            height={cell}
            rx={1}
            fill={on ? ACCENT_DEEP : MUTED}
            opacity={on ? 0.95 : 0.15}
          />
        )
      })}
    </>
  )
}

/** Seven-segment digits cycling 0-9: the digit classifier's outputs. */
function Digits({ phase }: { phase: number }) {
  const digit = Math.floor(phase * 10) % 10
  return (
    <>
      {Array.from({ length: 10 }, (_, d) => (
        <circle
          key={d}
          cx={16 + d * 18.5}
          cy={H / 2}
          r={d === digit ? 9 : 5}
          fill={ACCENT_DEEP}
          opacity={d === digit ? 0.9 : 0.15}
        />
      ))}
      <text
        x={16 + digit * 18.5}
        y={H / 2 + 3.5}
        textAnchor="middle"
        className="text-[10px] font-bold"
        fill="white"
      >
        {digit}
      </text>
    </>
  )
}

/** A signal sweeping left to right through four layers of nodes. */
function Layers({ phase }: { phase: number }) {
  const sizes = [3, 5, 5, 2]
  const front = phase * (sizes.length + 0.5) - 0.5
  return (
    <>
      {sizes.map((size, l) =>
        Array.from({ length: size }, (_, i) => {
          const reached = front >= l
          const x = 22 + (l * (W - 48)) / (sizes.length - 1)
          const y = H / 2 + (i - (size - 1) / 2) * 11
          return (
            <g key={`${l}-${i}`}>
              {l < sizes.length - 1 &&
                Array.from({ length: sizes[l + 1] }, (_, j) => (
                  <line
                    key={j}
                    x1={x}
                    y1={y}
                    x2={22 + ((l + 1) * (W - 48)) / (sizes.length - 1)}
                    y2={H / 2 + (j - (sizes[l + 1] - 1) / 2) * 11}
                    stroke={ACCENT}
                    strokeWidth={0.6}
                    opacity={front >= l + 0.5 ? 0.35 : 0.1}
                  />
                ))}
              <circle cx={x} cy={y} r={4} fill={ACCENT_DEEP} opacity={reached ? 0.9 : 0.18} />
            </g>
          )
        })
      )}
    </>
  )
}

/** A ball rolling down a loss curve to its minimum, then resetting. */
function Descent({ phase }: { phase: number }) {
  // A parabola in view coordinates: minimum at the middle, opening upward.
  const yAt = (x: number) => 16 + Math.pow((x - W / 2) / 46, 2) * 30
  const path = Array.from({ length: 33 }, (_, i) => {
    const x = 12 + (i * (W - 24)) / 32
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${yAt(x).toFixed(1)}`
  }).join(' ')
  // Ease the ball in from the left edge and let it settle at the minimum.
  const t = Math.min(1, phase / 0.8)
  const ballX = 18 + (W / 2 - 18) * (1 - Math.pow(1 - t, 3))
  return (
    <>
      <path d={path} fill="none" stroke={MUTED} strokeWidth={1.5} opacity={0.4} />
      <circle cx={ballX} cy={yAt(ballX) - 4} r={5} fill={ACCENT_DEEP} opacity={0.95} />
    </>
  )
}

/** A sentence typing out, then a predicted next word appearing. */
function NextWord({ phase }: { phase: number }) {
  const words = [30, 22, 34, 18]
  const revealed = Math.min(words.length, Math.floor(phase * (words.length + 1.4)))
  let x = 12
  const marks = words.map((w, i) => {
    const rect = (
      <rect
        key={i}
        x={x}
        y={22}
        width={w}
        height={12}
        rx={3}
        fill={MUTED}
        opacity={i < revealed ? 0.45 : 0.12}
      />
    )
    x += w + 6
    return rect
  })
  const predicted = revealed >= words.length
  return (
    <>
      {marks}
      <rect
        x={x}
        y={20}
        width={38}
        height={16}
        rx={3}
        fill={ACCENT}
        opacity={predicted ? 0.9 : 0.12}
      />
    </>
  )
}

/** A context window filling up and scrolling old content off the front. */
function Context({ phase }: { phase: number }) {
  const filled = pulse(phase)
  return (
    <>
      <rect
        x={12}
        y={20}
        width={W - 24}
        height={16}
        rx={4}
        fill={MUTED}
        opacity={0.15}
      />
      <rect
        x={12}
        y={20}
        width={(W - 24) * (0.2 + filled * 0.75)}
        height={16}
        rx={4}
        fill={ACCENT}
        opacity={0.8}
      />
    </>
  )
}

/** Two bars trading the lead: a head-to-head comparison. */
function Compare({ phase }: { phase: number }) {
  const a = 0.35 + pulse(phase) * 0.5
  const b = 0.35 + pulse((phase + 0.5) % 1) * 0.5
  return (
    <>
      <rect x={12} y={16} width={(W - 24) * a} height={10} rx={3} fill={ACCENT} opacity={0.85} />
      <rect x={12} y={32} width={(W - 24) * b} height={10} rx={3} fill={GREEN} opacity={0.85} />
    </>
  )
}

/** Coins stacking up: tokens turning into dollars. */
function Pricing({ phase }: { phase: number }) {
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => {
        const local = stagger(phase, i, 6)
        const h = 8 + local * 30
        return (
          <rect
            key={i}
            x={20 + i * 28}
            y={H - 10 - h}
            width={18}
            height={h}
            rx={3}
            fill={i % 2 === 0 ? ACCENT : ACCENT_DEEP}
            opacity={0.4 + local * 0.5}
          />
        )
      })}
    </>
  )
}

/** An eye scanning an image: a vision model looking around a frame. */
function Vision({ phase }: { phase: number }) {
  const x = 40 + pulse(phase) * (W - 96)
  return (
    <>
      <rect
        x={12}
        y={10}
        width={W - 24}
        height={H - 20}
        rx={5}
        fill="none"
        stroke={MUTED}
        strokeWidth={1.5}
        opacity={0.35}
      />
      <rect
        x={x}
        y={H / 2 - 12}
        width={28}
        height={24}
        rx={4}
        fill="none"
        stroke={ACCENT_DEEP}
        strokeWidth={2}
        opacity={0.9}
      />
      <circle cx={x + 14} cy={H / 2} r={3} fill={ACCENT_DEEP} opacity={0.9} />
    </>
  )
}

/** Points drifting into clusters: meaning laid out as coordinates. */
function Embedding({ phase }: { phase: number }) {
  const points = [
    [40, 18],
    [52, 30],
    [34, 34],
    [110, 20],
    [124, 32],
    [104, 38],
    [168, 24],
    [156, 36],
  ]
  const spread = 1 - pulse(phase) * 0.7
  return (
    <>
      {points.map(([px, py], i) => {
        const cx = px < 80 ? 42 : px < 140 ? 113 : 162
        const cy = 28
        return (
          <circle
            key={i}
            cx={cx + (px - cx) * spread}
            cy={cy + (py - cy) * spread}
            r={4}
            fill={i < 3 ? ACCENT : i < 6 ? GREEN : WARM}
            opacity={0.85}
          />
        )
      })}
    </>
  )
}

/** A chain of thought: dots connecting one at a time before the answer lands. */
function Reasoning({ phase }: { phase: number }) {
  const count = 5
  const front = phase * (count + 0.6)
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const on = front > i
        const x = 24 + i * 38
        return (
          <g key={i}>
            {i > 0 && (
              <line
                x1={x - 38}
                y1={H / 2}
                x2={x}
                y2={H / 2}
                stroke={ACCENT}
                strokeWidth={2}
                opacity={on ? 0.6 : 0.12}
              />
            )}
            <circle
              cx={x}
              cy={H / 2}
              r={i === count - 1 ? 8 : 5}
              fill={i === count - 1 ? GREEN : ACCENT_DEEP}
              opacity={on ? 0.9 : 0.15}
            />
          </g>
        )
      })}
    </>
  )
}

/** A magnifier sweeping over results: a model reaching out to the web. */
function Search({ phase }: { phase: number }) {
  const x = 24 + pulse(phase) * (W - 60)
  return (
    <>
      {Array.from({ length: 4 }, (_, i) => (
        <rect
          key={i}
          x={16}
          y={12 + i * 10}
          width={W - 32}
          height={5}
          rx={2}
          fill={MUTED}
          opacity={0.18}
        />
      ))}
      <circle cx={x} cy={H / 2 - 4} r={9} fill="none" stroke={ACCENT_DEEP} strokeWidth={2.5} />
      <line
        x1={x + 6}
        y1={H / 2 + 3}
        x2={x + 13}
        y2={H / 2 + 10}
        stroke={ACCENT_DEEP}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </>
  )
}

/** A general model narrowing onto one specialty: fine-tuning. */
function Tuning({ phase }: { phase: number }) {
  const t = pulse(phase)
  return (
    <>
      {Array.from({ length: 3 }, (_, i) => {
        const y = 14 + i * 14
        return (
          <g key={i}>
            <rect x={16} y={y} width={40} height={8} rx={3} fill={MUTED} opacity={0.3} />
            <rect
              x={W - 56}
              y={y}
              width={40}
              height={8}
              rx={3}
              fill={i === 1 ? ACCENT : MUTED}
              opacity={i === 1 ? 0.3 + t * 0.6 : 0.18}
            />
            <line
              x1={56}
              y1={y + 4}
              x2={W - 56}
              y2={H / 2}
              stroke={ACCENT}
              strokeWidth={1.2}
              opacity={0.15 + t * 0.35}
            />
          </g>
        )
      })}
    </>
  )
}

/** A prompt being sharpened: a rough block resolving into clean lines. */
function Prompt({ phase }: { phase: number }) {
  const t = pulse(phase)
  return (
    <>
      {Array.from({ length: 4 }, (_, i) => {
        const target = [W - 40, W - 70, W - 55, W - 100][i]
        const rough = [W - 100, W - 46, W - 92, W - 60][i]
        return (
          <rect
            key={i}
            x={16}
            y={11 + i * 10}
            width={rough + (target - rough) * t - 16}
            height={6}
            rx={2}
            fill={i === 0 ? ACCENT : MUTED}
            opacity={i === 0 ? 0.8 : 0.28 + t * 0.2}
          />
        )
      })}
    </>
  )
}

/** Confident-looking output where one claim quietly turns red. */
function Hallucination({ phase }: { phase: number }) {
  const flagged = phase > 0.45
  return (
    <>
      {Array.from({ length: 4 }, (_, i) => {
        const bad = i === 2
        return (
          <rect
            key={i}
            x={16}
            y={11 + i * 10}
            width={[150, 120, 96, 138][i]}
            height={6}
            rx={2}
            fill={bad && flagged ? WARM : MUTED}
            opacity={bad && flagged ? 0.95 : 0.3}
          />
        )
      })}
      {flagged && <circle cx={W - 24} cy={34} r={5} fill={WARM} opacity={0.95} />}
    </>
  )
}

/** A closed box next to an open one, trading emphasis. */
function OpenSource({ phase }: { phase: number }) {
  const t = pulse(phase)
  return (
    <>
      <rect
        x={26}
        y={14}
        width={64}
        height={28}
        rx={5}
        fill={ACCENT_DEEP}
        opacity={0.25 + (1 - t) * 0.6}
      />
      <rect
        x={110}
        y={14}
        width={64}
        height={28}
        rx={5}
        fill="none"
        stroke={GREEN}
        strokeWidth={2.5}
        opacity={0.35 + t * 0.6}
      />
      {Array.from({ length: 3 }, (_, i) => (
        <line
          key={i}
          x1={118}
          y1={21 + i * 7}
          x2={166}
          y2={21 + i * 7}
          stroke={GREEN}
          strokeWidth={1.5}
          opacity={(0.25 + t * 0.55) * 0.8}
        />
      ))}
    </>
  )
}

/** Options narrowing to a single pick: the model chooser. */
function Chooser({ phase }: { phase: number }) {
  const picked = Math.floor(phase * 4) % 4
  return (
    <>
      {Array.from({ length: 4 }, (_, i) => (
        <rect
          key={i}
          x={16 + i * 44}
          y={i === picked ? 12 : 18}
          width={36}
          height={i === picked ? 32 : 20}
          rx={4}
          fill={i === picked ? ACCENT : MUTED}
          opacity={i === picked ? 0.9 : 0.2}
        />
      ))}
    </>
  )
}

const MOTIFS: Record<Motif, (props: { phase: number }) => React.ReactElement> = {
  tokens: Tokens,
  weights: Weights,
  pixels: Pixels,
  digits: Digits,
  layers: Layers,
  descent: Descent,
  nextWord: NextWord,
  context: Context,
  compare: Compare,
  pricing: Pricing,
  vision: Vision,
  embedding: Embedding,
  reasoning: Reasoning,
  search: Search,
  tuning: Tuning,
  prompt: Prompt,
  hallucination: Hallucination,
  openSource: OpenSource,
  chooser: Chooser,
}

/** How long one full cycle of each motif takes. Slower where motion is large. */
const PERIOD_MS: Partial<Record<Motif, number>> = {
  digits: 5000,
  descent: 3200,
  layers: 3400,
  reasoning: 3600,
  nextWord: 3800,
}
const DEFAULT_PERIOD_MS = 4200

interface TopicCardAnimationProps {
  motif: Motif
  /** Describes the motif for screen readers; the card's own text carries the topic. */
  label: string
}

export function TopicCardAnimation({ motif, label }: TopicCardAnimationProps) {
  const period = PERIOD_MS[motif] ?? DEFAULT_PERIOD_MS
  const { ref, phase } = useCardAnimation(period)
  const Shape = MOTIFS[motif]

  return (
    <div ref={ref} className="overflow-hidden rounded-lg bg-bg-secondary" data-motif={motif}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-14 w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={label}
      >
        <Shape phase={phase} />
      </svg>
    </div>
  )
}
