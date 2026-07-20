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
