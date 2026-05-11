import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router';
import { Building2,
         LayoutDashboard,
         LifeBuoy,
         LogOut,
         Megaphone } from 'lucide-react';

import { useAuthControllerLogoutV1 } from '../api/endpoints';
import { useAuth } from '../hooks/useAuth';

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
  const { logout: authLogout } = useAuth();
  const { mutate: logoutMutate } = useAuthControllerLogoutV1({
    mutation: {
      onSettled: () => {
        authLogout();
        window.location.href = '/';
      },
    },
  });

  const menuItems = [
    { label: '대시보드', icon: LayoutDashboard, to: '/dashboard' },
    { label: '조직 승인', icon: Building2, to: '/organizations' },
    { label: '공지사항', icon: Megaphone, to: '/announcements' },
    { label: '고객 지원', icon: LifeBuoy, to: '/support' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
          <div className="text-xl font-bold text-slate-800 tracking-tight">PLATFORM ADMIN</div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: 'bg-slate-100 text-slate-900' }}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={() => {
              logoutMutate();
            }}
            className="flex items-center space-x-3 px-3 py-2 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
}
