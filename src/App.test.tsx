import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import App from './App'

// openchart renders to canvas/SVG with real layout measurement — not jsdom-compatible.
// The chart data logic is covered separately in lib/graph.test.ts.
vi.mock('@opendata-ai/openchart-react', () => ({
  Chart: () => <div data-testid="chart" />,
}))

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

test('home page renders the value proposition', () => {
  renderAt('/')
  expect(
    screen.getByRole('heading', { level: 1, name: /pick the right ai model/i }),
  ).toBeInTheDocument()
})

test('every nav destination renders with a heading and page title', async () => {
  const routes: Array<[string, RegExp]> = [
    ['/compare', /compare models/i],
    ['/graph', /see it on a graph/i], // lazy-loaded
    ['/calculator', /what does a conversation cost/i], // lazy-loaded
    ['/quiz', /which model should i use/i],
    ['/learn', /learn the basics/i],
  ]
  for (const [path, heading] of routes) {
    renderAt(path)
    expect(
      await screen.findByRole('heading', { level: 1, name: heading }),
    ).toBeInTheDocument()
    expect(document.title).toMatch(/models\.fyi/i)
    document.body.innerHTML = ''
  }
})

test('unknown routes show the not-found page', () => {
  renderAt('/nope')
  expect(screen.getByRole('heading', { level: 1, name: /page not found/i })).toBeInTheDocument()
})
