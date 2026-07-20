import { createElement, lazy } from 'react'
import type { ComponentType } from 'react'

type RouteModule = Record<string, unknown>
export type RetryableRouteLoader<T extends RouteModule = RouteModule> = () => Promise<T>
type RouteLoader = RetryableRouteLoader

export function createRetryableRouteLoader<T extends RouteModule>(
  loader: () => Promise<T>,
): RetryableRouteLoader<T> {
  let pending: Promise<T> | undefined

  const load = () => {
    pending ??= loader().catch((error: unknown) => {
      pending = undefined
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
