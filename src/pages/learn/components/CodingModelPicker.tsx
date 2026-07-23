import { useState } from 'react'
import { models } from '../../../data/index.ts'

type CodingTask = 'quick-change' | 'daily-work' | 'complex-work'

interface Recommendation {
  id: CodingTask
  label: string
  detail: string
  modelId: string
  reason: string
}

const recommendations: Recommendation[] = [
  {
    id: 'quick-change',
    label: 'A quick change',
    detail: 'A small bug fix, test, or script',
    modelId: 'claude-sonnet-5',
    reason: 'A balanced model is a practical place to start when you want a capable coding partner for everyday work.',
  },
  {
    id: 'daily-work',
    label: 'A substantial feature',
    detail: 'Several files, a refactor, or a tricky review',
    modelId: 'claude-opus-4-8',
    reason: 'This flagship model has a strong software engineering score in the current data and a large listed context window.',
  },
  {
    id: 'complex-work',
    label: 'A hard system problem',
    detail: 'A new design, a risky change, or a long investigation',
    modelId: 'claude-fable-5',
    reason: 'This is the premium pick in the current data for difficult reasoning and long coding work.',
  },
]

function formatPrice(price: number | null): string {
  return price === null ? 'Pricing varies' : `$${price} per million tokens`
}

export function CodingModelPicker() {
  const [task, setTask] = useState<CodingTask>('quick-change')
  const recommendation = recommendations.find((item) => item.id === task) ?? recommendations[0]
  const model = models.find((item) => item.id === recommendation.modelId)

  if (!model) return null

  const sweScore = model.scores['swe-bench-verified']

  return (
    <aside
      aria-labelledby="coding-model-picker-title"
      className="rounded-xl border border-line bg-surface-raised p-4 shadow-subtle sm:p-6"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">Coding model guide</p>
      <h3 id="coding-model-picker-title" className="mt-1 text-lg font-semibold tracking-tight">
        Match the model to the job
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-fg-secondary">
        Pick the kind of coding work you have. This is an editorial starting point based on the current Models.fyi data.
      </p>

      <fieldset className="mt-5">
        <legend className="text-sm font-medium text-fg">What are you working on?</legend>
        <div className="mt-2 grid gap-2">
          {recommendations.map((item) => (
            <label key={item.id} className="block cursor-pointer">
              <input
                type="radio"
                name="coding-task"
                value={item.id}
                checked={task === item.id}
                onChange={() => setTask(item.id)}
                className="peer sr-only"
              />
              <span className="block rounded-lg border border-line px-3 py-3 text-sm transition-colors duration-150 motion-reduce:transition-none peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-checked:border-accent peer-checked:bg-accent-soft hover:border-line-strong">
                <span className="block font-medium text-fg">{item.label}</span>
                <span className="mt-0.5 block text-fg-secondary">{item.detail}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div aria-live="polite" className="mt-5 border-t border-line pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">A model to try first</p>
        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h4 className="text-lg font-semibold tracking-tight">{model.name}</h4>
          <span className="rounded border border-line px-2 py-0.5 text-xs font-medium capitalize text-fg-secondary">
            {model.tier} tier
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-fg-secondary">{recommendation.reason}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-3 text-sm">
          <div>
            <dt className="text-xs text-fg-muted">Input price</dt>
            <dd className="mt-0.5 font-mono tabular-nums text-fg">{formatPrice(model.inputPricePerMTok)}</dd>
          </div>
          <div>
            <dt className="text-xs text-fg-muted">SWE-bench Verified</dt>
            <dd className="mt-0.5 font-mono tabular-nums text-fg">
              {sweScore === undefined ? 'No score listed' : `${sweScore}%`}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-fg-muted">
          You should review every suggested change, especially when it affects security, data, or production systems.
        </p>
      </div>
    </aside>
  )
}
