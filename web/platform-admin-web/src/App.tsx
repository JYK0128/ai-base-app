import './index.css';

import { alert, Popup, Toaster } from '@pkg/ui';
import { keepPreviousData, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { isAxiosError } from 'axios';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { getAuthControllerMeV1QueryKey } from './api/generated/endpoints';
import { NotFound } from './components/NotFound';
import { useSession } from './hooks/useSession';
import { useWheelScroll } from './hooks/useWheelScroll';
import { clearCsrfToken } from './lib/axios';
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
    session: undefined!,
    queryClient: undefined!,
  },
  defaultNotFoundComponent: NotFound,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

let isHandlingUnauthorized = false;
const authQueryKey = getAuthControllerMeV1QueryKey();

// 1) QueryClient 설정 (mini-sass와 동일하게 MutationCache 추가)
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      const isAuthQuery = query.queryKey.length === authQueryKey.length
        && query.queryKey.every((value, index) => value === authQueryKey[index]);

      if (!isAxiosError(error) || error.response?.status !== 401 || isAuthQuery || isHandlingUnauthorized) {
        return;
      }

      isHandlingUnauthorized = true;
      clearCsrfToken();
      queryClient.clear();
      void alert({
        title: '로그아웃되었습니다.',
        description: '세션이 만료되었습니다. 다시 로그인해 주세요.',
      });

      void router.navigate({ to: '/login', replace: true }).finally(() => {
        isHandlingUnauthorized = false;
      });
    },
  }),
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
  const session = useSession();
  const { t } = useTranslation('common');

  useWheelScroll();

  if (session.isPending) {
    return (
      <div className="
        flex h-screen items-center justify-center bg-slate-50 font-sans
      "
      >
        <div className="font-medium text-slate-400">{t('loadingAuth')}</div>
      </div>
    );
  }

  return (
    <>
      <RouterProvider
        router={router}
        context={{
          session,
          queryClient,
        }}
      />
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
      <Popup />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>

  );
}

export default App;
