import { Badge, Button, confirm, toast } from '@pkg/ui';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowDown, ArrowUp, ChevronDown, ChevronRight, FileCode2, Folder, ListCollapse, ListTree, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';

import { useResourceControllerCreateResourceV1,
         useResourceControllerDeleteResourceV1,
         useResourceControllerGetResourceListV1,
         useResourceControllerUpdateResourceSortV1, useResourceControllerUpdateResourceV1 } from '@/api/generated/endpoints';
import { type CreateResourceRequestDto,
         type DeleteResourceRequestDto,
         GetResourceListFiltersDtoScope,
         type GetResourceListItem,
         type GetResourceListItemScope,
         GetResourceListItemType,
         type UpdateResourceRequestDto,
         type UpdateResourceSortRequestDto } from '@/api/generated/model';
import { useSession } from '@/hooks/useSession';
import { pickApiItems } from '@/lib/api-response';

import { ConsolePanel } from '../../-components/ConsolePanel';
import { RESOURCE_ACTION_OPTIONS, type ResourceAction } from '../-helpers/resource-actions.helper';
import { flattenResourceTree, type ResourceRow } from '../-helpers/resource-tree.helper';
import { type CreateMenuInput, MenuRegistrationModal } from '../-modals/MenuRegistrationModal';
import { ResourceEditModal } from '../-modals/ResourceEditModal';
import { type CreateSubResourceInput, SubResourceRegistrationModal } from '../-modals/SubResourceRegistrationModal';

type ResourceScopeType = GetResourceListFiltersDtoScope;

function compareBySortOrder(
  left: {
    readonly code: string
    readonly sortOrder: number | null
  },
  right: {
    readonly code: string
    readonly sortOrder: number | null
  },
): number {
  if (!left.sortOrder && !right.sortOrder) {
    return left.code.localeCompare(right.code);
  }

  if (!left.sortOrder) {
    return 1;
  }

  if (!right.sortOrder) {
    return -1;
  }

  const diff = left.sortOrder - right.sortOrder;
  return diff !== 0 ? diff : left.code.localeCompare(right.code);
}

function buildResourceSortPayload(
  rows: ResourceRow[],
  parentId: string | undefined,
): UpdateResourceSortRequestDto {
  return {
    items: rows.map((row, index) => ({
      id: row.id,
      sortOrder: index + 1,
      parent: parentId,
    })),
  };
}

function resolveResourceTypeLabel(type: GetResourceListItemType): string {
  return type;
}

function resolveResourceScopeLabel(scope: GetResourceListItemScope): string {
  if (scope === GetResourceListFiltersDtoScope.PLATFORM) {
    return '플랫폼';
  }

  return '일반';
}

function getResourceIcon(type: GetResourceListItemType) {
  return type === GetResourceListItemType.MENU ? Folder : FileCode2;
}

function collectExpandableResourceIds(nodes: readonly GetResourceListItem[]): string[] {
  return nodes.flatMap((node) => ([
    ...(node.children.length > 0 ? [node.id] : []),
    ...collectExpandableResourceIds(node.children),
  ]));
}

function collectLockedMenuActions(resourceId: string, rows: ResourceRow[]): ResourceAction[] {
  const children = rows.filter((row) => row.parent === resourceId);
  const lockedActions = new Set<ResourceAction>();

  for (const child of children) {
    if (child.type === GetResourceListItemType.COMPONENT) {
      for (const action of RESOURCE_ACTION_OPTIONS) {
        if (child.actions.includes(action)) {
          lockedActions.add(action);
        }
      }
    }

    for (const action of collectLockedMenuActions(child.id, rows)) {
      lockedActions.add(action);
    }
  }

  return [...lockedActions];
}

interface ResourceTreeSectionProps {
  readonly isActive?: boolean
}

