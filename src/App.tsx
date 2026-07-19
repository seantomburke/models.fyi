import { lazy, Suspense, useState, useCallback } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { Layout } from './components/Layout.tsx'
import { ShortcutsDialog } from './components/ShortcutsDialog.tsx'
import { Home } from './pages/Home.tsx'
import { Compare } from './pages/Compare.tsx'
import { Quiz } from './pages/Quiz.tsx'
import { Learn } from './pages/learn/Learn.tsx'
import { LearnTopic } from './pages/learn/LearnTopic.tsx'
import { FAQ } from './pages/FAQ.tsx'
import { Glossary } from './pages/Glossary.tsx'
import { Search } from './pages/Search.tsx'
import { WhatsNew } from './pages/WhatsNew.tsx'
import { ModelDetail } from './pages/models/ModelDetail.tsx'
import { NotFound } from './pages/NotFound.tsx'
import { GraphSkeleton } from './components/GraphSkeleton.tsx'
import { CalculatorSkeleton } from './components/CalculatorSkeleton.tsx'
import { useDarkMode } from './lib/darkMode'
import { useKeyboardShortcuts, createDefaultShortcuts } from './lib/keyboard-shortcuts.ts'
import { usePostHogPageView } from './hooks/usePostHogPageView'
import { usePostHog } from '@posthog/react'
import { exportComparison, EXPORT_SHORTCUT_EVENT } from './lib/export.ts'
import { captureExport, captureExportFailed } from './lib/posthog-events.ts'
import { models } from './data/index.ts'

// These pages pull in the charting library (and the calculator a tokenizer) —
// keep them off the main bundle.
const Graph = lazy(() => import('./pages/Graph.tsx').then((m) => ({ default: m.Graph })))
const Calculator = lazy(() =>
  import('./pages/Calculator.tsx').then((m) => ({ default: m.Calculator })),
)

function App() {
  usePostHogPageView()
  const navigate = useNavigate()
  const posthog = usePostHog()
  const [, setIsDark] = useDarkMode()
  const [showShortcuts, setShowShortcuts] = useState(false)

  const handleShowHelp = useCallback(() => {
    setShowShortcuts(true)
  }, [])

  const handleToggleDarkMode = useCallback(() => {
    const currentIsDark = document.documentElement.classList.contains('dark')
    setIsDark(!currentIsDark)
  }, [setIsDark])

  const shortcuts = createDefaultShortcuts({
    showHelp: handleShowHelp,
    showSearch: () => navigate('/search'),
    goToCompare: () => navigate('/compare'),
    goToGraph: () => navigate('/graph'),
    goToCalculator: () => navigate('/calculator'),
    goToQuiz: () => navigate('/quiz'),
    goToLearn: () => navigate('/learn'),
    goToFAQ: () => navigate('/faq'),
    toggleExport: () => {
      // A page with richer export state (Compare's filtered table) claims the
      // shortcut by calling preventDefault; dispatchEvent returns false then.
      const claimed = !window.dispatchEvent(
        new CustomEvent(EXPORT_SHORTCUT_EVENT, { cancelable: true }),
      )
      if (claimed) return
      try {
        exportComparison(models)
        captureExport(posthog, models.length)
      } catch (error) {
        console.error('Failed to export model data:', error)
        captureExportFailed(
          posthog,
          models.length,
          error instanceof Error ? error.message : 'Unknown error',
        )
      }
    },
    toggleDarkMode: handleToggleDarkMode,
  })

  useKeyboardShortcuts(shortcuts)

  return (
    <ErrorBoundary>
      <ShortcutsDialog
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        shortcuts={shortcuts}
      />
      <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="search" element={<Search />} />
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
        <Route path="faq" element={<FAQ />} />
        <Route path="glossary" element={<Glossary />} />
        <Route path="whats-new" element={<WhatsNew />} />
        <Route path="models/:id" element={<ModelDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      </Routes>
    </ErrorBoundary>
  )
}

export default App
