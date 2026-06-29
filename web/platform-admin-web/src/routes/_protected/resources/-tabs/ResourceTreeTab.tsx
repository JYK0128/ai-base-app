import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, ScrollArea } from '@pkg/ui';
import { AlertCircle, FolderTree, Loader2 } from 'lucide-react';
import { type ReactNode, useMemo } from 'react';

import { useResourceControllerGetResourceListV1 } from '@/api/generated/endpoints';
import { GetResourceListFiltersDtoScope,
         type GetResourceListItem,
         GetResourceListItemType } from '@/api/generated/model';
import { pickApiItems } from '@/lib/api-response';

import { ResourcePanel } from './ResourcePanel';

interface ResourceTreeTabProps {
  readonly locales?: unknown[]
}

interface ResourceRow extends GetResourceListItem {
  readonly depth: number
}

function flattenResources(nodes: readonly GetResourceListItem[], depth = 0): ResourceRow[] {
  return nodes.flatMap((node) => ([
    { ...node, depth },
    ...flattenResources(node.children ?? [], depth + 1),
  ]));
}

function resourceTypeTone(type: GetResourceListItemType) {
  if (type === GetResourceListItemType.MENU) {
    return 'border-slate-200 bg-slate-100 text-slate-600';
  }

  return 'border-indigo-200 bg-indigo-50 text-indigo-700';
}

export function ResourceTreeTab({ locales }: ResourceTreeTabProps) {
  const resourceQuery = useResourceControllerGetResourceListV1({
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

  const resourceRows = useMemo(
    () => flattenResources(resourceQuery.data ?? []),
    [resourceQuery.data],
  );
  let treeContent: ReactNode;

  if (resourceQuery.isLoading && resourceRows.length === 0) {
    treeContent = (
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
    treeContent = (
      <div className="
        flex min-h-80 items-center justify-center px-6 py-10 text-sm
        text-slate-500
      "
      >
        <AlertCircle className="mr-2 size-4" />
        등록된 리소스가 없습니다.
      </div>
    );
  }
  else {
    treeContent = (
      <div className="space-y-2 p-4">
        {resourceRows.map((row) => {
          const actions = row.actions ?? [];

          return (
            <div
              key={row.id}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3"
              style={{ marginLeft: `${row.depth * 16}px` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
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
                    <span className="truncate font-semibold text-slate-900">{row.name}</span>
                  </div>
                  <p className="mt-1 truncate font-mono text-xs text-slate-500">
                    {row.code}
                    {row.path ? ` · ${row.path}` : ''}
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className="
                    shrink-0 border-slate-200 bg-white text-[10px]
                    text-slate-500
                  "
                >
                  {row.scope}
                </Badge>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {actions.length > 0
                  ? actions.map((action) => (
                    <Badge
                      key={`${row.id}-${action}`}
                      variant="outline"
                      className="
                        border-slate-200 bg-white text-[10px] text-slate-600
                      "
                    >
                      {action}
                    </Badge>
                  ))
                  : <span className="text-xs text-slate-400">허용 액션 없음</span>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="
      grid gap-4
      lg:grid-cols-[minmax(0,1fr)_320px]
    "
    >
      <ResourcePanel
        icon={<FolderTree className="size-4 text-sky-600" />}
        title="리소스 트리"
        description="현재 계약에는 조회만 존재합니다. 편집/삭제/권한 수정 기능은 제거했습니다."
      >
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <ScrollArea className="h-135">
            {treeContent}
          </ScrollArea>
        </div>
      </ResourcePanel>

      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="size-4" />
            사용 안내
          </CardTitle>
          <CardDescription>
            {(locales ?? []).length > 0 ? '다국어 설정이 연결되어 있습니다.' : '다국어 설정이 없습니다.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-sm text-slate-600">
          <p>
            생성된 API 계약에는 리소스 생성, 수정, 삭제, 정렬, 권한 변경이 포함되어 있지 않습니다.
          </p>
          <p>
            따라서 이 화면은 서버에서 제공하는 리소스 구조를 조회하는 용도로만 사용합니다.
          </p>
          <p className="
            rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3
            py-2 text-xs text-slate-500
          "
          >
            `ResourceControl` 은 generated API의 리소스 트리를 기준으로 접근 제어를 수행합니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
