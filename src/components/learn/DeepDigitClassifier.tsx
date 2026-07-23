import { useState } from 'react'
import {
  DIGITS,
  GRID_SIZE,
  OUTPUT_SHAPE_WEIGHTS,
  PARAMETER_COUNT,
  PIXEL_COUNT,
  PRIMITIVES,
  PRIMITIVE_COUNT,
  SHAPES,
  SHAPE_COUNT,
  classifyDigitDeep,
  digitPattern,
} from './deepDigitModel'
import { DeepDigitNetworkDiagram } from './DeepDigitNetworkDiagram'
import { PixelGrid } from './PixelGrid'

const POSITIVE = 'rgba(34, 197, 94, 0.55)'
const NEGATIVE = 'rgba(239, 68, 68, 0.4)'

export function DeepDigitClassifier() {
  const [pixels, setPixels] = useState<boolean[]>(Array(PIXEL_COUNT).fill(false))

  const handleClear = () => {
    setPixels(Array(PIXEL_COUNT).fill(false))
  }

  const result = classifyDigitDeep(pixels)
  const totalPixels = pixels.filter(Boolean).length
  const anyInk = totalPixels > 0

  return (
    <div className="space-y-8">
      {/* Drawing Grid */}
      <div className="rounded-lg border border-line bg-bg-secondary p-6">
        <h3 className="text-lg font-semibold">Draw a digit: 0-9</h3>
        <p className="mt-2 text-sm text-fg-secondary">
          Click a pixel, or drag across the grid to draw a stroke at once. On a phone, draw with
          your finger. A three-layer network, 64 inputs, {PRIMITIVE_COUNT} stroke primitives,{' '}
          {SHAPE_COUNT} shape detectors, 10 outputs, will read it.
        </p>

        <div className="mt-6 w-full max-w-80">
          <PixelGrid pixels={pixels} onChange={setPixels} gridSize={GRID_SIZE} />
        </div>

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

      {/* Layer 1: stroke primitives */}
      <div className="rounded-lg border border-line bg-bg-secondary p-6">
        <h3 className="text-lg font-semibold">
          Layer 1: {PRIMITIVE_COUNT} stroke primitives
        </h3>
        <p className="mt-2 text-sm text-fg-secondary">
          The same seven-segment skeleton as the two-layer model, but each bar is cut into a left
          and a right half. Finer parts are what let the next layer tell the top of an 8 from the
          top of a 7. Colored cells are the pixels each neuron watches; everything else is weight
          zero.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          {PRIMITIVES.map((prim, j) => {
            const activation = result.primitives[j]
            const firing = anyInk && activation > 0.5
            return (
              <div
                key={prim.name}
                className="rounded-lg border bg-surface p-3 transition-colors"
                style={{ borderColor: firing ? prim.color : 'var(--color-line)' }}
              >
                <div
                  className="inline-grid gap-px"
                  style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
                  role="img"
                  aria-label={`${prim.name} primitive weights`}
                >
                  {Array.from({ length: PIXEL_COUNT }, (_, i) => {
                    const watched = prim.pixels.includes(i)
                    const lit = watched && pixels[i]
                    return (
                      <div
                        key={i}
                        className="h-2.5 w-2.5 rounded-[2px] border border-line"
                        style={{
                          background: watched ? prim.color : 'transparent',
                          opacity: watched ? (anyInk && !lit ? 0.3 : 1) : 1,
                        }}
                      />
                    )
                  })}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ background: prim.color }}
                  />
                  <span className="font-medium text-fg-secondary">{prim.name}</span>
                </div>
                <div className="mt-1 font-mono text-xs text-fg-muted">
                  {anyInk ? `${(activation * 100).toFixed(0)}% active` : 'waiting for ink'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Layer 2: shape detectors */}
      <div className="rounded-lg border border-line bg-bg-secondary p-6">
        <h3 className="text-lg font-semibold">Layer 2: {SHAPE_COUNT} shape detectors</h3>
        <p className="mt-2 text-sm text-fg-secondary">
          This is the layer Doodle-525 doesn't have. Each detector wants a specific combination of
          primitives, and refuses to fire if a stroke that would break the shape is present. A top
          loop needs the cap and both upper sides; an open curve needs the same cap but insists one
          side stay missing. That's how the network learns the difference between a circle and a
          corner.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {SHAPES.map((shape, s) => {
            const activation = result.shapes[s]
            const firing = anyInk && activation > 0.5
            return (
              <div
                key={shape.name}
                className="rounded-lg border bg-surface p-4 transition-colors"
                style={{ borderColor: firing ? shape.color : 'var(--color-line)' }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-medium text-fg-primary">
                    <span
                      className="h-3 w-3 shrink-0 rounded-sm"
                      style={{ background: shape.color }}
                    />
                    {shape.name}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-fg-muted">
                    {anyInk ? `${(activation * 100).toFixed(0)}%` : '—'}
                  </span>
                </div>
                <p className="mt-2 text-xs text-fg-secondary">{shape.blurb}</p>
                <div className="mt-3 flex flex-wrap gap-1 text-[10px]">
                  {shape.needs.map((j) => (
                    <span
                      key={`n-${j}`}
                      className="rounded px-1.5 py-0.5 text-fg-secondary"
                      style={{ background: POSITIVE }}
                    >
                      needs {PRIMITIVES[j].name.toLowerCase()}
                    </span>
                  ))}
                  {shape.forbids.map((j) => (
                    <span
                      key={`f-${j}`}
                      className="rounded px-1.5 py-0.5 text-fg-secondary"
                      style={{ background: NEGATIVE }}
                    >
                      no {PRIMITIVES[j].name.toLowerCase()}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Layer 3 weights */}
      <div className="rounded-lg border border-line bg-bg-secondary p-6">
        <h3 className="text-lg font-semibold">Layer 3: combining shapes into digits</h3>
        <p className="mt-2 text-sm text-fg-secondary">
          The output layer's {SHAPE_COUNT * DIGITS.length} shape weights, one row per digit. Green
          means "this digit shows that shape", red means "that shape is evidence against it". Note
          that no two rows are identical: eight shapes are enough to give every digit its own
          fingerprint, which is why this layer never has to look at raw pixels.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="border-separate border-spacing-1">
            <thead>
              <tr>
                <th scope="col" className="pr-2 text-left text-xs font-medium text-fg-muted">
                  Digit
                </th>
                {SHAPES.map((shape) => (
                  <th key={shape.name} scope="col" className="px-0 text-center">
                    <span
                      className="mx-auto block h-3 w-3 rounded-sm"
                      style={{ background: shape.color }}
                      title={shape.name}
                    />
                    <span className="sr-only">{shape.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DIGITS.map((digit) => (
                <tr key={digit}>
                  <th
                    scope="row"
                    className="pr-2 text-left font-mono text-sm text-fg-secondary"
                  >
                    {digit}
                  </th>
                  {OUTPUT_SHAPE_WEIGHTS[digit].map((w, s) => (
                    <td
                      key={s}
                      className="h-6 w-6 rounded-sm border border-line text-center align-middle text-[10px] font-semibold text-fg-secondary"
                      style={{ background: w > 0 ? POSITIVE : NEGATIVE }}
                      title={`${SHAPES[s].name}: ${w > 0 ? '+1, expected' : '-1, counts against'} for "${digit}"`}
                    >
                      {w > 0 ? '+' : '−'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-muted">
          {SHAPES.map((shape) => (
            <span key={shape.name} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: shape.color }} />
              {shape.name}
            </span>
          ))}
        </div>
      </div>

      {/* Network animation */}
      <div className="rounded-lg border border-line bg-bg-secondary p-6">
        <h3 className="text-lg font-semibold">Watch your drawing run through all three layers</h3>
        <p className="mt-2 text-sm text-fg-secondary">
          Four columns, three hops: pixels wake up primitives, primitives assemble into shapes,
          shapes vote on digits.
        </p>
        <div className="mt-6">
          <DeepDigitNetworkDiagram pixels={pixels} />
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
                {anyInk ? result.prediction : '—'}
              </div>
            </div>
            <div>
              <div className="text-sm text-fg-secondary">Confidence</div>
              <div className="text-2xl font-bold text-accent">
                {anyInk ? `${(result.confidence * 100).toFixed(0)}%` : '—'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {DIGITS.map((digit) => (
              <div key={digit} className="flex items-center gap-3 text-xs text-fg-secondary">
                <span className="w-20 shrink-0">"{digit}" output</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-primary">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-300"
                    style={{ width: `${anyInk ? result.probs[digit] * 100 : 0}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right font-mono">
                  {anyInk ? `${(result.probs[digit] * 100).toFixed(0)}%` : '—'}
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
            <div className="flex justify-between">
              <span>Shapes firing:</span>
              <span className="font-mono">
                {anyInk ? result.shapes.filter((s) => s > 0.5).length : 0} / {SHAPE_COUNT}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Parameters:</span>
              <span className="font-mono">{PARAMETER_COUNT}</span>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="rounded-lg border border-line bg-bg-secondary p-6">
        <h3 className="text-lg font-semibold">Why the third layer earns its keep</h3>

        <div className="mt-4 space-y-4 text-sm">
          <p className="text-fg-secondary">
            Doodle-525 counts strokes. That works, but it means a digit is only a checklist, and
            the model has no idea that a 0 is <em>round</em>. Doodle-918 splits the job into two
            smaller questions, and it gets a vocabulary of shapes out of the split:
          </p>

          <ul className="space-y-3 text-fg-secondary">
            <li>
              <strong className="text-fg-primary">Layer 1 finds parts.</strong> This layer holds
              ten primitives, and each one is a bar half or a short line. These parts are smaller
              than the ones the two-layer model uses, and that is deliberate, because you cannot
              compose a loop out of pieces that are already loop-sized.
            </li>
            <li>
              <strong className="text-fg-primary">Layer 2 finds shapes.</strong> This layer holds
              eight detectors, and each one wants a specific combination of primitives while
              rejecting specific others. This is where "circular top", "circular bottom" and
              "straight spine" become ideas the network can represent on their own terms.
            </li>
            <li>
              <strong className="text-fg-primary">Layer 3 names the digit.</strong> Every digit has
              a distinct signature over those eight shapes, so the final layer is a short vote.
              Each shape a digit shows adds a point, and each shape it lacks subtracts one.
            </li>
          </ul>

          <p className="text-fg-secondary">
            You can load an 8, erase its lower-left line, and watch the bottom loop switch off.
            The model reads a 9, because a 9 is an 8 with the bottom loop opened up. If you erase
            the middle bar instead, the waist goes quiet and the model reads a 0. The two-layer
            model reaches the same answers by tallying strokes. This model gets there by noticing
            that the loop is gone, and that is the reason it stays confident when your drawing is
            smudged.
          </p>

          <p className="text-fg-secondary">
            That is the whole argument for depth, and it is the same argument at every scale. A
            real vision model's early layers find edges, its middle layers find textures and parts,
            and its late layers find objects. Training discovers all of those middle features on
            its own. Here they were chosen by hand so that you can read them, all{' '}
            {PARAMETER_COUNT} parameters of them.
          </p>
        </div>
      </div>
    </div>
  )
}
