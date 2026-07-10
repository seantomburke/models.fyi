import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout.tsx'
import { Home } from './pages/Home.tsx'
import { Compare } from './pages/Compare.tsx'
import { Placeholder } from './pages/Placeholder.tsx'

// The graph page pulls in the charting library — keep it off the main bundle.
const Graph = lazy(() => import('./pages/Graph.tsx').then((m) => ({ default: m.Graph })))

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="compare" element={<Compare />} />
        <Route
          path="graph"
          element={
            <Suspense fallback={<p className="text-sm text-fg-muted">Loading graph…</p>}>
              <Graph />
            </Suspense>
          }
        />
        <Route
          path="quiz"
          element={
            <Placeholder
              title="Which model should I use?"
              metaTitle="Which AI model should I use? — Models.fyi"
              description="Answer a few plain-language questions and get an AI model recommendation with the reasoning spelled out."
            />
          }
        />
        <Route
          path="learn"
          element={
            <Placeholder
              title="Learn the basics"
              metaTitle="What is an AI model? — Models.fyi"
              description="What is an LLM? What is GPT? What is a context window? The basics of AI models, explained like you're five."
            />
          }
        />
        <Route
          path="*"
          element={
            <Placeholder
              title="Page not found"
              metaTitle="Not found — Models.fyi"
              description="That page doesn't exist. Head back to the Models.fyi home page to compare AI models."
            />
          }
        />
      </Route>
    </Routes>
  )
}

export default App
