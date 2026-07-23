import { useState } from 'react'
import { models } from '../../../data/index.ts'
import type { BenchmarkId } from '../../../data/types.ts'

interface PickerOption {
  id: string
  label: string
  detail: string
  modelId: string
  reason: string
}

interface StatConfig {
  scoreKey: BenchmarkId
  label: string
  unit?: string
}

export interface TaskModelPickerConfig {
  eyebrow: string
  title: string
  intro: string
  legend: string
  options: PickerOption[]
  stat: StatConfig
  caveat: string
}

function formatPrice(price: number | null): string {
  return price === null ? 'Pricing varies' : `$${price} per million tokens`
}

const writingConfig: TaskModelPickerConfig = {
  eyebrow: 'Writing model guide',
  title: 'Match the model to the writing job',
  intro:
    'You can pick the kind of writing you have. This is an editorial starting point based on the current Models.wtf data.',
  legend: 'What are you writing?',
  options: [
    {
      id: 'everyday',
      label: 'An everyday draft',
      detail: 'An email, a summary, or a quick rewrite',
      modelId: 'claude-sonnet-5',
      reason:
        'A balanced mid-tier model is fast enough and cheap enough for everyday writing, so it is a practical place to start.',
    },
    {
      id: 'polished',
      label: 'A polished piece',
      detail: 'An essay, a blog post, or marketing copy',
      modelId: 'claude-opus-4-8',
      reason:
        'This flagship model is thoughtful and clear, so it is a strong pick when you are iterating on long-form content that needs to read well.',
    },
    {
      id: 'variations',
      label: 'Fast variations',
      detail: 'Several angles, tones, or headline options',
      modelId: 'gpt-5-6-terra',
      reason:
        'This model is fast and versatile, so it is a good fit when you want to juggle multiple voices and generate options quickly.',
    },
  ],
  stat: {
    scoreKey: 'gpqa-diamond',
    label: 'GPQA Diamond',
    unit: '%',
  },
  caveat:
    'You should read every draft yourself. A model can match your style, and you decide whether it sounds like you.',
}

const researchConfig: TaskModelPickerConfig = {
  eyebrow: 'Research model guide',
  title: 'Match the model to the research job',
  intro:
    'You can pick the kind of research you have. This is an editorial starting point based on the current Models.wtf data.',
  legend: 'What are you researching?',
  options: [
    {
      id: 'quick-scan',
      label: 'A quick scan',
      detail: 'A fast look across sources or a trend check',
      modelId: 'gpt-5-6-terra',
      reason:
        'This model is broad and fast, so it is a good fit when you want to survey a topic quickly before you go deep.',
    },
    {
      id: 'synthesis',
      label: 'Careful synthesis',
      detail: 'A literature review or a long paper to digest',
      modelId: 'claude-opus-4-8',
      reason:
        'This flagship model synthesizes clearly and admits its limits, and its large context window can hold a whole paper in a single query.',
    },
    {
      id: 'hard-reasoning',
      label: 'Hard reasoning',
      detail: 'A novel problem or a deep scientific question',
      modelId: 'claude-fable-5',
      reason:
        'This is the premium pick in the current data for difficult reasoning, so it is worth the cost when accuracy matters most.',
    },
  ],
  stat: {
    scoreKey: 'gpqa-diamond',
    label: 'GPQA Diamond',
    unit: '%',
  },
  caveat:
    'You should verify every claim in the original sources. No model is a substitute for that.',
}

function TaskModelPicker({ config }: { config: TaskModelPickerConfig }) {
  const [selectedId, setSelectedId] = useState(config.options[0].id)
  const option =
    config.options.find((item) => item.id === selectedId) ?? config.options[0]
  const model = models.find((item) => item.id === option.modelId)

  if (!model) return null

  const score = model.scores[config.stat.scoreKey]
  const titleId = `${config.eyebrow.replace(/\s+/g, '-').toLowerCase()}-title`
  const radioName = titleId

  return (
    <aside
      aria-labelledby={titleId}
      className="rounded-xl border border-line bg-surface-raised p-4 shadow-subtle sm:p-6"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">{config.eyebrow}</p>
      <h3 id={titleId} className="mt-1 text-lg font-semibold tracking-tight">
        {config.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-fg-secondary">{config.intro}</p>

      <fieldset className="mt-5">
        <legend className="text-sm font-medium text-fg">{config.legend}</legend>
        <div className="mt-2 grid gap-2">
          {config.options.map((item) => (
            <label key={item.id} className="block cursor-pointer">
              <input
                type="radio"
                name={radioName}
                value={item.id}
                checked={selectedId === item.id}
                onChange={() => setSelectedId(item.id)}
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
        <p className="mt-2 text-sm leading-relaxed text-fg-secondary">{option.reason}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-3 text-sm">
          <div>
            <dt className="text-xs text-fg-muted">Input price</dt>
            <dd className="mt-0.5 font-mono tabular-nums text-fg">{formatPrice(model.inputPricePerMTok)}</dd>
          </div>
          <div>
            <dt className="text-xs text-fg-muted">{config.stat.label}</dt>
            <dd className="mt-0.5 font-mono tabular-nums text-fg">
              {score === undefined ? 'No score listed' : `${score}${config.stat.unit ?? ''}`}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-fg-muted">{config.caveat}</p>
      </div>
    </aside>
  )
}

export function WritingModelPicker() {
  return <TaskModelPicker config={writingConfig} />
}

export function ResearchModelPicker() {
  return <TaskModelPicker config={researchConfig} />
}
