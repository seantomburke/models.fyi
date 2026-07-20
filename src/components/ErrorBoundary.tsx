import { Component } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { capture } from '../lib/analytics.ts'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
    capture('error_boundary_caught', {
      error_message: error.message,
      error_stack: error.stack,
      component_stack: errorInfo.componentStack,
    })
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
          <p className="mt-3 text-fg-secondary">
            We encountered an unexpected error. Please try again.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={this.resetError}
              className="rounded-lg bg-accent-deep px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent"
            >
              Try again
            </button>
            <Link
              to="/"
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-fg-secondary transition-colors duration-150 hover:bg-surface-raised"
            >
              Go home
            </Link>
          </div>
          {this.state.error && (
            <div className="mt-6 rounded-lg border border-line bg-surface-raised p-4">
              <p className="text-xs font-mono text-fg-muted">{this.state.error.message}</p>
            </div>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
