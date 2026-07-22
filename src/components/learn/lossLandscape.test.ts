import { describe, expect, it } from 'vitest'
import {
  descendPolynomial,
  descendSurface,
  polynomialGradient,
  polynomialLoss,
  projectPoint,
  interpolateSurfaceColor,
  sampleGradientVectors,
  sampleSurface,
  seededValue,
  surfaceGradient,
  surfaceLoss,
} from './lossLandscape'

describe('loss landscape math', () => {
  it('matches analytic gradients to finite differences', () => {
    const epsilon = 1e-5
    const x = 0.37
    const y = -0.42
    const numericalPolynomial =
      (polynomialLoss(x + epsilon) - polynomialLoss(x - epsilon)) / (2 * epsilon)
    expect(polynomialGradient(x)).toBeCloseTo(numericalPolynomial, 5)

    const gradient = surfaceGradient(x, y)
    const numericalX =
      (surfaceLoss(x + epsilon, y) - surfaceLoss(x - epsilon, y)) / (2 * epsilon)
    const numericalY =
      (surfaceLoss(x, y + epsilon) - surfaceLoss(x, y - epsilon)) / (2 * epsilon)
    expect(gradient.x).toBeCloseTo(numericalX, 5)
    expect(gradient.y).toBeCloseTo(numericalY, 5)
  })

  it('takes downhill steps and can finish in different polynomial basins', () => {
    const left = descendPolynomial(-0.4)
    const right = descendPolynomial(0.45)
    expect(left[left.length - 1].y).toBeLessThan(left[0].y)
    expect(right[right.length - 1].y).toBeLessThan(right[0].y)
    expect(left[left.length - 1].x).toBeLessThan(0)
    expect(right[right.length - 1].x).toBeGreaterThan(0)
  })

  it('maps a valid seed to a deterministic start inside the requested range', () => {
    expect(seededValue(7, -3.4, 2.8)).toBe(seededValue(7, -3.4, 2.8))
    expect(seededValue(8, -3.4, 2.8)).not.toBe(seededValue(7, -3.4, 2.8))
    expect(seededValue(7, -3.4, 2.8)).toBeGreaterThanOrEqual(-3.4)
    expect(seededValue(7, -3.4, 2.8)).toBeLessThan(2.8)
    expect(() => seededValue(-1, 0, 1)).toThrow(/Seed/)
  })

  it('samples and projects a finite deterministic surface', () => {
    const first = sampleSurface(8)
    expect(first).toEqual(sampleSurface(8))
    expect(first).toHaveLength(8)
    expect(first[0]).toHaveLength(8)
    const projected = projectPoint(first[2][3], -0.7, 0.6)
    expect(Object.values(projected).every(Number.isFinite)).toBe(true)

    const path = descendSurface({ x: 2.8, y: 2.5 })
    expect(path[path.length - 1].z).toBeLessThan(path[0].z)
  })

  it('builds a restrained deterministic set of downhill surface vectors', () => {
    const grid = sampleSurface()
    const vectors = sampleGradientVectors(grid)
    expect(vectors).toEqual(sampleGradientVectors(grid))
    expect(vectors.length).toBeGreaterThan(8)
    expect(vectors.length).toBeLessThan(30)
    for (const vector of vectors) {
      const gradient = surfaceGradient(vector.start.x, vector.start.y)
      const movementX = vector.end.x - vector.start.x
      const movementY = vector.end.y - vector.start.y
      expect(gradient.x * movementX + gradient.y * movementY).toBeLessThan(0)
    }
  })

  it('interpolates a continuous clamped surface color scale', () => {
    const low = [240, 253, 250] as const
    const high = [13, 148, 136] as const
    expect(interpolateSurfaceColor(0, low, high)).toBe('rgb(240 253 250)')
    expect(interpolateSurfaceColor(0.5, low, high)).toBe('rgb(127 201 193)')
    expect(interpolateSurfaceColor(1, low, high)).toBe('rgb(13 148 136)')
    expect(interpolateSurfaceColor(2, low, high)).toBe('rgb(13 148 136)')
  })
})
