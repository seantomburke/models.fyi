import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error)
      console.error('Component stack:', errorInfo.componentStack)
    }
  }

  handleReset = () => {
    // Reload the page to reset the error state
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-4 py-10 sm:px-6">
          <div className="rounded-xl border border-line bg-surface p-8 text-center">
            {/* Error icon */}
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4v2m0 0v2m0-6V7m0 0v2m0-2H7m0 0H5m0 0v2m0-2v2m0 0H7m5 0h5m0 0h2m0 0v2m0-2v2m0 0h-2"
                />
              </svg>
            </div>

            {/* Error message */}
            <h1 className="mb-2 text-2xl font-bold text-fg">Something went wrong</h1>
            <p className="mb-6 text-fg-secondary">
              We encountered an unexpected error. Please try again.
            </p>

            {/* Error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 rounded bg-red-50 p-3 text-left">
                <p className="mb-2 text-xs font-mono font-semibold text-red-700">
                  {this.state.error.message}
                </p>
                <details className="text-xs text-red-600">
                  <summary className="cursor-pointer font-semibold">Stack trace</summary>
                  <pre className="mt-2 overflow-auto text-left font-mono">
                    {this.state.error.stack}
                  </pre>
                </details>
              </div>
            )}

            {/* Try again button */}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-deep"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
