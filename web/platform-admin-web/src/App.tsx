import './index.css';

import { Toaster } from '@pkg/ui';
import { keepPreviousData, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import React from 'react';

import { useAuth } from './hooks/useAuth';
import { routeTree } from './routeTree.gen';

const TanStackRouterDevtools
  = import.meta.env.PROD
    ? () => null
    : React.lazy(() =>
      import('@tanstack/react-router-devtools').then((res) => ({
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

const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// 1) QueryClient 설정 (mini-sass와 동일하게 MutationCache 추가)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      placeholderData: keepPreviousData,
      throwOnError: false,
      staleTime: 0,
      gcTime: 0,
    },
    mutations: {
      retry: false,
      throwOnError: false,
      gcTime: 0,
    },
  },
});

function AppInner() {
  const { isInitializing, isAuthenticated, mustChangePassword } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 font-sans">
        <div className="text-slate-400 font-medium">인증 정보를 확인 중입니다...</div>
      </div>
    );
  }

  return (
    <>
      <RouterProvider router={router} context={{ auth: { isAuthenticated, mustChangePassword } }} />
      <React.Suspense fallback={null}>
        <TanStackRouterDevtools router={router} />
        <ReactQueryDevtools />
      </React.Suspense>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>

      <AppInner />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>

  );
}

export default App;
