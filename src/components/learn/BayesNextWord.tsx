import { useState } from 'react'
import { TOPICS, topicPosteriors, mixtureNextWords } from './bayesModel'

function pct(p: number): string {
  const v = p * 100
  if (v === 0 || v === 100) return `${v}%`
  return v < 10 ? `${v.toFixed(1)}%` : `${v.toFixed(0)}%`
}

/**
 * Bayesian next-word prediction: build a sentence one word at a time from a
 * model that mixes two tiny bigram corpora (weather and cooking). Each word
 * you pick is evidence; Bayes' theorem updates P(topic | words so far), and
 * the next-word distribution sharpens as the posterior does. All numbers come
 * from bayesModel.ts: counting and Bayes' theorem, nothing else.
 */
export function BayesNextWord() {
  const [words, setWords] = useState<string[]>([])

  const posteriors = topicPosteriors(words)
  const predictions = mixtureNextWords(words)
  const done = predictions.length === 0

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-line bg-bg-secondary p-6">
        <h3 className="text-lg font-semibold">Build a sentence, watch the belief update</h3>
        <p className="mt-2 text-sm text-fg-secondary">
          This model learned from ten sentences (five about weather, five about cooking) but
          it doesn't know which kind of sentence you're writing. Every word you pick is
          evidence. Bayes' theorem turns that evidence into an updated belief about the topic,
          and the belief sharpens the next-word prediction.
        </p>

        <div className="mt-5 min-h-[3rem] rounded-lg border border-line bg-bg-tertiary p-4 font-mono text-sm" data-testid="bayes-sentence">
          {words.length === 0 ? (
            <span className="text-fg-muted">Pick a first word below…</span>
          ) : (
            words.join(' ')
          )}
        </div>

        {/* The posterior over the hidden topic */}
        <div className="mt-5">
          <h4 className="text-sm font-medium">The model's belief: P(topic | words so far)</h4>
          <div className="mt-2 space-y-2">
            {posteriors.map(({ topic, posterior }) => (
              <div key={topic} className="flex items-center gap-3">
                <span className="w-20 text-sm capitalize text-fg-secondary">{topic}</span>
                <div
                  className="h-4 flex-1 overflow-hidden rounded bg-bg-tertiary"
                  role="meter"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(posterior * 100)}
                  aria-label={`Probability the topic is ${topic}`}
                >
                  <div
                    className="h-full rounded bg-accent transition-all duration-300"
                    style={{ width: `${posterior * 100}%` }}
                  />
                </div>
                <span className="w-14 text-right font-mono text-sm text-accent">{pct(posterior)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next-word choices */}
        <div className="mt-5">
          <h4 className="text-sm font-medium">
            {done ? 'No continuations left. The sentence ended.' : 'Predicted next word: P(word | sentence so far)'}
          </h4>
          {!done && (
            <ul className="mt-2 space-y-1.5">
              {predictions.map((p) => (
                <li key={p.word}>
                  <button
                    onClick={() => setWords([...words, p.word])}
                    aria-label={`Pick "${p.word}": probability ${pct(p.prob)}`}
                    className="flex w-full items-center gap-3 rounded border border-line bg-bg-tertiary px-3 py-2 text-left text-sm transition-colors hover:border-accent hover:bg-accent-soft"
                  >
                    <span className="w-16 font-mono font-medium">{p.word}</span>
                    <span className="h-3 overflow-hidden rounded bg-line/50" style={{ width: `${Math.max(p.prob * 55, 1)}%` }}>
                      <span className="block h-full bg-accent" />
                    </span>
                    <span className="ml-auto font-mono text-xs text-fg-secondary">{pct(p.prob)}</span>
                    <span className="hidden font-mono text-[11px] text-fg-muted sm:inline">
                      {TOPICS.map((t) => `${t}: ${pct(p.perTopic[t] ?? 0)}`).join(' · ')}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={() => setWords([])}
          disabled={words.length === 0}
          className="mt-5 rounded border border-line bg-bg-tertiary px-4 py-2 text-sm font-medium transition-colors hover:bg-bg-secondary disabled:opacity-50"
        >
          Start over
        </button>

        <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-fg-muted">
          Each prediction is the two topics' word probabilities, weighted by the current belief:
          P(word) = P(word | weather) · P(weather | context) + P(word | cooking) · P(cooking | context).
          Pick "rain" and the cooking belief drops to zero (no cooking sentence ever contained it),
          so the model commits, and its next predictions get sharper.
        </p>
      </div>
    </div>
  )
}
