import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { ThemeAwareChart } from './ThemeAwareChart'

vi.mock('@opendata-ai/openchart-react', () => ({
  Chart: ({ darkMode }: { darkMode: string }) => (
    <div>
      Chart theme: {darkMode}
      <svg className="oc-chart">
        <line className="oc-mark-rule" data-mark-id={`rule-${darkMode}`} aria-label="decorative connection" />
        <circle data-mark-id={`point-${darkMode}`} aria-label={`Test model, ${darkMode}`} />
        <path data-mark-id="area-0" aria-label="A future valid labeled mark" />
      </svg>
    </div>
  ),
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
  await waitFor(() => {
    expect(document.querySelector('circle[data-mark-id="point-force"]')).toHaveAttribute(
      'role',
      'img',
    )
  })
})

test('gives named points valid roles and hides decorative rule marks', async () => {
  const { container } = render(<ThemeAwareChart spec={{} as never} />)
  await screen.findByText('Chart theme: off')

  const point = container.querySelector('circle[data-mark-id="point-off"]')
  expect(point).toHaveAttribute('role', 'img')
  expect(point).toHaveAttribute('aria-label', 'Test model, off')

  const rule = container.querySelector('line[data-mark-id="rule-off"]')
  expect(rule).toHaveAttribute('aria-hidden', 'true')
  expect(rule).not.toHaveAttribute('aria-label')

  const futureMark = container.querySelector('path[data-mark-id="area-0"]')
  expect(futureMark).toHaveAttribute('aria-label', 'A future valid labeled mark')
  expect(futureMark).not.toHaveAttribute('aria-hidden')

  const lateRule = document.createElementNS('http://www.w3.org/2000/svg', 'line')
  lateRule.classList.add('oc-mark-rule')
  lateRule.setAttribute('data-mark-id', 'rule-1')
  container.querySelector('svg')!.append(lateRule)
  lateRule.setAttribute('aria-label', 'late decorative connection')

  await waitFor(() => expect(lateRule).toHaveAttribute('aria-hidden', 'true'))
  expect(lateRule).not.toHaveAttribute('aria-label')
})
