import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SceneNetworkDiagram } from './SceneNetworkDiagram'

test('renders the network with two named hidden nodes', () => {
  render(<SceneNetworkDiagram />)
  const svg = screen.getByRole('img', { name: /neural network/i })
  expect(within(svg).getByText('friendliness')).toBeInTheDocument()
  expect(within(svg).getByText('role')).toBeInTheDocument()
})

test('picking a current word updates the hidden values', async () => {
  const user = userEvent.setup()
  render(<SceneNetworkDiagram />)
  // Bob is unfriendly (-1) and a person (-1); both hidden nodes should read -1.0.
  await user.click(screen.getByRole('button', { name: /^Bob$/ }))
  const svg = screen.getByRole('img', { name: /neural network/i })
  expect(within(svg).getAllByText('-1.0').length).toBeGreaterThanOrEqual(2)
})

test('shows the unfriendly verb as the top verb after Bob', async () => {
  const user = userEvent.setup()
  render(<SceneNetworkDiagram />)
  await user.click(screen.getByRole('button', { name: /^Bob$/ }))
  const svg = screen.getByRole('img', { name: /neural network/i })
  // "ignores" carries a higher percentage than "greets" after Bob.
  const ignores = within(svg).getByText(/^ignores \d+%$/).textContent ?? ''
  const greets = within(svg).getByText(/^greets \d+%$/).textContent ?? ''
  const pct = (s: string) => Number(/(\d+)%/.exec(s)?.[1])
  expect(pct(ignores)).toBeGreaterThan(pct(greets))
})

test('expanding adds Charlie and sees to the input words', async () => {
  const user = userEvent.setup()
  render(<SceneNetworkDiagram />)
  expect(screen.queryByRole('button', { name: /^Charlie$/ })).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /add charlie/i }))
  expect(screen.getByRole('button', { name: /^Charlie$/ })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /^sees$/ })).toBeInTheDocument()
})
