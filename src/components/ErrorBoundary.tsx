import { Component, ReactNode } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
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
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
    
    // Report to error tracking service (if available)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      })
    }
    
    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const errorMessage = this.state.error?.message || 'An unexpected error occurred'
      const isDevelopment = import.meta.env.DEV

      return (
        <div className="min-h-screen flex items-center justify-center bg-deepBlack p-6" role="alert" aria-live="assertive">
          <div className="max-w-md w-full text-center">
            <div className="bg-darkSurface rounded-2xl p-8 border border-white/10 shadow-2xl">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
              
              <p className="text-gray-400 mb-6">
                {errorMessage}
              </p>
              
              {isDevelopment && this.state.errorInfo && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-300 mb-2">
                    Error Details
                  </summary>
                  <pre className="text-xs text-gray-600 bg-black/20 p-4 rounded overflow-auto max-h-40">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
              
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primaryHover text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105 min-h-[44px]"
                aria-label="Try again"
              >
                <RefreshCw className="w-5 h-5" aria-hidden="true" />
                Try Again
              </button>
              
              <Link
                to="/"
                className="mt-3 flex items-center justify-center gap-2 w-full bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 min-h-[44px]"
                aria-label="Go to home page"
              >
                <Home className="w-5 h-5" aria-hidden="true" />
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
