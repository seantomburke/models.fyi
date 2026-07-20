import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { ThemeAwareChart } from './ThemeAwareChart'

vi.mock('@opendata-ai/openchart-react', () => ({
  Chart: ({ darkMode }: { darkMode: string }) => <div>Chart theme: {darkMode}</div>,
}))

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
})

test('shows a stable accessible placeholder while the chart runtime loads', async () => {
  const user = userEvent.setup()
  render(<ThemeAwareChart spec={{} as never} deferUntilInteraction />)

  expect(screen.getByRole('status', { name: 'Interactive chart not loaded' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Load chart' }))
  expect(await screen.findByText('Chart theme: off')).toBeInTheDocument()
})

test('updates an existing chart when the site theme changes', async () => {
  render(<ThemeAwareChart spec={{} as never} />)
  await screen.findByText('Chart theme: off')
  expect(screen.getByText('Chart theme: off')).toBeInTheDocument()

  act(() => {
    localStorage.setItem('models-fyi-dark-mode', 'true')
    window.dispatchEvent(new Event('models-fyi-dark-mode-change'))
  })

  expect(screen.getByText('Chart theme: force')).toBeInTheDocument()
})
