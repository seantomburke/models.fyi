import type { ReactNode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'

function routePath(pathname: string, baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, '')
  const withoutBase = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname
  return `/${withoutBase}`.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/'
}

/**
 * Static hosts can serve the root prerender as an SPA fallback for an
 * extensionless nested URL. Hydrating that unrelated page necessarily fails;
 * only hydrate markup that declares it was rendered for the current route.
 */
export function canHydrateRoot(
  container: HTMLElement,
  pathname: string,
  baseUrl: string,
): boolean {
  return container.dataset.prerenderPath === routePath(pathname, baseUrl)
}

export function renderRoot(
  container: HTMLElement,
  app: ReactNode,
  pathname: string,
  baseUrl: string,
) {
  if (canHydrateRoot(container, pathname, baseUrl)) {
    return hydrateRoot(container, app)
  }

  container.replaceChildren()
  const root = createRoot(container)
  root.render(app)
  return root
}
