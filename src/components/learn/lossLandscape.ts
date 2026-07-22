export interface Point2D {
  x: number
  y: number
}

export interface Point3D extends Point2D {
  z: number
}

export interface ProjectedPoint extends Point2D {
  depth: number
}

export interface GradientVector {
  start: Point3D
  end: Point3D
  magnitude: number
}

/** Deterministic teaching starts make a loss-landscape experiment replayable. */
export function seededValue(seed: number, minimum: number, maximum: number): number {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) {
    throw new RangeError('Seed must be a whole number from 0 to 4,294,967,295')
  }
  if (!Number.isFinite(minimum) || !Number.isFinite(maximum) || minimum >= maximum) {
    throw new RangeError('Seeded range needs finite bounds in ascending order')
  }
  const mixed = (seed * 1664525 + 1013904223) >>> 0
  return minimum + (mixed / 0x100000000) * (maximum - minimum)
}

/** An asymmetric double well: different starts settle in different valleys. */
export function polynomialLoss(x: number): number {
  return 0.08 * (x + 2.2) ** 2 * (x - 1.4) ** 2 + 0.08 * x + 0.45
}

export function polynomialGradient(x: number): number {
  return (
    0.16 * (x + 2.2) * (x - 1.4) ** 2 +
    0.16 * (x - 1.4) * (x + 2.2) ** 2 +
    0.08
  )
}

export function descendPolynomial(start: number, steps = 36, learningRate = 0.08): Point2D[] {
  if (!Number.isFinite(start) || !Number.isInteger(steps) || steps < 0) {
    throw new RangeError('Descent needs a finite start and a non-negative integer step count')
  }
  if (!Number.isFinite(learningRate) || learningRate <= 0) {
    throw new RangeError('Learning rate must be positive and finite')
  }

  const path: Point2D[] = [{ x: start, y: polynomialLoss(start) }]
  let x = start
  for (let step = 0; step < steps; step++) {
    x -= learningRate * polynomialGradient(x)
    path.push({ x, y: polynomialLoss(x) })
  }
  return path
}

/** A two-parameter toy loss surface with two basins and a saddle between them. */
export function surfaceLoss(x: number, y: number): number {
  return 0.035 * (x * x - 4) ** 2 + 0.045 * (y * y - 2.5) ** 2 + 0.025 * x * y + 0.08 * x
}

export function surfaceGradient(x: number, y: number): Point2D {
  return {
    x: 0.14 * x * (x * x - 4) + 0.025 * y + 0.08,
    y: 0.18 * y * (y * y - 2.5) + 0.025 * x,
  }
}

export function descendSurface(
  start: Point2D,
  steps = 42,
  learningRate = 0.11
): Point3D[] {
  const path: Point3D[] = [{ ...start, z: surfaceLoss(start.x, start.y) }]
  let { x, y } = start
  for (let step = 0; step < steps; step++) {
    const gradient = surfaceGradient(x, y)
    x -= learningRate * gradient.x
    y -= learningRate * gradient.y
    path.push({ x, y, z: surfaceLoss(x, y) })
  }
  return path
}

export function sampleSurface(size = 25, extent = 3.2): Point3D[][] {
  if (!Number.isInteger(size) || size < 2 || !Number.isFinite(extent) || extent <= 0) {
    throw new RangeError('Surface sampling needs at least two points and a positive extent')
  }
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) => {
      const x = -extent + (column / (size - 1)) * extent * 2
      const y = -extent + (row / (size - 1)) * extent * 2
      return { x, y, z: surfaceLoss(x, y) }
    })
  )
}

/** A sparse, normalized set of downhill vectors for the projected surface. */
export function sampleGradientVectors(
  grid: Point3D[][],
  stride = 6,
  length = 0.34
): GradientVector[] {
  if (!Number.isInteger(stride) || stride < 1 || !Number.isFinite(length) || length <= 0) {
    throw new RangeError('Gradient vectors need a positive stride and length')
  }
  const vectors: GradientVector[] = []
  for (let row = Math.floor(stride / 2); row < grid.length; row += stride) {
    for (let column = Math.floor(stride / 2); column < grid[row].length; column += stride) {
      const start = grid[row][column]
      const gradient = surfaceGradient(start.x, start.y)
      const magnitude = Math.hypot(gradient.x, gradient.y)
      if (magnitude < 1e-9) continue
      const x = start.x - (gradient.x / magnitude) * length
      const y = start.y - (gradient.y / magnitude) * length
      vectors.push({ start, end: { x, y, z: surfaceLoss(x, y) }, magnitude })
    }
  }
  return vectors
}

/** Continuous RGB interpolation, kept pure so the canvas color scale is testable. */
export function interpolateSurfaceColor(
  amount: number,
  low: readonly [number, number, number],
  high: readonly [number, number, number]
): string {
  const t = Math.min(Math.max(amount, 0), 1)
  const channels = low.map((channel, index) =>
    Math.round(channel + (high[index] - channel) * t)
  )
  return `rgb(${channels.join(' ')})`
}

/** Dependency-free orthographic projection used by the canvas renderer and tests. */
export function projectPoint(
  point: Point3D,
  yaw: number,
  pitch: number,
  scale = 42
): ProjectedPoint {
  const cosYaw = Math.cos(yaw)
  const sinYaw = Math.sin(yaw)
  const cosPitch = Math.cos(pitch)
  const sinPitch = Math.sin(pitch)
  const rotatedX = point.x * cosYaw - point.y * sinYaw
  const depth = point.x * sinYaw + point.y * cosYaw
  return {
    x: rotatedX * scale,
    y: (depth * sinPitch - point.z * cosPitch) * scale,
    depth: depth * cosPitch + point.z * sinPitch,
  }
}
