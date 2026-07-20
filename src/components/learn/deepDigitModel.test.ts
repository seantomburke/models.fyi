import { describe, it, expect } from 'vitest'
import {
  DIGITS,
  DIGIT_PRIMITIVES,
  OUTPUT_SHAPE_WEIGHTS,
  OUTPUT_SKIP_WEIGHTS,
  PARAMETER_COUNT,
  PIXEL_COUNT,
  PRIMITIVES,
  PRIMITIVE_COUNT,
  PRIMITIVE_WEIGHTS,
  SHAPES,
  SHAPE_COUNT,
  SHAPE_WEIGHTS,
  classifyDigitDeep,
  digitPattern,
  shapesOf,
} from './deepDigitModel'
import { classifyDigit, digitPattern as shallowPattern } from './digitClassifierModel'

/** Erase every pixel of the given primitives from a drawing. */
function erase(pixels: boolean[], ...primitiveIndices: number[]): boolean[] {
  const next = [...pixels]
  for (const j of primitiveIndices) {
    for (const i of PRIMITIVES[j].pixels) next[i] = false
  }
  return next
}

describe('deepDigitModel structure', () => {
  it('has 10 stroke primitives with disjoint pixels', () => {
    expect(PRIMITIVES).toHaveLength(PRIMITIVE_COUNT)
    const seen = new Set<number>()
    for (const prim of PRIMITIVES) {
      expect(prim.pixels.length).toBeGreaterThan(0)
      for (const i of prim.pixels) {
        expect(seen.has(i)).toBe(false)
        seen.add(i)
      }
    }
  })

  it('shapes only reference real primitives, and never need and forbid the same one', () => {
    expect(SHAPES).toHaveLength(SHAPE_COUNT)
    for (const shape of SHAPES) {
      expect(shape.needs.length + shape.forbids.length).toBeGreaterThan(0)
      for (const j of [...shape.needs, ...shape.forbids]) {
        expect(j).toBeGreaterThanOrEqual(0)
        expect(j).toBeLessThan(PRIMITIVE_COUNT)
      }
      for (const j of shape.needs) expect(shape.forbids).not.toContain(j)
    }
  })

  it('has one weight row per neuron in every layer', () => {
    expect(PRIMITIVE_WEIGHTS).toHaveLength(PRIMITIVE_COUNT)
    for (const row of PRIMITIVE_WEIGHTS) expect(row).toHaveLength(PIXEL_COUNT)
    expect(SHAPE_WEIGHTS).toHaveLength(SHAPE_COUNT)
    for (const row of SHAPE_WEIGHTS) expect(row).toHaveLength(PRIMITIVE_COUNT)
    expect(OUTPUT_SHAPE_WEIGHTS).toHaveLength(DIGITS.length)
    for (const row of OUTPUT_SHAPE_WEIGHTS) expect(row).toHaveLength(SHAPE_COUNT)
    expect(OUTPUT_SKIP_WEIGHTS).toHaveLength(DIGITS.length)
    for (const row of OUTPUT_SKIP_WEIGHTS) expect(row).toHaveLength(PRIMITIVE_COUNT)
  })

  it('quotes a parameter count that matches the weights it actually holds', () => {
    const counted =
      PRIMITIVE_WEIGHTS.length * PIXEL_COUNT +
      PRIMITIVE_COUNT +
      SHAPE_WEIGHTS.length * PRIMITIVE_COUNT +
      SHAPE_COUNT +
      OUTPUT_SHAPE_WEIGHTS.length * SHAPE_COUNT +
      OUTPUT_SKIP_WEIGHTS.length * PRIMITIVE_COUNT
    expect(PARAMETER_COUNT).toBe(counted)
  })

  it('gives every digit a distinct shape signature', () => {
    const signatures = OUTPUT_SHAPE_WEIGHTS.map((row) => row.join(','))
    expect(new Set(signatures).size).toBe(DIGITS.length)
  })
})

describe('layer 2 finds the shapes it claims to find', () => {
  it('lights the top loop for 0, 8 and 9 and nothing else', () => {
    const topLoop = SHAPES.findIndex((s) => s.name === 'Top loop')
    for (const digit of DIGITS) {
      const { shapes } = classifyDigitDeep(digitPattern(digit))
      const expected = [0, 8, 9].includes(digit)
      expect(shapes[topLoop] > 0.5).toBe(expected)
    }
  })

  it('lights the bottom loop for 0, 6 and 8 but not for 9', () => {
    const bottomLoop = SHAPES.findIndex((s) => s.name === 'Bottom loop')
    for (const digit of DIGITS) {
      const { shapes } = classifyDigitDeep(digitPattern(digit))
      expect(shapes[bottomLoop] > 0.5).toBe([0, 6, 8].includes(digit))
    }
  })

  it('lights the straight right spine only for the straight-line digits 1, 3 and 7', () => {
    const spine = SHAPES.findIndex((s) => s.name === 'Straight right spine')
    for (const digit of DIGITS) {
      const { shapes } = classifyDigitDeep(digitPattern(digit))
      expect(shapes[spine] > 0.5).toBe([1, 3, 7].includes(digit))
    }
  })

  it('splits the open curves by which side is missing', () => {
    const leftGap = SHAPES.findIndex((s) => s.name === 'Open curve, left gap')
    const rightGap = SHAPES.findIndex((s) => s.name === 'Open curve, right gap')
    for (const digit of DIGITS) {
      const { shapes } = classifyDigitDeep(digitPattern(digit))
      expect(shapes[leftGap] > 0.5).toBe([2, 3].includes(digit))
      expect(shapes[rightGap] > 0.5).toBe([5, 6].includes(digit))
    }
  })

  it('vetoes a shape when a forbidden primitive is drawn', () => {
    const leftGap = SHAPES.findIndex((s) => s.name === 'Open curve, left gap')
    const three = classifyDigitDeep(digitPattern(3))
    expect(three.shapes[leftGap]).toBeGreaterThan(0.5)

    // Add the upper-left line, which the "left gap" shape forbids. Every
    // primitive it needs is still drawn; the shape must switch off anyway.
    const closed = [...digitPattern(3)]
    for (const i of PRIMITIVES[2].pixels) closed[i] = true
    expect(classifyDigitDeep(closed).shapes[leftGap]).toBeLessThan(0.1)
  })

  it('names the shapes each canonical digit shows', () => {
    expect(shapesOf(0)).toContain('Top loop')
    expect(shapesOf(0)).toContain('Bottom loop')
    expect(shapesOf(0)).not.toContain('Waist')
    expect(shapesOf(9)).toContain('Top loop')
    expect(shapesOf(9)).not.toContain('Bottom loop')
    expect(shapesOf(1)).toEqual(['Straight right spine'])
  })
})

