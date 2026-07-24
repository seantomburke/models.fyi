import {
  CORPUS,
  START,
  END,
  END_LABEL,
  tokenLabel,
  bigramCounts,
  nextWords,
  parameterCount,
  candidatesAt,
  rechooseWordAt,
} from './nextWordModel'
import { topics } from '../../pages/learn/topics'

test('training is counting: bigram counts match the corpus', () => {
  const counts = bigramCounts()
  // "the cat" appears three times in the corpus.
  expect(counts.get('the')?.get('cat')).toBe(3)
  // Every sentence contributes a START transition to its first word.
  expect(counts.get(START)?.get('the')).toBe(6)
  expect(counts.get(START)?.get('a')).toBe(2)
  expect(counts.get(START)?.get('my')).toBe(1)
  // Sentence-final words transition to END.
  expect(counts.get('mat')?.get(END)).toBe(2)
})

test('predictions are probabilities that sum to 1, most likely first', () => {
  for (const prev of [START, 'the', 'cat', 'on']) {
    const preds = nextWords(prev)
    expect(preds.length).toBeGreaterThan(0)
    const total = preds.reduce((sum, p) => sum + p.prob, 0)
    expect(total).toBeCloseTo(1, 10)
    for (let i = 1; i < preds.length; i++) {
      expect(preds[i - 1].count).toBeGreaterThanOrEqual(preds[i].count)
    }
  }
})

test('unseen words predict nothing: the model can only parrot its training data', () => {
  expect(nextWords('helicopter')).toEqual([])
})

test('every word in the corpus has a continuation, so generation never dead-ends', () => {
  const vocab = new Set(CORPUS.flatMap((s) => s.split(' ')))
  for (const word of vocab) {
    expect(nextWords(word).length).toBeGreaterThan(0)
  }
})

test('candidatesAt gives sentence openers for the first word and bigram continuations after', () => {
  const words = ['the', 'cat', 'sat']
  expect(candidatesAt(words, 0)).toEqual(nextWords(START))
  expect(candidatesAt(words, 1)).toEqual(nextWords('the'))
  expect(candidatesAt(words, 2)).toEqual(nextWords('cat'))
  // Every chosen word appears among its own position's candidates.
  words.forEach((word, i) => {
    expect(candidatesAt(words, i).map((c) => c.word)).toContain(word)
  })
})

test('rechooseWordAt keeps the prefix, applies the new word, and drops the rest', () => {
  expect(rechooseWordAt(['the', 'cat', 'sat'], 1, 'dog')).toEqual(['the', 'dog'])
  expect(rechooseWordAt(['the', 'cat', 'sat'], 0, 'a')).toEqual(['a'])
  expect(rechooseWordAt(['the', 'cat', 'sat'], 2, 'ate')).toEqual(['the', 'cat', 'ate'])
})

test('rechooseWordAt with END truncates without appending: the sentence stops there', () => {
  expect(rechooseWordAt(['the', 'cat', 'sat'], 2, END)).toEqual(['the', 'cat'])
})

test('the END token reads as a period; every other token reads as itself', () => {
  expect(END_LABEL).toBe('.')
  expect(tokenLabel(END)).toBe('.')
  expect(tokenLabel('cat')).toBe('cat')
  expect(tokenLabel(START)).toBe(START)
})

test('the parameter count matches the name Parrot-43 used across the learn content', () => {
  expect(parameterCount()).toBe(43)
  const parrot = topics.find((t) => t.slug === 'how-llms-predict-the-next-word')
  expect(parrot?.modelSpec?.name).toBe('Parrot-43')
  expect(parrot?.modelSpec?.parameters).toContain('43')
})
