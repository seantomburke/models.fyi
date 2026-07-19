import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { axe } from 'vitest-axe'
import type { AxeResults } from 'axe-core'
import { Home } from '../pages/Home.tsx'
import { Compare } from '../pages/Compare.tsx'
import { FAQ } from '../pages/FAQ.tsx'
import { Glossary } from '../pages/Glossary.tsx'
import { Learn } from '../pages/learn/Learn.tsx'
import { LearnTopic } from '../pages/learn/LearnTopic.tsx'
import { ModelDetail } from '../pages/models/ModelDetail.tsx'
import { models } from '../data/index.ts'

// axe needs a real element in the document to resolve colour and ancestry rules;
// Testing Library's default container is already attached, so pass it straight through.
async function expectNoViolations(container: HTMLElement) {
  const results = (await axe(container)) as AxeResults
  const messages = results.violations.map(
    (v) => `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.map((n) => n.html).join('\n  ')}`,
  )
  expect(messages).toEqual([])
}

function renderAt(path: string, element: React.ReactElement, routePath = path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={routePath} element={element} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
})

test('Home has no accessibility violations', async () => {
  const { container } = renderAt('/', <Home />)
  await expectNoViolations(container)
})

test('Compare has no accessibility violations', async () => {
  const { container } = renderAt('/compare', <Compare />)
  await expectNoViolations(container)
})

test('Glossary has no accessibility violations', async () => {
  const { container } = renderAt('/glossary', <Glossary />)
  await expectNoViolations(container)
})

test('FAQ has no accessibility violations', async () => {
  const { container } = renderAt('/faq', <FAQ />)
  await expectNoViolations(container)
})

test('Learn index has no accessibility violations', async () => {
  const { container } = renderAt('/learn', <Learn />)
  await expectNoViolations(container)
})

test('a Learn topic has no accessibility violations', async () => {
  const { container } = renderAt('/learn/what-is-a-token', <LearnTopic />, '/learn/:slug')
  await expectNoViolations(container)
})

test('a model detail page has no accessibility violations', async () => {
  const { container } = renderAt(`/models/${models[0].id}`, <ModelDetail />, '/models/:id')
  await expectNoViolations(container)
})
