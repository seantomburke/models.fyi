import { useMemo, useState } from 'react'
import { classifyWithLearnedWeights, GRID_SIZE, PIXEL_COUNT, type TrainingRun } from './gradientDescent'
import { patternE, patternThree } from './pixelClassifierModel'
import { PixelGrid } from './PixelGrid'

interface TrainablePixelClassifierProps {
  run: TrainingRun
}

export function TrainablePixelClassifier({ run }: TrainablePixelClassifierProps) {
  const [pixels, setPixels] = useState<boolean[]>(Array(PIXEL_COUNT).fill(false))
  const result = useMemo(
    () => classifyWithLearnedWeights(run.finalWeights, run.bias, pixels),
    [pixels, run]
  )
  const drawnPixels = pixels.filter(Boolean).length

  return (
    <section className="rounded-lg border border-line p-4" aria-labelledby="trained-classifier-title">
      <h2 id="trained-classifier-title" className="text-lg font-semibold tracking-tight">
        Test the model you trained
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-fg-secondary">
        These predictions use the learned weights above. The examples are familiar training shapes,
        so success here shows the training worked; it does not measure performance on new handwriting.
      </p>
      <div className="mt-4 max-w-72">
        <PixelGrid pixels={pixels} onChange={setPixels} gridSize={GRID_SIZE} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setPixels(Array(PIXEL_COUNT).fill(false))} className="rounded border border-line px-3 py-2 text-sm font-medium hover:border-line-strong">
          Clear
        </button>
        <button type="button" onClick={() => setPixels(patternThree())} className="rounded border border-line px-3 py-2 text-sm font-medium hover:border-line-strong">
          Example: 3
        </button>
        <button type="button" onClick={() => setPixels(patternE())} className="rounded border border-line px-3 py-2 text-sm font-medium hover:border-line-strong">
          Example: E
        </button>
      </div>

      <div className="mt-4 rounded bg-surface-raised p-4" aria-live="polite">
        <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">Learned prediction</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-accent-deep">
          {drawnPixels === 0 ? 'Draw a shape' : `${result.prediction} · ${(result.confidence * 100).toFixed(0)}%`}
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-fg-muted">Probability of 3</dt>
            <dd className="font-mono tabular-nums">{drawnPixels === 0 ? '—' : `${(result.probThree * 100).toFixed(1)}%`}</dd>
          </div>
          <div>
            <dt className="text-fg-muted">Probability of E</dt>
            <dd className="font-mono tabular-nums">{drawnPixels === 0 ? '—' : `${(result.probE * 100).toFixed(1)}%`}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
