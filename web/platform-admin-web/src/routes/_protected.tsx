import { createFileRoute, Link, Outlet, redirect, useNavigate } from '@tanstack/react-router';
import { Bell,
         BookOpen,
         Building2,
         Gauge,
         Globe,
         LifeBuoy,
         LogOut,
         type LucideIcon,
         ScrollText,
         Shield,
         SquareKanban,
         Users } from 'lucide-react';
import type { ChangeEventHandler, MouseEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

import { getAuthControllerGetAllowedResourceListV1QueryOptions } from '../api/generated/endpoints';
import { type AllowedResourceListItem,
         AllowedResourceListItemType } from '../api/generated/model';

export const Route = createFileRoute('/_protected')({
  beforeLoad: ({ context }) => {
    if (context.session.requiredAgreeTerms) {
      throw redirect({ to: '/term-agreement' });
    }
    if (context.session.requiredPasswordChange) {
      throw redirect({ to: '/change-password' });
    }
    if (!context.session.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
  loader: async ({ context }) => {
    const res = await context.queryClient.ensureQueryData(
      getAuthControllerGetAllowedResourceListV1QueryOptions(),
    );
    return res?.items || [];
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
  const { session } = Route.useRouteContext();
  const menuItems = Route.useLoaderData();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogout: MouseEventHandler<HTMLButtonElement> = () => {
    void (async () => {
      await session.clear();
      await navigate({ to: '/login' });
    })();
  };
  const handleChangeLanguage: ChangeEventHandler<HTMLSelectElement> = (e) => {
    void i18n.changeLanguage(e.target.value);
  };

  const iconByCode: Record<string, LucideIcon> = {
    DASHBOARD: Gauge,
    ANNOUNCEMENT: Bell,
    ORGANIZATION: Building2,
    MEMBER: Users,
    RESOURCE: SquareKanban,
    PERMISSION: Shield,
    TERMS: BookOpen,
    SUPPORT: LifeBuoy,
    AUDIT: ScrollText,
  };

  const renderMenuItems = (items: AllowedResourceListItem[], depth = 0) =>
    items
      .filter((item) => item.type === AllowedResourceListItemType.MENU)
      .slice()
      .sort((a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER))
      .map((item) => {
        const Icon = iconByCode[item.code] ?? Gauge;
        const hasChildren = item.children.length > 0;
        const hasPath = Boolean(item.path);
        const paddingLeft = 12 + depth * 16;

        return (
          <div key={item.id} className="space-y-1">
            {hasPath
              ? (
                <Link
                  to={item.path}
                  activeProps={{ className: 'bg-slate-100 text-slate-950' }}
                  className="
                    flex items-center space-x-3 rounded-lg px-3 py-2
                    text-slate-600 transition-colors
                    hover:bg-slate-50 hover:text-slate-900
                  "
                  style={{ paddingLeft }}
                >
                  <Icon className="size-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
              : (
                <div
                  className="
                    flex items-center space-x-3 rounded-lg px-3 py-2
                    text-slate-500
                  "
                  style={{ paddingLeft }}
                >
                  <Icon className="size-5" />
                  <span className="font-medium">{item.name}</span>
                </div>
              )}
            {hasChildren ? <div className="space-y-1">{renderMenuItems(item.children, depth + 1)}</div> : null}
          </div>
        );
      });

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r bg-white">
        <div className="flex flex-col gap-3 border-b p-6">
          <div className="text-xl font-bold tracking-tight text-slate-800">{t('appName')}</div>
          <div className="
            flex items-center space-x-2 rounded-lg border border-slate-100
            bg-slate-50 px-2.5 py-1.5
          "
          >
            <Globe className="size-4 text-slate-400" />
            <select
              value={i18n.language}
              onChange={handleChangeLanguage}
              className="
                w-full cursor-pointer bg-transparent text-xs font-medium
                text-slate-500
                focus:outline-none
              "
            >
              <option value="ko">한국어 (KO)</option>
              <option value="en">English (EN)</option>
            </select>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">{renderMenuItems(menuItems)}</nav>

        <div className="border-t p-4">
          <button
            onClick={handleLogout}
            className="
              flex w-full items-center space-x-3 rounded-lg px-3 py-2
              text-red-600 transition-colors
              hover:bg-red-50
            "
          >
            <LogOut className="size-5" />
            <span className="font-medium">{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="scroll flex-1 bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
};
