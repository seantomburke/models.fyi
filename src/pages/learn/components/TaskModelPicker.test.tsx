import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WritingModelPicker, ResearchModelPicker } from './TaskModelPicker'

describe('WritingModelPicker', () => {
  it('starts with a balanced recommendation for an everyday draft', () => {
    render(<WritingModelPicker />)

    expect(screen.getByRole('radio', { name: /an everyday draft/i })).toBeChecked()
    expect(screen.getByRole('heading', { level: 4, name: 'Claude Sonnet 5' })).toBeInTheDocument()
    expect(screen.getByText('91.1%')).toBeInTheDocument()
  })

  it('changes the recommendation when a reader selects a polished piece', async () => {
    const user = userEvent.setup()
    render(<WritingModelPicker />)

    await user.click(screen.getByRole('radio', { name: /a polished piece/i }))

    expect(screen.getByRole('radio', { name: /a polished piece/i })).toBeChecked()
    expect(screen.getByRole('heading', { level: 4, name: 'Claude Opus 4.8' })).toBeInTheDocument()
    expect(screen.getByText('93.6%')).toBeInTheDocument()
  })
})

describe('ResearchModelPicker', () => {
  it('starts with a fast recommendation for a quick scan', () => {
    render(<ResearchModelPicker />)

    expect(screen.getByRole('radio', { name: /a quick scan/i })).toBeChecked()
    expect(screen.getByRole('heading', { level: 4, name: 'GPT-5.6 Terra' })).toBeInTheDocument()
    expect(screen.getByText('92.9%')).toBeInTheDocument()
  })

  it('recommends the premium model for hard reasoning', async () => {
    const user = userEvent.setup()
    render(<ResearchModelPicker />)

    await user.click(screen.getByRole('radio', { name: /hard reasoning/i }))

    expect(screen.getByRole('radio', { name: /hard reasoning/i })).toBeChecked()
    expect(screen.getByRole('heading', { level: 4, name: 'Claude Fable 5' })).toBeInTheDocument()
    expect(screen.getByText('92.6%')).toBeInTheDocument()
  })
})
