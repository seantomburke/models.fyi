import { useState } from 'react'
import { CORPUS, START, END, nextWords, candidatesAt, rechooseWordAt } from './nextWordModel'

/** Matches TokenVisualization's fixed light highlights: readable in both themes. */
const PREV_STYLE = { backgroundColor: '#FDE68A', color: '#1f2937' }
const NEXT_STYLE = { backgroundColor: '#BBF7D0', color: '#1f2937' }

const MAX_WORDS = 12

/**
 * Interactive bigram next-word predictor. The user builds a sentence one
 * word at a time by clicking the model's predictions, while the training
 * corpus highlights exactly where each count came from.
 */
export function NextWordPredictor() {
  const [words, setWords] = useState<string[]>([])
  const [done, setDone] = useState(false)

  const prev = words.length === 0 ? START : words[words.length - 1]
  const predictions = done ? [] : nextWords(prev)

  const pick = (word: string) => {
    if (word === END || words.length + 1 >= MAX_WORDS) {
      if (word !== END) setWords((w) => [...w, word])
      setDone(true)
    } else {
      setWords((w) => [...w, word])
    }
  }

  const autoComplete = () => {
    const sentence = [...words]
    let last = sentence.length === 0 ? START : sentence[sentence.length - 1]
    while (sentence.length < MAX_WORDS) {
      const [best] = nextWords(last)
      if (!best || best.word === END) break
      sentence.push(best.word)
      last = best.word
    }
    setWords(sentence)
    setDone(true)
  }

  const reset = () => {
    setWords([])
    setDone(false)
  }

  /**
   * Re-choose the word at `index` from its dropdown. Everything after it is
   * dropped — those words were predicted from a word that no longer exists —
   * and prediction picks up from the new choice.
   */
  const rechoose = (index: number, word: string) => {
    if (word === words[index]) return
    const rebuilt = rechooseWordAt(words, index, word)
    setWords(rebuilt)
    setDone(word === END || rebuilt.length >= MAX_WORDS)
  }

  const highlightPrev = done ? null : prev

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-fg">The entire training data</h3>
        <div className="rounded-lg border border-line bg-surface p-4 text-base leading-loose">
          {CORPUS.map((sentence, si) => {
            const sentenceWords = sentence.split(' ')
            return (
              <p key={si}>
                {sentenceWords.map((w, wi) => {
                  const isPrev = highlightPrev !== null && w === highlightPrev
                  const followsPrev =
                    highlightPrev !== null &&
                    (highlightPrev === START ? wi === 0 : wi > 0 && sentenceWords[wi - 1] === highlightPrev)
                  return (
                    <span key={wi}>
                      <span
                        className="whitespace-pre-wrap rounded-sm px-0.5 py-0.5"
                        style={isPrev ? PREV_STYLE : followsPrev ? NEXT_STYLE : undefined}
                      >
                        {w}
                      </span>{' '}
                    </span>
                  )
                })}
              </p>
            )
          })}
        </div>
        <p className="text-sm text-fg-secondary">
          {highlightPrev === START
            ? 'The sentence is empty, so Parrot-43 looks at how sentences start. Every green word opens a sentence in the training data.'
            : highlightPrev !== null
              ? `Every yellow "${highlightPrev}" is a place the model saw your last word. The green word after each one is where the counts below come from.`
              : 'Press reset to run the model again.'}
        </p>
      </div>

      <div className="rounded-lg border border-line bg-surface p-4">
        <h3 className="text-sm font-semibold text-fg">Your sentence so far</h3>
        <div className="mt-2 flex min-h-10 flex-wrap items-center gap-1.5" data-testid="sentence">
          {words.length === 0 ? (
            <span className="text-lg text-fg-faint">(empty: pick the first word below)</span>
          ) : (
            <>
              {words.map((word, wi) => (
                <span
                  key={wi}
                  className="group relative inline-flex rounded-lg focus-within:outline focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-accent-deep"
                >
                  {/* Visible chip: just the word. The transparent select on top
                      is the real control; its options carry the percentages. */}
                  <span
                    aria-hidden="true"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-raised py-1 pl-2.5 pr-2 text-lg font-medium text-fg transition-colors duration-150 group-hover:border-line-strong"
                  >
                    {word}
                    <svg width="10" height="6" viewBox="0 0 10 6" className="text-fg-secondary">
                      <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                  <select
                    value={word}
                    onChange={(e) => rechoose(wi, e.target.value)}
                    aria-label={`word ${wi + 1}: ${word}. Change it to rebuild the sentence from here`}
                    className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
                  >
                    {candidatesAt(words, wi).map((c) => (
                      <option key={c.word} value={c.word}>
                        {c.word === END
                          ? `end here (.): ${Math.round(c.prob * 100)}%`
                          : `${c.word}: ${Math.round(c.prob * 100)}%`}
                      </option>
                    ))}
                  </select>
                </span>
              ))}
              <span className="text-lg">{done ? '.' : <span className="text-fg-faint">…</span>}</span>
            </>
          )}
        </div>
        {words.length > 0 && (
          <p className="mt-2 text-sm text-fg-secondary">
            Each word is a dropdown of everything the model could have picked there, most likely
            first. Change one and the sentence rebuilds from that point.
          </p>
        )}
      </div>

      {!done && predictions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-fg">
            {words.length === 0 ? 'How does a sentence start?' : `What comes after "${prev}"?`}
          </h3>
          <ul className="space-y-1.5">
            {predictions.map((p) => (
              <li key={p.word}>
                <button
                  type="button"
                  onClick={() => pick(p.word)}
                  aria-label={`${p.word === END ? 'end the sentence' : p.word}: ${Math.round(p.prob * 100)}%, seen ${p.count} times`}
                  className="group flex w-full items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2 text-left transition-colors duration-150 hover:border-line-strong"
                >
                  <span className="w-24 shrink-0 font-medium text-fg group-hover:text-accent-deep">
                    {p.word === END ? 'end here .' : p.word}
                  </span>
                  <span className="relative h-2.5 grow overflow-hidden rounded-full bg-accent-soft">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-accent-deep/70"
                      style={{ width: `${Math.round(p.prob * 100)}%` }}
                    />
                  </span>
                  <span className="w-28 shrink-0 text-right text-sm text-fg-secondary">
                    {Math.round(p.prob * 100)}% · seen {p.count}×
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {!done && (
          <button
            type="button"
            onClick={autoComplete}
            className="rounded-lg border border-line bg-surface-raised px-3 py-1.5 text-sm font-medium transition-colors duration-150 hover:border-line-strong"
          >
            Always pick the favorite
          </button>
        )}
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-line bg-surface-raised px-3 py-1.5 text-sm font-medium transition-colors duration-150 hover:border-line-strong"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
