import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import posthog from 'posthog-js'
import { PostHogProvider } from '@posthog/react'
import './index.css'
import App from './App.tsx'

posthog.init(import.meta.env.VITE_POSTHOG_PROJECT_TOKEN, {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
  defaults: '2026-05-30',
})

// Routes are prerendered to static HTML for crawlers and first paint
// (scripts/prerender.mjs). We deliberately client-render over that markup
// instead of hydrating: production React reported mismatches on subroutes
// (#418) and its recovery path is a client re-render anyway — doing it
// unconditionally is byte-identical markup swapped in with zero errors.
const container = document.getElementById('root')!
createRoot(container).render(
  <StrictMode>
    <PostHogProvider client={posthog}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </PostHogProvider>
  </StrictMode>,
)
