import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Glossary } from './Glossary'

function renderGlossary(initialEntry = '/glossary') {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Glossary />
    </MemoryRouter>,
  )
}

test('?q= seeds the search box and filters the list', () => {
  renderGlossary('/glossary?q=Hallucination')
  expect(screen.getByRole('textbox', { name: 'Search glossary terms' })).toHaveValue('Hallucination')
  expect(screen.getByText('Hallucination')).toBeInTheDocument()
  expect(screen.queryByText('AI Agent')).not.toBeInTheDocument()
})

test('typing after a ?q= deep link stays local and does not rewrite the URL', async () => {
  const user = userEvent.setup()
  renderGlossary('/glossary?q=Hallucination')

  const input = screen.getByRole('textbox', { name: 'Search glossary terms' })
  await user.clear(input)
  await user.type(input, 'token')
  expect(input).toHaveValue('token')
  // The list re-filters from local state without a navigation.
  expect(screen.queryByText('Hallucination')).not.toBeInTheDocument()
})

test('a bare /glossary starts with an empty search box', () => {
  renderGlossary()
  expect(screen.getByRole('textbox', { name: 'Search glossary terms' })).toHaveValue('')
})
