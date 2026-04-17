import { Component, type ErrorInfo, lazy, type ReactNode, Suspense } from 'react';

const RemoteAuthApp = lazy(() => import('platform_admin_auth/App'));
const RemoteDashboardApp = lazy(() => import('platform_admin_mfe-dashboard/App'));

type ErrorBoundaryProps = {
  children: ReactNode
  name: string
};

type ErrorBoundaryState = {
  hasError: boolean
  message: string | null
};

class RemoteErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = {
    hasError: false,
    message: null,
  };

  override componentDidCatch(error: Error, _info: ErrorInfo) {
    this.setState({
      hasError: true,
      message: error.message || 'Failed to load remote app',
    });
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="remote-fallback remote-fallback-error">
          <p className="eyebrow">Remote unavailable</p>
          <h2>
            {this.props.name}
            {' '}
            remote did not load
          </h2>
          <p>{this.state.message}</p>
          <p className="remote-fallback-note">
            Ensure the remote is running, then reload the host shell.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <main className="shell-layout">
      <section className="shell-hero">
        <p className="eyebrow">Micro-frontend host</p>
        <h1>One shell, independently deployed UI slices.</h1>
        <p className="hero-copy">
          This app orchestrates multiple remotes. Auth (3001) and Dashboard (3002)
          are loaded as separate Vite remotes at runtime.
        </p>
      </section>

      <div style={{ display: 'grid', gap: '4rem', padding: '0 2rem' }}>
        <section className="shell-stage">
          <div className="stage-header">
            <p className="eyebrow">Federated module: Dashboard</p>
            <h2>Real-time Platform Insights</h2>
          </div>

          <RemoteErrorBoundary name="Dashboard">
            <Suspense
              fallback={(
                <div className="remote-fallback">
                  <p className="eyebrow">Loading remote</p>
                  <h2>Mounting dashboard remote</h2>
                </div>
              )}
            >
              <RemoteDashboardApp />
            </Suspense>
          </RemoteErrorBoundary>
        </section>

        <section className="shell-stage">
          <div className="stage-header">
            <p className="eyebrow">Federated module: Auth</p>
            <h2>Secure Authentication Flow</h2>
          </div>

          <RemoteErrorBoundary name="Auth">
            <Suspense
              fallback={(
                <div className="remote-fallback">
                  <p className="eyebrow">Loading remote</p>
                  <h2>Mounting auth remote</h2>
                </div>
              )}
            >
              <RemoteAuthApp />
            </Suspense>
          </RemoteErrorBoundary>
        </section>
      </div>
    </main>
  );
}

export default App;