export function ResourceTreeSection({
  isActive = true,
}: ResourceTreeSectionProps) {
  const queryClient = useQueryClient();
  const session = useSession();
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');
  const [expandedResourceIds, setExpandedResourceIds] = useState<Record<string, boolean>>({});
  const [menuCreateOpen, setMenuCreateOpen] = useState(false);
  const [subResourceCreateOpen, setSubResourceCreateOpen] = useState(false);
  const [subResourceTargetId, setSubResourceTargetId] = useState<string>('');
  const [subResourceTargetName, setSubResourceTargetName] = useState<string>('');
  const [editOpen, setEditOpen] = useState(false);
  const isPlatformOrganization = session.data?.organization?.code === 'platform';
  const defaultCreateScope: ResourceScopeType = isPlatformOrganization
    ? GetResourceListFiltersDtoScope.PLATFORM
    : GetResourceListFiltersDtoScope.ORGANIZATION;

  const resourceQuery = useResourceControllerGetResourceListV1({
    filters: { scope: GetResourceListFiltersDtoScope.ORGANIZATION },
    limit: 1000,
    offset: 0,
  }, {
    query: {
      select: (response) => pickApiItems(response),
    },
  });

  const createResourceMutation = useResourceControllerCreateResourceV1({
    mutation: {
      onSuccess: async (response) => {
        await queryClient.invalidateQueries({ queryKey: resourceQuery.queryKey });
        const createdId = (response as { data?: { id?: string } }).data?.id;

        if (typeof createdId === 'string' && createdId.length > 0) {
          setSelectedResourceId(createdId);
        }
        toast.success('리소스를 추가했습니다.');
      },
    },
  });

  const updateResourceMutation = useResourceControllerUpdateResourceV1({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: resourceQuery.queryKey });
        toast.success('리소스를 수정했습니다.');
      },
    },
  });

  const deleteResourceMutation = useResourceControllerDeleteResourceV1({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: resourceQuery.queryKey });
        setSelectedResourceId('');
        toast.success('리소스를 삭제했습니다.');
      },
    },
  });

  const updateResourceSortMutation = useResourceControllerUpdateResourceSortV1({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: resourceQuery.queryKey });
        toast.success('리소스 정렬 순서를 업데이트했습니다.');
      },
    },
  });

  const resourceRows = useMemo(
    () => flattenResourceTree(resourceQuery.data ?? []),
    [resourceQuery.data],
  );

  const resourceTree = useMemo(
    () => (resourceQuery.data ?? []).slice().sort(compareBySortOrder),
    [resourceQuery.data],
  );
  const expandableResourceIds = useMemo(
    () => collectExpandableResourceIds(resourceTree),
    [resourceTree],
  );

  const selectedResource = resourceRows.find((row) => row.id === selectedResourceId)
    ?? resourceRows[0]
    ?? null;
  const selectedParentResource = selectedResource?.parent
    ? resourceRows.find((row) => row.id === selectedResource.parent) ?? null
    : null;
  const selectedResourceChildren = selectedResource
    ? resourceRows.filter((row) => row.parent === selectedResource.id)
    : [];
  const selectedResourceLockedActions = selectedResource?.type === GetResourceListItemType.MENU
    ? collectLockedMenuActions(selectedResource.id, resourceRows)
    : [];
  const siblingRows = selectedResource
    ? resourceRows.filter((row) => row.depth === selectedResource.depth && row.parent === selectedResource.parent)
    : [];
  const selectedSiblingIndex = selectedResource
    ? siblingRows.findIndex((row) => row.id === selectedResource.id)
    : -1;

  const isLoading = resourceQuery.isLoading && resourceRows.length === 0;
  const showEmpty = !resourceQuery.isLoading && resourceRows.length === 0;
  const treeContent = renderTreeContent(
    isLoading,
    showEmpty,
    resourceTree,
    selectedResourceId,
    setSelectedResourceId,
    expandedResourceIds,
    (resourceId) => {
      setExpandedResourceIds((previous) => ({
        ...previous,
        [resourceId]: !(previous[resourceId] ?? true),
      }));
    },
    (resourceId, resourceName) => {
      setSelectedResourceId(resourceId);
      setSubResourceTargetId(resourceId);
      setSubResourceTargetName(resourceName);
      setSubResourceCreateOpen(true);
    },
  );
  const expandAllResources = () => {
    setExpandedResourceIds(
      Object.fromEntries(expandableResourceIds.map((resourceId) => [resourceId, true])),
    );
  };

  const collapseAllResources = () => {
    setExpandedResourceIds(
      Object.fromEntries(expandableResourceIds.map((resourceId) => [resourceId, false])),
    );
  };

  const handleCreateMenu = async (input: CreateMenuInput) => {
    await createResourceMutation.mutateAsync({
      data: {
        code: input.code,
        name: input.name,
        type: 'MENU',
        scope: input.scope,
        path: input.path,
        icon: input.icon,
        actions: input.actions,
      } satisfies CreateResourceRequestDto,
    });
  };

  const handleCreateSubResource = async (input: CreateSubResourceInput) => {
    const targetResource = resourceRows.find((row) => row.id === subResourceTargetId) ?? selectedResource;

    if (!targetResource) {
      return;
    }

    await createResourceMutation.mutateAsync({
      data: {
        code: input.code,
        name: input.name,
        type: 'COMPONENT',
        scope: targetResource.scope,
        parent: targetResource.id,
        actions: input.actions,
      } satisfies CreateResourceRequestDto,
    });
  };

  const handleUpdateResource = async (input: {
    code?: string
    name?: string
    scope?: ResourceScopeType
    path?: string
    icon?: string
    actions?: ResourceAction[]
  }) => {
    if (!selectedResource) {
      return;
    }

    await updateResourceMutation.mutateAsync({
      data: {
        id: selectedResource.id,
        code: input.code ?? selectedResource.code,
        name: input.name ?? selectedResource.name,
        type: selectedResource.type,
        scope: input.scope ?? selectedResource.scope,
        parent: selectedResource.parent,
        path: input.path,
        icon: input.icon,
        sortOrder: selectedResource.sortOrder,
        actions: input.actions ?? selectedResource.actions,
      } satisfies UpdateResourceRequestDto,
    });
  };

  const handleDeleteResource = async () => {
    if (!selectedResource) {
      return;
    }

    const confirmed = await confirm({
      title: '리소스를 삭제할까요?',
      description: '삭제한 리소스는 복구할 수 없습니다.',
      actionText: '삭제',
      cancelText: '취소',
    });

    if (!confirmed) {
      return;
    }

    await deleteResourceMutation.mutateAsync({
      data: {
        id: selectedResource.id,
      } satisfies DeleteResourceRequestDto,
    });
  };

  const handleMoveResource = async (direction: 'up' | 'down') => {
    if (!selectedResource || selectedSiblingIndex < 0) {
      return;
    }

    const nextIndex = direction === 'up'
      ? selectedSiblingIndex - 1
      : selectedSiblingIndex + 1;

    if (nextIndex < 0 || nextIndex >= siblingRows.length) {
      return;
    }

    const nextSiblings = siblingRows.slice();
    const [moved] = nextSiblings.splice(selectedSiblingIndex, 1);
    nextSiblings.splice(nextIndex, 0, moved);

    await updateResourceSortMutation.mutateAsync({
      data: buildResourceSortPayload(nextSiblings, selectedResource.parent),
    });
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className="
      grid h-full min-h-0 gap-4
      lg:grid-cols-[360px_minmax(0,1fr)]
    "
    >
      <ConsolePanel
        icon="folder-tree"
        title="리소스 트리"
        description="플랫폼 관리자와 조직 관리자용 리소스를 한 번에 관리합니다."
        actions={[
          <Button
            key="create-menu"
            type="button"
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => setMenuCreateOpen(true)}
          >
            <Plus className="size-3.5" />
            메뉴 추가
          </Button>,
        ]}
      >
        <div className="
          grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden
          rounded-lg border border-slate-200 bg-white
        "
        >
          <div className="
            flex items-center justify-between gap-2 border-b border-slate-200
            bg-slate-50 px-3 py-2
          "
          >
            <div />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="
                  size-7 p-0 text-slate-500
                  hover:bg-slate-100 hover:text-slate-700
                "
                onClick={() => void handleMoveResource('up')}
                disabled={selectedSiblingIndex <= 0}
                title="위로"
                aria-label="위로"
              >
                <ArrowUp className="size-3.5" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="
                  size-7 p-0 text-slate-500
                  hover:bg-slate-100 hover:text-slate-700
                "
                onClick={() => void handleMoveResource('down')}
                disabled={selectedSiblingIndex < 0 || selectedSiblingIndex >= siblingRows.length - 1}
                title="아래로"
                aria-label="아래로"
              >
                <ArrowDown className="size-3.5" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="
                  size-7 p-0 text-slate-500
                  hover:bg-slate-100 hover:text-slate-700
                "
                onClick={expandAllResources}
                disabled={expandableResourceIds.length === 0}
                title="모두 펼치기"
                aria-label="모두 펼치기"
              >
                <ListTree className="size-3.5" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="
                  size-7 p-0 text-slate-500
                  hover:bg-slate-100 hover:text-slate-700
                "
                onClick={collapseAllResources}
                disabled={expandableResourceIds.length === 0}
                title="모두 접기"
                aria-label="모두 접기"
              >
                <ListCollapse className="size-3.5" />
              </Button>
            </div>
          </div>
          <div className="scroll-y min-h-0">
            {treeContent}
          </div>
        </div>
      </ConsolePanel>

      <div className="grid min-h-0 gap-4">
        <ConsolePanel
          icon="pencil"
          title="리소스 세부"
          description="선택된 리소스의 기본 정보와 허용 기능을 확인하고 편집합니다."
          actions={[
            <Button
              key="edit"
              type="button"
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => setEditOpen(true)}
              disabled={!selectedResource}
            >
              <Pencil className="size-3.5" />
              수정
            </Button>,
            <Button
              key="delete"
              type="button"
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => void handleDeleteResource()}
              disabled={!selectedResource || deleteResourceMutation.isPending}
            >
              <Trash2 className="size-3.5" />
              삭제
            </Button>,
          ]}
        >
          {selectedResource
            ? (
              <div className="space-y-4">
                <section
                  className="
                    rounded-xl border border-slate-200 bg-white shadow-sm
                  "
                >
                  <div className="border-b border-slate-200 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">
                        {resolveResourceTypeLabel(selectedResource.type)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="
                          border-slate-200 bg-slate-50 text-[10px]
                          text-slate-500
                        "
                      >
                        {resolveResourceScopeLabel(selectedResource.scope)}
                      </Badge>
                    </div>
                    <div className="mt-3 min-w-0">
                      <h3 className="
                        truncate text-lg font-semibold text-slate-950
                      "
                      >
                        {selectedResource.name}
                      </h3>
                      <p className="mt-1 font-mono text-xs text-slate-500">
                        {selectedResource.code}
                      </p>
                    </div>
                  </div>

                  <dl className="divide-y divide-slate-200">
                    <InfoRow label="부모" value={selectedParentResource?.name ?? '-'} />
                    <InfoRow label="정렬" value={selectedResource.sortOrder?.toString() ?? '-'} mono />
                    <InfoRow label="하위 수" value={selectedResourceChildren.length.toString()} />
                    {selectedResource.type === GetResourceListItemType.MENU
                      ? (
                        <>
                          <InfoRow label="경로" value={selectedResource.path ?? '-'} mono />
                          <InfoRow label="아이콘" value={selectedResource.icon ?? '-'} mono />
                        </>
                      )
                      : null}
                  </dl>
                </section>

                <section
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-900">허용 기능</h3>
                    <span className="text-xs text-slate-500">
                      {selectedResource.actions.length}
                      개
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedResource.actions.length > 0
                      ? selectedResource.actions.map((action) => (
                        <Badge
                          key={action}
                          variant="outline"
                          className="
                            border-slate-200 bg-white text-xs text-slate-600
                          "
                        >
                          {action}
                        </Badge>
                      ))
                      : <span className="text-sm text-slate-400">허용 기능 없음</span>}
                  </div>
                </section>
              </div>
            )
            : (
              <div className="
                grid min-h-80 place-items-center rounded-xl border border-dashed
                border-slate-200 bg-slate-50 px-6 py-10 text-sm text-slate-500
              "
              >
                리소스를 선택하면 세부 정보와 편집 기능이 표시됩니다.
              </div>
            )}
        </ConsolePanel>

      </div>

      <MenuRegistrationModal
        open={menuCreateOpen}
        onOpenChange={setMenuCreateOpen}
        defaultScope={defaultCreateScope}
        onSave={handleCreateMenu}
      />

      <SubResourceRegistrationModal
        open={subResourceCreateOpen}
        onOpenChange={setSubResourceCreateOpen}
        parentName={subResourceTargetName || selectedResource?.name}
        availableActions={resourceRows.find((row) => row.id === subResourceTargetId)?.actions ?? selectedResource?.actions ?? []}
        onSave={handleCreateSubResource}
      />

      <ResourceEditModal
        key={selectedResource?.id ?? 'resource-edit'}
        open={editOpen}
        onOpenChange={setEditOpen}
        resource={selectedResource}
        availableActions={selectedResource?.type === 'COMPONENT' ? selectedParentResource?.actions : undefined}
        lockedActions={selectedResourceLockedActions}
        onSave={handleUpdateResource}
      />

    </div>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  readonly label: string
  readonly value: string
  readonly mono?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <dt className="
        shrink-0 text-xs font-medium tracking-wide text-slate-400 uppercase
      "
      >
        {label}
      </dt>
      <dd
        className={`
          min-w-0 text-right text-sm text-slate-700
          ${mono ? 'font-mono' : ''}
        `}
      >
        {value}
      </dd>
    </div>
  );
}

