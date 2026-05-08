import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode, useEffect } from 'react';

interface ErrorBoundaryProps extends PropsWithChildren {
  fallback?: (props: { error: Error | null, reset: () => void }) => ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetKeys?: Array<unknown>
  onReset?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export function ErrorBoundary({
  children,
  fallback,
  onError,
  resetKeys,
  onReset,
}: Readonly<ErrorBoundaryProps>) {
  return (
    <ReactErrorBoundary
      fallback={fallback}
      onError={onError}
      resetKeys={resetKeys}
      onReset={onReset}
    >
      <RuntimeErrorBoundary onError={onError}>
        {children}
      </RuntimeErrorBoundary>
    </ReactErrorBoundary>
  );
}

/**
 * 1. React Error Boundary (Class Component)
 */
class ReactErrorBoundary extends Component<Readonly<ErrorBoundaryProps>, ErrorBoundaryState> {
  constructor(props: Readonly<ErrorBoundaryProps>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
    if (import.meta.env.DEV) {
      console.error('React Error Boundary caught an error:', error, errorInfo);
    }
  }

  override componentDidUpdate(prevProps: Readonly<ErrorBoundaryProps>) {
    const { hasError } = this.state;
    const { resetKeys } = this.props;

    if (hasError && resetKeys && this.checkKeysChanged(prevProps.resetKeys, resetKeys)) {
      this.resetErrorBoundary();
    }
  }

  private checkKeysChanged(prevKeys: Array<unknown> | undefined, nextKeys: Array<unknown> | undefined) {
    if (!prevKeys || !nextKeys) return false;
    return prevKeys.length !== nextKeys.length || nextKeys.some((key, i) => key !== prevKeys[i]);
  }

  private resetErrorBoundary = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  override render() {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      return fallback ? fallback({ error, reset: this.resetErrorBoundary }) : null;
    }

    return children;
  }
}

/**
 * 2. Runtime Error Boundary (Global Listeners)
 */
function RuntimeErrorBoundary({
  children,
  onError,
}: Readonly<Pick<ErrorBoundaryProps, 'children' | 'onError'>>) {
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      const error = event.error instanceof Error ? event.error : new Error(event.message);
      onError?.(error, { componentStack: 'Global window error' });

      if (import.meta.env.PROD) {
        event.preventDefault();
      }
    };

    const rejectHandler = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      onError?.(error, { componentStack: 'Unhandled promise rejection' });

      if (import.meta.env.PROD) {
        event.preventDefault();
      }
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectHandler);
    };
  }, [onError]);

  return <>{children}</>;
}
