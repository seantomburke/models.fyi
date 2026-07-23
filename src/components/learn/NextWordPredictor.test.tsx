import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextWordPredictor } from './NextWordPredictor'

/** The sentence built so far, read from the per-word dropdowns. */
function sentenceWords(): string[] {
  const sentence = screen.getByTestId('sentence')
  return within(sentence)
    .queryAllByRole('combobox')
    .map((el) => (el as HTMLSelectElement).value)
}

test('starts empty and offers the sentence-opening words with counts', () => {
  render(<NextWordPredictor />)
  expect(screen.getByTestId('sentence')).toHaveTextContent(/empty/i)
  expect(screen.getByRole('heading', { name: /how does a sentence start/i })).toBeInTheDocument()
  // "the" opens 6 of the 9 training sentences.
  expect(screen.getByRole('button', { name: 'the: 67%, seen 6 times' })).toBeInTheDocument()
})

test('clicking a prediction appends it and re-predicts from the new last word', async () => {
  const user = userEvent.setup()
  render(<NextWordPredictor />)
  await user.click(screen.getByRole('button', { name: /^the:/i }))
  expect(sentenceWords()).toEqual(['the'])
  expect(screen.getByRole('heading', { name: /what comes after "the"/i })).toBeInTheDocument()
  // "cat" follows "the" three times in the corpus.
  expect(screen.getByRole('button', { name: /^cat:.*seen 3 times/i })).toBeInTheDocument()
})

test('each chosen word is a dropdown of the candidates at that position, most likely first', async () => {
  const user = userEvent.setup()
  render(<NextWordPredictor />)
  await user.click(screen.getByRole('button', { name: /^the:/i }))
  await user.click(screen.getByRole('button', { name: /^cat:/i }))

  const [first, second] = screen.getAllByRole('combobox')
  // The first word's dropdown holds the sentence openers, sorted by probability.
  expect(within(first).getAllByRole('option').map((o) => o.textContent)).toEqual([
    'the: 67%',
    'a: 22%',
    'my: 11%',
  ])
  // The second word's dropdown holds everything that can follow "the".
  const secondOptions = within(second).getAllByRole('option').map((o) => o.textContent)
  // "cat" follows "the" 3 of 13 times.
  expect(secondOptions[0]).toBe('cat: 23%')
  expect(second).toHaveValue('cat')
})

test('re-choosing a word rebuilds the sentence from that position', async () => {
  const user = userEvent.setup()
  render(<NextWordPredictor />)
  await user.click(screen.getByRole('button', { name: /^the:/i }))
  await user.click(screen.getByRole('button', { name: /^cat:/i }))
  await user.click(screen.getByRole('button', { name: /^ate:/i }))
  expect(sentenceWords()).toEqual(['the', 'cat', 'ate'])

  // Swap word 2 from "cat" to "dog": everything after it is dropped.
  await user.selectOptions(screen.getAllByRole('combobox')[1], 'dog')
  expect(sentenceWords()).toEqual(['the', 'dog'])
  // Prediction continues from the new word.
  expect(screen.getByRole('heading', { name: /what comes after "dog"/i })).toBeInTheDocument()
})

test('re-choosing the first word restarts the sentence from a different opener', async () => {
  const user = userEvent.setup()
  render(<NextWordPredictor />)
  await user.click(screen.getByRole('button', { name: /^the:/i }))
  await user.click(screen.getByRole('button', { name: /^cat:/i }))

  await user.selectOptions(screen.getAllByRole('combobox')[0], 'my')
  expect(sentenceWords()).toEqual(['my'])
  expect(screen.getByRole('heading', { name: /what comes after "my"/i })).toBeInTheDocument()
})

test('choosing "end here" from a dropdown ends the sentence at that point', async () => {
  const user = userEvent.setup()
  render(<NextWordPredictor />)
  await user.click(screen.getByRole('button', { name: /^the:/i }))
  await user.click(screen.getByRole('button', { name: /^cat:/i }))
  await user.click(screen.getByRole('button', { name: /^sat:/i }))

  // Word 3's candidates are everything that follows "cat" — including END,
  // because "the dog chased the cat" stops there. Choose it.
  const third = screen.getAllByRole('combobox')[2]
  const endOption = within(third)
    .getAllByRole('option')
    .find((o) => /end here/.test(o.textContent ?? ''))
  expect(endOption).toBeDefined()
  await user.selectOptions(third, (endOption as HTMLOptionElement).value)
  expect(sentenceWords()).toEqual(['the', 'cat'])
  expect(screen.queryByRole('heading', { name: /what comes after/i })).not.toBeInTheDocument()
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
  expect(screen.queryByRole('heading', { name: /what comes after/i })).not.toBeInTheDocument()
})

test('reset clears the sentence', async () => {
  const user = userEvent.setup()
  render(<NextWordPredictor />)
  await user.click(screen.getByRole('button', { name: /always pick the favorite/i }))
  await user.click(screen.getByRole('button', { name: /reset/i }))
  expect(screen.getByTestId('sentence')).toHaveTextContent(/empty/i)
})
