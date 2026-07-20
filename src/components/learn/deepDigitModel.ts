/**
 * A real (tiny) three-layer network that reads the digits 0–9 on an 8x8 grid.
 *
 * Doodle-525 went pixels → strokes → digits. This one puts another layer in
 * the middle, because that is what "deep" actually buys you. The strokes get
 * chopped finer, and the new layer recognizes *shapes* built out of several
 * strokes at once: a closed loop up top, a closed loop below, an open curve
 * with a gap on one side, a straight spine down the right edge.
 *
 * Layer 1 (64 pixels → 10 stroke primitives): the seven-segment strokes of
 * Doodle-525, with each horizontal bar split into a left and a right half.
 * Finer parts are what let the next layer tell "the top of an 8" from "the
 * top of a 7". Each primitive averages the pixels of its own stroke and
 * fires through a steep sigmoid when most of them are drawn.
 *
 * Layer 2 (10 primitives → 8 shape detectors): each shape detector is an AND
 * over a handful of primitives. Its weights are 1/needs on the primitives
 * the shape requires and a hard negative on the ones that would break it, so
 * "top loop" fires for 0, 8 and 9 but not for 7, whose top bar is there but
 * whose left side is missing. These are the compositional features the issue
 * asks for: circular tops, circular bottoms, open curves, straight lines.
 *
 * Layer 3 (8 shapes → 10 digit outputs): the shape vocabulary gives every
 * digit its own signature, so the output weights are *derived*, not typed
 * in — we run layers 1 and 2 over the canonical drawing of each digit and
 * read off which shapes it lights up. +1 for a shape the digit shows, -1 for
 * one it doesn't, exactly Doodle-525's stroke vote one level of abstraction
 * higher. Softmax turns the ten scores into probabilities.
 *
 * Some pairs sit one shape apart — a 0 is an 8 without the waist, a 2 is a 3
 * that leans the other way — so layer 3 also keeps a quiet direct connection
 * back to layer 1. Real vision models do the same thing with skip
 * connections: late layers get to look at early features when the
 * abstraction throws away something they still need.
 */

export const GRID_SIZE = 8
export const PIXEL_COUNT = GRID_SIZE * GRID_SIZE
export const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const

function px(row: number, col: number): number {
  return row * GRID_SIZE + col
}

function halfBar(row: number, side: 'left' | 'right'): number[] {
  return side === 'left' ? [px(row, 2), px(row, 3)] : [px(row, 4), px(row, 5)]
}

function vertical(col: number, fromRow: number, toRow: number): number[] {
  const pixels: number[] = []
  for (let row = fromRow; row <= toRow; row++) pixels.push(px(row, col))
  return pixels
}

export interface StrokePrimitive {
  /** Human name shown next to every colored mark. */
  name: string
  /** CSS custom property carrying this primitive's categorical color. */
  color: string
  /** Pixel indices this detector watches (weight 1/size each). */
  pixels: number[]
}

/**
 * The 10 stroke primitives of layer 1, top-to-bottom. Together they tile
 * exactly the seven-segment skeleton Doodle-525 uses, so both models see the
 * same reference drawings and you can compare them on the same input.
 */
export const PRIMITIVES: StrokePrimitive[] = [
  { name: 'Top bar, left half', color: 'var(--color-seg-1)', pixels: halfBar(0, 'left') },
  { name: 'Top bar, right half', color: 'var(--color-seg-2)', pixels: halfBar(0, 'right') },
  { name: 'Upper-left line', color: 'var(--color-seg-3)', pixels: vertical(1, 1, 3) },
  { name: 'Upper-right line', color: 'var(--color-seg-4)', pixels: vertical(6, 1, 3) },
  { name: 'Middle bar, left half', color: 'var(--color-seg-5)', pixels: halfBar(3, 'left') },
  { name: 'Middle bar, right half', color: 'var(--color-seg-6)', pixels: halfBar(3, 'right') },
  { name: 'Lower-left line', color: 'var(--color-seg-7)', pixels: vertical(1, 4, 6) },
  { name: 'Lower-right line', color: 'var(--color-seg-1)', pixels: vertical(6, 4, 6) },
  { name: 'Bottom bar, left half', color: 'var(--color-seg-3)', pixels: halfBar(7, 'left') },
  { name: 'Bottom bar, right half', color: 'var(--color-seg-5)', pixels: halfBar(7, 'right') },
]

export const PRIMITIVE_COUNT = PRIMITIVES.length

/** Which primitives make up each digit (indices into PRIMITIVES). */
export const DIGIT_PRIMITIVES: number[][] = [
  [0, 1, 2, 3, 6, 7, 8, 9], // 0
  [3, 7], // 1
  [0, 1, 3, 4, 5, 6, 8, 9], // 2
  [0, 1, 3, 4, 5, 7, 8, 9], // 3
  [2, 3, 4, 5, 7], // 4
  [0, 1, 2, 4, 5, 7, 8, 9], // 5
  [0, 1, 2, 4, 5, 6, 7, 8, 9], // 6
  [0, 1, 3, 7], // 7
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // 8
  [0, 1, 2, 3, 4, 5, 7, 8, 9], // 9
]

