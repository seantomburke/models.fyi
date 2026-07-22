import { act } from '@testing-library/react'
import { prerender } from 'react-dom/static'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { preloadInitialRoute } from './routePreload.ts'
import { renderRoot } from './rootRender.tsx'
import { GraphScatter } from './components/GraphScatter.tsx'
import type { AxisOption, GraphRow } from './lib/graph.ts'

const hydrationMessages = (consoleError: ReturnType<typeof vi.spyOn>) =>
  consoleError.mock.calls
    .flat()
    .map(String)
    .filter((message: string) => /hydration|#418|did not match|server rendered/i.test(message))

test('an extensionless lazy route replaces an unrelated SPA fallback instead of hydrating it', async () => {
  const container = document.createElement('div')
  container.id = 'root'
  container.dataset.prerenderPath = '/'
  container.innerHTML = '<main><h1>Pick the right AI model</h1></main>'
  document.body.append(container)

  await preloadInitialRoute('/models.fyi/graph', '/models.fyi/')
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  let root: ReturnType<typeof renderRoot> | undefined
  await act(async () => {
    root = renderRoot(
      container,
      <main><h1>See it on a graph</h1></main>,
      '/models.fyi/graph',
      '/models.fyi/',
    )
  })

  expect(container).toHaveTextContent('See it on a graph')
  expect(container).not.toHaveTextContent('Pick the right AI model')
  expect(hydrationMessages(consoleError)).toEqual([])

  await act(async () => root?.unmount())
  consoleError.mockRestore()
  container.remove()
})

test('matching prerendered route markup is hydrated without recovery', async () => {
  const app = <main><h1>See it on a graph</h1></main>
  const { prelude } = await prerender(app)
  const container = document.createElement('div')
  container.id = 'root'
  container.dataset.prerenderPath = '/graph'
  container.innerHTML = await new Response(prelude as ReadableStream).text()
  document.body.append(container)

  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  let root: ReturnType<typeof renderRoot> | undefined
  await act(async () => {
    root = renderRoot(container, app, '/models.fyi/graph/', '/models.fyi/')
  })

  expect(container).toHaveTextContent('See it on a graph')
  expect(hydrationMessages(consoleError)).toEqual([])

  await act(async () => root?.unmount())
  consoleError.mockRestore()
  container.remove()
})

test('the responsive graph preserves its server markup during hydration', async () => {
  const xAxis: AxisOption = {
    id: 'price',
    label: 'Price',
    axisTitle: 'Price ($)',
    getValue: () => undefined,
  }
  const yAxis: AxisOption = {
    id: 'score',
    label: 'Score',
    axisTitle: 'Score (%)',
    getValue: () => undefined,
  }
  const rows: GraphRow[] = [
    { model: 'Alpha', modelId: 'alpha', provider: 'OpenAI', family: 'Alpha', series: 'OpenAI', x: 2, y: 80 },
    { model: 'Beta', modelId: 'beta', provider: 'OpenAI', family: 'Beta', series: 'OpenAI', x: 4, y: 90 },
  ]
  // The card's model-page link needs a router, during prerender too — the
  // real page always renders inside one.
  const graph = (
    <MemoryRouter initialEntries={['/graph']}>
      <GraphScatter
        rows={rows}
        xAxis={xAxis}
        yAxis={yAxis}
        connections="provider"
        selected={null}
        onPointSelected={() => {}}
        onDismiss={() => {}}
      />
    </MemoryRouter>
  )
  const { prelude } = await prerender(graph)
  const container = document.createElement('div')
  container.id = 'root'
  container.dataset.prerenderPath = '/graph'
  container.innerHTML = await new Response(prelude as ReadableStream).text()
  const serverMarkup = container.innerHTML
  document.body.append(container)

  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  let root: ReturnType<typeof renderRoot> | undefined
  await act(async () => {
    root = renderRoot(container, graph, '/models.fyi/graph/', '/models.fyi/')
  })

  expect(container.innerHTML).toBe(serverMarkup)
  expect(hydrationMessages(consoleError)).toEqual([])

  await act(async () => root?.unmount())
  consoleError.mockRestore()
  container.remove()
})
