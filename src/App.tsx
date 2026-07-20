import { lazy, Suspense, useState, useCallback } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { Layout } from './components/Layout.tsx'
import { ShortcutsDialog } from './components/ShortcutsDialog.tsx'
import { Home } from './pages/Home.tsx'
import { GraphSkeleton } from './components/GraphSkeleton.tsx'
import { CalculatorSkeleton } from './components/CalculatorSkeleton.tsx'
import { useDarkMode } from './lib/darkMode'
import { useKeyboardShortcuts, createDefaultShortcuts } from './lib/keyboard-shortcuts.ts'
import { usePostHogPageView } from './hooks/usePostHogPageView'
import { usePostHog } from './lib/posthog-react.ts'
import { exportComparison, EXPORT_SHORTCUT_EVENT } from './lib/export.ts'
import { captureExport, captureExportFailed } from './lib/posthog-events.ts'
import { models } from './data/index.ts'

// Every route but Home is lazy. Home stays static because it is the most
// common landing route, and splitting it would only buy a round-trip.
// Everything else was riding along in the entry bundle — a visitor landing on
// Home was downloading the Learn labs' neural nets before the page could paint.
const Graph = lazy(() => import('./pages/Graph.tsx').then((m) => ({ default: m.Graph })))
const Calculator = lazy(() =>
  import('./pages/Calculator.tsx').then((m) => ({ default: m.Calculator })),
)
const Search = lazy(() => import('./pages/Search.tsx').then((m) => ({ default: m.Search })))
const Compare = lazy(() => import('./pages/Compare.tsx').then((m) => ({ default: m.Compare })))
const Quiz = lazy(() => import('./pages/Quiz.tsx').then((m) => ({ default: m.Quiz })))
const Learn = lazy(() => import('./pages/learn/Learn.tsx').then((m) => ({ default: m.Learn })))
const LearnTopic = lazy(() =>
  import('./pages/learn/LearnTopic.tsx').then((m) => ({ default: m.LearnTopic })),
)
const FAQ = lazy(() => import('./pages/FAQ.tsx').then((m) => ({ default: m.FAQ })))
const Glossary = lazy(() => import('./pages/Glossary.tsx').then((m) => ({ default: m.Glossary })))
const WhatsNew = lazy(() => import('./pages/WhatsNew.tsx').then((m) => ({ default: m.WhatsNew })))
const ModelDetail = lazy(() =>
  import('./pages/models/ModelDetail.tsx').then((m) => ({ default: m.ModelDetail })),
)
const NotFound = lazy(() => import('./pages/NotFound.tsx').then((m) => ({ default: m.NotFound })))

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
      {/* Layout already wraps <Outlet /> in a Suspense boundary, so the lazy
          routes below need no per-route one. Graph and Calculator keep theirs
          because their skeletons mirror the real layout, which the generic
          fallback cannot. */}
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
