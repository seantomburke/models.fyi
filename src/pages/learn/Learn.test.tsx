import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Learn } from './Learn'
import { LearnTopic } from './LearnTopic'
import { topics } from './topics'

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/:slug" element={<LearnTopic />} />
      </Routes>
    </MemoryRouter>,
  )
}

test('index links every topic', () => {
  renderAt('/learn')
  for (const t of topics) {
    expect(screen.getByRole('link', { name: new RegExp(t.question, 'i') })).toHaveAttribute(
      'href',
      `/learn/${t.slug}`,
    )
  }
})

test('every topic page renders with unique SEO meta and cross-links', () => {
  const seenTitles = new Set<string>()
  for (const t of topics) {
    renderAt(`/learn/${t.slug}`)
    expect(screen.getByRole('heading', { level: 1, name: t.question })).toBeInTheDocument()
    expect(document.title).toBe(t.metaTitle)
    expect(seenTitles.has(t.metaTitle)).toBe(false)
    seenTitles.add(t.metaTitle)
    // Cross-links to the interactive pages.
    expect(screen.getByRole('link', { name: /recommendation in 4 questions/i })).toBeInTheDocument()
    document.body.innerHTML = ''
  }
})

test('unknown topic slug shows not-found with a way back', () => {
  renderAt('/learn/nope')
  expect(screen.getByRole('heading', { level: 1, name: /page not found/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /see all topics/i })).toBeInTheDocument()
})

test('topics use semantic heading structure', () => {
  renderAt(`/learn/${topics[0].slug}`)
  expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThan(1)
})
