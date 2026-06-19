import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, ScrollArea } from '@pkg/ui';
import { AlertCircle, Key, Loader2, Shield, TreePine } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useResourceControllerGetPermissionSetsV1, useResourceControllerGetResourcePageV1 } from '@/api/generated/endpoints';
import type { GetPermissionSetResponseDto, GetResourceResponseDto } from '@/api/generated/model';
import { GetResourcePageFiltersDtoScope, GetResourceResponseDtoType } from '@/api/generated/model';

const CRUD_ORDER = ['CREATE', 'READ', 'UPDATE', 'DELETE'] as const;

type ActionType = (typeof CRUD_ORDER)[number];

type ResourceRow = GetResourceResponseDto & {
  depth: number
};

const EMPTY_PERMISSION_SETS: GetPermissionSetResponseDto[] = [];
const EMPTY_RESOURCE_ROWS: GetResourceResponseDto[] = [];

function isActionType(value: string): value is ActionType {
  return CRUD_ORDER.includes(value as ActionType);
}

function buildPermissionCode(resourceCode: string, action: ActionType): string {
  return `${resourceCode}:${action}`;
}

function flattenResourceTree(nodes: readonly GetResourceResponseDto[], depth = 0): ResourceRow[] {
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

function resourceTypeTone(type: GetResourceResponseDtoType) {
  return type === GetResourceResponseDtoType.MENU
    ? 'border-slate-200 bg-slate-100 text-slate-600'
    : 'border-indigo-200 bg-indigo-50 text-indigo-700';
}

export function PermissionManagementTab() {
  const [selectedPermissionSetId, setSelectedPermissionSetId] = useState<string>('');

  const permissionSetsQuery = useResourceControllerGetPermissionSetsV1();
  const resourcesQuery = useResourceControllerGetResourcePageV1({
    filters: {
      scope: GetResourcePageFiltersDtoScope.ORGANIZATION,
    },
    limit: 1000,
    offset: 0,
  });

  const permissionSets = permissionSetsQuery.data?.data ?? EMPTY_PERMISSION_SETS;
  const resourceRows = useMemo(
    () => flattenResourceTree(resourcesQuery.data?.data ?? EMPTY_RESOURCE_ROWS),
    [resourcesQuery.data?.data],
  );
  const selectedPermissionSet = permissionSets.find((permissionSet) => permissionSet.id === selectedPermissionSetId) ?? permissionSets[0] ?? null;
  const permissionCodes = new Set(selectedPermissionSet?.permissions ?? []);

  const isLoading = permissionSetsQuery.isLoading || resourcesQuery.isLoading;
  let permissionSetContent: React.ReactNode;
  let resourceContent: React.ReactNode;

  if (isLoading && permissionSets.length === 0) {
    permissionSetContent = (
      <div className="flex min-h-[220px] items-center justify-center rounded border border-dashed border-slate-200 bg-slate-50/50 text-sm text-slate-500">
        <Loader2 className="mr-2 size-4 animate-spin" />
        권한 세트를 불러오는 중입니다...
      </div>
    );
  }
  else if (permissionSets.length === 0) {
    permissionSetContent = (
      <div className="grid place-items-center rounded border border-dashed border-slate-200 bg-slate-50/50 px-3 py-8 text-sm text-slate-500">
        등록된 권한 세트가 없습니다.
      </div>
    );
  }
  else {
    permissionSetContent = (
      <>
        {permissionSets.map((permissionSet) => {
          const isSelected = permissionSet.id === selectedPermissionSet?.id;

          return (
            <button
              key={permissionSet.id}
              type="button"
              onClick={() => setSelectedPermissionSetId(permissionSet.id)}
              className={`w-full rounded-lg border p-3 text-left transition ${
                isSelected
                  ? 'border-slate-300 bg-slate-50'
                  : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{permissionSet.name}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">{permissionSet.description || '설명이 없습니다.'}</p>
                </div>
                <Badge variant="secondary" className="shrink-0 bg-slate-100 text-[10px] text-slate-500">
                  {permissionSet.code}
                </Badge>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <Key className="size-3.5" />
                {permissionSet.permissions.length}
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
      <div className="flex min-h-[320px] items-center justify-center px-6 py-10 text-sm text-slate-500">
        <Loader2 className="mr-2 size-4 animate-spin" />
        리소스 목록을 불러오는 중입니다...
      </div>
    );
  }
  else if (resourceRows.length === 0) {
    resourceContent = (
      <div className="flex min-h-[320px] items-center justify-center px-6 py-10 text-sm text-slate-500">
        <AlertCircle className="mr-2 size-4" />
        사용할 수 있는 리소스가 없습니다.
      </div>
    );
  }
  else {
    resourceContent = (
      <ScrollArea className="h-[540px]">
        <div className="space-y-3 p-4">
          {resourceRows.map((row) => (
            <div key={row.id} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className={`text-[10px] ${resourceTypeTone(row.type)}`}>
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
                      className={`rounded-full px-2.5 py-1 text-[11px] ${actionTone(active)}`}
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
    <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-4" />
            권한 세트
          </CardTitle>
          <CardDescription>
            생성된 API에는 조회만 포함되어 있어 권한 편집 기능은 제공하지 않습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[540px]">
            <div className="space-y-2 p-3">{permissionSetContent}</div>
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
            선택된 권한 세트에 포함된 권한 코드만 표시합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {resourceContent}
        </CardContent>
      </Card>
    </div>
  );
}
