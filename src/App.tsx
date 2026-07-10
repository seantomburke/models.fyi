import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout.tsx'
import { Home } from './pages/Home.tsx'
import { Compare } from './pages/Compare.tsx'
import { Quiz } from './pages/Quiz.tsx'
import { Learn } from './pages/learn/Learn.tsx'
import { LearnTopic } from './pages/learn/LearnTopic.tsx'
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
        <Route path="quiz" element={<Quiz />} />
        <Route path="learn" element={<Learn />} />
        <Route path="learn/:slug" element={<LearnTopic />} />
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
