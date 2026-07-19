import { useState, useCallback } from 'react'

export function PixelClassifier() {
  // 8x8 pixel grid for drawing
  const GRID_SIZE = 8
  const [pixels, setPixels] = useState<boolean[]>(Array(GRID_SIZE * GRID_SIZE).fill(false))

  // Pre-trained "weights" for the classifier (hardcoded for the demo)
  // These are simple heuristics that classify 3 vs E
  const classifyPixels = useCallback((pixelArray: boolean[]) => {
    // Count pixels in different regions
    const leftEdge = [] as boolean[]
    const rightEdge = [] as boolean[]
    const topMiddle = [] as boolean[]
    const middleRow = [] as boolean[]
    const bottomMiddle = [] as boolean[]

    // Collect pixels by region
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const idx = row * GRID_SIZE + col
        if (pixelArray[idx]) {
          if (col < 2) leftEdge.push(true)
          if (col > 5) rightEdge.push(true)
          if (row < 2) topMiddle.push(true)
          if (row === 3 || row === 4) middleRow.push(true)
          if (row > 5) bottomMiddle.push(true)
        }
      }
    }

    // Simple classification logic
    // The number 3 has pixels on the right edge, 7 on the middle
    // The letter E has pixels on the left edge, 7 on the middle, and more top/bottom
    const rightEdgeScore = rightEdge.length
    const leftEdgeScore = leftEdge.length
    const topScore = topMiddle.length
    const bottomScore = bottomMiddle.length

    // E tends to have more left edge and balanced top/bottom
    // 3 tends to have more right edge
    const eScore =
      leftEdgeScore * 2 + (Math.abs(topScore - bottomScore) < 2 ? 5 : 0) + topScore + bottomScore
    const threeScore = rightEdgeScore * 2 + Math.abs(topScore - bottomScore) * 2

    return {
      isThree: threeScore > eScore,
      confidence: Math.abs(threeScore - eScore) / Math.max(threeScore, eScore, 1),
      threeScore,
      eScore,
    }
  }, [])

  const handlePixelClick = (index: number) => {
    const updated = [...pixels]
    updated[index] = !updated[index]
    setPixels(updated)
  }

  const handleClear = () => {
    setPixels(Array(GRID_SIZE * GRID_SIZE).fill(false))
  }

  const draw3 = () => {
    // Draw a simple "3" pattern
    const newPixels = Array(GRID_SIZE * GRID_SIZE).fill(false)
    // Top bar
    for (let col = 1; col < 6; col++) newPixels[col] = true
    // Top-right curve
    newPixels[1 * GRID_SIZE + 6] = true
    newPixels[2 * GRID_SIZE + 6] = true
    // Middle bar
    for (let col = 2; col < 6; col++) newPixels[4 * GRID_SIZE + col] = true
    // Bottom-right curve
    newPixels[5 * GRID_SIZE + 6] = true
    newPixels[6 * GRID_SIZE + 6] = true
    // Bottom bar
    for (let col = 1; col < 6; col++) newPixels[7 * GRID_SIZE + col] = true
    setPixels(newPixels)
  }

  const drawE = () => {
    // Draw a simple "E" pattern
    const newPixels = Array(GRID_SIZE * GRID_SIZE).fill(false)
    // Left edge
    for (let row = 0; row < 8; row++) newPixels[row * GRID_SIZE] = true
    for (let row = 0; row < 8; row++) newPixels[row * GRID_SIZE + 1] = true
    // Top bar
    for (let col = 1; col < 6; col++) newPixels[col] = true
    // Middle bar
    for (let col = 1; col < 6; col++) newPixels[4 * GRID_SIZE + col] = true
    // Bottom bar
    for (let col = 1; col < 6; col++) newPixels[7 * GRID_SIZE + col] = true
    setPixels(newPixels)
  }

  const result = classifyPixels(pixels)
  const totalPixels = pixels.filter(Boolean).length

  return (
    <div className="space-y-8">
      {/* Drawing Grid */}
      <div className="rounded-lg border border-line bg-bg-secondary p-6">
        <h3 className="text-lg font-semibold">Draw a digit: 3 or letter: E</h3>
        <p className="mt-2 text-sm text-fg-secondary">
          Click pixels to draw. The classifier will predict if it's a "3" or an "E".
        </p>

        {/* Pixel Grid */}
        <div className="mt-6 inline-block">
          <div
            className="inline-grid gap-1 rounded border border-line p-4"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            }}
          >
            {pixels.map((isActive, i) => (
              <button
                key={i}
                onClick={() => handlePixelClick(i)}
                className={`h-8 w-8 rounded-sm border transition-colors ${
                  isActive ? 'border-accent bg-accent' : 'border-line bg-bg-primary hover:bg-bg-secondary'
                }`}
                aria-label={`Pixel ${i}`}
              />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleClear}
            className="rounded bg-bg-secondary px-4 py-2 text-sm font-medium text-fg-primary hover:bg-line"
          >
            Clear
          </button>
          <button
            onClick={draw3}
            className="rounded bg-bg-secondary px-4 py-2 text-sm font-medium text-fg-primary hover:bg-line"
          >
            Example: 3
          </button>
          <button
            onClick={drawE}
            className="rounded bg-bg-secondary px-4 py-2 text-sm font-medium text-fg-primary hover:bg-line"
          >
            Example: E
          </button>
        </div>
      </div>

      {/* Prediction Results */}
      <div className="rounded-lg border border-line bg-bg-secondary p-6">
        <h3 className="text-lg font-semibold">Prediction</h3>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between rounded bg-bg-primary p-4">
            <div>
              <div className="text-sm text-fg-secondary">Prediction</div>
              <div className="text-2xl font-bold text-accent">
                {totalPixels === 0 ? '—' : result.isThree ? '3' : 'E'}
              </div>
            </div>
            <div>
              <div className="text-sm text-fg-secondary">Confidence</div>
              <div className="text-2xl font-bold text-accent">
                {totalPixels === 0 ? '—' : `${(result.confidence * 100).toFixed(0)}%`}
              </div>
            </div>
          </div>

          {/* Debug: Score breakdown */}
          <div className="space-y-2 text-xs text-fg-secondary">
            <div className="flex justify-between">
              <span>Model score for "3":</span>
              <span className="font-mono">{result.threeScore.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span>Model score for "E":</span>
              <span className="font-mono">{result.eScore.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pixels drawn:</span>
              <span className="font-mono">{totalPixels} / 64</span>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="rounded-lg border border-line bg-bg-secondary p-6">
        <h3 className="text-lg font-semibold">How this classifier works</h3>

        <div className="mt-4 space-y-4 text-sm">
          <p className="text-fg-secondary">
            This is a simplified "neural network" with just one layer. Instead of billions of weights, it uses just a
            few learned patterns to tell 3 from E:
          </p>

          <ul className="space-y-3 text-fg-secondary">
            <li>
              <strong className="text-fg-primary">Right edge pixels:</strong> The digit 3 has most of its pixels on
              the right side.
            </li>
            <li>
              <strong className="text-fg-primary">Left edge pixels:</strong> The letter E has a strong vertical stroke
              on the left.
            </li>
            <li>
              <strong className="text-fg-primary">Top/bottom balance:</strong> The letter E has similar ink at the top
              and bottom; 3 is more curved.
            </li>
          </ul>

          <p className="text-fg-secondary">
            In a real neural network, you'd have hundreds or thousands of such patterns stacked and combined. The
            network learns these patterns automatically from training data, without anyone writing them out.
          </p>

          <p className="text-fg-secondary">
            Try drawing a 3 or E, or use the example buttons. Then try something in between or messy—you'll see the
            confidence drop, just like a real model gets uncertain on ambiguous inputs.
          </p>
        </div>
      </div>
    </div>
  )
}
