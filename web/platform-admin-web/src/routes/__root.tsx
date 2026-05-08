import { ErrorBoundary } from '@pkg/ui';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import React from 'react';

const TanStackRouterDevtools
  = import.meta.env.PROD
    ? () => null
    : React.lazy(() =>
      import('@tanstack/router-devtools').then((res) => ({
        default: res.TanStackRouterDevtools,
      })),
    );

const ReactQueryDevtools
  = import.meta.env.PROD
    ? () => null
    : React.lazy(() =>
      import('@tanstack/react-query-devtools').then((res) => ({
        default: res.ReactQueryDevtools,
      })),
    );

interface RouterContext {
  auth: {
    isAuthenticated: boolean
    mustChangePassword: boolean
  }
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <ErrorBoundary
      fallback={({ error, reset }) => {
        console.log(error);
        return (
          <div>
            <div>오류 발생</div>
            <div onClick={reset}>재시도</div>
          </div>
        );
      }}
    >
      <Outlet />
      <React.Suspense>
        <TanStackRouterDevtools />
        <ReactQueryDevtools />
      </React.Suspense>
    </ErrorBoundary>
  ),
});
