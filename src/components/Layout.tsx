import { useState, Suspense } from 'react'
import type { ReactNode } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { dataSourcedAt } from '../data/index.ts'
import { DarkModeToggle } from './DarkModeToggle'
import { ErrorBoundary } from './ErrorBoundary.tsx'
import { ReturnToTop } from './ReturnToTop.tsx'
import { ScrollToTop } from './ScrollToTop.tsx'

const navItems = [
  { to: '/compare', label: 'Compare' },
  { to: '/graph', label: 'Graph' },
  { to: '/calculator', label: 'Calculator' },
  { to: '/quiz', label: 'Which model?' },
  { to: '/learn', label: 'Learn' },
  { to: '/faq', label: 'FAQ' },
  { to: '/whats-new', label: 'What\'s new' },
]

/**
 * A Suspense boundary in the browser, and nothing at all during prerender.
 *
 * Having a boundary server-side is what broke SSG. react-dom/static resolves a
 * lazy child inline when nothing can show a fallback, but as soon as a boundary
 * exists it may flush the shell the moment its buffer fills (~12kB) and stream
 * the remainder as trailing <template> blobs plus a $RC() script. Those only
 * splice in under a real browser, so crawlers — the whole reason this site
 * prerenders — saw a <main> holding nothing but the fallback on every page big
 * enough to cross that threshold. Smaller pages fit in the shell and looked
 * fine, which is why this shipped unnoticed.
 *
 * Dropping the boundary server-side costs nothing: prerender awaits the lazy
 * module and emits finished markup, so there is no loading state to show
 * anyway. The client keeps its fallback, and hydration still matches because it
 * hydrates against fully-rendered content.
 */
export function ClientSuspense({
  fallback,
  children,
}: {
  fallback: ReactNode
  children: ReactNode
}) {
  if (import.meta.env.SSR) return <>{children}</>
  return <Suspense fallback={fallback}>{children}</Suspense>
}

export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:z-50 focus:absolute focus:top-0 focus:left-0 focus:p-4 focus:bg-accent-deep focus:text-white"
      >
        Skip to main content
      </a>
      <header className="border-b border-line bg-surface-raised/80 backdrop-blur">
        <nav
          aria-label="Main"
          className="mx-auto flex h-14 w-full max-w-5xl items-center gap-1 px-4 sm:px-6"
        >
          <Link
            to="/"
            className="mr-4 text-base font-semibold tracking-tight text-fg transition-colors duration-150 hover:text-accent-deep focus:outline-none focus:ring-2 focus:ring-accent rounded-lg"
            title="Home (go to compare)"
          >
            models<span className="text-accent">.fyi</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="flex-1" />
          <div className="hidden gap-1 sm:flex">
            {navItems.map(({ to, label }) => {
              const keyHints: Record<string, string> = {
                '/compare': 'g c',
                '/graph': 'g g',
                '/calculator': 'g k',
                '/quiz': 'g q',
                '/learn': 'g l',
                '/faq': 'g f',
              }
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent ${
                      isActive
                        ? 'bg-accent-soft font-medium text-accent-deep'
                        : 'text-fg-secondary hover:bg-black/[0.04] hover:text-fg'
                    }`
                  }
                  title={keyHints[to] ? `${label} (${keyHints[to]})` : label}
                >
                  {label}
                </NavLink>
              )
            })}
          </div>

          {/* Dark Mode Toggle */}
          <DarkModeToggle />

          {/* Mobile Hamburger Button */}
          <button
            className="ml-auto flex h-11 w-11 items-center justify-center rounded-lg transition-colors duration-150 hover:bg-black/[0.04] sm:hidden dark:hover:bg-white/[0.04]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              className="h-6 w-6 text-fg"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isMobileMenuOpen
                    ? 'M6 18L18 6M6 6l12 12'
                    : 'M4 6h16M4 12h16M4 18h16'
                }
              />
            </svg>
          </button>
        </nav>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-line bg-surface-raised sm:hidden dark:bg-surface-raised">
            <div className="mx-auto w-full max-w-5xl px-4 py-2">
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2.5 text-sm transition-colors duration-150 ${
                      isActive
                        ? 'bg-accent-soft font-medium text-accent-deep'
                        : 'text-fg-secondary hover:bg-black/[0.04] hover:text-fg'
                    } dark:hover:bg-white/[0.04]`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <ErrorBoundary>
          <ClientSuspense fallback={<p className="text-sm text-fg-muted">Loading…</p>}>
            <Outlet />
          </ClientSuspense>
        </ErrorBoundary>
      </main>

      <ReturnToTop />

      <footer className="border-t border-line" role="contentinfo">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-6 text-xs text-fg-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="space-y-1">
            <p>
              <strong>Data refreshed:</strong> <time dateTime={new Date(dataSourcedAt).toISOString()}>
                {new Date(dataSourcedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </p>
            <p className="text-fg-muted">
              Benchmarks are provider-published evals. Treat small differences with healthy skepticism.
              <a
                href="https://github.com/seantomburke/models.fyi/tree/main/src/data"
                className="ml-1 text-accent-deep underline underline-offset-1 focus:outline-none focus:ring-2 focus:ring-accent rounded-lg"
              >
                Data sources
              </a>
            </p>
            <p className="text-fg-muted">
              <Link
                to="/glossary"
                className="text-accent-deep underline underline-offset-1 focus:outline-none focus:ring-2 focus:ring-accent rounded-lg"
              >
                Glossary
              </Link>
              {' · '}
              <Link
                to="/learn"
                className="text-accent-deep underline underline-offset-1 focus:outline-none focus:ring-2 focus:ring-accent rounded-lg"
              >
                Learn more
              </Link>
            </p>
          </div>
          <a
            href="https://github.com/seantomburke/models.fyi"
            className="w-fit whitespace-nowrap rounded-lg bg-surface-raised px-3 py-2 underline decoration-line-strong underline-offset-2 transition-colors duration-150 hover:text-fg-secondary focus:outline-none focus:ring-2 focus:ring-accent"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
