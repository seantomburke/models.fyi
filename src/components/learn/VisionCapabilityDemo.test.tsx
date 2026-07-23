import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VisionCapabilityDemo } from './VisionCapabilityDemo'
import { SCENARIOS, KIND_LABEL } from './visionModel'

test('starts on the receipt scenario and lists its findings', () => {
  render(<VisionCapabilityDemo />)
  expect(screen.getByRole('img', { name: /receipt/i })).toBeInTheDocument()
  expect(
    screen.getByRole('listitem', { name: /read text: reads "blue bottle coffee" at the top/i }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('listitem', { name: /extracted data: pulls the total: \$12\.75/i }),
  ).toBeInTheDocument()
})

test('switching scenarios swaps both the picture and the findings', async () => {
  const user = userEvent.setup()
  render(<VisionCapabilityDemo />)

  await user.click(screen.getByRole('button', { name: /a bar chart/i }))
  expect(screen.getByRole('img', { name: /bar chart of quarterly revenue/i })).toBeInTheDocument()
  expect(
    screen.getByRole('listitem', { name: /extracted data: q3 is the tallest bar/i }),
  ).toBeInTheDocument()
  // The receipt's findings are gone.
  expect(
    screen.queryByRole('listitem', { name: /blue bottle coffee/i }),
  ).not.toBeInTheDocument()
})

test('the street scenario reports spotted objects', async () => {
  const user = userEvent.setup()
  render(<VisionCapabilityDemo />)

  await user.click(screen.getByRole('button', { name: /a street photo/i }))
  expect(
    screen.getByRole('listitem', { name: /spotted object: spots two people crossing/i }),
  ).toBeInTheDocument()
})

test('every receipt finding renders with a readable kind label', () => {
  render(<VisionCapabilityDemo />)
  const receipt = SCENARIOS[0]
  // Each finding's full "<kind>: <label>" sentence is an accessible name.
  for (const finding of receipt.findings) {
    const name = `${KIND_LABEL[finding.kind]}: ${finding.label}`
    expect(screen.getByRole('listitem', { name })).toBeInTheDocument()
  }
})
