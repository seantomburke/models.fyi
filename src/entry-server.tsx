import { StrictMode } from 'react'
import { prerender } from 'react-dom/static'
import { StaticRouter } from 'react-router'
import App from './App.tsx'

// Re-exported for scripts/prerender.mjs (which can only import compiled JS).
export { routeMeta, SITE_URL, canonicalUrl } from './lib/routeMeta.ts'

/**
 * Render the app for one route. `path` excludes the base (e.g. "/compare").
 * Uses react-dom/static's prerender — the React 19 SSG API.
 *
 * It resolves lazy route chunks inline only while no Suspense boundary is
 * mounted; with one, it may flush a shell and stream the rest as trailing
 * <template> blobs no crawler executes. Layout's ClientSuspense therefore
 * renders no boundary under SSR, and scripts/prerender.mjs fails the build if
 * an unresolved boundary ever reaches the output.
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
