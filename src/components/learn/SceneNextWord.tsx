import { useEffect, useId, useRef, useState } from 'react'
import {
  STARTER_MODEL,
  FULL_MODEL,
  DIMENSIONS,
  START,
  END,
  nextWords,
  candidatesAt,
  rechooseWordAt,
} from './sceneModel'
import type { Model, NextWord, WordInfo } from './sceneModel'

/**
 * This map demo teaches word-to-word meaning, so it hides the sentence-ending
 * period and rescales the rest to add back to 100%. The period lives in the
 * network diagram further down the page, where generation needs it.
 */
function wordsOnly(candidates: NextWord[]): NextWord[] {
  const kept = candidates.filter((c) => c.word !== END)
  const total = kept.reduce((sum, c) => sum + c.prob, 0)
  if (total === 0) return kept
  return kept.map((c) => ({ ...c, prob: c.prob / total }))
}

/** Matches the green "chosen word" highlight used across the lab demos: readable in both themes. */
const CHOSEN_STYLE = { backgroundColor: '#BBF7D0', color: '#1f2937' }

/** People are drawn as circles, verbs as diamonds, so the two roles read apart. */
const PERSON_FILL = '#2563eb'
const VERB_FILL = '#7c3aed'

const MAX_WORDS = 8

/* ------------------------------------------------------------------ map --- */

interface MeaningMapProps {
  vocab: WordInfo[]
  /** The word the sentence currently stands on, highlighted on the map. */
  activeWord: string | null
  /** The predicted candidates, so their dots can glow by probability. */
  predictions: NextWord[]
}

/**
 * The two-axis meaning map. Every word the model knows is a dot, placed by its
 * two learned numbers: friendliness left to right, role bottom (person) to top
 * (verb). When the sentence stands on a word, that word is ringed and each
 * candidate for the next word glows in proportion to its probability, so you
 * can see the prediction land on the map.
 */