/** Layer-1 weights: [primitive][pixel], 1/size inside the stroke, 0 outside. */
export const PRIMITIVE_WEIGHTS: number[][] = PRIMITIVES.map((prim) => {
  const row = Array(PIXEL_COUNT).fill(0)
  for (const i of prim.pixels) row[i] = 1 / prim.pixels.length
  return row
})

export interface ShapeDetector {
  /** Human name shown on the shape card. */
  name: string
  /** One line of plain English: what the shape is, and which digits have it. */
  blurb: string
  /** CSS custom property carrying this shape's categorical color. */
  color: string
  /** Primitives that must all be present for the shape to be there. */
  needs: number[]
  /**
   * Primitives that must all be absent. A closed loop and an open curve
   * share the same bars; only the missing side tells them apart.
   */
  forbids: number[]
}

/**
 * The 8 shape detectors of layer 2. Each is a pattern over stroke
 * primitives, and each is reused by several digits — that reuse is the whole
 * point of a middle layer.
 */
export const SHAPES: ShapeDetector[] = [
  {
    name: 'Top loop',
    blurb: 'A circle closed around the upper half: top bar plus both upper sides. 0, 8 and 9 have one.',
    color: 'var(--color-seg-1)',
    needs: [0, 1, 2, 3],
    forbids: [],
  },
  {
    name: 'Bottom loop',
    blurb: 'The same circle in the lower half: both lower sides plus the bottom bar. 0, 6 and 8 have one; 9 famously does not.',
    color: 'var(--color-seg-2)',
    needs: [6, 7, 8, 9],
    forbids: [],
  },
  {
    name: 'Waist',
    blurb: 'A full bar across the middle, pinching the shape in two. Everything except 0, 1 and 7 has one.',
    color: 'var(--color-seg-4)',
    needs: [4, 5],
    forbids: [],
  },
  {
    name: 'Open curve, left gap',
    blurb: 'A C-shaped arc down the right: top bar, upper-right line and waist, with the upper-left side missing. The top of a 2 or a 3.',
    color: 'var(--color-seg-6)',
    needs: [0, 1, 3, 4, 5],
    forbids: [2],
  },
  {
    name: 'Open curve, right gap',
    blurb: 'The mirror image: an arc down the left with the upper-right side missing. The top of a 5 or a 6.',
    color: 'var(--color-seg-7)',
    needs: [0, 1, 2, 4, 5],
    forbids: [3],
  },
  {
    name: 'Straight right spine',
    blurb: 'One unbroken vertical down the right edge with nothing on the left. The backbone of 1 and 7.',
    color: 'var(--color-seg-3)',
    needs: [3, 7],
    forbids: [2, 6],
  },
  {
    name: 'Flat base',
    blurb: 'A full bar closing the shape off along the bottom. Seven digits rest on one; 1, 4 and 7 do not.',
    color: 'var(--color-seg-5)',
    needs: [8, 9],
    forbids: [],
  },
  {
    name: 'Flat cap',
    blurb: 'A full bar across the top. Present in every digit except 1 and 4, which start partway down.',
    color: 'var(--color-seg-2)',
    needs: [0, 1],
    forbids: [],
  },
]

export const SHAPE_COUNT = SHAPES.length

/**
 * Layer-2 weights: [shape][primitive]. Each required primitive gets 1/needs,
 * so all of them present sums to exactly 1 and any one missing drops the sum
 * below the threshold. Each forbidden primitive gets -1, enough for a single
 * one to veto the shape on its own. Everything else is weight 0.
 */
export const SHAPE_WEIGHTS: number[][] = SHAPES.map((shape) => {
  const row = Array(PRIMITIVE_COUNT).fill(0)
  for (const j of shape.needs) row[j] = 1 / shape.needs.length
  for (const j of shape.forbids) row[j] = -1
  return row
})

/** The reference drawing of a digit: the union of its primitives' pixels. */
export function digitPattern(digit: number): boolean[] {
  const pixels = Array(PIXEL_COUNT).fill(false)
  for (const j of DIGIT_PRIMITIVES[digit]) {
    for (const i of PRIMITIVES[j].pixels) pixels[i] = true
  }
  return pixels
}

export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

/** How sharply a stroke primitive switches from off to on. */
const PRIMITIVE_STEEPNESS = 14
const PRIMITIVE_BIAS = -0.5

/** How sharply a shape switches from off to on once its threshold is crossed. */
const SHAPE_STEEPNESS = 30

/**
 * A shape wants *every* primitive it needs, so its threshold sits just under
 * 1 rather than at the halfway mark: most of a loop is not a loop. "Just
 * under" has to scale with how many primitives the shape needs, though. Each
 * one contributes 1/needs to the sum, so a fixed threshold is generous to a
 * six-primitive shape and impossibly strict on a two-primitive one. Leaving
 * a constant half-primitive of slack keeps every shape equally tolerant of a
 * smudged stroke and equally intolerant of a missing one.
 */
function shapeBias(needs: number): number {
  return -(1 - 0.5 / needs)
}

