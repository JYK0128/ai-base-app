import { createRouter, RouterProvider } from '@tanstack/react-router';

import { useSession } from './hooks/useSession';
import { routeTree } from './routeTree.gen';
import { useAuth } from './stores/auth.store';

const router = createRouter({
  routeTree,
  context: {
    auth: undefined!, // This will be set by the RouterProvider context prop
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  const { isInitializing } = useSession();
  const { isAuthenticated, mustChangePassword } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 font-sans">
        <div className="text-slate-400 font-medium">인증 정보를 확인 중입니다...</div>
      </div>
    );
  }

  return (
    <RouterProvider router={router} context={{ auth: { isAuthenticated, mustChangePassword } }} />
  );
}

export default App;
