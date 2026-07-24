/**
 * Parrot-2D: a next-word predictor that thinks in two meanings.
 *
 * Parrot-43 (the bigram model) is a lookup table. It memorizes which word
 * followed which. Parrot-2D does something a frontier transformer does. It gives
 * every word a small list of numbers (an embedding) and the meaning of those
 * numbers is what drives the prediction.
 *
 * Here every word gets exactly two numbers, and both numbers mean something a
 * person can read:
 *   - dimension 1: friendliness, from -1 (unfriendly) to +1 (friendly)
 *   - dimension 2: role, from -1 (a person) to +1 (a verb)
 *
 * So "Bob" sits at (-1, -1): a person, and unfriendly. "greets" sits at
 * (+1, +1): a verb, and friendly. Every word lands on a corner (or, for the
 * neutral words, the middle) of a two-by-two map you can look at.
 *
 * Prediction works by counting, then reading the meaning off the counts. For
 * the word you are standing on, the model looks at every word that followed it
 * in the training data and turns those counts into probabilities. Because the
 * training sentences were built from the meanings above, the counts and the
 * map always agree. An unfriendly person like Bob is usually followed by an
 * unfriendly verb like "ignores".
 *
 * Every number this file exposes comes from the corpus below. There is no
 * other knowledge anywhere, which is the whole point of a model small enough
 * to see through.
 */

/** Sentinel for the empty sentence, so the model can predict a first word. */
export const START = '<start>'
/** Sentinel for "the sentence ends here". It shows on screen as a period. */
export const END = '<end>'
/** How the END token reads on screen: a period, the mark that ends a sentence. */
export const END_LABEL = '.'

/** Display form of any token, mapping the END sentinel to a period. */
export function tokenLabel(word: string): string {
  return word === END ? END_LABEL : word
}

/** A word's two learned numbers: where it sits on the meaning map. */
export interface Embedding {
  /** -1 unfriendly ... +1 friendly. 0 is neutral. */
  friendliness: number
  /** -1 a person ... +1 a verb. 0 is neither. */
  role: number
}

export interface WordInfo {
  word: string
  embedding: Embedding
}

/**
 * The full vocabulary and where each word lives on the 2D map. The first four
 * words are the starter model. Charlie and "sees" are the two neutral words
 * the lesson adds later to show what the middle of the map is for.
 */
export const VOCAB: Record<string, Embedding> = {
  // People
  Alice: { friendliness: 1, role: -1 }, // a friendly person
  Bob: { friendliness: -1, role: -1 }, // an unfriendly person
  Charlie: { friendliness: 0, role: -1 }, // a person who is neither
  // Verbs
  greets: { friendliness: 1, role: 1 }, // a friendly verb
  ignores: { friendliness: -1, role: 1 }, // an unfriendly verb
  sees: { friendliness: 0, role: 1 }, // a verb that is neither
  // The period that ends a sentence. It is neither friendly nor a verb, so it
  // sits dead center on the map, its own kind of token.
  [END]: { friendliness: 0, role: 0 },
}

/** The map position of any token, including the END period. */
export function embeddingOf(word: string): Embedding {
  return VOCAB[word]
}

/** The starter words that keep the model at four words. */
export const STARTER_WORDS = ['Alice', 'Bob', 'greets', 'ignores'] as const
/** The two neutral words the lesson adds in its second half. */
export const EXTRA_WORDS = ['Charlie', 'sees'] as const

/**
 * The training sentences.
 *
 * The first block is the four-word starter corpus. It is built around the two
 * sentences from the issue, "Alice greets Bob" and "Bob ignores Alice", so the
 * model learns the tendency that a friendly person greets and an unfriendly
 * person ignores. A smaller number of pattern-breakers ("Bob greets Alice",
 * "Alice ignores Bob") keep it a tendency, not a hard rule, so the second-place
 * word still gets real probability.
 *
 * More sentences make the probabilities smoother. With only a handful, one odd
 * sentence swings the odds hard. With a few dozen, the friendly-greets and
 * unfriendly-ignores pattern reads clearly while the exceptions stay visible.
 */
export const STARTER_CORPUS: string[] = [
  // Alice (friendly) usually greets.
  'Alice greets Bob',
  'Alice greets Bob',
  'Alice greets Bob',
  'Alice greets Bob',
  'Alice greets Bob',
  'Alice greets Alice',
  // Alice ignores now and then, the friendly exception.
  'Alice ignores Bob',
  'Alice ignores Bob',
  // Bob (unfriendly) usually ignores.
  'Bob ignores Alice',
  'Bob ignores Alice',
  'Bob ignores Alice',
  'Bob ignores Alice',
  'Bob ignores Alice',
  'Bob ignores Bob',
  // Bob greets now and then, the unfriendly exception.
  'Bob greets Alice',
  'Bob greets Alice',
]

