/**
 * Deterministic, SSR-safe label placement for the graph scatter plot.
 *
 * Every point wants its short model name printed beside it, but a scatter of
 * twenty models clusters, and naive labels overprint each other and the
 * points. This module resolves that entirely in the plot's 0-100 percent
 * coordinate space with no DOM measurement: label boxes are estimated from
 * character count, points are processed in a fixed order, and each label
 * tries a ring of candidate anchors before giving up. The output is a plain
 * data structure the renderer positions with inline styles, so the same
 * input always yields the same layout on server and client.
 */

export interface LabelInput {
  /** Stable key, unique per point (the model name). */
  id: string
  /** Text the label will show; its length drives the estimated box width. */
  text: string
  /** Point position in plot percent, x rightward, y downward. */
  x: number
  y: number
}

export interface PlacedLabel {
  id: string
  text: string
  /** Top-left corner of the label box, in plot percent. */
  left: number
  top: number
  /** Estimated box size in plot percent, for the renderer's leader lines. */
  width: number
  height: number
  /**
   * True when the label sits away from its default anchor and needs a thin
   * leader line drawn from the point to the label's nearest edge.
   */
  leader: boolean
  /** Where the leader attaches on the label box, in plot percent. */
  anchorX: number
  anchorY: number
}

export interface PlaceLabelsOptions {
  /**
   * Plot width divided by height. Percent units are not square — 1% of a
   * 900px-wide plot is ~2x the distance of 1% of its 450px height — so
   * collision math must weigh x and y differently. Defaults to the graph
   * page's roughly 2:1 plot.
   */
  aspectRatio?: number
  /** Estimated character width in x-percent at the label font size. */
  charWidth?: number
  /** Estimated label line height in y-percent. */
  lineHeight?: number
}

/**
 * Tuned for text-[10px] labels in a ~900x450 plot: a 10px-font character
 * averages ~6px wide → 6/900 ≈ 0.67% of width; a 14px line → 14/450 ≈ 3.1%
 * of height. Estimates only — the renderer keeps labels non-interactive, so
 * a slightly generous box costs nothing but spacing.
 */
const DEFAULT_CHAR_WIDTH = 0.7
const DEFAULT_LINE_HEIGHT = 3.2
const DEFAULT_ASPECT = 2

/** Gap between a point's center and its label box, in x-percent. */
const POINT_GAP_X = 1.1
/** Extra padding around boxes when testing overlap, in percent. */
const COLLISION_PAD = 0.3

/** Half-size of the dot itself (h-3 w-3 ≈ 12px) in x-percent terms. */
const POINT_HALF_X = 0.8

interface Box {
  left: number
  top: number
  right: number
  bottom: number
}

function overlaps(a: Box, b: Box, aspect: number): boolean {
  // Scale y into x-equivalent units so the padding means the same visual
  // distance on both axes.
  const pad = COLLISION_PAD
  return (
    a.left - pad < b.right + pad &&
    a.right + pad > b.left - pad &&
    (a.top - pad) / aspect < (b.bottom + pad) / aspect &&
    (a.bottom + pad) / aspect > (b.top - pad) / aspect
  )
}

/** Candidate anchor slots around a point, tried in order. */
type Slot = {
  /** Horizontal placement of the box relative to the point. */
  side: 'right' | 'left' | 'center'
  /** Vertical placement of the box relative to the point. */
  vert: 'middle' | 'above' | 'below'
  /** Multiplier on the point gap; >1 pushes the label farther out. */
  distance: number
}

/**
 * Right first (the natural reading position), then left, above, below, then
 * the same ring pushed farther out. Only the first slot counts as the
 * default anchor; every other slot sets the leader flag.
 */
