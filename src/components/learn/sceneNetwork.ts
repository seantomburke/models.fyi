/**
 * The Parrot-2D neural network as a forward pass you can watch.
 *
 *   input layer   one node per word, one-hot for the current word
 *   hidden layer  two nodes, and the two nodes are the two meanings:
 *                   hidden[0] = friendliness of the current word
 *                   hidden[1] = role of the current word (person or verb)
 *   output layer  one node per possible next word
 *
 * The input-to-hidden weights are the embedding map itself. A one-hot input for
 * "Bob" copies Bob's (friendliness, role) straight into the two hidden nodes.
 *
 * The output layer reports the model's next-word probabilities. Those come from
 * the corpus counts (the same numbers the map demo shows), so the network's
 * prediction matches what you already read off the map: an unfriendly person is
 * usually followed by an unfriendly verb.
 *
 * This module shows the forward pass only. Training the output weights and
 * generating whole sentences needs a sense of word position (is this word the
 * subject or the object?), which a two-number model does not have. That is the
 * subject of a later module on position and attention.
 */

import { START, END, VOCAB, tokenLabel, nextWords } from './sceneModel'
import type { Model } from './sceneModel'

/** The two hidden nodes, named so the diagram can label them. */
export const HIDDEN_LABELS = ['friendliness', 'role'] as const

export interface OutputProb {
  word: string
  /** Display form: real words as themselves, END as a period. */
  label: string
  /** Probability the model assigns to this word coming next. */
  prob: number
}

/**
 * A forward-pass view of Parrot-2D over one corpus. Input and output
 * vocabularies are the same tokens; the map (input weights) is fixed and the
 * output distribution is read from the corpus counts.
 */
export interface Network {
  /** The tokens that can be the current word, in display order. */
  inputVocab: string[]
  /** The tokens that can be the next word, in display order (includes the period). */
  outputVocab: string[]
  /** Fixed input-to-hidden weights: inputWeights[word] = [friendliness, role]. */
  inputWeights: Record<string, [number, number]>
  /** The count model this network reads its output probabilities from. */
  counts: Model
}

/** hidden = the current word's two numbers, straight off the map. */
export function hidden(network: Network, word: string): [number, number] {
  return network.inputWeights[word] ?? [0, 0]
}

/**
 * The network's next-word distribution for `word`, in the output-layer order.
 * Every output word gets a probability, zero for words that never followed it.
 * The period is included, since a word can end a sentence.
 */
export function outputs(network: Network, word: string): OutputProb[] {
  const preds = nextWords(network.counts, word)
  const byWord = new Map(preds.map((p) => [p.word, p.prob]))
  return network.outputVocab.map((w) => ({ word: w, label: tokenLabel(w), prob: byWord.get(w) ?? 0 }))
}

/** The same distribution, ranked most likely first, dropping zero-probability words. */
export function predict(network: Network, word: string): OutputProb[] {
  return outputs(network, word)
    .filter((o) => o.prob > 0)
    .sort((a, b) => b.prob - a.prob)
}

/** Stable ordering used for input and output columns. */
function tokensInOrder(model: Model, includeEnd: boolean): string[] {
  const order = ['Alice', 'Bob', 'Charlie', 'greets', 'ignores', 'sees', END]
  const set = new Set(model.vocab.map((w) => w.word))
  if (includeEnd) set.add(END)
  return order.filter((t) => set.has(t))
}

/** Build the forward-pass network for a corpus by counting it. */
export function buildNetwork(model: Model): Network {
  const inputVocab = tokensInOrder(model, false)
  const outputVocab = tokensInOrder(model, true)
  const inputWeights: Record<string, [number, number]> = {}
  for (const w of inputVocab) inputWeights[w] = [VOCAB[w].friendliness, VOCAB[w].role]
  return { inputVocab, outputVocab, inputWeights, counts: model }
}

/** START is not a current word here; the network reasons word to word. */
export const FIRST_TOKEN = START
