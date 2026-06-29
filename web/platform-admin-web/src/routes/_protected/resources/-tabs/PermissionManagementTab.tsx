import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, ScrollArea } from '@pkg/ui';
import { AlertCircle, Key, Loader2, Shield, TreePine } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useResourceControllerGetResourceListV1, useResourceControllerGetRolePermissionListV1 } from '@/api/generated/endpoints';
import { GetResourceListFiltersDtoScope,
         type GetResourceListItem,
         GetResourceListItemType,
         type RolePermissionListItem } from '@/api/generated/model';
import { pickApiItems } from '@/lib/api-response';

const CRUD_ORDER = ['CREATE', 'READ', 'UPDATE', 'DELETE'] as const;

type ActionType = (typeof CRUD_ORDER)[number];

type ResourceRow = GetResourceListItem & {
  depth: number
};

const EMPTY_ROLE_PERMISSIONS: RolePermissionListItem[] = [];

function isActionType(value: string): value is ActionType {
  return CRUD_ORDER.includes(value as ActionType);
}

function buildPermissionCode(resourceCode: string, action: ActionType): string {
  return `${resourceCode}:${action}`;
}

function flattenResourceTree(nodes: readonly GetResourceListItem[], depth = 0): ResourceRow[] {
  return nodes.flatMap((node) => ([
    { ...node, depth },
    ...flattenResourceTree(node.children ?? [], depth + 1),
  ]));
}

function actionTone(active: boolean) {
  return active
    ? 'border-sky-200 bg-sky-50 text-sky-700'
    : 'border-slate-200 bg-white text-slate-400';
}

function resourceTypeTone(type: GetResourceListItemType) {
  return type === GetResourceListItemType.MENU
    ? 'border-slate-200 bg-slate-100 text-slate-600'
    : 'border-indigo-200 bg-indigo-50 text-indigo-700';
}

export function PermissionManagementTab() {
  const [selectedRolePermissionId, setSelectedRolePermissionId] = useState<string>('');

  const rolePermissionsQuery = useResourceControllerGetRolePermissionListV1({
    query: {
      select: (response) => pickApiItems(response),
    },
  });
  const resourcesQuery = useResourceControllerGetResourceListV1({
    filters: {
      scope: GetResourceListFiltersDtoScope.ORGANIZATION,
    },
    limit: 1000,
    offset: 0,
  }, {
    query: {
      select: (response) => pickApiItems(response),
    },
  });

  const rolePermissions = rolePermissionsQuery.data ?? EMPTY_ROLE_PERMISSIONS;
  const resourceRows = useMemo(
    () => flattenResourceTree(resourcesQuery.data ?? []),
    [resourcesQuery.data],
  );
  const selectedRolePermission = rolePermissions.find((rolePermission) => rolePermission.id === selectedRolePermissionId) ?? rolePermissions[0] ?? null;
  const permissionCodes = new Set(selectedRolePermission?.permissions ?? []);

  const isLoading = rolePermissionsQuery.isLoading || resourcesQuery.isLoading;
  let rolePermissionContent: React.ReactNode;
  let resourceContent: React.ReactNode;

  if (isLoading && rolePermissions.length === 0) {
    rolePermissionContent = (
      <div className="
        flex min-h-55 items-center justify-center rounded-sm border
        border-dashed border-slate-200 bg-slate-50/50 text-sm text-slate-500
      "
      >
        <Loader2 className="mr-2 size-4 animate-spin" />
        역할 권한을 불러오는 중입니다...
      </div>
    );
  }
  else if (rolePermissions.length === 0) {
    rolePermissionContent = (
      <div className="
        grid place-items-center rounded-sm border border-dashed border-slate-200
        bg-slate-50/50 px-3 py-8 text-sm text-slate-500
      "
      >
        등록된 역할 권한이 없습니다.
      </div>
    );
  }
  else {
    rolePermissionContent = (
      <>
        {rolePermissions.map((rolePermission) => {
          const isSelected = rolePermission.id === selectedRolePermission?.id;

          return (
            <button
              key={rolePermission.id}
              type="button"
              onClick={() => setSelectedRolePermissionId(rolePermission.id)}
              className={`
                w-full rounded-lg border p-3 text-left transition
                ${
            isSelected
              ? 'border-slate-300 bg-slate-50'
              : `
                border-slate-100 bg-white
                hover:border-slate-200 hover:bg-slate-50
              `
            }
              `}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{rolePermission.name}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">{rolePermission.description || '설명이 없습니다.'}</p>
                </div>
                <Badge
                  variant="secondary"
                  className="shrink-0 bg-slate-100 text-[10px] text-slate-500"
                >
                  {rolePermission.code}
                </Badge>
              </div>
              <div className="
                mt-3 flex items-center gap-2 text-xs text-slate-500
              "
              >
                <Key className="size-3.5" />
                {rolePermission.permissions.length}
                개 권한
              </div>
            </button>
          );
        })}
      </>
    );
  }

  if (isLoading && resourceRows.length === 0) {
    resourceContent = (
      <div className="
        flex min-h-80 items-center justify-center px-6 py-10 text-sm
        text-slate-500
      "
      >
        <Loader2 className="mr-2 size-4 animate-spin" />
        리소스 목록을 불러오는 중입니다...
      </div>
    );
  }
  else if (resourceRows.length === 0) {
    resourceContent = (
      <div className="
        flex min-h-80 items-center justify-center px-6 py-10 text-sm
        text-slate-500
      "
      >
        <AlertCircle className="mr-2 size-4" />
        사용할 수 있는 리소스가 없습니다.
      </div>
    );
  }
  else {
    resourceContent = (
      <ScrollArea className="h-135">
        <div className="space-y-3 p-4">
          {resourceRows.map((row) => (
            <div
              key={row.id}
              className="rounded-lg border border-slate-200 bg-white p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className={`
                    text-[10px]
                    ${resourceTypeTone(row.type)}
                  `}
                >
                  {row.type}
                </Badge>
                <span className="font-medium text-slate-900" style={{ paddingLeft: `${row.depth * 12}px` }}>
                  {row.name}
                </span>
                <span className="font-mono text-xs text-slate-500">
                  (
                  {row.code}
                  )
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {row.actions.filter(isActionType).map((action) => {
                  const permissionCode = buildPermissionCode(row.code, action);
                  const active = permissionCodes.has(permissionCode);

                  return (
                    <Badge
                      key={permissionCode}
                      variant="outline"
                      className={`
                        rounded-full px-2.5 py-1 text-[11px]
                        ${actionTone(active)}
                      `}
                    >
                      {action}
                    </Badge>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  }

  return (
    <div className="
      grid gap-4
      lg:grid-cols-[320px_minmax(0,1fr)]
    "
    >
      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-4" />
            역할 권한
          </CardTitle>
          <CardDescription>
            생성된 API에는 조회만 포함되어 있어 역할 권한 편집 기능은 제공하지 않습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-135">
            <div className="space-y-2 p-3">{rolePermissionContent}</div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="flex items-center gap-2">
            <TreePine className="size-4" />
            리소스 권한 맵
          </CardTitle>
          <CardDescription>
            선택된 역할 권한에 포함된 권한 코드만 표시합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {resourceContent}
        </CardContent>
      </Card>
    </div>
  );
}
