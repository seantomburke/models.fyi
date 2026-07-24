/** A hand-followable language model with a position signal and one attention head. */
export const START = '<start>'
export const END = '<end>'

export type Slot = 'subject' | 'verb' | 'object' | 'end'
export interface Choice { word: string; prob: number }

const DISTRIBUTIONS: Record<string, Choice[]> = {
  '<start>|subject': [{ word: 'Bob', prob: 0.5 }, { word: 'Alice', prob: 0.5 }],
  'Bob|subject': [{ word: 'ignores', prob: 0.75 }, { word: 'greets', prob: 0.25 }],
  'Alice|subject': [{ word: 'greets', prob: 0.75 }, { word: 'ignores', prob: 0.25 }],
  'ignores|verb': [{ word: 'Alice', prob: 0.6 }, { word: 'Bob', prob: 0.4 }],
  'greets|verb': [{ word: 'Alice', prob: 0.6 }, { word: 'Bob', prob: 0.4 }],
  'Alice|object': [{ word: END, prob: 1 }],
  'Bob|object': [{ word: END, prob: 1 }],
}

/** Position turns the same word into a different input. */
export function positionSignal(slot: Slot): number {
  return ({ subject: -1, verb: 0, object: 1, end: 2 })[slot]
}

export function nextChoices(previous: string, slot: Slot): Choice[] {
  return DISTRIBUTIONS[`${previous}|${slot}`] ?? []
}

export function adjustedChoices(previous: string, slot: Slot, temperature: number): Choice[] {
  const choices = nextChoices(previous, slot)
  if (choices.length < 2) return choices
  const powers = choices.map((choice) => Math.pow(choice.prob, 1 / temperature))
  const total = powers.reduce((sum, value) => sum + value, 0)
  return choices.map((choice, index) => ({ ...choice, prob: powers[index] / total }))
}

export function chooseNext(previous: string, slot: Slot, temperature: number, sample: boolean, random = Math.random): string {
  const choices = adjustedChoices(previous, slot, temperature)
  if (choices.length === 0) return END
  if (!sample) return choices[0].word
  let remaining = random()
  for (const choice of choices) {
    remaining -= choice.prob
    if (remaining <= 0) return choice.word
  }
  return choices[choices.length - 1].word
}

export function generateSentence(temperature: number, sample: boolean, random = Math.random): string[] {
  const words: string[] = []
  let previous = START
  // The first prediction fills the subject slot. Each later prediction reads
  // the position of the word it just received, then fills the next slot.
  for (const slot of ['subject', 'subject', 'verb', 'object'] as const) {
    const word = chooseNext(previous, slot, temperature, sample, random)
    if (word === END) break
    words.push(word)
    previous = word
  }
  return words
}

/** Attention weights for `Bob ignores _`: the object query looks at the subject and verb. */
export const ATTENTION = [
  { token: 'Bob', key: 1, value: 'person', weight: 0.72 },
  { token: 'ignores', key: 0.4, value: 'verb', weight: 0.28 },
] as const
