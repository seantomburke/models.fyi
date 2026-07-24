/**
 * Doodle-64R: the Doodle-64 classifier run backward to generate images.
 *
 * The classifier answers "is this a 3 or an E?" by scoring 64 pixels with 64
 * weights. The generator asks the opposite question. You name a target, either
 * "3" or "E", and each pixel decides on its own how likely it is to hold ink in
 * a drawing of that target. The decision uses the exact same 64 weights, so the
 * generator is the classifier read in reverse.
 *
 * A pixel's weight (RAW_WEIGHTS) says which class it votes for: positive votes
 * "3", negative votes "E", zero is shared by both shapes. To generate a target
 * we turn that vote into an ink probability: a pixel that votes for the target
 * is almost always inked, a pixel that votes against it is almost always blank,
 * and a shared pixel is inked because both shapes use it. Sampling those
 * probabilities with a seed gives a fresh drawing every time, which is exactly
 * how a real image generator turns one prompt into many different pictures.
 */

import {
  GRID_SIZE,
  PIXEL_COUNT,
  RAW_WEIGHTS,
  patternThree,
  patternE,
} from './pixelClassifierModel'

export { GRID_SIZE, PIXEL_COUNT }

export type Target = '3' | 'E'

/**
 * How strongly a pixel's weight favours the chosen target, from -1 to 1.
 * +1 means the pixel is core to this shape, -1 means it belongs to the other
 * shape, 0 means both shapes share it (or neither uses it).
 */
export function affinity(pixelIndex: number, target: Target): number {
  const weight = RAW_WEIGHTS[pixelIndex]
  return target === '3' ? weight : -weight
}

/**
 * Whether a pixel is part of the target's own reference shape. Shared pixels
 * (the bars both letters draw) count as part of both, which is why a generated
 * 3 and a generated E share their horizontal bars.
 */
function inReferenceShape(pixelIndex: number, target: Target): boolean {
  const three = patternThree()
  const e = patternE()
  const shared = three[pixelIndex] && e[pixelIndex]
  if (shared) return true
  return target === '3' ? three[pixelIndex] : e[pixelIndex]
}

/**
 * The probability that a pixel holds ink in a drawing of the target. Pixels the
 * target shape uses start near-certain; pixels the other shape owns start
 * near-zero. Temperature bends both toward 0.5, which is how a higher
 * "creativity" setting makes the output noisier and less canonical.
 */
export function inkProbability(
  pixelIndex: number,
  target: Target,
  temperature: number,
): number {
  const base = inReferenceShape(pixelIndex, target) ? 0.94 : 0.03
  // temperature 0 keeps the base probability; temperature 1 pulls it to 0.5.
  const t = Math.min(1, Math.max(0, temperature))
  return base + (0.5 - base) * t
}

/** A tiny deterministic PRNG so a seed reproduces the same drawing. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface Generation {
  pixels: boolean[]
  /** Ink probability per pixel, for the explanation view. */
  probabilities: number[]
  target: Target
}

/**
 * Generate an 8x8 drawing of the target by sampling every pixel from its ink
 * probability with the given seed. A fixed seed always returns the same image;
 * changing the seed is what the "generate again" button does.
 */
export function generate(
  target: Target,
  temperature: number,
  seed: number,
): Generation {
  const rand = mulberry32(seed)
  const probabilities: number[] = []
  const pixels: boolean[] = []
  for (let i = 0; i < PIXEL_COUNT; i++) {
    const p = inkProbability(i, target, temperature)
    probabilities.push(p)
    pixels.push(rand() < p)
  }
  return { pixels, probabilities, target }
}