function MeaningMap({ vocab, activeWord, predictions }: MeaningMapProps) {
  const size = 300
  const pad = 44
  const span = size - pad * 2
  // Map an embedding value in [-1, 1] onto the drawing area. Role is inverted
  // so "verb" (+1) sits at the top, which reads as "more abstract".
  const px = (f: number) => pad + ((f + 1) / 2) * span
  const py = (r: number) => pad + ((1 - r) / 2) * span

  const probOf = (word: string) => predictions.find((p) => p.word === word)?.prob ?? 0

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full max-w-sm"
      role="img"
      aria-label="A map of every word the model knows, placed by friendliness left to right and by role, person at the bottom and verb at the top."
    >
      {/* Quadrant guides */}
      <line x1={size / 2} y1={pad} x2={size / 2} y2={size - pad} stroke="currentColor" strokeOpacity="0.15" />
      <line x1={pad} y1={size / 2} x2={size - pad} y2={size / 2} stroke="currentColor" strokeOpacity="0.15" />

      {/* Axis labels */}
      <text x={size / 2} y={size - 12} textAnchor="middle" className="fill-fg-faint" fontSize="11">
        {DIMENSIONS.friendliness.low} &#8594; {DIMENSIONS.friendliness.high}
      </text>
      <text
        x={14}
        y={size / 2}
        textAnchor="middle"
        className="fill-fg-faint"
        fontSize="11"
        transform={`rotate(-90 14 ${size / 2})`}
      >
        {DIMENSIONS.role.low} &#8594; {DIMENSIONS.role.high}
      </text>

      {vocab.map(({ word, embedding }) => {
        const cx = px(embedding.friendliness)
        const cy = py(embedding.role)
        const isActive = word === activeWord
        const prob = probOf(word)
        const isPerson = embedding.role < 0
        const fill = isPerson ? PERSON_FILL : VERB_FILL
        return (
          <g key={word}>
            {/* Glow for a likely next word, sized by probability. */}
            {prob > 0 && (
              <circle cx={cx} cy={cy} r={10 + prob * 16} fill={fill} fillOpacity={0.12 + prob * 0.3} />
            )}
            {isActive && (
              <circle cx={cx} cy={cy} r={13} fill="none" stroke="#f59e0b" strokeWidth={2.5} />
            )}
            {isPerson ? (
              <circle cx={cx} cy={cy} r={6} fill={fill} />
            ) : (
              <rect x={cx - 5.5} y={cy - 5.5} width={11} height={11} transform={`rotate(45 ${cx} ${cy})`} fill={fill} />
            )}
            <text
              x={cx}
              y={cy - 12}
              textAnchor="middle"
              className="fill-fg"
              fontSize="12"
              fontWeight={isActive ? 700 : 500}
            >
              {word}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* -------------------------------------------------------------- dropdown --- */

function CandidateRow({ candidate }: { candidate: NextWord }) {
  const pct = Math.round(candidate.prob * 100)
  return (
    <span className="flex w-full items-center gap-3">
      <span className="min-w-16 font-medium">{candidate.word}</span>
      <span className="relative h-2 grow overflow-hidden rounded-full bg-accent-soft">
        <span className="absolute inset-y-0 left-0 rounded-full bg-accent-deep/70" style={{ width: `${pct}%` }} />
      </span>
      <span className="shrink-0 whitespace-nowrap text-xs text-fg-secondary">
        {pct}% · seen {candidate.count}×
      </span>
    </span>
  )
}

interface WordDropdownProps {
  candidates: NextWord[]
  value: string | null
  slotLabel: string
  onChoose: (word: string) => void
}

/**
 * A themed button that opens a popover of candidate words, each showing its
 * probability and how many times the model saw it. Mirrors the control the
 * Parrot-43 demo uses so the two lab language models feel like one family.
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
            : `${slotLabel}: ${value}. Change it to rebuild the sentence from here`
        }
        onClick={() => setOpen((o) => !o)}
        style={isEmpty ? undefined : CHOSEN_STYLE}
        className={
          isEmpty
            ? 'inline-flex items-center gap-1.5 rounded-lg border border-dashed border-accent px-2.5 py-1 text-base font-medium text-accent-deep transition-colors duration-150 hover:bg-accent-soft'
            : 'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-base font-medium transition-opacity duration-150 hover:opacity-90'
        }
      >
        {isEmpty ? 'next word' : value}
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
              aria-label={`${c.word}: ${Math.round(c.prob * 100)}%, seen ${c.count} times`}
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

/* -------------------------------------------------------- probability bar --- */

/** A ranked list of what the model thinks comes next, as labeled bars. */
function PredictionBars({ predictions, prev }: { predictions: NextWord[]; prev: string }) {
  if (predictions.length === 0) return null
  const heading =
    prev === START ? 'How a sentence tends to start' : `What tends to follow "${prev}"`
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-fg">{heading}</h3>
      <ul className="space-y-1.5">
        {predictions.map((p) => {
          const pct = Math.round(p.prob * 100)
          return (
            <li key={p.word} className="flex items-center gap-3">
              <span className="min-w-16 text-sm font-medium">{p.word}</span>
              <span className="relative h-3 grow overflow-hidden rounded-full bg-accent-soft">
                <span className="absolute inset-y-0 left-0 rounded-full bg-accent-deep/70" style={{ width: `${pct}%` }} />
              </span>
              <span className="w-24 shrink-0 whitespace-nowrap text-right text-xs text-fg-secondary">
                {pct}% · seen {p.count}×
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------- component --- */

/**
 * Parrot-2D: an embedding-based next-word predictor you can watch on a map.
 *
 * You build a sentence one word at a time. As you go, the map rings the word
 * you stand on and lights up the words the model expects next, sized by how
 * likely each one is. A toggle grows the model from four words to six by
 * adding the two neutral words (Charlie and "sees"), so you can see the empty
 * middle of the map fill in.
 */
export function SceneNextWord() {
  const [expanded, setExpanded] = useState(false)
  const [words, setWords] = useState<string[]>([])
  const [done, setDone] = useState(false)

  const model: Model = expanded ? FULL_MODEL : STARTER_MODEL

  const prev = words.length === 0 ? START : words[words.length - 1]
  const predictions = done ? [] : wordsOnly(nextWords(model, prev))
  const activeWord = done || words.length === 0 ? null : prev

  const pick = (word: string) => {
    const next = [...words, word]
    setWords(next)
    if (next.length >= MAX_WORDS || wordsOnly(nextWords(model, word)).length === 0) setDone(true)
  }

  const rechoose = (index: number, word: string) => {
    if (word === words[index]) return
    const rebuilt = rechooseWordAt(words, index, word)
    setWords(rebuilt)
    setDone(rebuilt.length >= MAX_WORDS || wordsOnly(nextWords(model, word)).length === 0)
  }

  const reset = () => {
    setWords([])
    setDone(false)
  }

  const toggleExpanded = () => {
    setExpanded((e) => !e)
    reset()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 rounded-lg border border-line bg-surface p-4 sm:flex-row sm:items-start sm:gap-6">
        <MeaningMap vocab={model.vocab} activeWord={activeWord} predictions={predictions} />
        <div className="min-w-0 flex-1 space-y-2 text-sm text-fg-secondary">
          <p className="text-fg">
            Every word the model knows sits on this map. A word&#39;s spot is its two learned
            numbers: friendliness across, and whether it is a person or a verb up and down.
          </p>
          <p>
            People are round dots, and verbs are diamonds. When your sentence stands on a word, that
            word gets a gold ring, and the words the model expects next glow. The more likely a word
            is, the bigger it glows.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: PERSON_FILL }} /> person
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rotate-45" style={{ backgroundColor: VERB_FILL }} /> verb
            </span>
          </div>
        </div>
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
                  candidates={wordsOnly(candidatesAt(model, words, wi))}
                  value={word}
                  slotLabel={`word ${wi + 1}`}
                  onChoose={(w) => rechoose(wi, w)}
                />
              ))}
              {done ? (
                <span className="text-lg text-fg-faint">(no more words to predict)</span>
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
            : `Open the ${words.length === 0 ? 'first' : 'next'}-word dropdown to see the model's ranked guesses, each with its probability and how many times it was seen. Pick one and predict again.`}
        </p>
      </div>

      {!done && <PredictionBars predictions={predictions} prev={prev} />}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-line bg-surface-raised px-3 py-1.5 text-sm font-medium transition-colors duration-150 hover:border-line-strong"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={toggleExpanded}
          aria-pressed={expanded}
          className="rounded-lg border border-line bg-surface-raised px-3 py-1.5 text-sm font-medium transition-colors duration-150 hover:border-line-strong"
        >
          {expanded ? 'Back to 4 words' : 'Add Charlie and "sees" (6 words)'}
        </button>
        <span className="text-xs text-fg-secondary">
          {expanded
            ? 'Charlie is a person who is neither friendly nor unfriendly, so he sits in the middle. "sees" is a verb that is neither, so it sits in the middle too.'
            : 'The starter model knows four words, one in each corner of the map.'}
        </span>
      </div>
    </div>
  )
}
