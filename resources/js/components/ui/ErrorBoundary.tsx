import * as React from "react"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  public resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback

      if (FallbackComponent && this.state.error) {
        return <FallbackComponent error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />
      }

      return (
        <div className="flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-xl space-y-6">
            <div className="flex-shrink-0">
              <span className="h-12 w-12 flex-shrink-0 rounded-md bg-danger-container">
                <svg className="h-6 w-6 mx-auto text-danger" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </span>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-on-surface">
                Something went wrong
              </h1>
              <div className="mt-2">
                <p className="text-sm text-on-surface-variant">
                  We're sorry, but something went wrong on our end. Please try again later.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={this.resetErrorBoundary}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary;
