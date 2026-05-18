import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router';
import { Building2,
         FileText,
         Info,
         Key,
         LayoutDashboard,
         LifeBuoy,
         LogOut,
         type LucideIcon, Megaphone,
         ScrollText,
         Settings,
         Shield,
         Users } from 'lucide-react';

import { getRbacControllerGetResourcesV1QueryOptions,
         useAuthControllerLogoutV1,
         useRbacControllerGetResourcesV1 } from '../api/endpoints';
import type { ResourceResponseDto } from '../api/model/resourceResponseDto';
import { useAuth } from '../hooks/useAuth';

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
function findMatchingResource(flattened: ResourceResponseDto[], path: string): ResourceResponseDto | undefined {
  return flattened.find((res) => {
    if (res.type !== 'MENU' || !res.path) return false;
    const mappedPath = res.path === '/roles' ? '/rbac' : res.path;
    return path === mappedPath || path.startsWith(mappedPath + '/');
  });
}

// 🌟 권한이 없을 경우 사용자가 권한을 가진 첫 번째 메뉴의 경로를 반환하는 헬퍼 함수
function findFallbackRedirectPath(flattened: ResourceResponseDto[], permissions: string[]): string {
  const allowedMenu = flattened
    .filter((res) => res.type === 'MENU' && res.path)
    .find((res) => {
      const rp = res.permissions.find((p) => p.action === 'READ');
      const req = rp ? rp.code : `${res.code}:READ`;
      return permissions.includes(req);
    });

  if (!allowedMenu) return '/login';
  return allowedMenu.path === '/roles' ? '/rbac' : allowedMenu.path!;
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

    // 🌟 TanStack Query의 Cache Layer를 활용해 rbac.resources 데이터를 Prefetch 및 로드
    let resources: ResourceResponseDto[] = [];
    try {
      const { queryKey, queryFn } = getRbacControllerGetResourcesV1QueryOptions();
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

    const permissions = context.auth.permissions;
    const path = location.pathname;

    if (resources.length > 0) {
      const flattened = flattenResources(resources);
      const matchingResource = findMatchingResource(flattened, path);

      if (matchingResource) {
        // READ 권한 코드 동적 추출
        const readPerm = matchingResource.permissions.find((p) => p.action === 'READ');
        const requiredPermission = readPerm ? readPerm.code : `${matchingResource.code}:READ`;

        // 사용자가 해당 자원의 필수 권한을 안 가지고 있다면 차단 및 허용 경로로 튕김 제어
        if (!permissions.includes(requiredPermission)) {
          const fallbackPath = findFallbackRedirectPath(flattened, permissions);
          throw redirect({ to: fallbackPath });
        }
      }
    }
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

  // 🌟 API와 실시간 동기화되는 동적 리소스 조회
  const { data: dbResources = [] } = useRbacControllerGetResourcesV1({
    query: {
      select: (res) => res.data ?? [],
      staleTime: 1000 * 60 * 5, // 5분 동안 fresh 상태 유지
      gcTime: 1000 * 60 * 10,   // 0인 전역 gcTime 우회
    },
  });

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
  const menuItemsFromApi = dbResources
    ? flattenResources(dbResources)
      .filter((res) => res.type === 'MENU')
      .map((res) => {
        // READ 액션 권한 찾기
        const readPerm = res.permissions.find((p) => p.action === 'READ');
        const requiredPermission = readPerm ? readPerm.code : `${res.code}:READ`;

        // /roles 주소를 우리 플랫폼 어드민 웹의 /rbac 경로와 일치시킴 (DB 자원과 하이퍼링크 매핑 통일)
        let toPath = `/${res.code.toLowerCase()}`;
        if (res.path === '/roles') {
          toPath = '/rbac';
        }
        else if (res.path) {
          toPath = res.path;
        }

        // Lucide 아이콘 매핑
        const iconKey = res.icon || 'Shield';
        const IconComponent = IconMap[iconKey] || Shield;

        return {
          label: res.name,
          icon: IconComponent,
          to: toPath,
          requiredPermission,
          displayOrder: res.displayOrder ?? 99,
        };
      })
      .sort((a, b) => a.displayOrder - b.displayOrder)
    : [];

  const visibleMenuItems = menuItemsFromApi.filter(
    (item) => permissions.includes(item.requiredPermission),
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
          <div className="text-xl font-bold text-slate-800 tracking-tight">PLATFORM ADMIN</div>
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
