import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { PostHogProvider } from './lib/posthog-react.ts'
import './index.css'
import App from './App.tsx'
import { getAnalyticsClient, loadAnalytics } from './lib/analytics.ts'
import { preloadInitialRoute } from './routePreload.ts'
import { renderRoot } from './rootRender.tsx'

// Routes are prerendered to static HTML for crawlers and first paint
// (scripts/prerender.mjs). Preserve that DOM during startup: replacing it with
// createRoot caused the footer to jump through the viewport on every lazy-route
// landing. The current route chunk is preloaded below before hydration so React
// sees the same complete tree the server emitted, including on direct visits.
// Preloading resolves React.lazy's promise; App deliberately keeps rendering
// that same lazy component so the server and first client trees stay identical.
const container = document.getElementById('root')!
const renderApp = () => {
  renderRoot(
    container,
    <StrictMode>
      <PostHogProvider client={getAnalyticsClient()}>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <App />
        </BrowserRouter>
      </PostHogProvider>
    </StrictMode>,
    window.location.pathname,
    import.meta.env.BASE_URL,
  )
}

const startApp = () => {
  preloadInitialRoute(window.location.pathname, import.meta.env.BASE_URL)
    .catch((error: unknown) => {
      // A transient chunk failure should not leave a permanently static page.
      // The retryable loader will make one fresh request when React renders.
      console.error('Failed to preload the current route; rendering with its loading state.', error)
    })
    .finally(renderApp)
}

startApp()

// Analytics is not load-bearing for anything on screen, so keep it off the
// critical path: fetch the SDK once the browser is idle after first paint.
// Events fired before it lands are queued and replayed (see lib/analytics.ts).
const startAnalytics = () => void loadAnalytics()
if ('requestIdleCallback' in window) {
  requestIdleCallback(startAnalytics, { timeout: 3000 })
} else {
  setTimeout(startAnalytics, 1000)
}
