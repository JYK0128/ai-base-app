import { createFileRoute, Link, notFound, Outlet, redirect } from '@tanstack/react-router';
import { Building2, FileText, Globe, Info, Key, LayoutDashboard, LifeBuoy, LogOut, type LucideIcon, Megaphone, ScrollText, Settings, Shield, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getI18nControllerGetLocalesV1QueryOptions, getResourceControllerGetMyResourcesV1QueryOptions, useAuthControllerLogoutV1, useI18nControllerGetTranslationsV1 } from '../api/endpoints';
import type { LocaleDto } from '../api/model';
import type { ResourceResponseDto } from '../api/model/resourceResponseDto';
import { useAuth } from '../hooks/useAuth';
import i18n from '../lib/i18n';
import { getStoredAdminLocale, normalizeAdminLocale } from '../lib/locale';

// 🌟 트리 자원 평탄화 헬퍼 함수
function flattenResources(nodes: ResourceResponseDto[]): ResourceResponseDto[] {
  const result: ResourceResponseDto[] = [];
  const traverse = (list: ResourceResponseDto[]) => {
    for (const node of list) {
      result.push(node);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  };
  traverse(nodes);
  return result;
}

// 🌟 현재 경로와 대응하는 MENU 타입 자원을 식별하는 헬퍼 함수
function findMatchingMenuResource(flattened: ResourceResponseDto[], path: string): ResourceResponseDto | undefined {
  return flattened.find((res) => {
    if (res.type !== 'MENU' || !res.path) return false;
    return path === res.path || path.startsWith(res.path + '/');
  });
}

function isDashboardPath(path: string): boolean {
  return path === '/dashboard' || path === '/dashboard/';
}

export const Route = createFileRoute('/_protected')({
  beforeLoad: async ({ context, location }) => {
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

    const queryClient = context.queryClient;

    let resources: ResourceResponseDto[] = [];
    let locales: LocaleDto[] = [];
    try {
      const { queryKey, queryFn } = getResourceControllerGetMyResourcesV1QueryOptions();
      const response = await queryClient.ensureQueryData({
        queryKey,
        queryFn,
        staleTime: 1000 * 60 * 5, // 5분 동안 fresh 상태 유지
        gcTime: 1000 * 60 * 10,   // 0인 전역 gcTime 우회
      });
      resources = response.data ?? [];
    }
    catch (error) {
      console.error('Failed to prefetch dynamic resources in route guard:', error);
    }

    try {
      const { queryKey, queryFn } = getI18nControllerGetLocalesV1QueryOptions();
      const response = await queryClient.ensureQueryData({
        queryKey,
        queryFn,
        staleTime: 1000 * 60 * 60,
        gcTime: 1000 * 60 * 60,
      });
      locales = response.data?.list ?? [];
    }
    catch (error) {
      console.error('Failed to prefetch locales in route guard:', error);
    }

    const permissions = context.auth.permissions;
    const path = location.pathname;
    const allowDashboardWithoutResource = isDashboardPath(path);

    // 보호 구간은 리소스가 없으면 기본 차단(fail-closed)
    if (resources.length === 0) {
      if (allowDashboardWithoutResource) {
        return {
          resources,
          flatResources: [],
          locales,
        };
      }

      throw notFound();
    }

    const flattened = flattenResources(resources);
    const matchingMenuResource = findMatchingMenuResource(flattened, path);

    // 보호 구간에서는 MENU 자원에 매칭되지 않는 경로도 접근 불가로 처리
    if (!matchingMenuResource) {
      if (allowDashboardWithoutResource) {
        return {
          resources,
          flatResources: flattened,
          locales,
        };
      }

      throw notFound();
    }

    const canReadMenuResource = matchingMenuResource.actions.includes('READ');
    const requiredPermission = `${matchingMenuResource.code}:READ`;
    const hasRequiredPermission = permissions.includes(requiredPermission);

    // READ 자체가 허용되지 않았거나, 사용자 READ 권한이 없으면 NotFound 처리
    if (!canReadMenuResource || !hasRequiredPermission) {
      throw notFound();
    }

    // 🌟 하위 레이아웃 컴포넌트가 동기식으로 사용할 수 있도록 리소스 데이터 반환
    return {
      resources,
      flatResources: flattened,
      locales,
    };
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
  const { logout: authLogout, permissions } = useAuth();
  const { mutate: logoutMutate } = useAuthControllerLogoutV1({
    mutation: {
      onSettled: () => {
        authLogout();
        window.location.href = '/';
      },
    },
  });

  const [currentLang, setCurrentLang] = useState<string>(getStoredAdminLocale);
  const { t } = useTranslation('common');

  const handleLangChange = (lang: string) => {
    const nextLang = normalizeAdminLocale(lang);
    setCurrentLang(nextLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_lang', nextLang);
    }
  };

  const { flatResources } = Route.useRouteContext();

  // 🌟 현재 로케일의 전체 번역 목록 조회
  const { data: translationResponse } = useI18nControllerGetTranslationsV1(
    { locale: currentLang },
    { query: { enabled: !!currentLang } },
  );

  useEffect(() => {
    const bundle = translationResponse?.data?.[currentLang]?.resource;
    if (!bundle) return;

    i18n.addResourceBundle(currentLang, 'resource', bundle, true, true);
    void i18n.changeLanguage(currentLang);
  }, [currentLang, translationResponse]);

  // 🌟 Lucide Icon 매핑 테이블
  const IconMap: Record<string, LucideIcon> = {
    LayoutDashboard,
    Building2,
    Megaphone,
    LifeBuoy,
    ScrollText,
    Shield,
    FileText,
    Key,
    Users,
    Settings,
    Info,
  };

  // 🌟 API로 조회한 MENU 타입 리소스를 기반으로 메뉴 동적 렌더링
  const menuItemsFromApi = flatResources
    .filter((res) => res.type === 'MENU')
    .map((res) => {
      // READ 액션 권한 찾기
      const requiredPermission = `${res.code}:READ`;

      let toPath = `/${res.code.toLowerCase()}`;
      if (res.path) {
        toPath = res.path;
      }

      // Lucide 아이콘 매핑
      const iconKey = res.icon || 'Shield';
      const IconComponent = IconMap[iconKey] || Shield;

      // 다국어 번역
      const label = t(res.code, { ns: 'resource', defaultValue: res.name });

      return {
        label,
        icon: IconComponent,
        to: toPath,
        requiredPermission,
        displayOrder: res.sortOrder ?? 99,
      };
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const visibleMenuItems = menuItemsFromApi.filter(
    (item) => permissions.includes(item.requiredPermission),
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 border-b flex flex-col gap-3">
          <div className="text-xl font-bold text-slate-800 tracking-tight">{t('appName')}</div>
          <div className="flex items-center space-x-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
            <Globe className="w-4 h-4 text-slate-400" />
            <select
              value={currentLang}
              onChange={(e) => handleLangChange(e.target.value)}
              className="text-xs bg-transparent font-medium text-slate-500 focus:outline-none cursor-pointer w-full"
            >
              <option value="ko">한국어 (KO)</option>
              <option value="en">English (EN)</option>
              <option value="ja">日本語 (JA)</option>
              <option value="zh-CN">中文 (ZH-CN)</option>
            </select>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {visibleMenuItems.map((item) => (
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
            <span className="font-medium">{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 scroll bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
}
