import { useEffect, useMemo, useState } from 'react'
import {
  EPOCHS,
  GRID_SIZE,
  PIXEL_COUNT,
  buildTrainingSet,
  trainGradientDescent,
  type TrainingExample,
  type TrainingRun,
} from './gradientDescent'
import { LearnedNetworkDiagram } from './LearnedNetworkDiagram'
import { PixelGrid } from './PixelGrid'
import { SwipeLabelDeck } from './SwipeLabelDeck'
import { WeightTrajectoryChart } from './WeightTrajectoryChart'
import {
  addCard,
  createDeck,
  currentCard,
  deleteCurrent,
  labelAll,
  labelCurrent,
  labelledCount,
  unlabelCard,
  type SwipeDeckState,
  type SwipeLabel,
} from './swipeLabel'
import { patternE, patternThree } from './pixelClassifierModel'

const DEFAULT_SEED = 20260722

function labelFor(example: TrainingExample): SwipeLabel {
  return example.target === 1 ? '3' : 'E'
}

function SamplePixels({ pixels, cellClass = 'h-1.5 w-1.5' }: { pixels: boolean[]; cellClass?: string }) {
  return (
    <span className="grid gap-px rounded border border-line bg-surface p-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }} aria-hidden="true">
      {pixels.map((on, index) => (
        <span key={index} className={`${cellClass} rounded-[1px] ${on ? 'bg-accent-deep' : 'bg-surface-raised'}`} />
      ))}
    </span>
  )
}

function WeightMap({ weights }: { weights: number[] }) {
  const extent = Math.max(...weights.map((weight) => Math.abs(weight)), 0.25)
  return (
    <div>
      <div className="inline-grid gap-1 rounded border border-line p-3" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }} role="img" aria-label="Learned 64-pixel weight heatmap">
        {weights.map((weight, index) => {
          const alpha = 0.12 + (Math.abs(weight) / extent) * 0.78
          return <span key={index} className="h-6 w-6 rounded-sm border border-line" style={{ background: weight >= 0 ? `rgba(34, 197, 94, ${alpha})` : `rgba(239, 68, 68, ${alpha})` }} />
        })}
      </div>
      <p className="mt-2 text-xs text-fg-muted">Green pixels are evidence for 3; red pixels are evidence for E; faint pixels barely affect the answer.</p>
    </div>
  )
}

/** The labelled cards, packed into a dense tray instead of a long column. */
function LabelledTray({
  label,
  examples,
  deck,
  onUnlabel,
}: {
  label: SwipeLabel
  examples: TrainingExample[]
  deck: SwipeDeckState
  onUnlabel: (card: number) => void
}) {
  const cards = examples
    .map((example, index) => ({ example, index }))
    .filter(({ index }) => deck.labels[index] === label)
  return (
    <div className="rounded border border-line p-3">
      <h3 className="text-sm font-semibold">
        Labelled {label} <span className="font-normal text-fg-muted">({cards.length})</span>
      </h3>
      <ul className="mt-2 flex flex-wrap gap-1" aria-label={`Drawings labelled ${label}`}>
        {cards.map(({ example, index }) => (
          <li key={example.label}>
            <button
              type="button"
              onClick={() => onUnlabel(index)}
              title={`${example.label} — send back to the deck`}
              aria-label={`${example.label}, labelled ${label}. Send back to the deck.`}
              className="rounded border border-transparent hover:border-accent"
            >
              <SamplePixels pixels={example.pixels} cellClass="h-1 w-1" />
            </button>
          </li>
        ))}
      </ul>
      {cards.length === 0 && <p className="mt-1 text-xs text-fg-muted">Nothing here yet.</p>}
    </div>
  )
}

