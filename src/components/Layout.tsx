import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { dataSourcedAt } from '../data/index.ts'
import { DarkModeToggle } from './DarkModeToggle'

const navItems = [
  { to: '/compare', label: 'Compare' },
  { to: '/graph', label: 'Graph' },
  { to: '/calculator', label: 'Calculator' },
  { to: '/quiz', label: 'Which model?' },
  { to: '/learn', label: 'Learn' },
]

export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-surface-raised/80 backdrop-blur">
        <nav
          aria-label="Main"
          className="mx-auto flex h-14 w-full max-w-5xl items-center gap-1 px-4 sm:px-6"
        >
          <Link
            to="/"
            className="mr-4 text-base font-semibold tracking-tight text-fg transition-colors duration-150 hover:text-accent-deep"
          >
            models<span className="text-accent">.fyi</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="flex-1" />
          <div className="hidden gap-1 sm:flex">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors duration-150 ${
                    isActive
                      ? 'bg-accent-soft font-medium text-accent-deep'
                      : 'text-fg-secondary hover:bg-black/[0.04] hover:text-fg'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
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

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-fg-muted sm:px-6">
          <p>
            Model data researched {dataSourcedAt}. Benchmarks are provider-published evals.
            Treat small differences with healthy skepticism.
          </p>
          <a
            href="https://github.com/seantomburke/models.fyi"
            className="underline decoration-line-strong underline-offset-2 transition-colors duration-150 hover:text-fg-secondary"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
