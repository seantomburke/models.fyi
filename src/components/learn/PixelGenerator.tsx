import { useMemo, useState } from 'react'
import { GRID_SIZE, generate, type Target } from './pixelGeneratorModel'
import { classify } from './pixelClassifierModel'

/**
 * Doodle-64R: the generative twin of the Doodle-64 classifier. You pick a
 * target, either "3" or "E", and the model draws one by running the classifier's
 * weights backward. The read-only grid shows the sampled drawing, and the
 * probability grid shows why each pixel chose ink or blank.
 */
export function PixelGenerator() {
  const [target, setTarget] = useState<Target>('3')
  const [temperature, setTemperature] = useState(0.15)
  const [seed, setSeed] = useState(1)

  const { pixels, probabilities } = useMemo(
    () => generate(target, temperature, seed),
    [target, temperature, seed],
  )

  // Feed the generated image back into the classifier to prove the two models
  // are two directions of the same weights: what the generator drew, the
  // classifier reads back as the same letter.
  const readBack = classify(pixels)
  const inkCount = pixels.filter(Boolean).length

  const generateAgain = () => setSeed((s) => s + 1)

  return (
    <div className="space-y-8">
      {/* Prompt */}
      <div className="rounded-lg border border-line bg-bg-secondary p-6">
        <h3 className="text-lg font-semibold">Ask the model to draw</h3>
        <p className="mt-2 text-sm text-fg-secondary">
          You can choose a target and the model will draw it for you. This is the classifier from
          the last lab, run backward. There it read a drawing and named the letter. Here it takes the
          letter and produces a drawing.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {(['3', 'E'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTarget(t)}
              aria-pressed={target === t}
              className={`rounded px-5 py-2 text-sm font-medium transition-colors ${
                target === t
                  ? 'bg-accent text-white'
                  : 'bg-bg-primary text-fg-primary hover:bg-line'
              }`}
            >
              Draw a {t}
            </button>
          ))}
          <button
            onClick={generateAgain}
            className="rounded bg-bg-primary px-5 py-2 text-sm font-medium text-fg-primary hover:bg-line"
          >
            Generate again
          </button>
        </div>

        {/* Creativity / temperature */}
        <div className="mt-6">
          <label htmlFor="gen-temp" className="flex items-center justify-between text-sm">
            <span className="font-medium">Creativity</span>
            <span className="font-mono text-xs text-fg-secondary">
              {temperature < 0.1 ? 'low' : temperature > 0.5 ? 'high' : 'medium'}
            </span>
          </label>
          <input
            id="gen-temp"
            type="range"
            min={0}
            max={0.9}
            step={0.05}
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="mt-2 w-full max-w-md accent-accent"
          />
          <p className="mt-2 text-xs text-fg-secondary">
            Low creativity draws the same clean shape every time. Higher creativity lets each pixel
            wander, so the drawing gets noisier and less certain. Real image generators call this
            same dial the temperature.
          </p>
        </div>
      </div>

      {/* Generated drawing */}
      <div className="rounded-lg border border-line bg-bg-secondary p-6">
        <h3 className="text-lg font-semibold">The drawing the model made</h3>
        <p className="mt-2 text-sm text-fg-secondary">
          Every pixel was decided on its own. The model never stored a picture of a {target}. It
          rebuilt one from 64 weights, one coin flip per pixel.
        </p>
        <div className="mt-6 flex flex-wrap items-start gap-8">
          <div>
            <div
              className="inline-grid gap-1 rounded border border-line p-3 sm:p-4"
              style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
            >
              {pixels.map((on, i) => (
                <div
                  key={i}
                  className={`h-7 w-7 rounded-sm border sm:h-8 sm:w-8 ${
                    on ? 'border-accent bg-accent' : 'border-line bg-bg-primary'
                  }`}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-fg-secondary">{inkCount} of 64 pixels inked</p>
          </div>

          {/* Classifier read-back */}
          <div className="max-w-xs rounded bg-bg-primary p-4 text-sm">
            <div className="text-xs text-fg-secondary">Now read it back with Doodle-64</div>
            <div className="mt-1 text-2xl font-bold text-accent">
              {inkCount === 0 ? '—' : readBack.prediction}
            </div>
            <div className="mt-1 text-xs text-fg-secondary">
              {inkCount === 0
                ? 'The drawing is empty.'
                : `The classifier reads this drawing as a "${readBack.prediction}" with ${(
                    readBack.confidence * 100
                  ).toFixed(0)}% confidence. The generator and the classifier share one set of weights, so what one draws the other recognizes.`}
            </div>
          </div>
        </div>
      </div>

      {/* Probability map */}
      <div className="rounded-lg border border-line bg-bg-secondary p-6">
        <h3 className="text-lg font-semibold">Why each pixel chose ink or blank</h3>
        <p className="mt-2 text-sm text-fg-secondary">
          Before the coin flip, every pixel holds a probability of ink. Blue pixels are almost
          certain to fill in for a {target}. Faint pixels are almost certain to stay blank. The
          drawing above is one roll of these 64 dice.
        </p>
        <div className="mt-6">
          <div
            className="inline-grid gap-1 rounded border border-line p-4"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
          >
            {probabilities.map((p, i) => (
              <div
                key={i}
                className="h-8 w-8 rounded-sm border border-line"
                style={{ background: `rgba(59, 130, 246, ${p.toFixed(2)})` }}
                title={`${(p * 100).toFixed(0)}% chance of ink`}
              />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-fg-secondary">
            <span className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ background: 'rgba(59, 130, 246, 0.94)' }}
              />
              High chance of ink: the {target} shape uses this pixel
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm border border-line" />
              Low chance of ink: the other letter owns this pixel
            </span>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-lg border border-line bg-bg-secondary p-6">
        <h3 className="text-lg font-semibold">How this generator works</h3>
        <div className="mt-4 space-y-4 text-sm text-fg-secondary">
          <p>
            The classifier and the generator are one model pointed two ways. The classifier takes 64
            pixels and produces one answer. The generator takes one answer and produces 64 pixels. It
            reads the same 64 weights to do it.
          </p>
          <p>
            A pixel whose weight votes for the letter you asked for is almost certain to fill in. A
            pixel whose weight votes for the other letter is almost certain to stay empty. The bars
            both letters draw sit in the middle, so a generated 3 and a generated E share them.
          </p>
          <p>
            The coin flip is the important part. Because each pixel is sampled, the model can draw
            many different versions of the same letter from one request. A real image generator does
            the same thing at a giant scale. It turns your prompt into a probability for millions of
            pixels, then samples them into a picture nobody drew before.
          </p>
        </div>
      </div>
    </div>
  )
}
