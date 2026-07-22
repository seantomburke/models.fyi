/**
 * Real gradient descent, trained in the browser on the same 8x8 problem as
 * Doodle-64: is this drawing a "3" or an "E"?
 *
 * Nothing here is faked for the animation. We start all 64 weights at small
 * random numbers (from a seeded PRNG, so every visitor and every test sees the
 * identical run), then repeatedly:
 *   1. score each training image with the current weights,
 *   2. squash the score to a probability with sigmoid,
 *   3. measure how wrong that probability is (cross-entropy loss),
 *   4. nudge every weight a little way down the loss slope.
 *
 * We snapshot all 64 weights plus the loss after every epoch, and that history
 * is what GradientDescentDemo animates. The curves you see are the actual
 * training trajectory.
 */

import { GRID_SIZE, PIXEL_COUNT, patternE, patternThree, sigmoid } from './pixelClassifierModel'

export { GRID_SIZE, PIXEL_COUNT }

/** Number of full passes over the training set we record. */
export const EPOCHS = 120

/** Each class gets enough varied drawings that the model cannot just memorize one glyph. */
export const TRAINING_SAMPLES_PER_CLASS = 25

/** How big a step each weight takes down the slope. */
export const LEARNING_RATE = 0.35

/** The seed for the starting weights. Fixed so the run is reproducible. */
export const SEED = 20260719

/**
 * Deterministic 32-bit PRNG (mulberry32). Seeded so the "random" starting
 * weights are the same every single run — which is what makes the animation
 * reproducible and the tests meaningful.
 */
export function makeRandom(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface TrainingExample {
  /** Human-readable name, shown under the sample thumbnails. */
  label: string
  /** 64 pixels, true where there is ink. */
  pixels: boolean[]
  /** 1 for a "3", 0 for an "E". */
  target: number
}

function withNoise(base: boolean[], rand: () => number, flips: number): boolean[] {
  const pixels = base.slice()
  for (let n = 0; n < flips; n++) {
    const i = Math.floor(rand() * PIXEL_COUNT)
    pixels[i] = !pixels[i]
  }
  return pixels
}

/**
 * The training set: the two clean reference shapes plus smudged variants, so
 * the model has to learn a general rule instead of memorizing two images.
 */
export function buildTrainingSet(seed = SEED): TrainingExample[] {
  const rand = makeRandom(seed ^ 0x9e3779b9)
  const three = patternThree()
  const e = patternE()
  const examples: TrainingExample[] = [
    { label: 'Clean 3', pixels: three, target: 1 },
    { label: 'Clean E', pixels: e, target: 0 },
  ]
  for (let v = 1; v < TRAINING_SAMPLES_PER_CLASS; v++) {
    const flips = 2 + Math.floor(rand() * 4)
    examples.push({ label: `Training 3 #${v + 1}`, pixels: withNoise(three, rand, flips), target: 1 })
    examples.push({ label: `Training E #${v + 1}`, pixels: withNoise(e, rand, flips), target: 0 })
  }
  return examples
}

export const TRAINING_SET: TrainingExample[] = buildTrainingSet()

/** One recorded moment in training: what every weight was, and how wrong we were. */
export interface EpochSnapshot {
  epoch: number
  /** All 64 weights at the end of this epoch. */
  weights: number[]
  /** Mean cross-entropy loss over the training set at the start of this epoch. */
  loss: number
  /** How many training images the model gets right, 0–1. */
  accuracy: number
  /** The intercept learned alongside the 64 pixel weights. */
  bias: number
}

export interface TrainingRun {
  /** Snapshot 0 is the random starting point, so the history is EPOCHS + 1 long. */
  history: EpochSnapshot[]
  /** Convenience view: history.map(h => h.loss). */
  lossCurve: number[]
  /** The weights we ended up with. */
  finalWeights: number[]
  /** The weights we started from. */
  initialWeights: number[]
  bias: number
}

function forward(weights: number[], bias: number, pixels: boolean[]): number {
  let score = bias
  for (let i = 0; i < PIXEL_COUNT; i++) {
    if (pixels[i]) score += weights[i]
  }
  return sigmoid(score)
}

function evaluate(
  weights: number[],
  bias: number,
  data: TrainingExample[]
): { loss: number; accuracy: number } {
  let loss = 0
  let correct = 0
  for (const ex of data) {
    const p = Math.min(Math.max(forward(weights, bias, ex.pixels), 1e-9), 1 - 1e-9)
    loss += -(ex.target * Math.log(p) + (1 - ex.target) * Math.log(1 - p))
    if ((p >= 0.5 ? 1 : 0) === ex.target) correct++
  }
  return { loss: loss / data.length, accuracy: correct / data.length }
}

function validateTrainingOptions(
  seed: number,
  epochs: number,
  learningRate: number,
  data: TrainingExample[]
): void {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) {
    throw new RangeError('Seed must be an integer from 0 to 4,294,967,295')
  }
  if (!Number.isFinite(epochs) || !Number.isInteger(epochs) || epochs < 0) {
    throw new RangeError('Epochs must be a non-negative integer')
  }
  if (!Number.isFinite(learningRate) || learningRate <= 0) {
    throw new RangeError('Learning rate must be a positive finite number')
  }
  if (data.length === 0) throw new RangeError('Training data must not be empty')

  for (const example of data) {
    if (example.pixels.length !== PIXEL_COUNT) {
      throw new RangeError(`Training example "${example.label}" must have ${PIXEL_COUNT} pixels`)
    }
    if (example.target !== 0 && example.target !== 1) {
      throw new RangeError(`Training example "${example.label}" must target 0 or 1`)
    }
    if (example.pixels.some((pixel) => typeof pixel !== 'boolean')) {
      throw new TypeError(`Training example "${example.label}" pixels must be booleans`)
    }
  }
}

