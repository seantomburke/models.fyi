import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

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

test('every nav destination renders with a heading and page title', () => {
  const routes: Array<[string, RegExp]> = [
    ['/compare', /compare models/i],
    ['/graph', /graph/i],
    ['/quiz', /which model should i use/i],
    ['/learn', /learn the basics/i],
  ]
  for (const [path, heading] of routes) {
    renderAt(path)
    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
    expect(document.title).toMatch(/models\.fyi/i)
    document.body.innerHTML = ''
  }
})

test('unknown routes show the not-found page', () => {
  renderAt('/nope')
  expect(screen.getByRole('heading', { level: 1, name: /page not found/i })).toBeInTheDocument()
})
