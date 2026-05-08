import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.pathname,
        },
      });
    }

    if (context.auth.mustChangePassword) {
      throw redirect({
        to: '/change-password',
      });
    }
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
  return <Outlet />;
}