const SLOTS: Slot[] = [
  { side: 'right', vert: 'middle', distance: 1 },
  { side: 'left', vert: 'middle', distance: 1 },
  { side: 'center', vert: 'above', distance: 1 },
  { side: 'center', vert: 'below', distance: 1 },
  { side: 'right', vert: 'above', distance: 1.6 },
  { side: 'right', vert: 'below', distance: 1.6 },
  { side: 'left', vert: 'above', distance: 1.6 },
  { side: 'left', vert: 'below', distance: 1.6 },
  { side: 'right', vert: 'middle', distance: 3 },
  { side: 'left', vert: 'middle', distance: 3 },
  { side: 'center', vert: 'above', distance: 2.5 },
  { side: 'center', vert: 'below', distance: 2.5 },
]

function boxFor(
  input: LabelInput,
  slot: Slot,
  width: number,
  height: number,
  aspect: number,
): Box {
  const gapX = (POINT_GAP_X + POINT_HALF_X) * slot.distance
  // The same visual gap vertically: convert x-percent to y-percent.
  const gapY = gapX * aspect * 0.55

  let left: number
  if (slot.side === 'right') left = input.x + gapX
  else if (slot.side === 'left') left = input.x - gapX - width
  else left = input.x - width / 2

  let top: number
  if (slot.vert === 'middle') top = input.y - height / 2
  else if (slot.vert === 'above') top = input.y - gapY - height
  else top = input.y + gapY

  return { left, top, right: left + width, bottom: top + height }
}

/** Point where a leader line should meet the label box: its nearest edge midpoint. */
function leaderAttachment(box: Box, point: LabelInput): { x: number; y: number } {
  const cx = (box.left + box.right) / 2
  const cy = (box.top + box.bottom) / 2
  const dx = point.x - cx
  const dy = point.y - cy
  // Attach on the side facing the point; compare against box extents to pick
  // a horizontal or vertical edge.
  if (Math.abs(dx) * (box.bottom - box.top) > Math.abs(dy) * (box.right - box.left)) {
    return { x: dx > 0 ? box.right : box.left, y: cy }
  }
  return { x: cx, y: dy > 0 ? box.bottom : box.top }
}

/**
 * Place a label near every point, avoiding the points and each other.
 *
 * Deterministic: inputs are processed in the caller's order (stable for a
 * given dataset), each label takes the first non-colliding slot, and a label
 * that collides in every slot is dropped rather than drawn over a neighbor —
 * the model stays reachable through the point's own hover card and the
 * fallback selector, so a hidden label loses less than an unreadable pile.
 */
export function placeLabels(
  inputs: LabelInput[],
  options: PlaceLabelsOptions = {},
): PlacedLabel[] {
  const aspect = options.aspectRatio ?? DEFAULT_ASPECT
  const charWidth = options.charWidth ?? DEFAULT_CHAR_WIDTH
  const lineHeight = options.lineHeight ?? DEFAULT_LINE_HEIGHT

  // Points themselves are obstacles: a label may not cover any dot.
  const pointBoxes: Box[] = inputs.map((p) => ({
    left: p.x - POINT_HALF_X,
    right: p.x + POINT_HALF_X,
    top: p.y - POINT_HALF_X * aspect,
    bottom: p.y + POINT_HALF_X * aspect,
  }))

  const placedBoxes: Box[] = []
  const placed: PlacedLabel[] = []

  for (const input of inputs) {
    const width = input.text.length * charWidth
    const height = lineHeight

    for (let s = 0; s < SLOTS.length; s++) {
      const box = boxFor(input, SLOTS[s], width, height, aspect)
      // Keep the whole label inside the plot area.
      if (box.left < 0 || box.right > 100 || box.top < 0 || box.bottom > 100) continue
      const hitsPoint = pointBoxes.some((pb) => overlaps(box, pb, aspect))
      if (hitsPoint) continue
      const hitsLabel = placedBoxes.some((lb) => overlaps(box, lb, aspect))
      if (hitsLabel) continue

      const leader = s !== 0
      const attach = leader ? leaderAttachment(box, input) : { x: box.left, y: input.y }
      placedBoxes.push(box)
      placed.push({
        id: input.id,
        text: input.text,
        left: box.left,
        top: box.top,
        width,
        height,
        leader,
        anchorX: attach.x,
        anchorY: attach.y,
      })
      break
    }
  }

  return placed
}
