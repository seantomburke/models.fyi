import { useState } from 'react'
import { GRID_SIZE, PIXEL_COUNT, classify, patternE, patternThree } from './pixelClassifierModel'
import { WeightHeatmap } from './WeightHeatmap'
import { PixelNetworkDiagram } from './PixelNetworkDiagram'
import { PixelGrid } from './PixelGrid'

export function PixelClassifier() {
  const [pixels, setPixels] = useState<boolean[]>(Array(PIXEL_COUNT).fill(false))

  const handleClear = () => {
    setPixels(Array(PIXEL_COUNT).fill(false))
  }

  const result = classify(pixels)
  const totalPixels = pixels.filter(Boolean).length

  return (
    <div className="space-y-8">
      {/* Drawing Grid */}
      <div className="rounded-lg border border-line bg-bg-secondary p-6">
        <h3 className="text-lg font-semibold">Draw a digit: 3 or letter: E</h3>
        <p className="mt-2 text-sm text-fg-secondary">
          Click a pixel, or drag across the grid to draw a whole stroke at once. On a phone,
          draw with your finger. The classifier will predict if it's a "3" or an "E".
        </p>

        {/* Pixel Grid */}
        <div className="mt-6 w-full max-w-80">
          <PixelGrid pixels={pixels} onChange={setPixels} gridSize={GRID_SIZE} />
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
            onClick={() => setPixels(patternThree())}
            className="rounded bg-bg-secondary px-4 py-2 text-sm font-medium text-fg-primary hover:bg-line"
          >
            Example: 3
          </button>
          <button
            onClick={() => setPixels(patternE())}
            className="rounded bg-bg-secondary px-4 py-2 text-sm font-medium text-fg-primary hover:bg-line"
          >
            Example: E
          </button>
        </div>
      </div>

      {/* The 64 weights */}
      <div className="rounded-lg border border-line bg-bg-secondary p-6">
        <h3 className="text-lg font-semibold">The classifier's 64 weights</h3>
        <p className="mt-2 text-sm text-fg-secondary">
          This is the network's entire "knowledge": one weight per pixel, squashed to 0–1 with the
          sigmoid function and drawn in the same 8x8 layout as the drawing grid. Green cells (weight
          near 1) are where a 3 puts ink but an E doesn't. Red cells (weight near 0) are where an E
          puts ink but a 3 doesn't. Transparent cells (weight 0.5) don't help tell them apart, so
          the network ignores them.
        </p>
        <div className="mt-6">
          <WeightHeatmap />
        </div>
      </div>

      {/* Network animation */}
      <div className="rounded-lg border border-line bg-bg-secondary p-6">
        <h3 className="text-lg font-semibold">Watch your drawing run through the network</h3>
        <p className="mt-2 text-sm text-fg-secondary">
          The same animation as the neural network page, wired with this classifier's real weights:
          all 64 pixels feed two output neurons, one for "3" and one for "E".
        </p>
        <div className="mt-6">
          <PixelNetworkDiagram pixels={pixels} />
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
                {totalPixels === 0 ? '—' : result.prediction}
              </div>
            </div>
            <div>
              <div className="text-sm text-fg-secondary">Confidence</div>
              <div className="text-2xl font-bold text-accent">
                {totalPixels === 0 ? '—' : `${(result.confidence * 100).toFixed(0)}%`}
              </div>
            </div>
          </div>

          {/* Per-class probabilities */}
          <div className="space-y-2">
            {(
              [
                ['"3" output', result.probThree],
                ['"E" output', result.probE],
              ] as const
            ).map(([label, prob]) => (
              <div key={label} className="flex items-center gap-3 text-xs text-fg-secondary">
                <span className="w-20 shrink-0">{label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-primary">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-300"
                    style={{ width: `${totalPixels === 0 ? 0 : prob * 100}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right font-mono">
                  {totalPixels === 0 ? '—' : `${(prob * 100).toFixed(0)}%`}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs text-fg-secondary">
            <div className="flex justify-between">
              <span>Weighted sum (positive favors "3"):</span>
              <span className="font-mono">{result.score.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pixels drawn:</span>
              <span className="font-mono">
                {totalPixels} / {PIXEL_COUNT}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="rounded-lg border border-line bg-bg-secondary p-6">
        <h3 className="text-lg font-semibold">How this classifier works</h3>

        <div className="mt-4 space-y-4 text-sm">
          <p className="text-fg-secondary">
            This is a real (tiny) neural network with just one layer: 64 inputs, 64 weights, 2
            outputs. Every pixel you draw is multiplied by its weight and the products are summed:
          </p>

          <ul className="space-y-3 text-fg-secondary">
            <li>
              <strong className="text-fg-primary">Green-weight pixels</strong> (the right edge) add
              to the "3" score. That's where a 3 curves and an E is empty.
            </li>
            <li>
              <strong className="text-fg-primary">Red-weight pixels</strong> (the left edge) add to
              the "E" score. That's the E's vertical stroke, which a 3 doesn't have.
            </li>
            <li>
              <strong className="text-fg-primary">Transparent-weight pixels</strong> (the top,
              middle, and bottom bars) appear in both shapes, so they carry no evidence either way.
            </li>
          </ul>

          <p className="text-fg-secondary">
            The weighted sum then goes through the sigmoid function to become a confidence between 0
            and 1. In a real image model the idea is identical. There are just millions of weights,
            learned automatically from training data instead of derived from two example shapes.
          </p>

          <p className="text-fg-secondary">
            Try drawing a 3 or E, or use the example buttons. Then try something in between or
            messy. You'll see the confidence drop, just like a real model gets uncertain on ambiguous
            inputs.
          </p>
        </div>
      </div>
    </div>
  )
}
