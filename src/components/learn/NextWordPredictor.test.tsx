import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextWordPredictor } from './NextWordPredictor'

/** The word chips built so far, read from the per-word dropdown buttons. */
function sentenceWords(): string[] {
  const sentence = screen.getByTestId('sentence')
  return within(sentence)
    .queryAllByRole('button')
    .map((el) => el.getAttribute('aria-label') ?? '')
    .map((label) => /^word \d+: (.+?)\./.exec(label)?.[1])
    .filter((w): w is string => Boolean(w))
}

/** Open a slot's dropdown and return its option buttons. */
async function openSlot(user: ReturnType<typeof userEvent.setup>, name: RegExp) {
  const trigger = screen.getByRole('button', { name })
  await user.click(trigger)
  const listbox = screen.getByRole('listbox')
  return within(listbox)
}

test('starts with a first-word slot and offers the sentence-opening words with counts', async () => {
  const user = userEvent.setup()
  render(<NextWordPredictor />)
  const first = await openSlot(user, /first word: pick the next word/i)
  // "the" opens 6 of the 9 training sentences.
  expect(first.getByRole('option', { name: 'the: 67%, seen 6 times' })).toBeInTheDocument()
})

test('picking a candidate appends it and re-predicts from the new last word', async () => {
  const user = userEvent.setup()
  render(<NextWordPredictor />)
  const first = await openSlot(user, /first word: pick/i)
  await user.click(first.getByRole('option', { name: /^the:/i }))
  expect(sentenceWords()).toEqual(['the'])

  const next = await openSlot(user, /next word: pick/i)
  // "cat" follows "the" three times in the corpus.
  expect(next.getByRole('option', { name: /^cat:.*seen 3 times/i })).toBeInTheDocument()
})

test('each chosen word is a dropdown of the candidates at that position, most likely first', async () => {
  const user = userEvent.setup()
  render(<NextWordPredictor />)
  await user.click((await openSlot(user, /first word: pick/i)).getByRole('option', { name: /^the:/i }))
  await user.click((await openSlot(user, /next word: pick/i)).getByRole('option', { name: /^cat:/i }))

  // The first word's dropdown holds the sentence openers, sorted by probability.
  const first = await openSlot(user, /word 1: the/i)
  expect(first.getAllByRole('option').map((o) => o.getAttribute('aria-label'))).toEqual([
    'the: 67%, seen 6 times',
    'a: 22%, seen 2 times',
    'my: 11%, seen 1 times',
  ])
  await user.keyboard('{Escape}')

  // The second word's dropdown holds everything that can follow "the".
  const second = await openSlot(user, /word 2: cat/i)
  const options = second.getAllByRole('option')
  // "cat" follows "the" 3 of 13 times, and is the selected option.
  expect(options[0]).toHaveAttribute('aria-label', expect.stringMatching(/^cat: 23%/))
  expect(options[0].closest('[role="option"]')).toHaveAttribute('aria-selected', 'true')
})

test('re-choosing a word rebuilds the sentence from that position', async () => {
  const user = userEvent.setup()
  render(<NextWordPredictor />)
  await user.click((await openSlot(user, /first word: pick/i)).getByRole('option', { name: /^the:/i }))
  await user.click((await openSlot(user, /next word: pick/i)).getByRole('option', { name: /^cat:/i }))
  await user.click((await openSlot(user, /next word: pick/i)).getByRole('option', { name: /^ate:/i }))
  expect(sentenceWords()).toEqual(['the', 'cat', 'ate'])

  // Swap word 2 from "cat" to "dog": everything after it is dropped.
  await user.click((await openSlot(user, /word 2: cat/i)).getByRole('option', { name: /^dog:/i }))
  expect(sentenceWords()).toEqual(['the', 'dog'])
  // Prediction continues from the new word.
  const next = await openSlot(user, /next word: pick/i)
  expect(next.getByRole('option', { name: /^chased:/i })).toBeInTheDocument()
})

test('re-choosing the first word restarts the sentence from a different opener', async () => {
  const user = userEvent.setup()
  render(<NextWordPredictor />)
  await user.click((await openSlot(user, /first word: pick/i)).getByRole('option', { name: /^the:/i }))
  await user.click((await openSlot(user, /next word: pick/i)).getByRole('option', { name: /^cat:/i }))

  await user.click((await openSlot(user, /word 1: the/i)).getByRole('option', { name: /^my:/i }))
  expect(sentenceWords()).toEqual(['my'])
})

test('choosing "." (end) from a dropdown ends the sentence at that point', async () => {
  const user = userEvent.setup()
  render(<NextWordPredictor />)
  await user.click((await openSlot(user, /first word: pick/i)).getByRole('option', { name: /^the:/i }))
  await user.click((await openSlot(user, /next word: pick/i)).getByRole('option', { name: /^cat:/i }))
  await user.click((await openSlot(user, /next word: pick/i)).getByRole('option', { name: /^sat:/i }))

  // Word 3's dropdown includes the end token, because "the dog chased the cat"
  // stops there. Choose it (labeled "end the sentence").
  await user.click((await openSlot(user, /word 3: sat/i)).getByRole('option', { name: /end the sentence/i }))
  expect(sentenceWords()).toEqual(['the', 'cat'])
  // A trailing period marks the finished sentence and the next-word slot is gone.
  expect(screen.getByTestId('sentence')).toHaveTextContent('.')
  expect(screen.queryByRole('button', { name: /next word: pick/i })).not.toBeInTheDocument()
})

test('always picking the favorite completes a sentence deterministically', async () => {
  const user = userEvent.setup()
  render(<NextWordPredictor />)
  await user.click(screen.getByRole('button', { name: /always pick the favorite/i }))
  // Greedy decoding gets stuck in the parrot loop the topic text describes.
  expect(sentenceWords()).toEqual([
    'the',
    'cat',
    'ate',
    'my',
    'cat',
    'ate',
    'my',
    'cat',
    'ate',
    'my',
    'cat',
    'ate',
  ])
  expect(screen.queryByRole('button', { name: /next word: pick/i })).not.toBeInTheDocument()
})

test('reset clears the sentence back to a first-word slot', async () => {
  const user = userEvent.setup()
  render(<NextWordPredictor />)
  await user.click(screen.getByRole('button', { name: /always pick the favorite/i }))
  await user.click(screen.getByRole('button', { name: /reset/i }))
  expect(sentenceWords()).toEqual([])
  expect(screen.getByRole('button', { name: /first word: pick/i })).toBeInTheDocument()
})
