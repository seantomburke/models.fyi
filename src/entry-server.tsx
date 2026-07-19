import { StrictMode } from 'react'
import { prerender } from 'react-dom/static'
import { StaticRouter } from 'react-router'
import App from './App.tsx'

// Re-exported for scripts/prerender.mjs (which can only import compiled JS).
export { routeMeta, SITE_URL } from './lib/routeMeta.ts'

/**
 * Render the app for one route. `path` excludes the base (e.g. "/compare").
 * Uses react-dom/static's prerender — the React 19 SSG API whose output is
 * built to pair with hydrateRoot (and which waits for lazy chunks, so the
 * graph page prerenders real content instead of its Suspense fallback).
 */
export async function render(path: string): Promise<string> {
  const base = import.meta.env.BASE_URL
  const { prelude } = await prerender(
    <StrictMode>
      <StaticRouter basename={base} location={base.replace(/\/$/, '') + path}>
        <App />
      </StaticRouter>
    </StrictMode>,
  )
  return await new Response(prelude as ReadableStream).text()
}
