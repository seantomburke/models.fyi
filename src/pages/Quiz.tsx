import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePostHog } from '../lib/posthog-react.ts'
import { usePageMeta } from '../lib/meta.ts'
import { metaFor } from '../lib/routeMeta.ts'
import { describePricing, formatTokens, withArticle } from '../lib/format.ts'
import {
  budgets,
  companyPrefs,
  profileModel,
  recommend,
  roles,
  tasks,
} from '../lib/quiz.ts'
import type { Budget, CompanyPref, Role, Task } from '../lib/quiz.ts'
import { models, providerById } from '../data/index.ts'
import type { Model } from '../data/index.ts'
import { captureQuizStepAnswered, captureQuizCompleted, captureQuizReset } from '../lib/posthog-events.ts'
import { ProviderLogo } from '../components/ProviderLogo.tsx'
import { Breadcrumb } from '../components/Breadcrumb.tsx'

type Mode = 'forward' | 'reverse'

function Chip({
  selected,
  onClick,
  children,
}: {
  selected?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-lg px-4 py-2.5 text-left text-sm transition-colors duration-150 ${
        selected
          ? 'bg-accent-soft font-medium text-accent-deep'
          : 'border border-line bg-surface-raised text-fg-secondary hover:border-line-strong hover:text-fg'
      }`}
    >
      {children}
    </button>
  )
}

function StepHeading({ step, children }: { step: number; children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-semibold tracking-tight">
      <span className="mr-2 text-fg-muted">{step}.</span>
      {children}
    </h2>
  )
}

/** Where to dig deeper, shared by both quiz directions. */
function SeeAlsoLinks({ name }: { name: string }) {
  return (
    <p className="text-sm text-fg-muted">
      See how {name} stacks up on the{' '}
      <Link className="text-accent-deep underline underline-offset-2" to="/compare">comparison table</Link>{' '}
      or the <Link className="text-accent-deep underline underline-offset-2" to="/graph">graph</Link>.
    </p>
  )
}

function ResultCard({ role, task, budget, pref }: { role: Role; task: Task; budget: Budget; pref: CompanyPref }) {
  const { pick, runnerUp, why } = recommend(role, task, budget, pref)
  const provider = providerById.get(pick.providerId)
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-accent-soft/60 p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-accent-deep">
          Our pick for {withArticle(role.person)} who wants to {task.label.toLowerCase()}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">{pick.name}</h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-fg-secondary">
          by <ProviderLogo providerId={pick.providerId} size={13} /> {provider?.name}
        </p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg-secondary">{pick.blurb}</p>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-fg-secondary">
          {describePricing(pick.inputPricePerMTok, pick.outputPricePerMTok)}
          {pick.contextWindowTokens !== null &&
            ` It can consider about ${formatTokens(pick.contextWindowTokens)} tokens at once, its working memory for text.`}
        </p>
      </div>

      <div className="rounded-xl border border-line bg-surface-raised p-6">
        <h3 className="text-sm font-semibold">Why this one?</h3>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-fg-secondary">
          {why.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
        {runnerUp && (
          <p className="mt-4 border-t border-line pt-3 text-sm text-fg-muted">
            Close second: <span className="font-medium text-fg-secondary">{runnerUp.name}</span>.{' '}
            {runnerUp.blurb}
          </p>
        )}
      </div>

      <SeeAlsoLinks name={pick.name} />
    </div>
  )
}

function ReverseFlow() {
  const posthog = usePostHog()
  const [selected, setSelected] = useState<Model | null>(null)
  const profile = selected ? profileModel(selected) : null
  const provider = selected ? providerById.get(selected.providerId) : null

  const handleModelSelect = (m: Model) => {
    setSelected(m)
    posthog?.capture('quiz_model_selected', { model_id: m.id, model_name: m.name, provider_id: m.providerId })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1.5">
        {models.map((m) => (
          <Chip key={m.id} selected={selected?.id === m.id} onClick={() => handleModelSelect(m)}>
            {m.name}
          </Chip>
        ))}
      </div>
      {selected && profile && (
        <div className="rounded-xl border border-line bg-surface-raised p-6">
          <h2 className="text-xl font-semibold tracking-tight">{selected.name}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-fg-muted">
            by <ProviderLogo providerId={selected.providerId} size={13} /> {provider?.name}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-fg-secondary">{selected.blurb}</p>
          <p className="mt-2 text-sm leading-relaxed text-fg-secondary">
            {describePricing(selected.inputPricePerMTok, selected.outputPricePerMTok)}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wide text-fg-muted">
                Great for
              </h3>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-fg-secondary">
                {profile.goodFor.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wide text-fg-muted">
                Best suited to
              </h3>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-fg-secondary">
                {profile.audience.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
          {profile.caveats.length > 0 && (
            <div className="mt-4 border-t border-line pt-3">
              <h3 className="text-xs font-medium uppercase tracking-wide text-fg-muted">
                Worth knowing
              </h3>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-fg-secondary">
                {profile.caveats.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {selected && <SeeAlsoLinks name={selected.name} />}
    </div>
  )
}

export function Quiz() {
  const posthog = usePostHog()
  const meta = metaFor('/quiz')
  usePageMeta({
    title: meta.title,
    description: meta.description,
    image: meta.image,
    type: meta.type,
    pathname: '/quiz',
    structuredData: meta.structuredData,
  })

  const [mode, setMode] = useState<Mode>('forward')
  const [role, setRole] = useState<Role | null>(null)
  const [task, setTask] = useState<Task | null>(null)
  const [budget, setBudget] = useState<Budget | null>(null)
  const [pref, setPref] = useState<CompanyPref | null>(null)

  const handleModeSwitch = (nextMode: Mode) => {
    setMode(nextMode)
    posthog?.capture('quiz_mode_switched', { mode: nextMode })
  }

  const handlePrefSelect = (c: { id: CompanyPref; label: string }) => {
    setPref(c.id)
    const { pick } = recommend(role!, task!, budget!, c.id)
    captureQuizStepAnswered(posthog, 4, c.id)
    captureQuizCompleted(posthog, pick.name)
  }

  const reset = () => {
    captureQuizReset(posthog)
    setRole(null)
    setTask(null)
    setBudget(null)
    setPref(null)
  }

  const done = role && task && budget && pref

  const resultRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!done) return
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    resultRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    // Land keyboard/screen-reader focus on the result, not the last answer chip.
    resultRef.current?.focus({ preventScroll: true })
  }, [done])

  return (
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { name: 'Home', path: '/' },
          { name: 'Quiz' },
        ]}
        className="mb-4"
      />
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Which model should I use?</h1>
        <p className="mt-3 leading-relaxed text-fg-secondary">
          {mode === 'forward'
            ? 'Four quick questions, one recommendation, with the reasoning spelled out.'
            : "Pick a model and we'll tell you what it's good at."}
        </p>
      </div>

      <div className="flex gap-1.5" role="group" aria-label="Quiz direction">
        <Chip selected={mode === 'forward'} onClick={() => handleModeSwitch('forward')}>
          Find me a model
        </Chip>
        <Chip selected={mode === 'reverse'} onClick={() => handleModeSwitch('reverse')}>
          Start from a model
        </Chip>
      </div>

      {mode === 'reverse' ? (
        <ReverseFlow />
      ) : (
        <div className="space-y-8">
          <section className="space-y-3">
            <StepHeading step={1}>Who are you?</StepHeading>
            <div className="flex flex-wrap gap-1.5">
              {roles.map((r) => (
                <Chip
                  key={r.id}
                  selected={role?.id === r.id}
                  onClick={() => {
                    setRole(r)
                    captureQuizStepAnswered(posthog, 1, r.id)
                  }}
                >
                  {r.emoji} {r.label}
                </Chip>
              ))}
            </div>
          </section>

          {role && (
            <section className="space-y-3">
              <StepHeading step={2}>What do you want to do?</StepHeading>
              <div className="flex flex-wrap gap-1.5">
                {tasks.map((t) => (
                  <Chip
                    key={t.id}
                    selected={task?.id === t.id}
                    onClick={() => {
                      setTask(t)
                      captureQuizStepAnswered(posthog, 2, t.id)
                    }}
                  >
                    {t.emoji} {t.label}
                  </Chip>
                ))}
              </div>
            </section>
          )}

          {role && task && (
            <section className="space-y-3">
              <StepHeading step={3}>What do you want to spend?</StepHeading>
              <div className="flex flex-wrap gap-1.5">
                {budgets.map((b) => (
                  <Chip
                    key={b.id}
                    selected={budget === b.id}
                    onClick={() => {
                      setBudget(b.id)
                      captureQuizStepAnswered(posthog, 3, b.id)
                    }}
                  >
                    <span className="font-medium">{b.label}</span>
                    <span className="ml-1.5 text-fg-muted">{b.blurb}</span>
                  </Chip>
                ))}
              </div>
            </section>
          )}

          {role && task && budget && (
            <section className="space-y-3">
              <StepHeading step={4}>Any company preference?</StepHeading>
              <div className="flex flex-wrap gap-1.5">
                {companyPrefs.map((c) => (
                  <Chip key={c.id} selected={pref === c.id} onClick={() => handlePrefSelect(c)}>
                    {c.label}
                  </Chip>
                ))}
              </div>
            </section>
          )}

          {done && (
            <div ref={resultRef} tabIndex={-1} className="scroll-mt-6 space-y-8 outline-none">
              <ResultCard role={role} task={task} budget={budget} pref={pref} />
              <button
                type="button"
                onClick={reset}
                className="rounded-lg border border-line px-4 py-2 text-sm text-fg-secondary transition-colors duration-150 hover:border-line-strong hover:text-fg"
              >
                Start over
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
