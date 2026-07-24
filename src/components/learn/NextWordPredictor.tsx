import { useEffect, useId, useRef, useState } from 'react'
import {
  CORPUS,
  START,
  END,
  END_LABEL,
  tokenLabel,
  nextWords,
  candidatesAt,
  rechooseWordAt,
} from './nextWordModel'
import type { NextWord } from './nextWordModel'

/** Matches TokenVisualization's fixed light highlights: readable in both themes. */
const PREV_STYLE = { backgroundColor: '#FDE68A', color: '#1f2937' }
const NEXT_STYLE = { backgroundColor: '#BBF7D0', color: '#1f2937' }
/** Chosen words wear the same green as the "next word" highlight above. */
const CHOSEN_STYLE = NEXT_STYLE

const MAX_WORDS = 12

/** One row of the dropdown: the candidate word, its odds, and its evidence. */
function CandidateRow({ candidate }: { candidate: NextWord }) {
  const pct = Math.round(candidate.prob * 100)
  return (
    <span className="flex w-full items-center gap-3">
      <span className="min-w-16 font-medium">
        {candidate.word === END ? `${END_LABEL} (end)` : candidate.word}
      </span>
      <span className="relative h-2 grow overflow-hidden rounded-full bg-accent-soft">
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-accent-deep/70"
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="shrink-0 whitespace-nowrap text-xs text-fg-secondary">
        {pct}% · seen {candidate.count}×
      </span>
    </span>
  )
}

interface WordDropdownProps {
  /** The candidates this slot can hold, most likely first. */
  candidates: NextWord[]
  /** The currently chosen word, or null for an unfilled "next word" slot. */
  value: string | null
  /** Human label for the slot, e.g. "word 2" or "next word". */
  slotLabel: string
  onChoose: (word: string) => void
}

/**
 * A themed button that opens a popover of candidate words. Replaces the native
 * <select> so the control matches the page and every option can show the
 * word, its probability, and how many times the model saw it.
 *
 * Chosen words carry the green highlight; an empty "next word" slot reads as a
 * dashed, accented prompt so it's obvious that's where the sentence grows.
 */
function WordDropdown({ candidates, value, slotLabel, onChoose }: WordDropdownProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLSpanElement>(null)
  const listId = useId()

  useEffect(() => {
    if (!open) return
    const onDocPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDocPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDocPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const choose = (word: string) => {
    setOpen(false)
    onChoose(word)
  }

  const isEmpty = value === null
  const label = value === null ? null : tokenLabel(value)

  return (
    <span ref={rootRef} className="relative inline-flex align-middle">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={
          isEmpty
            ? `${slotLabel}: pick the next word`
            : `${slotLabel}: ${label}. Change it to rebuild the sentence from here`
        }
        onClick={() => setOpen((o) => !o)}
        style={isEmpty ? undefined : CHOSEN_STYLE}
        className={
          isEmpty
            ? 'inline-flex items-center gap-1.5 rounded-lg border border-dashed border-accent px-2.5 py-1 text-base font-medium text-accent-deep transition-colors duration-150 hover:bg-accent-soft'
            : 'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-base font-medium transition-opacity duration-150 hover:opacity-90'
        }
      >
        {isEmpty ? 'next word' : label}
        <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={`${slotLabel} options`}
          className="absolute left-0 top-full z-10 mt-1 max-h-72 w-72 max-w-[80vw] overflow-auto rounded-lg border border-line-strong bg-surface-raised p-1 shadow-subtle"
        >
          {candidates.map((c) => (
            <li
              key={c.word}
              role="option"
              aria-selected={c.word === value}
              tabIndex={0}
              onClick={() => choose(c.word)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  choose(c.word)
                }
              }}
              aria-label={`${c.word === END ? 'end the sentence' : c.word}: ${Math.round(c.prob * 100)}%, seen ${c.count} times`}
              className={`cursor-pointer rounded-md px-2 py-1.5 text-sm transition-colors duration-150 hover:bg-accent-soft focus:bg-accent-soft focus:outline-none ${
                c.word === value ? 'bg-accent-soft' : ''
              }`}
            >
              <CandidateRow candidate={c} />
            </li>
          ))}
        </ul>
      )}
    </span>
  )
}

/**
 * Interactive bigram next-word predictor. The user builds a sentence one word
 * at a time from a single row of themed dropdowns: each chosen word is a green
 * chip you can re-open, and the trailing slot offers the next word's
 * candidates. The training corpus highlights exactly where each count came from.
 */
export function NextWordPredictor() {
  const [words, setWords] = useState<string[]>([])
  const [done, setDone] = useState(false)

  const prev = words.length === 0 ? START : words[words.length - 1]
  const predictions = done ? [] : nextWords(prev)

  const pick = (word: string) => {
    if (word === END) {
      setDone(true)
      return
    }
    const next = [...words, word]
    setWords(next)
    if (next.length >= MAX_WORDS) setDone(true)
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
   * dropped (those words were predicted from a word that no longer exists)
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
                  const isLast = wi === sentenceWords.length - 1
                  // The final word ends the sentence, so the END-token highlight
                  // lands on the trailing period rather than a word.
                  const periodFollowsPrev = isLast && highlightPrev === END
                  return (
                    <span key={wi}>
                      <span
                        className="whitespace-pre-wrap rounded-sm px-0.5 py-0.5"
                        style={isPrev ? PREV_STYLE : followsPrev ? NEXT_STYLE : undefined}
                      >
                        {w}
                      </span>
                      {isLast ? (
                        <span
                          className="rounded-sm px-0.5 py-0.5"
                          style={periodFollowsPrev ? NEXT_STYLE : undefined}
                        >
                          .
                        </span>
                      ) : (
                        ' '
                      )}
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
            : highlightPrev === END
              ? 'Every green period is a place a sentence stopped in the training data. That is what the "." token counts.'
              : highlightPrev !== null
                ? `Every yellow "${highlightPrev}" is a place the model saw your last word. The green word after each one is where the counts below come from.`
                : 'Press reset to run the model again.'}
        </p>
      </div>

      <div className="rounded-lg border border-line bg-surface p-4">
        <h3 className="text-sm font-semibold text-fg">Build a sentence</h3>
        <div className="mt-2 flex min-h-11 flex-wrap items-center gap-1.5" data-testid="sentence">
          {words.length === 0 && done ? (
            <span className="text-lg text-fg-faint">(empty: pick the first word)</span>
          ) : (
            <>
              {words.map((word, wi) => (
                <WordDropdown
                  key={wi}
                  candidates={candidatesAt(words, wi)}
                  value={word}
                  slotLabel={`word ${wi + 1}`}
                  onChoose={(w) => rechoose(wi, w)}
                />
              ))}
              {done ? (
                <span className="text-lg font-medium text-fg">{END_LABEL}</span>
              ) : (
                <WordDropdown
                  candidates={predictions}
                  value={null}
                  slotLabel={words.length === 0 ? 'first word' : 'next word'}
                  onChoose={pick}
                />
              )}
            </>
          )}
        </div>
        <p className="mt-2 text-sm text-fg-secondary">
          {done
            ? 'Every green word is a dropdown of what the model could have picked there, most likely first. Change one and the sentence rebuilds from that point.'
            : `Open the ${words.length === 0 ? 'first' : 'next'}-word dropdown to see the model's ranked guesses, each with its probability and how many times it was seen. Pick one and predict again. Choose "${END_LABEL}" to end the sentence.`}
        </p>
      </div>

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
