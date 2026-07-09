import { Button,
         DropdownMenu,
         DropdownMenuContent,
         DropdownMenuItem,
         DropdownMenuTrigger } from '@pkg/ui';
import { createFileRoute, Link, Outlet, redirect, useNavigate } from '@tanstack/react-router';
import { BookOpen,
         Building2,
         Gauge,
         Globe,
         KeyRound,
         LifeBuoy,
         LogOut,
         type LucideIcon,
         Megaphone,
         ScrollText,
         Shield,
         SquareKanban,
         UserRoundCog,
         Users } from 'lucide-react';
import type { ChangeEventHandler } from 'react';
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

  const handleChangeLanguage: ChangeEventHandler<HTMLSelectElement> = (e) => {
    void i18n.changeLanguage(e.target.value);
  };

  const handleLogout = () => {
    void (async () => {
      await session.clear();
      await navigate({ to: '/login' });
    })();
  };

  const iconByCode: Record<string, LucideIcon> = {
    DASHBOARD: Gauge,
    ANNOUNCEMENT: Megaphone,
    ORGANIZATION: Building2,
    MEMBER: Users,
    RESOURCE: SquareKanban,
    PERMISSION: Shield,
    TERMS: BookOpen,
    SUPPORT: LifeBuoy,
    AUDIT: ScrollText,
  };

  const getInitials = (value: string) => value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
  const sessionData = session.data;

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

      </aside>

      {/* Main Content */}
      <main className="grid flex-1 grid-rows-[auto_1fr] bg-slate-50">
        <div className="
          flex h-9 items-center justify-between border-b border-slate-200
          bg-white px-6
        "
        >
          <div className="flex min-w-0 items-center gap-2">
            <div className="
              flex size-6 shrink-0 items-center justify-center rounded-full
              bg-slate-900 text-[10px] leading-none font-semibold text-white
            "
            >
              {sessionData ? getInitials(sessionData.member.name) : 'U'}
            </div>
            <h1 className="
              truncate text-sm leading-none font-medium text-slate-900
            "
            >
              {sessionData?.member.name ?? t('userSummary')}
            </h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="rounded-full"
              >
                <UserRoundCog className="size-4" />
                <span className="sr-only">메뉴 열기</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => void navigate({ to: '/change-password' })}>
                <KeyRound className="size-4" />
                {t('changePasswordAction')}
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                <LogOut className="size-4" />
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Outlet />
      </main>
    </div>
  );
};
