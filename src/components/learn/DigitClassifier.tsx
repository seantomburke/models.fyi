import { useState } from 'react'
import {
  DIGITS,
  GRID_SIZE,
  PIXEL_COUNT,
  SEGMENT_COUNT,
  classifyDigit,
  digitPattern,
} from './digitClassifierModel'
import { DigitFeatureHeatmaps } from './DigitFeatureHeatmaps'
import { DigitOutputWeights } from './DigitOutputWeights'
import { DigitNetworkDiagram } from './DigitNetworkDiagram'
import { PixelGrid } from './PixelGrid'

export function DigitClassifier() {
  const [pixels, setPixels] = useState<boolean[]>(Array(PIXEL_COUNT).fill(false))

  const handleClear = () => {
    setPixels(Array(PIXEL_COUNT).fill(false))
  }

  const result = classifyDigit(pixels)
  const totalPixels = pixels.filter(Boolean).length

  return (
    <div className="space-y-8">
      {/* Drawing Grid */}
      <div className="rounded-lg border border-line bg-bg-secondary p-6">
        <h3 className="text-lg font-semibold">Draw a digit: 0–9</h3>
        <p className="mt-2 text-sm text-fg-secondary">
          Click a pixel, or drag across the grid to draw a stroke at once. On a phone, draw with
          your finger. A two-layer network, 64 inputs, {SEGMENT_COUNT} stroke detectors, 10
          outputs, will read it.
        </p>

        {/* Pixel Grid */}
        <div className="mt-6 w-full max-w-80">
          <PixelGrid pixels={pixels} onChange={setPixels} gridSize={GRID_SIZE} />
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={handleClear}
            className="rounded bg-bg-secondary px-4 py-2 text-sm font-medium text-fg-primary hover:bg-line"
          >
            Clear
          </button>
          {DIGITS.map((digit) => (
            <button
              key={digit}
              onClick={() => setPixels(digitPattern(digit))}
              aria-label={`Example: ${digit}`}
              className="rounded bg-bg-secondary px-3 py-2 font-mono text-sm font-medium text-fg-primary hover:bg-line"
            >
              {digit}
            </button>
          ))}
        </div>
      </div>

      {/* Layer 1 weights */}
      <div className="rounded-lg border border-line bg-bg-secondary p-6">
        <h3 className="text-lg font-semibold">Layer 1: seven stroke detectors</h3>
        <p className="mt-2 text-sm text-fg-secondary">
          Each hidden neuron watches one stroke, a bar or a line, and its weights are drawn below
          in the same 8x8 layout as the drawing grid. Colored cells are the pixels that neuron
          cares about; everything else has weight zero. Draw something and watch each detector
          report how much of its stroke it sees.
        </p>
        <div className="mt-6">
          <DigitFeatureHeatmaps pixels={pixels} />
        </div>
      </div>

      {/* Layer 2 weights */}
      <div className="rounded-lg border border-line bg-bg-secondary p-6">
        <h3 className="text-lg font-semibold">Layer 2: combining strokes into digits</h3>
        <p className="mt-2 text-sm text-fg-secondary">
          The output layer's 70 weights, one row per digit. Green means "this digit expects that
          stroke", red means "that stroke is evidence against it". An 8 wants every stroke; a 1
          only wants the two right-hand lines — every other stroke argues against it.
        </p>
        <div className="mt-6">
          <DigitOutputWeights />
        </div>
      </div>

      {/* Network animation */}
      <div className="rounded-lg border border-line bg-bg-secondary p-6">
        <h3 className="text-lg font-semibold">Watch your drawing run through the network</h3>
        <p className="mt-2 text-sm text-fg-secondary">
          The same animation as the image classification page, one layer deeper: your 64 pixels
          light up the stroke detectors, and the detectors vote on all ten digits.
        </p>
        <div className="mt-6">
          <DigitNetworkDiagram pixels={pixels} />
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

          {/* Per-digit probabilities */}
          <div className="space-y-2">
            {DIGITS.map((digit) => (
              <div key={digit} className="flex items-center gap-3 text-xs text-fg-secondary">
                <span className="w-20 shrink-0">"{digit}" output</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-primary">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-300"
                    style={{ width: `${totalPixels === 0 ? 0 : result.probs[digit] * 100}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right font-mono">
                  {totalPixels === 0 ? '—' : `${(result.probs[digit] * 100).toFixed(0)}%`}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs text-fg-secondary">
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
            The 3-vs-E classifier needed only one layer, because single pixels were enough to
            separate two shapes. Ten digits share almost every pixel: an 8 contains a 3, a 9
            contains a 7, so no single pixel can vote cleanly for one digit. The fix is a hidden
            layer that finds bigger patterns first:
          </p>

          <ul className="space-y-3 text-fg-secondary">
            <li>
              <strong className="text-fg-primary">Layer 1 finds strokes.</strong> Each of the seven
              hidden neurons sums the pixels of one bar or line and fires when most of its stroke
              is drawn. It knows nothing about digits. It only knows its stroke.
            </li>
            <li>
              <strong className="text-fg-primary">Layer 2 combines strokes.</strong> Each digit
              output adds +1 for every firing detector the digit uses and −1 for every firing
              detector it doesn't. A quiet detector votes in reverse — no bottom bar is real
              evidence <em>for</em> a 4 and against an 8.
            </li>
            <li>
              <strong className="text-fg-primary">Softmax picks a winner.</strong> The ten scores
              become probabilities that add up to 100%, so the network always ranks every digit.
            </li>
          </ul>

          <p className="text-fg-secondary">
            Try drawing a digit with a stroke missing, or add an extra stroke, and watch the
            probabilities shift between the digits that share those strokes. That's the whole idea
            of depth: early layers find parts, later layers reason about combinations of parts.
            It's exactly what real vision models do, with millions of learned weights instead of
            518 hand-built ones.
          </p>
        </div>
      </div>
    </div>
  )
}
