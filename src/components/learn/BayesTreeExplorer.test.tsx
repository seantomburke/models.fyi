import { render, screen, fireEvent } from '@testing-library/react'
import { BayesTreeExplorer } from './BayesTreeExplorer'

test('renders the default worked example: posterior is exactly 1/12 ≈ 8.3%', () => {
  render(<BayesTreeExplorer />)
  // 9 sick-positives out of 108 positives per 1000 people.
  expect(screen.getByTestId('bayes-posterior')).toHaveTextContent('8.3%')
  expect(screen.getByText(/only 9 of them are sick/)).toBeInTheDocument()
})

test('the three probabilities are labeled sliders', () => {
  render(<BayesTreeExplorer />)
  expect(screen.getByRole('slider', { name: 'P(sick): the prior' })).toHaveValue('0.01')
  expect(screen.getByRole('slider', { name: 'P(positive | sick): sensitivity' })).toHaveValue('0.9')
  expect(screen.getByRole('slider', { name: 'P(positive | healthy): false-positive rate' })).toHaveValue('0.1')
})

test('dragging the prior slider updates the posterior via Bayes\' theorem', () => {
  render(<BayesTreeExplorer />)
  // Prior 50%, sensitivity 90%, FPR 10%:
  // posterior = 0.45 / (0.45 + 0.05) = 0.9.
  fireEvent.change(screen.getByRole('slider', { name: 'P(sick): the prior' }), { target: { value: '0.5' } })
  expect(screen.getByTestId('bayes-posterior')).toHaveTextContent('90%')
})

test('a perfect test drives the posterior to 100%', () => {
  render(<BayesTreeExplorer />)
  fireEvent.change(screen.getByRole('slider', { name: 'P(positive | healthy): false-positive rate' }), {
    target: { value: '0' },
  })
  expect(screen.getByTestId('bayes-posterior')).toHaveTextContent('100%')
})

test('the tree SVG announces the current numbers to screen readers', () => {
  render(<BayesTreeExplorer />)
  expect(
    screen.getByRole('img', { name: /prior 1\.0%, sensitivity 90%, false-positive rate 10%, posterior 8\.3%/ }),
  ).toBeInTheDocument()
})
