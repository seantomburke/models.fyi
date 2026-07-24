import { describe, expect, it } from 'vitest'
import {
  STARTER_MODEL,
  FULL_MODEL,
  STARTER_WORDS,
  EXTRA_WORDS,
  VOCAB,
  START,
  END,
  nextWords,
  parameterCount,
  candidatesAt,
  rechooseWordAt,
  train,
} from './sceneModel'

describe('Parrot-2D scene model', () => {
  it('places every word on a readable two-axis map', () => {
    // People sit on the person side, verbs on the verb side.
    expect(VOCAB.Alice.role).toBe(-1)
    expect(VOCAB.Bob.role).toBe(-1)
    expect(VOCAB.greets.role).toBe(1)
    expect(VOCAB.ignores.role).toBe(1)
    // Friendliness reads off the first axis.
    expect(VOCAB.Alice.friendliness).toBeGreaterThan(0)
    expect(VOCAB.Bob.friendliness).toBeLessThan(0)
    // The added words are neutral on friendliness.
    expect(VOCAB.Charlie.friendliness).toBe(0)
    expect(VOCAB.sees.friendliness).toBe(0)
  })

  it('the starter model knows exactly the four starter words', () => {
    const words = STARTER_MODEL.vocab.map((w) => w.word)
    expect(new Set(words)).toEqual(new Set(STARTER_WORDS))
  })

  it('the full model adds the two neutral words', () => {
    const words = FULL_MODEL.vocab.map((w) => w.word)
    for (const w of [...STARTER_WORDS, ...EXTRA_WORDS]) expect(words).toContain(w)
    expect(words).toHaveLength(6)
  })

  it('among the verbs after the unfriendly person, the unfriendly verb wins', () => {
    // Bob also ends sentences, so the period is a candidate too. Among the
    // verbs, though, the unfriendly verb "ignores" beats the friendly one.
    const preds = nextWords(STARTER_MODEL, 'Bob')
    const verbs = preds.filter((n) => n.word === 'greets' || n.word === 'ignores')
    expect(verbs[0].word).toBe('ignores')
    expect(verbs.map((v) => v.word)).toContain('greets')
    // A person never directly follows a person.
    const words = preds.map((n) => n.word)
    expect(words).not.toContain('Alice')
  })

  it('offers the period as a next word once a word has ended a sentence', () => {
    // Bob is the last word of several training sentences, so END can follow it.
    expect(nextWords(STARTER_MODEL, 'Bob').map((n) => n.word)).toContain(END)
  })

  it('every prediction is a probability distribution that sums to 1', () => {
    for (const prev of [START, 'Alice', 'Bob', 'greets', 'ignores']) {
      const preds = nextWords(STARTER_MODEL, prev)
      const total = preds.reduce((sum, p) => sum + p.prob, 0)
      expect(total).toBeCloseTo(1, 10)
      // Ranked most likely first.
      for (let i = 1; i < preds.length; i++) {
        expect(preds[i - 1].count).toBeGreaterThanOrEqual(preds[i].count)
      }
    }
  })

  it('carries each candidate its map position for drawing', () => {
    for (const pred of nextWords(STARTER_MODEL, 'Alice')) {
      expect(pred.embedding).toEqual(VOCAB[pred.word])
    }
  })

  it('counts one parameter per learned word pair', () => {
    // Deterministic and non-zero; the starter corpus has a handful of pairs.
    expect(parameterCount(STARTER_MODEL)).toBeGreaterThan(0)
    // Adding words and sentences can only add parameters, never remove them.
    expect(parameterCount(FULL_MODEL)).toBeGreaterThanOrEqual(parameterCount(STARTER_MODEL))
  })

  it('offers the first word from START and later words from the prior word', () => {
    const first = candidatesAt(STARTER_MODEL, [], 0)
    expect(first).toEqual(nextWords(STARTER_MODEL, START))
    const second = candidatesAt(STARTER_MODEL, ['Bob'], 1)
    expect(second).toEqual(nextWords(STARTER_MODEL, 'Bob'))
  })

  it('rechoosing a word drops everything after it', () => {
    expect(rechooseWordAt(['Alice', 'greets', 'Bob'], 1, 'ignores')).toEqual(['Alice', 'ignores'])
  })

  it('training is deterministic', () => {
    const a = train(['Alice greets Bob'])
    const b = train(['Alice greets Bob'])
    expect(parameterCount(a)).toBe(parameterCount(b))
    expect(nextWords(a, 'Alice')).toEqual(nextWords(b, 'Alice'))
  })
})