describe('classifyDigitDeep', () => {
  it.each(DIGITS.map((d) => [d]))('classifies the canonical %i correctly', (digit) => {
    expect(classifyDigitDeep(digitPattern(digit)).prediction).toBe(digit)
  })

  it.each(DIGITS.map((d) => [d]))('is over 99% sure about the canonical %i', (digit) => {
    expect(classifyDigitDeep(digitPattern(digit)).confidence).toBeGreaterThan(0.99)
  })

  it.each(DIGITS.map((d) => [d]))(
    'is at least as confident as the two-layer model on the canonical %i',
    (digit) => {
      const deep = classifyDigitDeep(digitPattern(digit))
      const shallow = classifyDigit(shallowPattern(digit))
      expect(shallow.prediction).toBe(digit)
      expect(deep.confidence).toBeGreaterThanOrEqual(shallow.confidence)
    }
  )

  it('produces probabilities that sum to 1', () => {
    for (const digit of DIGITS) {
      const { probs } = classifyDigitDeep(digitPattern(digit))
      expect(probs).toHaveLength(DIGITS.length)
      expect(probs.reduce((a, b) => a + b, 0)).toBeCloseTo(1)
      for (const p of probs) expect(p).toBeGreaterThanOrEqual(0)
    }
  })

  it('fires exactly the drawn primitives in layer 1', () => {
    for (const digit of DIGITS) {
      const { primitives } = classifyDigitDeep(digitPattern(digit))
      primitives.forEach((activation, j) => {
        if (DIGIT_PRIMITIVES[digit].includes(j)) {
          expect(activation).toBeGreaterThan(0.9)
        } else {
          expect(activation).toBeLessThan(0.1)
        }
      })
    }
  })

  it('survives a partly erased stroke on every digit', () => {
    // Rub out one pixel of the first multi-pixel primitive each digit uses.
    for (const digit of DIGITS) {
      const j = DIGIT_PRIMITIVES[digit].find((k) => PRIMITIVES[k].pixels.length > 2)
      if (j === undefined) continue
      const damaged = [...digitPattern(digit)]
      damaged[PRIMITIVES[j].pixels[0]] = false
      const result = classifyDigitDeep(damaged)
      expect(result.prediction).toBe(digit)
      expect(result.confidence).toBeGreaterThan(0.9)
    }
  })

  it('reads an 8 with its lower-left line rubbed out as a 9', () => {
    const damaged = erase(digitPattern(8), 6)
    const result = classifyDigitDeep(damaged)
    expect(result.prediction).toBe(9)
    expect(result.probs[8]).toBeLessThan(classifyDigitDeep(digitPattern(8)).probs[8])
  })

  it('reads an 8 with its waist rubbed out as a 0', () => {
    const result = classifyDigitDeep(erase(digitPattern(8), 4, 5))
    expect(result.prediction).toBe(0)
    expect(result.shapes[SHAPES.findIndex((s) => s.name === 'Waist')]).toBeLessThan(0.1)
  })

  it('reads a 9 with its top-left corner opened up as a 3', () => {
    const result = classifyDigitDeep(erase(digitPattern(9), 2))
    expect(result.prediction).toBe(3)
  })

  it('hesitates on a genuinely ambiguous drawing', () => {
    // Rub out two of the three pixels in the 8's upper-left line. The line is
    // now too faint to close the top loop but too present to be gone, which
    // is the one situation where a hand-built model should be unsure — and it
    // is, splitting its vote instead of committing.
    const damaged = [...digitPattern(8)]
    damaged[PRIMITIVES[2].pixels[0]] = false
    damaged[PRIMITIVES[2].pixels[1]] = false

    const result = classifyDigitDeep(damaged)
    expect(result.confidence).toBeLessThan(0.8)
    const runnerUp = Math.max(...result.probs.filter((p) => p !== result.confidence))
    expect(runnerUp).toBeGreaterThan(0.15)
  })

  it('reports the empty grid as an unlit network, not a real reading', () => {
    // Nothing drawn means every detector is silent, which is the recipe of
    // the digit that needs the fewest strokes. The UI gates on ink for this
    // reason; the model itself is honest about scoring it.
    const result = classifyDigitDeep(Array(PIXEL_COUNT).fill(false))
    expect(result.primitives.every((p) => p < 0.1)).toBe(true)
    expect(result.shapes.every((s) => s < 0.1)).toBe(true)
    expect(result.probs.reduce((a, b) => a + b, 0)).toBeCloseTo(1)
  })
})