/**
 * Train the 64 weights with full-batch gradient descent and record every epoch.
 *
 * The gradient of cross-entropy loss through a sigmoid collapses to something
 * beautifully simple: (prediction - target) * input. That single expression is
 * the entire learning rule below.
 */
export function trainGradientDescent(options: {
  seed?: number
  epochs?: number
  learningRate?: number
  data?: TrainingExample[]
} = {}): TrainingRun {
  const seed = options.seed ?? SEED
  const epochs = options.epochs ?? EPOCHS
  const learningRate = options.learningRate ?? LEARNING_RATE
  const data = options.data ?? TRAINING_SET
  validateTrainingOptions(seed, epochs, learningRate, data)

  // Step 1: guess. Small random numbers around zero — the model knows nothing.
  const rand = makeRandom(seed)
  const weights = Array.from({ length: PIXEL_COUNT }, () => (rand() - 0.5) * 0.6)
  const initialWeights = weights.slice()
  let bias = 0

  const history: EpochSnapshot[] = []
  const first = evaluate(weights, bias, data)
  history.push({
    epoch: 0,
    weights: weights.slice(),
    loss: first.loss,
    accuracy: first.accuracy,
    bias,
  })

  for (let epoch = 1; epoch <= epochs; epoch++) {
    const grad = new Array<number>(PIXEL_COUNT).fill(0)
    let biasGrad = 0

    for (const ex of data) {
      const p = forward(weights, bias, ex.pixels)
      const error = p - ex.target
      for (let i = 0; i < PIXEL_COUNT; i++) {
        if (ex.pixels[i]) grad[i] += error
      }
      biasGrad += error
    }

    // Step 2: step downhill. Every weight moves against its own slope.
    for (let i = 0; i < PIXEL_COUNT; i++) {
      weights[i] -= (learningRate * grad[i]) / data.length
    }
    bias -= (learningRate * biasGrad) / data.length

    const { loss, accuracy } = evaluate(weights, bias, data)
    history.push({ epoch, weights: weights.slice(), loss, accuracy, bias })
  }

  return {
    history,
    lossCurve: history.map((h) => h.loss),
    finalWeights: weights.slice(),
    initialWeights,
    bias,
  }
}

/** The one run the demo animates. Computed once, at module load. */
export const TRAINING_RUN: TrainingRun = trainGradientDescent()

/** Classify a drawing with a given set of learned weights. */
export function predictWith(weights: number[], bias: number, pixels: boolean[]): number {
  if (weights.length !== PIXEL_COUNT || pixels.length !== PIXEL_COUNT) {
    throw new RangeError(`Prediction requires ${PIXEL_COUNT} weights and pixels`)
  }
  if (!Number.isFinite(bias) || weights.some((weight) => !Number.isFinite(weight))) {
    throw new RangeError('Prediction weights and bias must be finite')
  }
  return forward(weights, bias, pixels)
}

export interface LearnedClassification {
  prediction: '3' | 'E'
  confidence: number
  probThree: number
  probE: number
}

/** Turn learned weights into the two-class result shown beside the drawing grid. */
export function classifyWithLearnedWeights(
  weights: number[],
  bias: number,
  pixels: boolean[]
): LearnedClassification {
  const probThree = predictWith(weights, bias, pixels)
  const probE = 1 - probThree
  return {
    prediction: probThree >= probE ? '3' : 'E',
    confidence: Math.max(probThree, probE),
    probThree,
    probE,
  }
}
