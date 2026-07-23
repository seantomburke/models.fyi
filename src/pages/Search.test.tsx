import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { Search } from './Search'
import { models } from '../data/index.ts'

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname + location.search}</div>
}

function renderSearch(initialEntry = '/search') {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Search />
      <LocationProbe />
    </MemoryRouter>,
  )
}

test('result cards link to the model detail page, not /compare', () => {
  renderSearch()
  for (const model of models) {
    const heading = screen.getByRole('heading', { level: 3, name: model.name })
    expect(heading.closest('a')).toHaveAttribute('href', `/models/${model.id}`)
  }
})

test('a query in the URL filters results and populates the input', () => {
  renderSearch('/search?q=claude')
  expect(screen.getByRole('textbox', { name: 'Search models' })).toHaveValue('claude')
  expect(screen.getByText('Claude Opus 4.8')).toBeInTheDocument()
  expect(screen.queryByText('GPT-5.6 Sol')).not.toBeInTheDocument()
})

test('typing pushes the query into the URL', async () => {
  const user = userEvent.setup()
  renderSearch()
  expect(screen.getByTestId('location')).toHaveTextContent('/search')

  await user.type(screen.getByRole('textbox', { name: 'Search models' }), 'claude')
  expect(screen.getByTestId('location')).toHaveTextContent('/search?q=claude')
})

test('clearing the query drops the param from the URL', async () => {
  const user = userEvent.setup()
  renderSearch('/search?q=claude')
  await user.click(screen.getByRole('button', { name: 'Clear search' }))
  expect(screen.getByTestId('location').textContent).toBe('/search')
})

test('a provider-name query shows the Providers section linking to the provider page', () => {
  renderSearch('/search?q=anthropic')
  expect(screen.getByRole('heading', { level: 2, name: 'Providers' })).toBeInTheDocument()
  const headings = screen.getAllByRole('heading', { level: 3, name: 'Anthropic' })
  const hrefs = headings.map((h) => h.closest('a')?.getAttribute('href'))
  expect(hrefs).toContain('/providers/anthropic')
})

test('a glossary-term query shows the Glossary section with a deep link', () => {
  renderSearch('/search?q=hallucination')
  expect(screen.getByRole('heading', { level: 2, name: 'Glossary' })).toBeInTheDocument()
  const heading = screen.getByRole('heading', { level: 3, name: 'Hallucination' })
  expect(heading.closest('a')).toHaveAttribute('href', expect.stringContaining('/glossary?q='))
})

test('a topic query shows the Learn section linking to the topic', () => {
  renderSearch('/search?q=context window')
  expect(screen.getByRole('heading', { level: 2, name: 'Learn' })).toBeInTheDocument()
  // The FAQ shares this exact question text, so match on the learn link.
  const headings = screen.getAllByRole('heading', { level: 3, name: 'What is a context window?' })
  const hrefs = headings.map((h) => h.closest('a')?.getAttribute('href'))
  expect(hrefs).toContain('/learn/what-is-a-context-window')
})

test('an FAQ query shows the FAQ section', () => {
  renderSearch('/search?q=open-source models')
  expect(screen.getByRole('heading', { level: 2, name: 'FAQ' })).toBeInTheDocument()
  const heading = screen.getByRole('heading', { level: 3, name: 'Can I use open-source models?' })
  expect(heading.closest('a')).toHaveAttribute('href', expect.stringContaining('/faq?q='))
})

test('content-only matches do not show the no-results block', () => {
  renderSearch('/search?q=hallucination')
  expect(screen.queryByText(/No results found/)).not.toBeInTheDocument()
})

test('a nonsense query shows the no-results block', () => {
  renderSearch('/search?q=zzzznonexistent123')
  expect(screen.getByText(/No results found matching/)).toBeInTheDocument()
})
