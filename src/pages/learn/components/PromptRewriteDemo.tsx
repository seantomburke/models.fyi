import { useState } from 'react'

type PromptId = 'summarize' | 'pitch' | 'email'

interface PromptUpgrade {
  label: string
}

interface PromptExample {
  id: PromptId
  tab: string
  weak: string
  strong: string
  upgrades: PromptUpgrade[]
}

const examples: PromptExample[] = [
  {
    id: 'summarize',
    tab: 'Summarize',
    weak: 'Summarize this.',
    strong: 'Summarize this article in three bullet points a busy manager can skim.',
    upgrades: [
      { label: 'Names the format: three bullet points' },
      { label: 'Names the reader: a busy manager' },
      { label: 'Names the goal: something skimmable' },
    ],
  },
  {
    id: 'pitch',
    tab: 'Pitch',
    weak: 'Write a pitch.',
    strong:
      'I am a startup founder. Help me pitch this app to investors in two minutes, ending with the ask.',
    upgrades: [
      { label: 'Gives your role: a startup founder' },
      { label: 'Sets the length: a two-minute pitch' },
      { label: 'Sets the stakes: it ends with the ask' },
    ],
  },
  {
    id: 'email',
    tab: 'Email',
    weak: 'Make this email better.',
    strong:
      'Rewrite this email to sound warm and confident. Keep it under 120 words and end with a clear next step.',
    upgrades: [
      { label: 'Names the tone: warm and confident' },
      { label: 'Sets a limit: under 120 words' },
      { label: 'Names the ending: a clear next step' },
    ],
  },
]

function PromptCard({
  tone,
  eyebrow,
  text,
}: {
  tone: 'weak' | 'strong'
  eyebrow: string
  text: string
}) {
  const isStrong = tone === 'strong'
  return (
    <div
      className={`rounded-lg border p-4 ${
        isStrong ? 'border-accent bg-accent-soft' : 'border-line bg-surface'
      }`}
    >
      <p
        className={`text-xs font-medium uppercase tracking-wide ${
          isStrong ? 'text-accent-deep' : 'text-fg-muted'
        }`}
      >
        {eyebrow}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-fg">{text}</p>
    </div>
  )
}

export function PromptRewriteDemo() {
  const [promptId, setPromptId] = useState<PromptId>(examples[0].id)
  const example = examples.find((item) => item.id === promptId) ?? examples[0]

  return (
    <aside
      aria-labelledby="prompt-rewrite-title"
      className="rounded-xl border border-line bg-surface-raised p-4 shadow-subtle sm:p-6"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">Prompt rewrite</p>
      <h3 id="prompt-rewrite-title" className="mt-1 text-lg font-semibold tracking-tight text-fg">
        Watch a vague prompt turn specific
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-fg-secondary">
        Pick a task to see the same request rewritten with a role, a format, and the stakes.
      </p>

      <fieldset className="mt-5">
        <legend className="text-sm font-medium text-fg">What do you want the model to do?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {examples.map((item) => (
            <label key={item.id} className="block cursor-pointer">
              <input
                type="radio"
                name="prompt-rewrite-task"
                value={item.id}
                checked={promptId === item.id}
                onChange={() => setPromptId(item.id)}
                className="peer sr-only"
              />
              <span className="block rounded-lg border border-line px-3 py-3 text-center text-sm font-medium text-fg transition-colors duration-150 motion-reduce:transition-none peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-checked:border-accent peer-checked:bg-accent-soft hover:border-line-strong">
                {item.tab}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div aria-live="polite" className="mt-5 border-t border-line pt-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <PromptCard tone="weak" eyebrow="Vague prompt" text={example.weak} />
          <PromptCard tone="strong" eyebrow="Specific prompt" text={example.strong} />
        </div>

        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-fg-muted">
          What the rewrite added
        </p>
        <ul className="mt-2 grid gap-2" aria-label="What the rewrite added">
          {example.upgrades.map((upgrade) => (
            <li
              key={upgrade.label}
              className="flex items-start gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm leading-relaxed text-fg-secondary"
            >
              <span
                aria-hidden="true"
                className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-deep"
              >
                +
              </span>
              <span>{upgrade.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
