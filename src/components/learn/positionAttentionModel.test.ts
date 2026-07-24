import { describe, expect, it } from 'vitest'
import { END, generateSentence, nextChoices, positionSignal } from './positionAttentionModel'

describe('position and attention model', () => {
  it('gives the same word different next-word distributions by position', () => {
    expect(nextChoices('Bob', 'subject')[0].word).toBe('ignores')
    expect(nextChoices('Bob', 'object')[0].word).toBe(END)
    expect(positionSignal('subject')).not.toBe(positionSignal('object'))
  })

  it('generates a grammatical subject verb object sentence greedily', () => {
    expect(generateSentence(0.8, false)).toEqual(['Bob', 'ignores', 'Alice'])
  })
})