export function TrainingLab() {
  const [seedText, setSeedText] = useState(String(DEFAULT_SEED))
  const [seed, setSeed] = useState(DEFAULT_SEED)
  const generated = useMemo(() => buildTrainingSet(seed), [seed])
  const [customExamples, setCustomExamples] = useState<TrainingExample[]>([])
  const examples = useMemo(() => [...generated, ...customExamples], [generated, customExamples])
  const [deck, setDeck] = useState<SwipeDeckState>(() => createDeck(generated.length))
  const [run, setRun] = useState<TrainingRun | null>(null)
  const [epoch, setEpoch] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [pixels, setPixels] = useState<boolean[]>(Array(PIXEL_COUNT).fill(false))
  const [drawing, setDrawing] = useState<boolean[]>(Array(PIXEL_COUNT).fill(false))
  const assignedCount = labelledCount(deck)
  const keptCount = examples.length - deck.deleted.length
  const card = currentCard(deck)

  useEffect(() => {
    if (!playing || !run) return
    const timer = window.setInterval(() => {
      setEpoch((current) => {
        if (current >= run.history.length - 1) {
          setPlaying(false)
          return current
        }
        return current + 1
      })
    }, 24)
    return () => window.clearInterval(timer)
  }, [playing, run])

  const invalidateRun = () => {
    setRun(null)
    setPlaying(false)
  }

  const generate = () => {
    const next = Number(seedText)
    if (!Number.isInteger(next) || next < 0 || next > 0xffffffff) return
    setSeed(next)
    setCustomExamples([])
    setDeck(createDeck(buildTrainingSet(next).length))
    invalidateRun()
  }

  const labelEverything = (inverted = false) => {
    setDeck((current) =>
      labelAll(current, (index) => {
        // Only the generated drawings have a known truth; a visitor's own
        // drawing stays in the deck for them to judge.
        if (index >= generated.length) return null
        const truth = labelFor(examples[index])
        return inverted ? (truth === 'E' ? '3' : 'E') : truth
      })
    )
    invalidateRun()
  }

  const addDrawing = () => {
    if (!drawing.some(Boolean)) return
    const index = examples.length
    setCustomExamples((current) => [
      ...current,
      { label: `Your drawing #${current.length + 1}`, pixels: drawing, target: 0 },
    ])
    setDeck((current) => addCard(current, index))
    setDrawing(Array(PIXEL_COUNT).fill(false))
    invalidateRun()
  }

  const train = () => {
    if (assignedCount === 0) return
    // Only the cards the visitor labelled train the model; deleted and
    // still-queued drawings sit this run out.
    const data = examples
      .map((example, index) => ({ example, index }))
      .filter(({ index }) => index in deck.labels)
      .map(({ example, index }) => ({ ...example, target: deck.labels[index] === '3' ? 1 : 0 }))
    const nextRun = trainGradientDescent({ seed, data })
    setRun(nextRun)
    setEpoch(0)
    setPlaying(true)
  }

  const snapshot = run?.history[epoch]

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-line p-4" aria-labelledby="training-lab-title">
        <h2 id="training-lab-title" className="text-lg font-semibold tracking-tight">Teach the model, one card at a time</h2>
        <p className="mt-2 text-sm leading-relaxed text-fg-secondary">Each card is an E or a 3. Swipe it left for E, right for 3, or up to delete it from the training set — or use the buttons under the deck. The model only learns the labels you give it, and you can start training with as few as you like.</p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-sm font-medium">Random seed<input aria-label="Training random seed" type="number" min="0" max="4294967295" value={seedText} onChange={(event) => setSeedText(event.target.value)} className="mt-1 block w-44 rounded border border-line bg-surface-raised px-3 py-2 font-mono" /></label>
          <button type="button" onClick={generate} className="rounded border border-line px-3 py-2 text-sm font-medium hover:border-line-strong">Make new drawings</button>
          <button type="button" onClick={() => labelEverything()} className="rounded border border-line px-3 py-2 text-sm font-medium hover:border-line-strong">Label all correctly</button>
          <button type="button" onClick={() => labelEverything(true)} className="rounded border border-line px-3 py-2 text-sm font-medium hover:border-line-strong">Invert every label</button>
        </div>
      </section>

      <section aria-labelledby="label-drawings-title">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="label-drawings-title" className="text-lg font-semibold tracking-tight">Label the training set</h2>
          <p className="text-sm text-fg-muted" role="status">
            {assignedCount} of {keptCount} labelled{deck.deleted.length > 0 && ` · ${deck.deleted.length} deleted`}
          </p>
        </div>
        <div className="mt-4 grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <SwipeLabelDeck
            card={card !== null ? { id: card, name: examples[card].label, pixels: examples[card].pixels } : null}
            remaining={Math.max(deck.queue.length - 1, 0)}
            onLabel={(label) => { setDeck((current) => labelCurrent(current, label)); invalidateRun() }}
            onDelete={() => { setDeck(deleteCurrent); invalidateRun() }}
          />
          <div className="space-y-3">
            <LabelledTray label="E" examples={examples} deck={deck} onUnlabel={(index) => { setDeck((current) => unlabelCard(current, index)); invalidateRun() }} />
            <LabelledTray label="3" examples={examples} deck={deck} onUnlabel={(index) => { setDeck((current) => unlabelCard(current, index)); invalidateRun() }} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-line p-4" aria-labelledby="add-your-own-title">
        <h2 id="add-your-own-title" className="text-lg font-semibold tracking-tight">Add your own drawing</h2>
        <p className="mt-2 text-sm text-fg-secondary">Draw an E, a 3, or anything in between, then add it to the deck and label it the same way. It trains alongside the generated set.</p>
        <div className="mt-4 max-w-72">
          <PixelGrid pixels={drawing} onChange={setDrawing} gridSize={GRID_SIZE} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={addDrawing} disabled={!drawing.some(Boolean)} className="rounded bg-accent px-3 py-2 text-sm font-medium text-white enabled:hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-50">Add to deck</button>
          <button type="button" onClick={() => setDrawing(Array(PIXEL_COUNT).fill(false))} className="rounded border border-line px-3 py-2 text-sm font-medium hover:border-line-strong">Clear drawing</button>
        </div>
        {customExamples.length > 0 && <p className="mt-3 text-xs text-fg-muted" role="status">{customExamples.length} of your drawings in the training set.</p>}
      </section>

      <section className="rounded-lg border border-line p-4" aria-labelledby="start-training-title">
        <h2 id="start-training-title" className="text-lg font-semibold tracking-tight">Start training</h2>
        <p className="mt-2 text-sm text-fg-secondary">Gradient descent adjusts all 64 weights after seeing every drawing you labelled. You can train on as few as one card — a lopsided set makes a lopsided model, which is a lesson in itself.</p>
        <button type="button" onClick={train} disabled={assignedCount === 0} className="mt-4 rounded bg-accent px-4 py-2 text-sm font-medium text-white enabled:hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-50">
          {assignedCount === 0 ? 'Start training' : `Train on ${assignedCount} labelled ${assignedCount === 1 ? 'drawing' : 'drawings'}`}
        </button>
        {assignedCount === 0 && <p className="mt-2 text-xs text-fg-muted">Label at least one drawing before training.</p>}
        {snapshot && (
          <div className="mt-5 space-y-5">
            <div className="max-w-xl">
              <p className="text-sm font-medium" aria-live="polite">Epoch {epoch} of {EPOCHS} · loss {snapshot.loss.toFixed(3)} · accuracy {(snapshot.accuracy * 100).toFixed(0)}%</p>
              <input className="mt-3 w-full accent-accent" aria-label="Training progress" type="range" min="0" max={run!.history.length - 1} value={epoch} onChange={(event) => { setPlaying(false); setEpoch(Number(event.target.value)) }} />
              <button type="button" onClick={() => { setEpoch(0); setPlaying(true) }} className="mt-3 rounded border border-line px-3 py-2 text-sm font-medium hover:border-line-strong">Replay training</button>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold">Weights converging over time</h3>
                <div className="mt-2"><WeightTrajectoryChart run={run!} epoch={epoch} /></div>
              </div>
              <div>
                <h3 className="text-sm font-semibold">The same weights on the grid</h3>
                <div className="mt-2"><WeightMap weights={snapshot.weights} /></div>
              </div>
            </div>
          </div>
        )}
      </section>

      {run && (
        <section className="rounded-lg border border-line p-4" aria-labelledby="use-trained-model-title">
          <h2 id="use-trained-model-title" className="text-lg font-semibold tracking-tight">Use your trained weights</h2>
          <p className="mt-2 text-sm text-fg-secondary">Draw a fresh input, then run it through the network you just trained. If you inverted the deck, the trained model should invert its answers too.</p>
          <div className="mt-4 grid items-start gap-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
            <div>
              <div className="max-w-72"><PixelGrid pixels={pixels} onChange={setPixels} gridSize={GRID_SIZE} /></div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => setPixels(patternE())} className="rounded border border-line px-3 py-2 text-sm">Example: E</button>
                <button type="button" onClick={() => setPixels(patternThree())} className="rounded border border-line px-3 py-2 text-sm">Example: 3</button>
                <button type="button" onClick={() => setPixels(Array(PIXEL_COUNT).fill(false))} className="rounded border border-line px-3 py-2 text-sm">Clear</button>
              </div>
            </div>
            <LearnedNetworkDiagram pixels={pixels} weights={run.finalWeights} bias={run.bias} />
          </div>
        </section>
      )}
    </div>
  )
}