function renderTreeContent(
  isLoading: boolean,
  showEmpty: boolean,
  resourceNodes: GetResourceListItem[],
  selectedResourceId: string,
  onSelect: (id: string) => void,
  expandedResourceIds: Record<string, boolean>,
  onToggle: (id: string) => void,
  onAddComponent: (id: string, name: string) => void,
): ReactNode {
  if (isLoading) {
    return (
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

  if (showEmpty) {
    return (
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

  return (
    <div className="py-1">
      {renderResourceNodes(
        resourceNodes,
        selectedResourceId,
        onSelect,
        expandedResourceIds,
        onToggle,
        onAddComponent,
      )}
    </div>
  );
}

function renderResourceNodes(
  nodes: GetResourceListItem[],
  selectedResourceId: string,
  onSelect: (id: string) => void,
  expandedResourceIds: Record<string, boolean>,
  onToggle: (id: string) => void,
  onAddComponent: (id: string, name: string) => void,
  depth = 0,
): ReactNode {
  const sortedNodes = [...nodes].sort(compareBySortOrder);

  return sortedNodes.map((node) => {
    const isSelected = node.id === selectedResourceId;
    const ResourceIcon = getResourceIcon(node.type);
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedResourceIds[node.id] ?? true;
    let toggleIcon: ReactNode = null;
    if (hasChildren) {
      toggleIcon = isExpanded
        ? <ChevronDown className="size-3" />
        : <ChevronRight className="size-3" />;
    }

    let toggleLabel: string | undefined;
    if (hasChildren) {
      toggleLabel = isExpanded ? '접기' : '펼치기';
    }

    return (
      <div key={node.id}>
        <div
          className={`
            group flex w-full items-center gap-2 text-sm transition-colors
            ${isSelected
        ? 'bg-sky-100 text-slate-950'
        : `
          bg-white text-slate-700
          hover:bg-slate-50
        `
      }
          `}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
          title={node.code}
        >
          <button
            type="button"
            className="
              flex size-4 shrink-0 items-center justify-center text-slate-300
              transition-colors
              hover:text-slate-500
            "
            onClick={(event) => {
              event.stopPropagation();
              if (hasChildren) {
                onToggle(node.id);
              }
            }}
            aria-label={toggleLabel}
          >
            {toggleIcon}
          </button>
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left"
            onClick={() => onSelect(node.id)}
          >
            <ResourceIcon className={`
              size-4 shrink-0
              ${node.type === 'MENU' ? 'text-slate-500' : 'text-slate-400'}
            `}
            />
            <span className="min-w-0 flex-1 truncate">{node.name}</span>
          </button>
          {node.type === GetResourceListItemType.MENU
            ? (
              <button
                type="button"
                className="
                  mr-2 ml-auto flex size-7 shrink-0 items-center justify-center
                  rounded-md text-slate-400 opacity-0 transition
                  group-hover:opacity-100
                  hover:bg-slate-100 hover:text-slate-600
                  focus:opacity-100
                "
                title="컴포넌트 추가"
                aria-label="컴포넌트 추가"
                onClick={(event) => {
                  event.stopPropagation();
                  onAddComponent(node.id, node.name);
                }}
              >
                <Plus className="size-3.5" />
              </button>
            )
            : null}
        </div>
        {hasChildren && isExpanded
          ? renderResourceNodes(
            node.children,
            selectedResourceId,
            onSelect,
            expandedResourceIds,
            onToggle,
            onAddComponent,
            depth + 1,
          )
          : null}
      </div>
    );
  });
}
