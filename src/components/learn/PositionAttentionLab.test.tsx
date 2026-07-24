import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PositionAttentionLab } from './PositionAttentionLab'

test('shows position-specific predictions and generation controls', async () => {
  const user = userEvent.setup()
  render(<PositionAttentionLab />)
  expect(screen.getByLabelText('subject predictions')).toHaveTextContent('ignores')
  expect(screen.getByLabelText('object predictions')).toHaveTextContent('.')
  await user.click(screen.getByRole('button', { name: 'Alice as subject' }))
  expect(screen.getByLabelText('subject predictions')).toHaveTextContent('greets')
  await user.click(screen.getByRole('button', { name: 'Generate' }))
  expect(screen.getByTestId('generated-sentence')).toHaveTextContent(/Bob ignores Alice\./)
})