/**
 * Charlie is neither friendly nor unfriendly, so his verb is a coin flip:
 * roughly as many greets as ignores. "sees" is the neutral verb, used by both
 * people so it sits in the middle of the map.
 */
export const EXTRA_CORPUS: string[] = [
  // Charlie splits evenly between the two verbs.
  'Charlie greets Bob',
  'Charlie greets Alice',
  'Charlie greets Bob',
  'Charlie ignores Alice',
  'Charlie ignores Bob',
  'Charlie ignores Alice',
  // The neutral verb "sees", from everyone.
  'Alice sees Bob',
  'Bob sees Alice',
  'Charlie sees Bob',
  'Alice sees Charlie',
]


export interface NextWord {
  word: string
  /** How many times this word followed the previous word in the corpus. */
  count: number
  /** count / total continuations of the previous word. */
  prob: number
  /** Where the predicted word sits on the map, for drawing it. */
  embedding: Embedding
}

/** The two dimensions carry friendly names the UI reuses. */
export const DIMENSIONS = {
  friendliness: { label: 'Friendliness', low: 'unfriendly', high: 'friendly' },
  role: { label: 'Role', low: 'person', high: 'verb' },
} as const

/**
 * A trained Parrot-2D: the words it knows, the sentences it saw, and its
 * next-word counts. Building one is "training": walk the corpus and count.
 */
export interface Model {
  /** Every word the model knows, in a stable display order. */
  vocab: WordInfo[]
  /** The sentences this model was trained on. */
  corpus: string[]
  /** counts.get(prev).get(next) = times `next` followed `prev`. */
  counts: Map<string, Map<string, number>>
}

/** Stable display order: people first (Alice, Bob, Charlie), then verbs, then the period. */
export const DISPLAY_ORDER = ['Alice', 'Bob', 'Charlie', 'greets', 'ignores', 'sees', END]

function orderWords(words: string[]): string[] {
  return [...words].sort((a, b) => DISPLAY_ORDER.indexOf(a) - DISPLAY_ORDER.indexOf(b))
}

/**
 * Train a model by counting adjacent word pairs in `corpus`. START counts as
 * the word before the first word of every sentence, so the model also learns
 * how sentences tend to begin.
 */
export function train(corpus: string[]): Model {
  const counts = new Map<string, Map<string, number>>()
  const bump = (prev: string, next: string) => {
    const row = counts.get(prev) ?? new Map<string, number>()
    row.set(next, (row.get(next) ?? 0) + 1)
    counts.set(prev, row)
  }
  const seen = new Set<string>()
  for (const sentence of corpus) {
    const words = sentence.split(' ')
    bump(START, words[0])
    for (const w of words) seen.add(w)
    for (let i = 0; i < words.length - 1; i++) bump(words[i], words[i + 1])
    // The period after the last word: the model learns how sentences stop.
    bump(words[words.length - 1], END)
  }
  const vocab: WordInfo[] = orderWords([...seen]).map((word) => ({
    word,
    embedding: VOCAB[word],
  }))
  return { vocab, corpus, counts }
}

/** The four-word starter model. */
export const STARTER_MODEL = train(STARTER_CORPUS)
/** The six-word model, once the neutral words are added. */
export const FULL_MODEL = train([...STARTER_CORPUS, ...EXTRA_CORPUS])

/** Deterministic tie order for equal counts: the display order above. */
function wordOrder(a: string, b: string): number {
  return DISPLAY_ORDER.indexOf(a) - DISPLAY_ORDER.indexOf(b)
}

/**
 * The model's ranked prediction for what follows `prev`, most likely first.
 * `prev` may be START for the first word of a sentence. Ties break by display
 * order so the demo behaves the same everywhere.
 */
export function nextWords(model: Model, prev: string): NextWord[] {
  const row = model.counts.get(prev)
  if (!row) return []
  const total = [...row.values()].reduce((a, b) => a + b, 0)
  return [...row.entries()]
    .map(([word, count]) => ({
      word,
      count,
      prob: count / total,
      embedding: VOCAB[word],
    }))
    .sort((a, b) => b.count - a.count || wordOrder(a.word, b.word))
}

/** Every stored count is one learned number: the model's parameter count. */
export function parameterCount(model: Model): number {
  let n = 0
  for (const row of model.counts.values()) n += row.size
  return n
}

/**
 * The candidates the model offered at position `index` of `words`: everything
 * that can follow the word before it (or START for the first word).
 */
export function candidatesAt(model: Model, words: string[], index: number): NextWord[] {
  return nextWords(model, index === 0 ? START : words[index - 1])
}

/**
 * Re-choose the word at `index`: keep everything before it, apply the new
 * choice, and drop everything after, since later words were predicted from a
 * word that no longer exists.
 */
export function rechooseWordAt(words: string[], index: number, word: string): string[] {
  return [...words.slice(0, index), word]
}
