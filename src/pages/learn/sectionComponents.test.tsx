import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { LearnTopic } from './LearnTopic'
import { topics } from './topics'
import { sectionComponents } from './sectionComponents'

// Every key must point at a live `<slug>::<heading>` pair, mirroring the
// topicProse guard: a renamed heading would silently drop the demo.
test('every registered section component resolves to a real topic section', () => {
  const live = new Set(
    topics.flatMap((t) => t.sections.map((s) => `${t.slug}::${s.heading}`)),
  )
  expect(Object.keys(sectionComponents).filter((key) => !live.has(key))).toEqual([])
})

test('the Bayesian statistics page mounts both interactive demos', () => {
  render(
    <MemoryRouter initialEntries={['/learn/bayesian-statistics']}>
      <Routes>
        <Route path="/learn/:slug" element={<LearnTopic />} />
      </Routes>
    </MemoryRouter>,
  )
  expect(screen.getByRole('heading', { level: 1, name: 'What is Bayesian statistics?' })).toBeInTheDocument()
  // The probability tree, showing the default 1-in-12 worked example.
  expect(screen.getByTestId('bayes-posterior')).toHaveTextContent('8.3%')
  // The next-word demo, waiting for a first word.
  expect(screen.getByText(/pick a first word/i)).toBeInTheDocument()
})

test('the coding guide mounts the model picker at the first coding section', () => {
  render(
    <MemoryRouter initialEntries={['/learn/best-model-for-coding']}>
      <Routes>
        <Route path="/learn/:slug" element={<LearnTopic />} />
      </Routes>
    </MemoryRouter>,
  )

  expect(screen.getByRole('heading', { level: 3, name: 'Match the model to the job' })).toBeInTheDocument()
  expect(screen.getByRole('radio', { name: /a quick change/i })).toBeChecked()
})
