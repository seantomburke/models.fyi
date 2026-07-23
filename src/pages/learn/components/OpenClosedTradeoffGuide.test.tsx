import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OpenClosedTradeoffGuide } from './OpenClosedTradeoffGuide'

describe('OpenClosedTradeoffGuide', () => {
  it('starts by guiding readers with deployment control toward open weights', () => {
    render(<OpenClosedTradeoffGuide />)

    expect(screen.getByRole('radio', { name: /keep the model and data under your control/i })).toBeChecked()
    expect(screen.getByRole('heading', { level: 4, name: /open-weights model is a strong fit/i })).toBeInTheDocument()
  })

  it('updates the guidance when a reader prioritizes a managed service', async () => {
    const user = userEvent.setup()
    render(<OpenClosedTradeoffGuide />)

    await user.click(screen.getByRole('radio', { name: /start quickly with a managed service/i }))

    expect(screen.getByRole('radio', { name: /start quickly with a managed service/i })).toBeChecked()
    expect(screen.getByRole('heading', { level: 4, name: /closed model is a strong fit/i })).toBeInTheDocument()
  })
})
