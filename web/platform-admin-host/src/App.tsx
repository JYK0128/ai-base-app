import { Component, type ErrorInfo, lazy, type ReactNode, Suspense } from 'react';

const RemoteAuthApp = lazy(() => import('platform_admin_login_remote/App'));

type ErrorBoundaryProps = {
  children: ReactNode
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
          <h2>Auth remote did not load</h2>
          <p>{this.state.message}</p>
          <p className="remote-fallback-note">
            Start the remote app on port 3001, then reload the host shell.
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
          This app owns orchestration and layout. The auth experience is loaded from a
          separate Vite remote at runtime.
        </p>
        <dl className="hero-metadata">
          <div>
            <dt>Host</dt>
            <dd>http://localhost:3000</dd>
          </div>
          <div>
            <dt>Remote</dt>
            <dd>http://localhost:3001/assets/remoteEntry.js</dd>
          </div>
        </dl>
      </section>

      <section className="shell-stage">
        <div className="stage-header">
          <p className="eyebrow">Federated module</p>
          <h2>Auth remote mounted into the host shell</h2>
          <p>
            The remote renders its own login flow, session state, and data fetches while
            remaining buildable and runnable on its own.
          </p>
        </div>

        <RemoteErrorBoundary>
          <Suspense
            fallback={(
              <div className="remote-fallback">
                <p className="eyebrow">Loading remote</p>
                <h2>Mounting auth remote</h2>
                <p>Waiting for `platform_admin_login_remote/App` to resolve from the remote entry.</p>
              </div>
            )}
          >
            <RemoteAuthApp />
          </Suspense>
        </RemoteErrorBoundary>
      </section>
    </main>
  );
}

export default App;
