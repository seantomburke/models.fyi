import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { Layout } from './components/Layout.tsx'
import { Home } from './pages/Home.tsx'
import { Compare } from './pages/Compare.tsx'
import { Quiz } from './pages/Quiz.tsx'
import { Learn } from './pages/learn/Learn.tsx'
import { LearnTopic } from './pages/learn/LearnTopic.tsx'
import { NotFound } from './pages/NotFound.tsx'
import { GraphSkeleton } from './components/GraphSkeleton.tsx'
import { CalculatorSkeleton } from './components/CalculatorSkeleton.tsx'

// These pages pull in the charting library (and the calculator a tokenizer) —
// keep them off the main bundle.
const Graph = lazy(() => import('./pages/Graph.tsx').then((m) => ({ default: m.Graph })))
const Calculator = lazy(() =>
  import('./pages/Calculator.tsx').then((m) => ({ default: m.Calculator })),
)

function App() {
  return (
    <ErrorBoundary>
      <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="compare" element={<Compare />} />
        <Route
          path="graph"
          element={
            <Suspense fallback={<GraphSkeleton />}>
              <Graph />
            </Suspense>
          }
        />
        <Route
          path="calculator"
          element={
            <Suspense fallback={<CalculatorSkeleton />}>
              <Calculator />
            </Suspense>
          }
        />
        <Route path="quiz" element={<Quiz />} />
        <Route path="learn" element={<Learn />} />
        <Route path="learn/:slug" element={<LearnTopic />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      </Routes>
    </ErrorBoundary>
  )
}

export default App
