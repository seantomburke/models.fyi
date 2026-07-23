import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CodingModelPicker } from './CodingModelPicker'

describe('CodingModelPicker', () => {
  it('starts with a balanced recommendation for a quick change', () => {
    render(<CodingModelPicker />)

    expect(screen.getByRole('radio', { name: /a quick change/i })).toBeChecked()
    expect(screen.getByRole('heading', { level: 4, name: 'Claude Sonnet 5' })).toBeInTheDocument()
    expect(screen.getByText('82.1%')).toBeInTheDocument()
  })

  it('changes the recommendation when a reader selects harder coding work', async () => {
    const user = userEvent.setup()
    render(<CodingModelPicker />)

    await user.click(screen.getByRole('radio', { name: /a hard system problem/i }))

    expect(screen.getByRole('radio', { name: /a hard system problem/i })).toBeChecked()
    expect(screen.getByRole('heading', { level: 4, name: 'Claude Fable 5' })).toBeInTheDocument()
    expect(screen.getByText('95%')).toBeInTheDocument()
  })
})
