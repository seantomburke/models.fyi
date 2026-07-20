import { describe, it, expect } from 'vitest'
import {
  EPOCHS,
  PIXEL_COUNT,
  TRAINING_RUN,
  TRAINING_SET,
  makeRandom,
  predictWith,
  trainGradientDescent,
} from './gradientDescent'

describe('makeRandom', () => {
  it('is deterministic for a given seed and produces values in [0, 1)', () => {
    const a = makeRandom(42)
    const b = makeRandom(42)
    for (let i = 0; i < 50; i++) {
      const v = a()
      expect(v).toBe(b())
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('produces different streams for different seeds', () => {
    expect(makeRandom(1)()).not.toBe(makeRandom(2)())
  })
})

describe('training set', () => {
  it('has balanced 3 and E examples, each 64 pixels wide', () => {
    expect(TRAINING_SET.length).toBeGreaterThanOrEqual(10)
    for (const ex of TRAINING_SET) {
      expect(ex.pixels).toHaveLength(PIXEL_COUNT)
      expect([0, 1]).toContain(ex.target)
    }
    const threes = TRAINING_SET.filter((ex) => ex.target === 1).length
    expect(threes).toBe(TRAINING_SET.length - threes)
  })
})

describe('trainGradientDescent', () => {
  it('records one snapshot per epoch plus the random starting point', () => {
    expect(TRAINING_RUN.history).toHaveLength(EPOCHS + 1)
    expect(TRAINING_RUN.lossCurve).toHaveLength(EPOCHS + 1)
    TRAINING_RUN.history.forEach((snap, i) => {
      expect(snap.epoch).toBe(i)
      expect(snap.weights).toHaveLength(PIXEL_COUNT)
      expect(Number.isFinite(snap.loss)).toBe(true)
      expect(snap.accuracy).toBeGreaterThanOrEqual(0)
      expect(snap.accuracy).toBeLessThanOrEqual(1)
    })
    expect(TRAINING_RUN.finalWeights).toEqual(TRAINING_RUN.history[EPOCHS].weights)
  })

  it('starts from small random weights, not from the answer', () => {
    for (const w of TRAINING_RUN.initialWeights) {
      expect(Math.abs(w)).toBeLessThan(0.31)
    }
    // A random start cannot already classify the training set.
    const start = TRAINING_RUN.history[0]
    expect(start.loss).toBeGreaterThan(0.4)
  })

  it('drives the loss down and keeps it going down', () => {
    const { lossCurve } = TRAINING_RUN
    expect(lossCurve[lossCurve.length - 1]).toBeLessThan(lossCurve[0] * 0.4)

    // Full-batch gradient descent at this learning rate should never step uphill.
    for (let i = 1; i < lossCurve.length; i++) {
      expect(lossCurve[i]).toBeLessThanOrEqual(lossCurve[i - 1] + 1e-9)
    }
  })

  it('classifies every training pattern correctly once trained', () => {
    const { finalWeights, bias } = TRAINING_RUN
    for (const ex of TRAINING_SET) {
      const p = predictWith(finalWeights, bias, ex.pixels)
      expect(p >= 0.5 ? 1 : 0).toBe(ex.target)
    }
    expect(TRAINING_RUN.history[EPOCHS].accuracy).toBe(1)
  })

  it('converges: the weights stop moving much by the end', () => {
    const { history } = TRAINING_RUN
    const move = (a: number, b: number) =>
      history[a].weights.reduce((sum, w, i) => sum + Math.abs(w - history[b].weights[i]), 0)
    const early = move(1, 0)
    const late = move(EPOCHS, EPOCHS - 1)
    expect(late).toBeLessThan(early)
  })

  it('is reproducible for the same seed and different for another', () => {
    const a = trainGradientDescent({ seed: 7, epochs: 20 })
    const b = trainGradientDescent({ seed: 7, epochs: 20 })
    expect(a.finalWeights).toEqual(b.finalWeights)
    expect(a.lossCurve).toEqual(b.lossCurve)

    const c = trainGradientDescent({ seed: 8, epochs: 20 })
    expect(c.initialWeights).not.toEqual(a.initialWeights)
  })

  it('learns faster with a bigger learning rate', () => {
    const slow = trainGradientDescent({ epochs: 25, learningRate: 0.05 })
    const fast = trainGradientDescent({ epochs: 25, learningRate: 0.5 })
    expect(fast.lossCurve[25]).toBeLessThan(slow.lossCurve[25])
  })
})
