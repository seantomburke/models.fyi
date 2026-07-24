import { describe, expect, test } from 'vitest'
import { generate, inkProbability, affinity, PIXEL_COUNT } from './pixelGeneratorModel'
import { classify, patternThree, patternE, RAW_WEIGHTS } from './pixelClassifierModel'

describe('affinity', () => {
  test('a 3-voting pixel favors "3" and opposes "E"', () => {
    const threeVoter = RAW_WEIGHTS.findIndex((w) => w > 0)
    expect(affinity(threeVoter, '3')).toBeGreaterThan(0)
    expect(affinity(threeVoter, 'E')).toBeLessThan(0)
  })

  test('an E-voting pixel favors "E" and opposes "3"', () => {
    const eVoter = RAW_WEIGHTS.findIndex((w) => w < 0)
    expect(affinity(eVoter, 'E')).toBeGreaterThan(0)
    expect(affinity(eVoter, '3')).toBeLessThan(0)
  })
})

describe('inkProbability', () => {
  test('pixels in the target shape are near-certain to ink', () => {
    const three = patternThree()
    const target3 = three.findIndex(Boolean)
    expect(inkProbability(target3, '3', 0)).toBeGreaterThan(0.9)
  })

  test('pixels owned by the other letter are near-certain to stay blank', () => {
    // A pixel the E uses but the 3 does not: the E's left vertical edge.
    const e = patternE()
    const three = patternThree()
    const eOnly = e.findIndex((on, i) => on && !three[i])
    expect(eOnly).toBeGreaterThanOrEqual(0)
    expect(inkProbability(eOnly, '3', 0)).toBeLessThan(0.1)
  })

  test('temperature pulls probabilities toward 0.5', () => {
    const three = patternThree()
    const inked = three.findIndex(Boolean)
    const cold = inkProbability(inked, '3', 0)
    const hot = inkProbability(inked, '3', 1)
    expect(hot).toBeCloseTo(0.5, 5)
    expect(hot).toBeLessThan(cold)
  })
})

describe('generate', () => {
  test('produces one probability and one pixel per cell', () => {
    const { pixels, probabilities } = generate('3', 0.1, 1)
    expect(pixels).toHaveLength(PIXEL_COUNT)
    expect(probabilities).toHaveLength(PIXEL_COUNT)
  })

  test('is deterministic for a fixed seed and varies across seeds', () => {
    const a = generate('E', 0.2, 7)
    const b = generate('E', 0.2, 7)
    const c = generate('E', 0.2, 8)
    expect(a.pixels).toEqual(b.pixels)
    expect(c.pixels).not.toEqual(a.pixels)
  })

  test('a clean generated 3 reads back as a 3', () => {
    const { pixels } = generate('3', 0, 1)
    expect(classify(pixels).prediction).toBe('3')
  })

  test('a clean generated E reads back as an E', () => {
    const { pixels } = generate('E', 0, 1)
    expect(classify(pixels).prediction).toBe('E')
  })
})
