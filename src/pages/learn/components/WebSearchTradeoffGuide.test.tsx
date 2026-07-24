import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WebSearchTradeoffGuide } from './WebSearchTradeoffGuide'

describe('WebSearchTradeoffGuide', () => {
  it('starts with a current question and shows the extra search path', () => {
    render(<WebSearchTradeoffGuide />)

    expect(screen.getByRole('radio', { name: /today's weather/i })).toBeChecked()
    expect(screen.getByRole('heading', { level: 4, name: 'Use web search' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Answer path' })).toHaveTextContent('Search the web')
    expect(screen.getByText(/can take more time/i)).toBeInTheDocument()
  })

  it('uses native radio keyboard controls to select a durable question', async () => {
    const user = userEvent.setup()
    render(<WebSearchTradeoffGuide />)

    await user.tab()
    await user.keyboard('{ArrowRight}')

    expect(screen.getByRole('radio', { name: /a history question/i })).toBeChecked()
    expect(screen.getByRole('heading', { level: 4, name: 'Skip web search' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Answer path' })).toHaveTextContent(
      'Answer from learned knowledge',
    )
    expect(screen.queryByText(/can take more time/i)).not.toBeInTheDocument()
  })

  it('updates the screen-reader announcement when a recent announcement is selected', async () => {
    const user = userEvent.setup()
    render(<WebSearchTradeoffGuide />)

    await user.click(screen.getByRole('radio', { name: /a recent announcement/i }))

    expect(screen.getByRole('radio', { name: /a recent announcement/i })).toBeChecked()
    expect(screen.getByText(/newer than the model's training data/i)).toBeInTheDocument()
    expect(screen.getByText(/search charges to the request/i)).toBeInTheDocument()
  })
})
