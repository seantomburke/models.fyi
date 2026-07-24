import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PromptRewriteDemo } from './PromptRewriteDemo'

describe('PromptRewriteDemo', () => {
  it('starts on the summarize task and shows both the vague and specific prompt', () => {
    render(<PromptRewriteDemo />)

    expect(screen.getByRole('radio', { name: 'Summarize' })).toBeChecked()
    expect(screen.getByText('Summarize this.')).toBeInTheDocument()
    expect(
      screen.getByText('Summarize this article in three bullet points a busy manager can skim.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'What the rewrite added' })).toHaveTextContent(
      'Names the format: three bullet points',
    )
  })

  it('uses native radio keyboard controls to switch tasks', async () => {
    const user = userEvent.setup()
    render(<PromptRewriteDemo />)

    await user.tab()
    await user.keyboard('{ArrowRight}')

    expect(screen.getByRole('radio', { name: 'Pitch' })).toBeChecked()
    expect(screen.getByText('Write a pitch.')).toBeInTheDocument()
    expect(screen.getByText(/Gives your role: a startup founder/)).toBeInTheDocument()
  })

  it('shows the email rewrite upgrades when the email task is selected', async () => {
    const user = userEvent.setup()
    render(<PromptRewriteDemo />)

    await user.click(screen.getByRole('radio', { name: 'Email' }))

    expect(screen.getByRole('radio', { name: 'Email' })).toBeChecked()
    expect(screen.getByText(/Rewrite this email to sound warm and confident/)).toBeInTheDocument()
    expect(screen.getByText('Sets a limit: under 120 words')).toBeInTheDocument()
  })
})
