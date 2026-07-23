import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

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

/**
 * The chart runtime is cached at module scope so both Calculator charts share
 * one download. That cache would otherwise leak across tests and hide the
 * placeholder, so each test imports a fresh copy of the module.
 */
async function importFreshChart() {
  vi.resetModules()
  return (await import('./ThemeAwareChart')).ThemeAwareChart
}

let ThemeAwareChart: Awaited<ReturnType<typeof importFreshChart>>

beforeEach(async () => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
  ThemeAwareChart = await importFreshChart()
})

/**
 * Drives the deferred-load path deliberately: jsdom has no
 * IntersectionObserver, so tests that need the observer must install one.
 */
function stubIntersectionObserver() {
  const observed: Element[] = []
  let trigger: (() => void) | undefined

  class FakeIntersectionObserver {
    constructor(callback: IntersectionObserverCallback) {
      trigger = () =>
        callback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        )
    }
    observe(el: Element) {
      observed.push(el)
    }
    disconnect() {}
    unobserve() {}
    takeRecords() {
      return []
    }
  }

  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  return {
    observed,
    scrollIntoView: () => act(() => trigger?.()),
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

test('shows a stable accessible placeholder until the chart scrolls into view', async () => {
  const io = stubIntersectionObserver()
  render(<ThemeAwareChart spec={{} as never} deferUntilInteraction />)

  expect(screen.getByRole('status', { name: 'Interactive chart not loaded' })).toBeInTheDocument()
  expect(screen.queryByText('Chart theme: off')).not.toBeInTheDocument()

  io.scrollIntoView()
  expect(await screen.findByText('Chart theme: off')).toBeInTheDocument()
})

test('a deferred chart still loads from the explicit button without scrolling', async () => {
  stubIntersectionObserver()
  const user = userEvent.setup()
  render(<ThemeAwareChart spec={{} as never} deferUntilInteraction />)

  await user.click(screen.getByRole('button', { name: 'Load chart' }))
  expect(await screen.findByText('Chart theme: off')).toBeInTheDocument()
})

test('observes the chart placeholder itself, not a global scroll target', () => {
  const io = stubIntersectionObserver()
  render(<ThemeAwareChart spec={{} as never} deferUntilInteraction />)

  // The regression: gating on window scroll left a chart that renders inside
  // the initial viewport stuck on its placeholder forever.
  expect(io.observed).toHaveLength(1)
  expect(io.observed[0]).toBe(screen.getByRole('status', { name: 'Interactive chart not loaded' }))
})

test('loads immediately when IntersectionObserver is unavailable', async () => {
  render(<ThemeAwareChart spec={{} as never} deferUntilInteraction />)
  expect(await screen.findByText('Chart theme: off')).toBeInTheDocument()
})

test('updates an existing chart when the site theme changes', async () => {
  render(<ThemeAwareChart spec={{} as never} />)
  await screen.findByText('Chart theme: off')
  expect(screen.getByText('Chart theme: off')).toBeInTheDocument()

  act(() => {
    localStorage.setItem('models-wtf-dark-mode', 'true')
    window.dispatchEvent(new Event('models-wtf-dark-mode-change'))
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
