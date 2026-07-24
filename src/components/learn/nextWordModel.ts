/**
 * A real (tiny) bigram language model: the smallest thing that can honestly
 * be called a next-word predictor.
 *
 * "Training" is literally counting: for every adjacent word pair in the
 * corpus, bump a counter. Prediction divides those counts into probabilities.
 * Sentence starts are one more "word" (START) and sentence ends another (END),
 * so the model also knows how sentences tend to begin and stop.
 *
 * Every number the demo shows is derived from CORPUS below; there is no
 * other knowledge anywhere. That is the point.
 */

export const CORPUS: string[] = [
  'the cat sat on the mat',
  'the cat chased a ball of yarn',
  'the dog chased the cat',
  'a dog sat on the mat',
  'the dog ate my homework',
  'my cat ate the fish',
  'the fish swam in the pond',
  'a bird sat on the fence',
  'the bird flew over the pond',
]

/** Sentinel for "the sentence just started". */
export const START = '<start>'
/** Sentinel for "the sentence ends here". */
export const END = '<end>'

/**
 * How the END token reads on screen: a literal period, the punctuation that
 * ends a sentence. The model still stores END internally; this is only its
 * face. Everything else renders as its own word.
 */
export const END_LABEL = '.'

/** Display form of any token, mapping the END sentinel to a period. */
export function tokenLabel(word: string): string {
  return word === END ? END_LABEL : word
}

export interface NextWord {
  word: string
  /** How many times this word followed the previous word in the corpus. */
  count: number
  /** count / total continuations of the previous word. */
  prob: number
}

/** counts.get(prev).get(next) = number of times `next` followed `prev`. */
export function bigramCounts(): Map<string, Map<string, number>> {
  const counts = new Map<string, Map<string, number>>()
  const bump = (prev: string, next: string) => {
    const row = counts.get(prev) ?? new Map<string, number>()
    row.set(next, (row.get(next) ?? 0) + 1)
    counts.set(prev, row)
  }
  for (const sentence of CORPUS) {
    const words = sentence.split(' ')
    bump(START, words[0])
    for (let i = 0; i < words.length - 1; i++) bump(words[i], words[i + 1])
    bump(words[words.length - 1], END)
  }
  return counts
}

const COUNTS = bigramCounts()

/** Deterministic tie order: alphabetical by codepoint, END always last. */
function wordOrder(a: string, b: string): number {
  if (a === END) return b === END ? 0 : 1
  if (b === END) return -1
  return a < b ? -1 : a > b ? 1 : 0
}

/**
 * The model's full prediction for what follows `prev`, most likely first.
 * Ties break deterministically so the demo behaves the same everywhere.
 */
export function nextWords(prev: string): NextWord[] {
  const row = COUNTS.get(prev)
  if (!row) return []
  const total = [...row.values()].reduce((a, b) => a + b, 0)
  return [...row.entries()]
    .map(([word, count]) => ({ word, count, prob: count / total }))
    .sort((a, b) => b.count - a.count || wordOrder(a.word, b.word))
}

/** Every stored count is one learned number: the model's parameter count. */
export function parameterCount(): number {
  let n = 0
  for (const row of COUNTS.values()) n += row.size
  return n
}

/**
 * The candidates the model offered at position `index` of `words`:
 * everything that can follow the word before it (or START for the first
 * word), most likely first.
 */
export function candidatesAt(words: string[], index: number): NextWord[] {
  return nextWords(index === 0 ? START : words[index - 1])
}

/**
 * Re-choose the word at `index`: keep everything before it, apply the new
 * choice, and drop everything after, since later words were predicted from a
 * word that no longer exists. Choosing END ends the sentence at `index`.
 */
export function rechooseWordAt(words: string[], index: number, word: string): string[] {
  const kept = words.slice(0, index)
  return word === END ? kept : [...kept, word]
}
