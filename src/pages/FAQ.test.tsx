import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { FAQ } from './FAQ'
import { faqs } from '../data/faqs.ts'

function renderFAQ() {
  render(
    <MemoryRouter initialEntries={['/faq']}>
      <FAQ />
    </MemoryRouter>,
  )
}

// The regression this guards: answers were rendered as `{isExpanded && ...}`,
// so a collapsed accordion shipped zero answer text. That emptied the
// prerendered page for crawlers and for readers without JS.
test('every answer is in the DOM while the accordion is collapsed', () => {
  renderFAQ()
  const main = document.body
  for (const faq of faqs) {
    expect(within(main).getByText(faq.answer)).toBeInTheDocument()
  }
})

test('collapsed answers are hidden from assistive tech, expanded ones are not', async () => {
  const user = userEvent.setup()
  renderFAQ()

  const first = screen.getByRole('button', { name: faqs[0].question })
  expect(first).toHaveAttribute('aria-expanded', 'false')

  const panel = document.getElementById(first.getAttribute('aria-controls') as string)
  expect(panel).not.toBeNull()
  expect(panel).toHaveAttribute('inert')
  expect(panel).toHaveTextContent(faqs[0].answer)

  await user.click(first)
  expect(first).toHaveAttribute('aria-expanded', 'true')
  expect(panel).not.toHaveAttribute('inert')

  await user.click(first)
  expect(first).toHaveAttribute('aria-expanded', 'false')
  expect(panel).toHaveAttribute('inert')
})

test('the answer panel is never removed by toggling', async () => {
  const user = userEvent.setup()
  renderFAQ()

  const first = screen.getByRole('button', { name: faqs[0].question })
  const panelId = first.getAttribute('aria-controls') as string

  await user.click(first)
  expect(document.getElementById(panelId)).toHaveTextContent(faqs[0].answer)
  await user.click(first)
  expect(document.getElementById(panelId)).toHaveTextContent(faqs[0].answer)
})
