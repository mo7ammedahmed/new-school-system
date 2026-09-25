import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    public state: ErrorBoundaryState = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                this.props.fallback ?? (
                    <div className="bg-destructive/10 border-destructive/20 text-destructive rounded-lg border p-4">
                        <h2 className="mb-2 text-lg font-bold">
                            Something went wrong.
                        </h2>
                        <p className="mb-2">
                            {this.state.error?.message ??
                                'An unexpected error occurred.'}
                        </p>
                        <button
                            onClick={() => {
                                window.location.reload();
                            }}
                            className="text-primary hover:underline"
                        >
                            Reload page
                        </button>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}
