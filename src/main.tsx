import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PostHogProvider } from './lib/posthog-react.ts'
import './index.css'
import App from './App.tsx'
import { getAnalyticsClient, loadAnalytics } from './lib/analytics.ts'

// Routes are prerendered to static HTML for crawlers and first paint
// (scripts/prerender.mjs). We deliberately client-render over that markup
// instead of hydrating: production React reported mismatches on subroutes
// (#418) and its recovery path is a client re-render anyway — doing it
// unconditionally is byte-identical markup swapped in with zero errors.
const container = document.getElementById('root')!
createRoot(container).render(
  <StrictMode>
    <PostHogProvider client={getAnalyticsClient()}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </PostHogProvider>
  </StrictMode>,
)

// Analytics is not load-bearing for anything on screen, so keep it off the
// critical path: fetch the SDK once the browser is idle after first paint.
// Events fired before it lands are queued and replayed (see lib/analytics.ts).
const startAnalytics = () => void loadAnalytics()
if ('requestIdleCallback' in window) {
  requestIdleCallback(startAnalytics, { timeout: 3000 })
} else {
  setTimeout(startAnalytics, 1000)
}