/**
 * Softmax temperature for the output layer, matched to Doodle-525's so the
 * two models' confidences are read off the same scale.
 */
const OUTPUT_STEEPNESS = 2

/**
 * How loudly layer 3 is allowed to consult layer 1 directly. Shapes carry
 * the argument; the skip path only settles what shapes cannot see, so it is
 * deliberately quiet — under half a shape's vote per primitive.
 */
const SKIP_SCALE = 0.45

interface DigitFeatures {
  coverage: number[]
  primitives: number[]
  shapes: number[]
}

/** Layer-1 and layer-2 activations for a drawing, before any digit is named. */
function features(pixels: boolean[]): DigitFeatures {
  const coverage = PRIMITIVES.map(
    (prim) => prim.pixels.filter((i) => pixels[i]).length / prim.pixels.length
  )
  const primitives = coverage.map((c) => sigmoid(PRIMITIVE_STEEPNESS * (c + PRIMITIVE_BIAS)))
  const shapes = SHAPE_WEIGHTS.map((row, s) => {
    const sum = row.reduce((total, w, j) => total + w * primitives[j], 0)
    return sigmoid(SHAPE_STEEPNESS * (sum + shapeBias(SHAPES[s].needs.length)))
  })
  return { coverage, primitives, shapes }
}

/** Shape signatures of the ten canonical drawings, computed once at load. */
const CANONICAL_SHAPES = DIGITS.map((digit) => features(digitPattern(digit)).shapes)

/**
 * Layer-3 shape weights: [digit][shape], +1 if the canonical drawing of the
 * digit lights that shape up, -1 if it doesn't. Derived by running the first
 * two layers over each reference digit rather than typed in by hand, which
 * is the closest a hand-built model gets to training: show it the examples
 * and read the answer off.
 */
export const OUTPUT_SHAPE_WEIGHTS: number[][] = CANONICAL_SHAPES.map((shapes) =>
  shapes.map((s) => (s > 0.5 ? 1 : -1))
)

/**
 * Layer-3 skip weights: [digit][primitive], the same +1/-1 vote taken over
 * layer 1. Scaled by SKIP_SCALE at inference time so it never overrules the
 * shape layer, only separates digits the shape layer scores alike.
 */
export const OUTPUT_SKIP_WEIGHTS: number[][] = DIGITS.map((digit) =>
  PRIMITIVES.map((_, j) => (DIGIT_PRIMITIVES[digit].includes(j) ? 1 : -1))
)

export interface DeepDigitClassification {
  prediction: number
  /** Probability of the winning digit. */
  confidence: number
  /** Softmax probability per digit, indexed 0–9. */
  probs: number[]
  /** Layer-1 activations per stroke primitive, 0–1. */
  primitives: number[]
  /** Layer-2 activations per shape detector, 0–1. */
  shapes: number[]
  /** Fraction of each primitive's pixels that are drawn, 0–1. */
  coverage: number[]
  /** Raw output scores before softmax. */
  scores: number[]
}

export function classifyDigitDeep(pixels: boolean[]): DeepDigitClassification {
  const { coverage, primitives, shapes } = features(pixels)

  // Center both feature layers to [-1, 1] so a quiet detector is evidence
  // *against* the digits that need it, not merely an absence of evidence.
  const centeredShapes = shapes.map((s) => 2 * s - 1)
  const centeredPrimitives = primitives.map((p) => 2 * p - 1)

  const scores = DIGITS.map((digit) => {
    const shapeVote = OUTPUT_SHAPE_WEIGHTS[digit].reduce(
      (sum, w, j) => sum + w * centeredShapes[j],
      0
    )
    const skipVote = OUTPUT_SKIP_WEIGHTS[digit].reduce(
      (sum, w, j) => sum + w * centeredPrimitives[j],
      0
    )
    return shapeVote + SKIP_SCALE * skipVote
  })

  const max = Math.max(...scores)
  const exps = scores.map((s) => Math.exp(OUTPUT_STEEPNESS * (s - max)))
  const total = exps.reduce((a, b) => a + b, 0)
  const probs = exps.map((e) => e / total)

  let prediction = 0
  probs.forEach((p, d) => {
    if (p > probs[prediction]) prediction = d
  })

  return { prediction, confidence: probs[prediction], probs, primitives, shapes, coverage, scores }
}

/** Which shapes the canonical drawing of a digit shows, by name. */
export function shapesOf(digit: number): string[] {
  return SHAPES.filter((_, j) => OUTPUT_SHAPE_WEIGHTS[digit][j] > 0).map((shape) => shape.name)
}

/**
 * Total parameters, quoted on the model card: 640 pixel→primitive weights,
 * 10 primitive biases, 80 primitive→shape weights, 8 shape biases, 80
 * shape→digit weights, 100 skip weights.
 */
export const PARAMETER_COUNT =
  PIXEL_COUNT * PRIMITIVE_COUNT +
  PRIMITIVE_COUNT +
  PRIMITIVE_COUNT * SHAPE_COUNT +
  SHAPE_COUNT +
  SHAPE_COUNT * DIGITS.length +
  PRIMITIVE_COUNT * DIGITS.length
