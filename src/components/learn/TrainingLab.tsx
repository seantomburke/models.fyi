import { useEffect, useMemo, useState } from 'react'
import {
  EPOCHS,
  GRID_SIZE,
  PIXEL_COUNT,
  buildTrainingSet,
  classifyWithLearnedWeights,
  trainGradientDescent,
  type TrainingExample,
  type TrainingRun,
} from './gradientDescent'
import { PixelGrid } from './PixelGrid'
import { patternE, patternThree } from './pixelClassifierModel'

type Label = 'E' | '3'
type Assignments = Record<number, Label | undefined>

const DEFAULT_SEED = 20260722

function labelFor(example: TrainingExample): Label {
  return example.target === 1 ? '3' : 'E'
}

function SamplePixels({ pixels }: { pixels: boolean[] }) {
  return (
    <span className="grid gap-px rounded border border-line bg-surface p-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }} aria-hidden="true">
      {pixels.map((on, index) => (
        <span key={index} className={`h-1.5 w-1.5 rounded-[1px] ${on ? 'bg-accent-deep' : 'bg-surface-raised'}`} />
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

export function TrainingLab() {
  const [seedText, setSeedText] = useState(String(DEFAULT_SEED))
  const [seed, setSeed] = useState(DEFAULT_SEED)
  const examples = useMemo(() => buildTrainingSet(seed), [seed])
  const [assignments, setAssignments] = useState<Assignments>({})
  const [run, setRun] = useState<TrainingRun | null>(null)
  const [epoch, setEpoch] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [pixels, setPixels] = useState<boolean[]>(Array(PIXEL_COUNT).fill(false))
  const assignedCount = Object.values(assignments).filter(Boolean).length

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

  const assign = (index: number, label: Label) => {
    setAssignments((current) => ({ ...current, [index]: label }))
    setRun(null)
    setPlaying(false)
  }

  const generate = () => {
    const next = Number(seedText)
    if (!Number.isInteger(next) || next < 0 || next > 0xffffffff) return
    setSeed(next)
    setAssignments({})
    setRun(null)
    setPlaying(false)
  }

  const labelAll = (inverted = false) => {
    setAssignments(Object.fromEntries(examples.map((example, index) => [index, inverted ? (labelFor(example) === 'E' ? '3' : 'E') : labelFor(example)])))
    setRun(null)
    setPlaying(false)
  }

  const train = () => {
    if (assignedCount !== examples.length) return
    const data = examples.map((example, index) => ({ ...example, target: assignments[index] === '3' ? 1 : 0 }))
    const nextRun = trainGradientDescent({ seed, data })
    setRun(nextRun)
    setEpoch(0)
    setPlaying(true)
  }

  const snapshot = run?.history[epoch]
  const result = run && pixels.some(Boolean) ? classifyWithLearnedWeights(run.finalWeights, run.bias, pixels) : null
  const groups: Array<{ label: Label; title: string }> = [
    { label: 'E', title: 'E bucket' },
    { label: '3', title: '3 bucket' },
  ]

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-line p-4" aria-labelledby="training-lab-title">
        <h2 id="training-lab-title" className="text-lg font-semibold tracking-tight">Teach the model with 50 drawings</h2>
        <p className="mt-2 text-sm leading-relaxed text-fg-secondary">Each tiny picture is an E or a 3. Drag it into a bucket, or use its two label buttons. The model only learns the labels you give it.</p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-sm font-medium">Random seed<input aria-label="Training random seed" type="number" min="0" max="4294967295" value={seedText} onChange={(event) => setSeedText(event.target.value)} className="mt-1 block w-44 rounded border border-line bg-surface-raised px-3 py-2 font-mono" /></label>
          <button type="button" onClick={generate} className="rounded border border-line px-3 py-2 text-sm font-medium hover:border-line-strong">Make new drawings</button>
          <button type="button" onClick={() => labelAll()} className="rounded border border-line px-3 py-2 text-sm font-medium hover:border-line-strong">Label all correctly</button>
          <button type="button" onClick={() => labelAll(true)} className="rounded border border-line px-3 py-2 text-sm font-medium hover:border-line-strong">Invert every label</button>
        </div>
      </section>

      <section aria-labelledby="label-drawings-title">
        <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 id="label-drawings-title" className="text-lg font-semibold tracking-tight">Label the training set</h2><p className="text-sm text-fg-muted">{assignedCount} of {examples.length} labelled</p></div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded border border-line p-3"><h3 className="text-sm font-semibold">Unlabelled</h3><ul className="mt-3 grid grid-cols-2 gap-2" aria-label="Unlabelled drawings">{examples.map((example, index) => !assignments[index] && <li key={example.label} draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', String(index))} className="rounded border border-line bg-surface-raised p-2"><div className="flex items-center gap-2"><SamplePixels pixels={example.pixels} /><span className="text-xs text-fg-muted">Drawing {index + 1}</span></div><div className="mt-2 flex gap-1"><button type="button" onClick={() => assign(index, 'E')} className="rounded border border-line px-2 py-1 text-xs">E</button><button type="button" onClick={() => assign(index, '3')} className="rounded border border-line px-2 py-1 text-xs">3</button></div></li>)}</ul></div>
          {groups.map(({ label, title }) => <div key={label} className="rounded border border-line p-3" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const index = Number(event.dataTransfer.getData('text/plain')); if (Number.isInteger(index)) assign(index, label) }}><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-xs text-fg-muted">Drop drawings here, or use the buttons.</p><ul className="mt-3 grid grid-cols-3 gap-2" aria-label={title}>{examples.map((example, index) => assignments[index] === label && <li key={example.label} draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', String(index))} className="rounded border border-line bg-surface-raised p-2"><SamplePixels pixels={example.pixels} /><button type="button" onClick={() => setAssignments((current) => ({ ...current, [index]: undefined }))} className="mt-1 text-xs text-accent-deep underline">Remove</button></li>)}</ul></div>)}
        </div>
      </section>

      <section className="rounded-lg border border-line p-4" aria-labelledby="start-training-title">
        <h2 id="start-training-title" className="text-lg font-semibold tracking-tight">Start training</h2>
        <p className="mt-2 text-sm text-fg-secondary">Gradient descent adjusts all 64 weights after seeing every labelled drawing.</p>
        <button type="button" onClick={train} disabled={assignedCount !== examples.length} className="mt-4 rounded bg-accent px-4 py-2 text-sm font-medium text-white enabled:hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-50">Start training</button>
        {assignedCount !== examples.length && <p className="mt-2 text-xs text-fg-muted">Label every drawing before training.</p>}
        {snapshot && <div className="mt-5 grid gap-5 md:grid-cols-2"><div><p className="text-sm font-medium" aria-live="polite">Epoch {epoch} of {EPOCHS} · loss {snapshot.loss.toFixed(3)} · accuracy {(snapshot.accuracy * 100).toFixed(0)}%</p><input className="mt-3 w-full accent-accent" aria-label="Training progress" type="range" min="0" max={run!.history.length - 1} value={epoch} onChange={(event) => { setPlaying(false); setEpoch(Number(event.target.value)) }} /><button type="button" onClick={() => { setEpoch(0); setPlaying(true) }} className="mt-3 rounded border border-line px-3 py-2 text-sm font-medium hover:border-line-strong">Replay training</button></div><WeightMap weights={snapshot.weights} /></div>}
      </section>

      {run && <section className="rounded-lg border border-line p-4" aria-labelledby="use-trained-model-title"><h2 id="use-trained-model-title" className="text-lg font-semibold tracking-tight">Use your trained weights</h2><p className="mt-2 text-sm text-fg-secondary">Draw a fresh input. If you inverted the buckets, the trained model should invert its answers too.</p><div className="mt-4 max-w-72"><PixelGrid pixels={pixels} onChange={setPixels} gridSize={GRID_SIZE} /></div><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => setPixels(patternE())} className="rounded border border-line px-3 py-2 text-sm">Example: E</button><button type="button" onClick={() => setPixels(patternThree())} className="rounded border border-line px-3 py-2 text-sm">Example: 3</button><button type="button" onClick={() => setPixels(Array(PIXEL_COUNT).fill(false))} className="rounded border border-line px-3 py-2 text-sm">Clear</button></div><p className="mt-4 text-xl font-semibold" aria-live="polite">{result ? `Prediction: ${result.prediction} (${(result.confidence * 100).toFixed(0)}%)` : 'Draw a shape to classify it.'}</p></section>}
    </div>
  )
}
