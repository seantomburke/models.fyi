import { useState } from 'react'
import { models } from '../../../data/index.ts'

type Priority = 'control' | 'ease' | 'capability'

interface Choice {
  id: Priority
  label: string
  detail: string
}

const choices: Choice[] = [
  {
    id: 'control',
    label: 'Keep the model and data under your control',
    detail: 'You can host the weights yourself and choose how the system runs.',
  },
  {
    id: 'ease',
    label: 'Start quickly with a managed service',
    detail: 'A provider can run the servers, updates, and scaling work for you.',
  },
  {
    id: 'capability',
    label: 'Use the strongest option for a demanding task',
    detail: 'You can compare current benchmark scores before you decide.',
  },
]

const guidance: Record<Priority, { title: string; detail: string }> = {
  control: {
    title: 'An open-weights model is a strong fit to explore',
    detail:
      'This route gives your team control over deployment and tuning. Plan for hardware, security, and ongoing operations.',
  },
  ease: {
    title: 'A closed model is a strong fit to explore',
    detail:
      'This route gives your team a managed API or app. Review the provider terms, data handling, and service limits.',
  },
  capability: {
    title: 'Compare the task before choosing a route',
    detail:
      'Strong results depend on the task and the benchmark. The current data includes high-scoring models in both groups.',
  },
}

export function OpenClosedTradeoffGuide() {
  const [priority, setPriority] = useState<Priority>('control')
  const openModels = models.filter((model) => model.openSource).length
  const closedModels = models.length - openModels
  const result = guidance[priority]

  return (
    <aside
      aria-labelledby="open-closed-tradeoff-title"
      className="rounded-xl border border-line bg-surface-raised p-4 shadow-subtle sm:p-6"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">Choice map</p>
      <h3 id="open-closed-tradeoff-title" className="mt-1 text-lg font-semibold tracking-tight">
        Start with the constraint that matters most
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-fg-secondary">
        Pick one priority to see which route deserves a closer look. A real choice can include both routes for different jobs.
      </p>

      <fieldset className="mt-5">
        <legend className="text-sm font-medium text-fg">What is most important for this use?</legend>
        <div className="mt-2 grid gap-2">
          {choices.map((choice) => (
            <label key={choice.id} className="block cursor-pointer">
              <input
                type="radio"
                name="open-closed-priority"
                value={choice.id}
                checked={priority === choice.id}
                onChange={() => setPriority(choice.id)}
                className="peer sr-only"
              />
              <span className="block rounded-lg border border-line px-3 py-3 text-sm transition-colors duration-150 motion-reduce:transition-none peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-checked:border-accent peer-checked:bg-accent-soft hover:border-line-strong">
                <span className="block font-medium text-fg">{choice.label}</span>
                <span className="mt-0.5 block text-fg-secondary">{choice.detail}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div aria-live="polite" className="mt-5 border-t border-line pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">A useful next step</p>
        <h4 className="mt-1 text-lg font-semibold tracking-tight">{result.title}</h4>
        <p className="mt-2 text-sm leading-relaxed text-fg-secondary">{result.detail}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-3 text-sm">
          <div>
            <dt className="text-xs text-fg-muted">Open-weight models tracked</dt>
            <dd className="mt-0.5 font-mono tabular-nums text-fg">{openModels}</dd>
          </div>
          <div>
            <dt className="text-xs text-fg-muted">Closed models tracked</dt>
            <dd className="mt-0.5 font-mono tabular-nums text-fg">{closedModels}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-fg-muted">
          “Open” can describe published weights. License terms and hosted options vary by model, so check the details before you deploy.
        </p>
      </div>
    </aside>
  )
}
