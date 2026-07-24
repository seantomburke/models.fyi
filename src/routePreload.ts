import { createElement, lazy } from 'react'
import type { ComponentType } from 'react'

type RouteModule = Record<string, unknown>
export type RetryableRouteLoader<T extends RouteModule = RouteModule> = () => Promise<T>
type RouteLoader = RetryableRouteLoader

const RELOAD_GUARD_KEY = 'models-wtf:chunk-reload'

/**
 * A dynamic import() rejects with a stale-chunk error when the deployed
 * index.html a returning visitor cached points at hashed chunk filenames that a
 * newer deploy has already removed. The message wording differs by browser, so
 * match the known signatures rather than a single string.
 */
export function isStaleChunkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '')
  return (
    /Failed to fetch dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /'?text\/html'? is not a valid JavaScript MIME type/i.test(message)
  )
}

/**
 * Recover from a stale-chunk failure with a single hard reload, which fetches a
 * fresh index.html pointing at the current chunk names. A sessionStorage guard
 * stops a genuinely broken deploy from reloading forever; it clears on the next
 * successful load. Returns true when a reload was scheduled so callers keep the
 * rejection pending (the page is about to navigate away) instead of surfacing a
 * dead error screen.
 */
function reloadForStaleChunk(error: unknown): boolean {
  if (typeof window === 'undefined' || !isStaleChunkError(error)) return false

  try {
    if (window.sessionStorage.getItem(RELOAD_GUARD_KEY)) return false
    window.sessionStorage.setItem(RELOAD_GUARD_KEY, '1')
  } catch {
    // sessionStorage can throw (private mode, disabled). Reload once anyway;
    // without the guard we accept the small risk over a permanent dead screen.
  }

  window.location.reload()
  return true
}

function clearReloadGuard(): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(RELOAD_GUARD_KEY)
  } catch {
    // Ignore: a readable-but-unwritable store just leaves the guard set.
  }
}

export function createRetryableRouteLoader<T extends RouteModule>(
  loader: () => Promise<T>,
): RetryableRouteLoader<T> {
  let pending: Promise<T> | undefined

  const load = () => {
    pending ??= loader()
      .then((module) => {
        clearReloadGuard()
        return module
      })
      .catch((error: unknown) => {
        pending = undefined
        // A fresh deploy invalidated this chunk. Reload once to pick up the new
        // index.html; keep the promise pending so React never renders the error
        // boundary before the page navigates away.
        if (reloadForStaleChunk(error)) return new Promise<T>(() => {})
        throw error
      })
    return pending
  }

  return load
}

/** Keep the lazy element identity stable even when its promise was preloaded. */
export function createPreloadedRoute(
  loader: RetryableRouteLoader<{ default: ComponentType }>,
) {
  const LazyRoute = lazy(loader)
  return function PreloadedRoute() {
    return createElement(LazyRoute)
  }
}

export const routeLoaders = {
  graph: createRetryableRouteLoader(() => import('./pages/Graph.tsx').then((m) => ({ default: m.Graph }))),
  calculator: createRetryableRouteLoader(() =>
    import('./pages/Calculator.tsx').then((m) => ({ default: m.Calculator })),
  ),
  search: createRetryableRouteLoader(() => import('./pages/Search.tsx').then((m) => ({ default: m.Search }))),
  compare: createRetryableRouteLoader(() => import('./pages/Compare.tsx').then((m) => ({ default: m.Compare }))),
  quiz: createRetryableRouteLoader(() => import('./pages/Quiz.tsx').then((m) => ({ default: m.Quiz }))),
  learn: createRetryableRouteLoader(() => import('./pages/learn/Learn.tsx').then((m) => ({ default: m.Learn }))),
  learnTopic: createRetryableRouteLoader(() =>
    import('./pages/learn/LearnTopic.tsx').then((m) => ({ default: m.LearnTopic })),
  ),
  faq: createRetryableRouteLoader(() => import('./pages/FAQ.tsx').then((m) => ({ default: m.FAQ }))),
  glossary: createRetryableRouteLoader(() =>
    import('./pages/Glossary.tsx').then((m) => ({ default: m.Glossary })),
  ),
  whatsNew: createRetryableRouteLoader(() =>
    import('./pages/WhatsNew.tsx').then((m) => ({ default: m.WhatsNew })),
  ),
  models: createRetryableRouteLoader(() =>
    import('./pages/models/ModelsIndex.tsx').then((m) => ({ default: m.ModelsIndex })),
  ),
  modelDetail: createRetryableRouteLoader(() =>
    import('./pages/models/ModelDetail.tsx').then((m) => ({ default: m.ModelDetail })),
  ),
  providerDetail: createRetryableRouteLoader(() =>
    import('./pages/providers/ProviderDetail.tsx').then((m) => ({ default: m.ProviderDetail })),
  ),
  notFound: createRetryableRouteLoader(() =>
    import('./pages/NotFound.tsx').then((m) => ({ default: m.NotFound })),
  ),
} as const

function routePath(pathname: string, baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, '')
  const withoutBase = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname
  return `/${withoutBase}`.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/'
}

export function routeLoaderFor(pathname: string, baseUrl = '/'): RouteLoader | undefined {
  const path = routePath(pathname, baseUrl)

  if (path === '/') return undefined
  if (path === '/graph') return routeLoaders.graph
  if (path === '/calculator') return routeLoaders.calculator
  if (path === '/search') return routeLoaders.search
  if (path === '/compare') return routeLoaders.compare
  if (path === '/quiz') return routeLoaders.quiz
  if (path === '/learn') return routeLoaders.learn
  if (path.startsWith('/learn/')) return routeLoaders.learnTopic
  if (path === '/faq') return routeLoaders.faq
  if (path === '/glossary') return routeLoaders.glossary
  if (path === '/whats-new') return routeLoaders.whatsNew
  if (path === '/models') return routeLoaders.models
  if (path.startsWith('/models/')) return routeLoaders.modelDetail
  if (path.startsWith('/providers/')) return routeLoaders.providerDetail
  return routeLoaders.notFound
}

/**
 * Keep prerendered content on screen until the current route chunk is ready.
 *
 * Hydration starts only after the initial lazy route resolves. React.lazy still
 * owns the route element on both the server and client, so preloading avoids a
 * fallback without changing the component identity React hydrates.
 */
export async function preloadInitialRoute(pathname: string, baseUrl = '/'): Promise<void> {
  await routeLoaderFor(pathname, baseUrl)?.()
}
