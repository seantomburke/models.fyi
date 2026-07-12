import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Quiz } from './Quiz'

function renderQuiz() {
  render(
    <MemoryRouter>
      <Quiz />
    </MemoryRouter>,
  )
}

test('the four-questions subtitle only shows in forward mode', async () => {
  const user = userEvent.setup()
  renderQuiz()
  expect(screen.getByText(/four quick questions/i)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Start from a model' }))
  expect(screen.queryByText(/four quick questions/i)).not.toBeInTheDocument()
  expect(screen.getByText(/pick a model and we'll tell you/i)).toBeInTheDocument()
})

test('completing the quiz shows a result with correct grammar, plain pricing, and scrolls to it', async () => {
  const scrollSpy = vi.spyOn(Element.prototype, 'scrollIntoView')
  const user = userEvent.setup()
  renderQuiz()
  await user.click(screen.getByRole('button', { name: /Everyday curious person/ }))
  await user.click(screen.getByRole('button', { name: /Chat and learn things/ }))
  await user.click(screen.getByRole('button', { name: /Good value/ }))
  await user.click(screen.getByRole('button', { name: 'No preference' }))

  // "an everyday", not "a everyday".
  const heading = screen.getByText(/our pick for an everyday curious person/i)
  expect(heading).toBeInTheDocument()
  // The provider line carries the company logo.
  const card = heading.closest('div')!
  expect(card.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument()
  // The price line speaks plain language, with rates in a parenthetical.
  expect(screen.getByText(/cheap to run/i)).toBeInTheDocument()
  expect(screen.queryByText(/per 1M tokens ·/)).not.toBeInTheDocument()
  expect(scrollSpy).toHaveBeenCalled()
  scrollSpy.mockRestore()
})

test('function-named roles read as people in the result heading', async () => {
  const user = userEvent.setup()
  renderQuiz()
  await user.click(screen.getByRole('button', { name: /Customer support/ }))
  await user.click(screen.getByRole('button', { name: /Chat and learn things/ }))
  await user.click(screen.getByRole('button', { name: /Good value/ }))
  await user.click(screen.getByRole('button', { name: 'No preference' }))

  // "a customer support agent", not "a customer support".
  expect(screen.getByText(/our pick for a customer support agent who wants to/i)).toBeInTheDocument()
})

test('reverse mode shows provider, pricing, and links for the chosen model', async () => {
  const user = userEvent.setup()
  renderQuiz()
  await user.click(screen.getByRole('button', { name: 'Start from a model' }))
  await user.click(screen.getByRole('button', { name: 'GLM-5.2' }))

  expect(screen.getByText(/by\s+Z\.ai \(GLM\)/)).toBeInTheDocument()
  expect(screen.getByText(/free to download and run on your own computer/i)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /comparison table/i })).toHaveAttribute('href', '/compare')
  expect(screen.getByRole('link', { name: /graph/i })).toHaveAttribute('href', '/graph')
})

test('the free budget chip names open source honestly', async () => {
  const user = userEvent.setup()
  renderQuiz()
  await user.click(screen.getByRole('button', { name: /Student/ }))
  await user.click(screen.getByRole('button', { name: /Translate text/ }))
  expect(screen.getByRole('button', { name: /Free \/ open source/ })).toBeInTheDocument()
})
