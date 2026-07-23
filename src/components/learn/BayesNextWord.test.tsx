import { render, screen, fireEvent } from '@testing-library/react'
import { BayesNextWord } from './BayesNextWord'

const pick = (word: string) =>
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`^Pick "${word}"`) }))

test('starts with a uniform topic belief and the corpus-count first words', () => {
  render(<BayesNextWord />)
  expect(screen.getByRole('meter', { name: /topic is weather/ })).toHaveAttribute('aria-valuenow', '50')
  expect(screen.getByRole('meter', { name: /topic is cooking/ })).toHaveAttribute('aria-valuenow', '50')
  // Both corpora open 4 of 5 sentences with "the": P = 4/5.
  expect(screen.getByRole('button', { name: 'Pick "the": probability 80%' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Pick "a": probability 20%' })).toBeInTheDocument()
})

test('a topic-neutral word leaves the belief at 50/50', () => {
  render(<BayesNextWord />)
  pick('the')
  expect(screen.getByTestId('bayes-sentence')).toHaveTextContent('the')
  expect(screen.getByRole('meter', { name: /topic is weather/ })).toHaveAttribute('aria-valuenow', '50')
})

test('picking "rain" collapses the belief to weather, exactly as Bayes\' theorem says', () => {
  render(<BayesNextWord />)
  pick('the')
  pick('rain')
  expect(screen.getByRole('meter', { name: /topic is weather/ })).toHaveAttribute('aria-valuenow', '100')
  expect(screen.getByRole('meter', { name: /topic is cooking/ })).toHaveAttribute('aria-valuenow', '0')
  // With the topic pinned, the weather bigram takes over: rain → fell, always.
  expect(screen.getByRole('button', { name: 'Pick "fell": probability 100%' })).toBeInTheDocument()
})

test('start over clears the sentence and resets the belief', () => {
  render(<BayesNextWord />)
  pick('the')
  pick('rain')
  fireEvent.click(screen.getByRole('button', { name: /start over/i }))
  expect(screen.getByText(/pick a first word/i)).toBeInTheDocument()
  expect(screen.getByRole('meter', { name: /topic is weather/ })).toHaveAttribute('aria-valuenow', '50')
})
