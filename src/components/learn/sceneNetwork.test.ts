import { describe, expect, it } from 'vitest'
import { buildNetwork, predict, outputs, hidden, HIDDEN_LABELS } from './sceneNetwork'
import { STARTER_MODEL, FULL_MODEL, END, VOCAB } from './sceneModel'

describe('Parrot-2D forward-pass network', () => {
  const net = buildNetwork(STARTER_MODEL)

  it('has exactly two hidden nodes, the two named meanings', () => {
    expect(HIDDEN_LABELS).toEqual(['friendliness', 'role'])
  })

  it('the hidden nodes are the current word two numbers from the map', () => {
    expect(hidden(net, 'Bob')).toEqual([VOCAB.Bob.friendliness, VOCAB.Bob.role])
    expect(hidden(net, 'greets')).toEqual([VOCAB.greets.friendliness, VOCAB.greets.role])
  })

  it('the output layer includes the period; the input layer does not', () => {
    expect(net.outputVocab).toContain(END)
    expect(net.inputVocab).not.toContain(END)
  })

  it('predicts an unfriendly verb most often among the verbs after the unfriendly person', () => {
    const preds = predict(net, 'Bob')
    const verbs = preds.filter((p) => p.word === 'greets' || p.word === 'ignores')
    expect(verbs[0].word).toBe('ignores')
  })

  it('predicts a friendly verb most often among the verbs after the friendly person', () => {
    const preds = predict(net, 'Alice')
    const verbs = preds.filter((p) => p.word === 'greets' || p.word === 'ignores')
    expect(verbs[0].word).toBe('greets')
  })

  it('the full output distribution sums to 1 for every input word', () => {
    for (const w of net.inputVocab) {
      const total = outputs(net, w).reduce((sum, o) => sum + o.prob, 0)
      expect(total).toBeCloseTo(1, 8)
    }
  })

  it('every output word gets a probability, zero when it never followed', () => {
    const row = outputs(net, 'greets')
    // A verb never directly follows a verb, so "ignores" scores zero here.
    expect(row.find((o) => o.word === 'ignores')?.prob).toBe(0)
    // A person does follow a verb.
    expect(row.find((o) => o.word === 'Bob')?.prob).toBeGreaterThan(0)
  })

  it('the six-word network adds the neutral words and the period', () => {
    const full = buildNetwork(FULL_MODEL)
    expect(full.inputVocab).toContain('Charlie')
    expect(full.inputVocab).toContain('sees')
    expect(full.outputVocab).toContain(END)
  })
})
