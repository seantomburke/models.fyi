import { useState } from 'react'

type SearchScenarioId = 'weather' | 'history' | 'announcement'

interface SearchScenario {
  id: SearchScenarioId
  label: string
  question: string
  recommendation: 'Use web search' | 'Skip web search'
  explanation: string
  searches: boolean
}

const scenarios: SearchScenario[] = [
  {
    id: 'weather',
    label: 'Today\'s weather',
    question: 'Will I need an umbrella today?',
    recommendation: 'Use web search',
    explanation: 'The forecast can change during the day, so a current source can help.',
    searches: true,
  },
  {
    id: 'history',
    label: 'A history question',
    question: 'How did the Roman roads help trade?',
    recommendation: 'Skip web search',
    explanation: 'This is general knowledge, so the model can answer from what it learned during training.',
    searches: false,
  },
  {
    id: 'announcement',
    label: 'A recent announcement',
    question: 'What did the company announce this week?',
    recommendation: 'Use web search',
    explanation: 'A recent announcement may be newer than the model\'s training data.',
    searches: true,
  },
]

function SearchPath({ searches }: { searches: boolean }) {
  const steps = searches
    ? ['Your question', 'Search the web', 'Read results', 'Answer with current context']
    : ['Your question', 'Answer from learned knowledge']

  return (
    <ol className="grid gap-2 sm:grid-cols-4" aria-label="Answer path">
      {steps.map((step, index) => (
        <li
          key={step}
          className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg"
        >
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-deep">
            {index + 1}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  )
}

export function WebSearchTradeoffGuide() {
  const [scenarioId, setScenarioId] = useState<SearchScenarioId>(scenarios[0].id)
  const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0]

  return (
    <aside
      aria-labelledby="web-search-tradeoff-title"
      className="rounded-xl border border-line bg-surface-raised p-4 shadow-subtle sm:p-6"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">Search decision</p>
      <h3 id="web-search-tradeoff-title" className="mt-1 text-lg font-semibold tracking-tight text-fg">
        Match the answer path to the question
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-fg-secondary">
        Pick a question to see whether a web search adds useful current context.
      </p>

      <fieldset className="mt-5">
        <legend className="text-sm font-medium text-fg">What are you asking about?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {scenarios.map((item) => (
            <label key={item.id} className="block cursor-pointer">
              <input
                type="radio"
                name="web-search-scenario"
                value={item.id}
                checked={scenarioId === item.id}
                onChange={() => setScenarioId(item.id)}
                className="peer sr-only"
              />
              <span className="block rounded-lg border border-line px-3 py-3 text-sm transition-colors duration-150 motion-reduce:transition-none peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-checked:border-accent peer-checked:bg-accent-soft hover:border-line-strong">
                <span className="block font-medium text-fg">{item.label}</span>
                <span className="mt-1 block text-fg-secondary">{item.question}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div aria-live="polite" className="mt-5 border-t border-line pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">Recommended path</p>
        <h4 className="mt-1 text-lg font-semibold tracking-tight text-fg">{scenario.recommendation}</h4>
        <p className="mt-2 text-sm leading-relaxed text-fg-secondary">{scenario.explanation}</p>
        <div className="mt-4">
          <SearchPath searches={scenario.searches} />
        </div>
        {scenario.searches && (
          <p className="mt-4 rounded-lg border border-line bg-surface px-3 py-3 text-sm leading-relaxed text-fg-secondary">
            Search gives the model an extra step. That step can take more time, and the results add
            tokens and search charges to the request.
          </p>
        )}
      </div>
    </aside>
  )
}
