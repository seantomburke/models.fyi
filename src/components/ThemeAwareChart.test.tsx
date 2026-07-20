import { act, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { ThemeAwareChart } from './ThemeAwareChart'

vi.mock('@opendata-ai/openchart-react', () => ({
  Chart: ({ darkMode }: { darkMode: string }) => <div>Chart theme: {darkMode}</div>,
}))

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
})

test('updates an existing chart when the site theme changes', () => {
  render(<ThemeAwareChart spec={{} as never} />)
  expect(screen.getByText('Chart theme: off')).toBeInTheDocument()

  act(() => {
    localStorage.setItem('models-fyi-dark-mode', 'true')
    window.dispatchEvent(new Event('models-fyi-dark-mode-change'))
  })

  expect(screen.getByText('Chart theme: force')).toBeInTheDocument()
})
