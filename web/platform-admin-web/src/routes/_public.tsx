import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_public')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated && !context.auth.mustChangePassword) {
      throw redirect({
        to: '/dashboard',
      });
    }
  },
  component: PublicLayout,
});

function PublicLayout() {
  return <Outlet />;
}
