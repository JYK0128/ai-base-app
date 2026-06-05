import { Badge, Button, Checkbox, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Label, RadioGroup, RadioGroupItem, SortableTree, type SortableTreeMove, Switch, toast, type TreeNode } from '@pkg/ui';
import { useQueryClient } from '@tanstack/react-query';
import * as LucideIcons from 'lucide-react';
import { Languages, ListTree, Loader2, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import React, { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getResourceControllerGetResourcesV1QueryKey, useResourceControllerCreateResourceV1, useResourceControllerDeleteResourceV1, useResourceControllerGetResourcesV1, useResourceControllerUpdateResourcePermissionsV1, useResourceControllerUpdateResourceSortV1, useResourceControllerUpdateResourceV1 } from '../../../../api/endpoints';
import type { LocaleDto, ResourceResponseDto } from '../../../../api/model';
import { ResourceResponseDtoScope } from '../../../../api/model';
import { ResourceControl } from '../../../../components/resource/ResourceControl';
import { CreateMenuInput, MenuRegistrationModal } from '../-modals/MenuRegistrationModal';
import { ResourceEditModal } from '../-modals/ResourceEditModal';
import { ResourceLanguageModal } from '../-modals/ResourceLanguageModal';
import { CreateSubResourceInput, SubResourceRegistrationModal } from '../-modals/SubResourceRegistrationModal';
import { ResourcePanel } from './ResourcePanel';

type ResourcePermissionValue = string[] | string | null | undefined;
type ResourcePermissions = Record<string, ResourcePermissionValue>;

const RESOURCE_ACTIONS = ['CREATE', 'READ', 'UPDATE', 'DELETE'] as const;
const RESOURCE_GROUP_CLASS = 'flex w-fit max-w-full flex-none items-center gap-2 rounded-xl border border-slate-200/50 bg-slate-50/50 px-2 py-1.2 shadow-sm transition-all duration-200 hover:bg-slate-50/90 md:px-3.5 md:py-1.5';
const RESOURCE_GROUP_LABEL_CLASS = 'w-[84px] shrink-0 select-none font-mono text-[9px] font-extrabold tracking-wider text-slate-400';
const EMPTY_PERMISSIONS: ResourcePermissions = {};
const EMPTY_RESOURCES: ResourceResponseDto[] = [];

interface ResourceTreeTabProps {
  readonly locales: LocaleDto[]
}

function buildInitialPermissions(nodes: ResourceResponseDto[]): ResourcePermissions {
  const initialPermissions: ResourcePermissions = {};

  const traverse = (items: ResourceResponseDto[]) => {
    items.forEach((item) => {
      if (item.type === 'MENU') {
        initialPermissions[item.id] = item.actions;
      }
      else if (item.actions && item.actions.length > 0) {
        initialPermissions[item.id] = item.actions[0];
      }
      else {
        initialPermissions[item.id] = item.constraint;
      }

      if (item.children.length) {
        traverse(item.children);
      }
    });
  };

  traverse(nodes);
  return initialPermissions;
}

function buildInitialExpandedNodes(nodes: ResourceResponseDto[]): Record<string, boolean> {
  const initialExpanded: Record<string, boolean> = {};

  nodes.forEach((node) => {
    if (node.children.length > 0) {
      initialExpanded[node.id] = true;
    }
  });

  return initialExpanded;
}

function findParentName(nodes: ResourceResponseDto[], parentId: string | null): string {
  if (!parentId) return '';

  const findName = (items: ResourceResponseDto[]): string => {
    for (const node of items) {
      if (node.id === parentId) {
        return node.name;
      }

      if (node.children.length > 0) {
        const found = findName(node.children);
        if (found !== '') {
          return found;
        }
      }
    }

    return '';
  };

  return findName(nodes);
}

function collectSubtreeIds(nodes: ResourceResponseDto[], targetId: string): string[] {
  const collected: string[] = [];

  const traverse = (items: ResourceResponseDto[]): boolean => {
    for (const node of items) {
      if (node.id === targetId) {
        collected.push(node.id);

        const collectChildren = (children: ResourceResponseDto[]) => {
          children.forEach((child) => {
            collected.push(child.id);
            if (child.children.length > 0) {
              collectChildren(child.children);
            }
          });
        };

        if (node.children.length > 0) {
          collectChildren(node.children);
        }

        return true;
      }

      if (node.children.length > 0 && traverse(node.children)) {
        return true;
      }
    }

    return false;
  };

  traverse(nodes);
  return collected;
}

function renderNodeIcon(node: ResourceResponseDto): ReactNode {
  if (node.type === 'COMPONENT') {
    return null;
  }

  if (node.icon) {
    const IconFromComp = (LucideIcons as unknown as Record<string, typeof LucideIcons.Folder>)[node.icon];
    if (IconFromComp) {
      return <IconFromComp className="w-4 h-4 md:w-5 md:h-5" />;
    }
  }

  return <LucideIcons.Folder className="w-4 h-4 md:w-5 md:h-5" />;
}

function toCreateResourceType(type: ResourceResponseDto['type']): 'MENU' | 'COMPONENT' {
  return type === 'MENU'
    ? 'MENU'
    : 'COMPONENT';
}

interface ResourceNodeActionsProps {
  readonly node: ResourceResponseDto
  readonly currentValue: ResourcePermissionValue
  readonly onChange: (node: ResourceResponseDto, value: ResourcePermissionValue) => void
  readonly parentActions: string[]
  readonly permissions: ResourcePermissions
}

function ResourceNodeActions({ node, currentValue, onChange, parentActions, permissions }: ResourceNodeActionsProps) {
  if (node.type === 'MENU') {
    const currentActions = currentValue as string[];

    const handleToggle = (val: string, checked: boolean) => {
      if (!checked) {
        const isActionUsedByComponents = (children: ResourceResponseDto[], action: string): boolean => {
          return children.some((child) => {
            if (child.type === 'COMPONENT') {
              const childVal = permissions[child.id];
              if (childVal === action) {
                return true;
              }
            }
            if (child.children.length > 0) {
              return isActionUsedByComponents(child.children, action);
            }
            return false;
          });
        };

        if (node.children.length > 0 && isActionUsedByComponents(node.children, val)) {
          toast.error(`하위 컴포넌트가 '${val}' 제약을 사용 중이므로 이 액션을 해제할 수 없습니다.`);
          return;
        }
      }

      const nextValue = checked
        ? [...currentActions, val]
        : currentActions.filter((v) => v !== val);
      onChange(node, nextValue);
    };

    return (
      <div className={RESOURCE_GROUP_CLASS}>
        <span className={RESOURCE_GROUP_LABEL_CLASS}>ACTIONS</span>
        <div className="flex flex-wrap items-center gap-2">
          {RESOURCE_ACTIONS.map((action) => {
            const id = `perm-${node.id}-${action}`;
            const isChecked = currentActions.includes(action);

            return (
              <div
                key={action}
                className="flex items-center gap-1.5 select-none"
              >
                <Checkbox
                  id={id}
                  checked={isChecked}
                  onCheckedChange={(checked) => handleToggle(action, !!checked)}
                />
                <Label
                  htmlFor={id}
                  className="text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  {action}
                </Label>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const currentAction = typeof currentValue === 'string' ? currentValue : null;
  const allowedActions = parentActions;
  const isEnabled = currentAction !== null && currentAction !== '';
  const activeValue = currentAction as string;

  if (!isEnabled) {
    return null;
  }

  return (
    <div className={RESOURCE_GROUP_CLASS}>
      <span className={RESOURCE_GROUP_LABEL_CLASS}>CONSTRAINTS</span>
      <RadioGroup
        name={node.id}
        value={activeValue}
        onValueChange={(value) => onChange(node, value)}
        className="flex flex-wrap items-center gap-2"
      >
        {RESOURCE_ACTIONS.map((action) => {
          const id = `perm-${node.id}-${action}`;
          const isAllowed = allowedActions.includes(action);

          return (
            <div
              key={action}
              className={`flex items-center gap-1.5 select-none ${!isAllowed ? 'opacity-35' : ''}`}
            >
              <RadioGroupItem
                id={id}
                value={action}
                disabled={!isAllowed}
              />
              <Label
                htmlFor={id}
                className={`text-xs font-semibold cursor-pointer ${
                  isAllowed ? 'text-slate-700' : 'text-slate-400 cursor-not-allowed line-through'
                }`}
              >
                {action}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}

interface ResourceNodeComponentToggleProps {
  readonly node: ResourceResponseDto
  readonly currentValue: ResourcePermissionValue
  readonly onChange: (node: ResourceResponseDto, value: ResourcePermissionValue) => void
}

function ResourceNodeComponentToggle({ node, currentValue, onChange }: ResourceNodeComponentToggleProps) {
  const isEnabled = typeof currentValue === 'string' && currentValue !== '';

  return (
    <div className="ml-auto flex items-center gap-2 shrink-0">
      <Switch
        checked={isEnabled}
        onCheckedChange={(checked) => {
          onChange(node, checked ? 'READ' : null);
        }}
      />
      <Label className="text-xs font-semibold text-slate-700">
        제약 적용
      </Label>
    </div>
  );
}

function ResourceNodeMenuButton({ nodeId, onOpenSubModal }: { readonly nodeId: string, readonly onOpenSubModal: (parentId: string) => void }) {
  return (
    <Button
      size="sm"
      type="button"
      variant="ghost"
      className="h-7 w-7 p-0 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-md shrink-0"
      title="컴포넌트 리소스 추가"
      onClick={() => onOpenSubModal(nodeId)}
    >
      <Plus className="w-4 h-4" />
    </Button>
  );
}

function ResourceNodeEditButton({
  node,
  onOpenEditModal,
  title = '리소스 수정',
}: {
  readonly node: ResourceResponseDto
  readonly onOpenEditModal: (node: ResourceResponseDto) => void
  readonly title?: string
}) {
  return (
    <Button
      size="sm"
      type="button"
      variant="ghost"
      className="h-7 w-7 p-0 hover:text-slate-700 hover:bg-slate-100 rounded-md shrink-0"
      title={title}
      onClick={() => onOpenEditModal(node)}
    >
      <Pencil className="w-4 h-4" />
    </Button>
  );
}

function ResourceNodeDeleteButton({ node, onDeleteNode }: { readonly node: ResourceResponseDto, readonly onDeleteNode: (node: ResourceResponseDto) => void }) {
  return (
    <Button
      size="sm"
      type="button"
      variant="ghost"
      className="h-7 w-7 p-0 hover:text-red-600 hover:bg-red-50 rounded-md shrink-0"
      title="리소스 삭제"
      onClick={() => onDeleteNode(node)}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}

function ResourceNodeLanguageButton({ node, onOpenLanguageModal }: { readonly node: ResourceResponseDto, readonly onOpenLanguageModal: (node: ResourceResponseDto) => void }) {
  return (
    <Button
      size="sm"
      type="button"
      variant="ghost"
      className="h-7 w-7 p-0 hover:text-indigo-600 hover:bg-indigo-50 rounded-md shrink-0"
      title="다국어 메시지 작업"
      onClick={() => onOpenLanguageModal(node)}
    >
      <Languages className="w-4 h-4" />
    </Button>
  );
}

function mapResourcesToTreeNodes(resources: ResourceResponseDto[]): TreeNode<ResourceResponseDto | null>[] {
  return resources.map((res) => ({
    id: res.id,
    value: res,
    children: res.children ? mapResourcesToTreeNodes(res.children) : [],
  }));
}

function mapTreeNodesToResources(nodes: readonly TreeNode<ResourceResponseDto | null>[]): ResourceResponseDto[] {
  return nodes
    .filter((node) => node.value !== null)
    .map((node, index) => ({
      ...node.value!,
      sortOrder: index + 1,
      children: node.children ? mapTreeNodesToResources(node.children) : [],
    }));
}

function collectSortUpdates(
  node: TreeNode<ResourceResponseDto | null>,
  updates: Array<{ id: string, sortOrder: number }> = [],
): Array<{ id: string, sortOrder: number }> {
  if (node.children) {
    node.children.forEach((child, index) => {
      const expectedSortOrder = index + 1;
      if (child.value && child.value.sortOrder !== expectedSortOrder) {
        updates.push({
          id: child.id,
          sortOrder: expectedSortOrder,
        });
      }
      collectSortUpdates(child, updates);
    });
  }
  return updates;
}

export function ResourceTreeTab({ locales }: ResourceTreeTabProps) {
  const activeScope = ResourceResponseDtoScope.ORGANIZATION;
  const [expandedIds, setExpandedIds] = useState<readonly string[]>([]);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [selectedEditNode, setSelectedEditNode] = useState<ResourceResponseDto | null>(null);
  const [selectedLanguageNode, setSelectedLanguageNode] = useState<ResourceResponseDto | null>(null);
  const [selectedDeleteNode, setSelectedDeleteNode] = useState<ResourceResponseDto | null>(null);
  const [permissions, setPermissions] = useState<ResourcePermissions>(EMPTY_PERMISSIONS);
  const { t } = useTranslation('common');
  const isOrganizationScope = true;

  const [isSortingMode, setIsSortingMode] = useState(false);
  const [localTree, setLocalTree] = useState<TreeNode<ResourceResponseDto | null> | null>(null);
  const [backupTree, setBackupTree] = useState<TreeNode<ResourceResponseDto | null> | null>(null);
  const [isSortingSaving, setIsSortingSaving] = useState(false);

  const queryClient = useQueryClient();
  const resourceParams = React.useMemo(() => ({ scope: activeScope }), [activeScope]);
  const { data: apiResponse, isLoading, isError, refetch } = useResourceControllerGetResourcesV1(resourceParams);
  const { mutateAsync: createResource, isPending: isCreating } = useResourceControllerCreateResourceV1();
  const { mutateAsync: updateResource, isPending: isUpdating } = useResourceControllerUpdateResourceV1();
  const { mutateAsync: deleteResource, isPending: isDeleting } = useResourceControllerDeleteResourceV1();
  const { mutateAsync: updateResourcePermissions, isPending: isUpdatingPermissions } = useResourceControllerUpdateResourcePermissionsV1();
  const { mutateAsync: updateResourceSort } = useResourceControllerUpdateResourceSortV1();

  const isSaving = isCreating || isUpdating || isDeleting || isUpdatingPermissions || isSortingSaving;
  const resourceTree = apiResponse?.data ?? EMPTY_RESOURCES;

  const initialPermissions = apiResponse?.data ? buildInitialPermissions(apiResponse.data) : EMPTY_PERMISSIONS;
  const displayPermissions = {
    ...initialPermissions,
    ...permissions,
  };

  useEffect(() => {
    setExpandedIds([]);
    setIsMenuModalOpen(false);
    setSubModalOpen(false);
    setEditModalOpen(false);
    setLanguageModalOpen(false);
    setDeleteConfirmOpen(false);
    setSelectedParentId(null);
    setSelectedEditNode(null);
    setSelectedLanguageNode(null);
    setSelectedDeleteNode(null);
    setPermissions(EMPTY_PERMISSIONS);
    setIsSortingMode(false);
    setLocalTree(null);
    setBackupTree(null);
  }, []);

  useEffect(() => {
    if (apiResponse?.data) {
      const initial = buildInitialExpandedNodes(apiResponse.data);
      setExpandedIds(Object.keys(initial));
    }
  }, [apiResponse?.data]);

  useEffect(() => {
    if (apiResponse?.data) {
      setLocalTree({
        id: 'root',
        value: null,
        children: mapResourcesToTreeNodes(apiResponse.data),
      });
    }
  }, [apiResponse?.data]);

  const treeValue = React.useMemo<TreeNode<ResourceResponseDto | null>>(() => {
    if (localTree) return localTree;
    return {
      id: 'root',
      value: null,
      children: mapResourcesToTreeNodes(resourceTree),
    };
  }, [localTree, resourceTree]);

  const canDrop = React.useCallback((move: SortableTreeMove<ResourceResponseDto | null>) => {
    return move.source.parent?.id === move.parentId;
  }, []);

  const handleTreeChange = React.useCallback((
    nextRoot: TreeNode<ResourceResponseDto | null>,
  ) => {
    setLocalTree(nextRoot);
  }, []);

  const handleSaveSort = async () => {
    if (!localTree || !isOrganizationScope) return;

    const updates = collectSortUpdates(localTree);

    if (updates.length === 0) {
      toast.success('정렬 순서에 변경 사항이 없습니다.');
      setIsSortingMode(false);
      return;
    }

    setIsSortingSaving(true);
    try {
      await updateResourceSort({
        data: {
          scope: activeScope,
          items: updates.map((update) => ({
            id: update.id,
            sortOrder: update.sortOrder,
          })),
        },
      });

      const nextResources = mapTreeNodesToResources(localTree.children ?? []);
      queryClient.setQueryData(
        getResourceControllerGetResourcesV1QueryKey(resourceParams),
        (oldData: { data?: ResourceResponseDto[] } | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: nextResources,
          };
        },
      );

      toast.success('정렬 순서가 저장되었습니다.');
      setIsSortingMode(false);
      void refetch();
    }
    catch (err) {
      console.error('Failed to save resource sort order:', err);
      toast.error('순서 저장 도중 오류가 발생했습니다.');
      if (backupTree) {
        setLocalTree(backupTree);
      }
    }
    finally {
      setIsSortingSaving(false);
    }
  };

  const handleAddResource = async (newMenu: CreateMenuInput) => {
    const response = await createResource({
      data: {
        code: newMenu.code,
        name: newMenu.name,
        type: toCreateResourceType(newMenu.type),
        path: newMenu.path,
      },
    });

    if (!response.data) return;

    const newCreatedNode: ResourceResponseDto = {
      id: response.data.id,
      code: newMenu.code,
      name: newMenu.name,
      type: newMenu.type,
      scope: activeScope,
      path: newMenu.path,
      icon: undefined,
      actions: [],
      children: [],
    };

    queryClient.setQueryData(
      getResourceControllerGetResourcesV1QueryKey(resourceParams),
      (oldData: { data?: ResourceResponseDto[] } | undefined) => {
        if (!oldData || !oldData.data) return oldData;
        return {
          ...oldData,
          data: [...oldData.data, newCreatedNode],
        };
      },
    );

    toast.success('메뉴 리소스가 생성되었습니다.');
  };

  const handleOpenSubModal = (parentId: string) => {
    setSelectedParentId(parentId);
    setSubModalOpen(true);
  };

  const handleAddSubResource = async (newResource: CreateSubResourceInput) => {
    if (!selectedParentId) return;

    const response = await createResource({
      data: {
        code: newResource.code,
        name: newResource.name,
        type: toCreateResourceType(newResource.type),
        parentId: selectedParentId,
      },
    });

    if (!response.data) return;

    const newCreatedNode: ResourceResponseDto = {
      id: response.data.id,
      code: newResource.code,
      name: newResource.name,
      type: newResource.type,
      scope: activeScope,
      actions: [],
      children: [],
    };

    const appendNodeToTree = (nodes: ResourceResponseDto[]): ResourceResponseDto[] => {
      return nodes.map((node) => {
        if (node.id === selectedParentId) {
          return {
            ...node,
            children: [...node.children, newCreatedNode],
          };
        }
        if (node.children && node.children.length > 0) {
          return {
            ...node,
            children: appendNodeToTree(node.children),
          };
        }
        return node;
      });
    };

    queryClient.setQueryData(
      getResourceControllerGetResourcesV1QueryKey(resourceParams),
      (oldData: { data?: ResourceResponseDto[] } | undefined) => {
        if (!oldData || !oldData.data) return oldData;
        return {
          ...oldData,
          data: appendNodeToTree(oldData.data),
        };
      },
    );

    toast.success('컴포넌트 리소스가 생성되었습니다.');
  };

  const handleOpenEditModal = (node: ResourceResponseDto) => {
    setSelectedEditNode(node);
    setEditModalOpen(true);
  };

  const handleOpenLanguageModal = (node: ResourceResponseDto) => {
    setSelectedLanguageNode(node);
    setLanguageModalOpen(true);
  };

  const handleSaveEdit = async (updated: { code?: string, name?: string, path?: string, icon?: string }) => {
    if (!selectedEditNode) {
      return;
    }

    const nextCode = updated.code !== undefined ? updated.code : selectedEditNode.code;
    const nextName = updated.name !== undefined ? updated.name : selectedEditNode.name;
    const nextPath = updated.path !== undefined ? updated.path : selectedEditNode.path;
    const nextIcon = updated.icon !== undefined ? updated.icon : selectedEditNode.icon;
    const changed = (
      selectedEditNode.code !== nextCode
      || selectedEditNode.name !== nextName
      || selectedEditNode.path !== nextPath
      || selectedEditNode.icon !== nextIcon
    );

    if (!changed) {
      toast.error('변경된 내용이 없습니다.');
      return;
    }

    await updateResource({
      data: {
        id: selectedEditNode.id,
        scope: activeScope,
        code: nextCode,
        name: nextName,
        path: nextPath,
        icon: nextIcon,
      },
    });

    const updateNodeInTree = (nodes: ResourceResponseDto[]): ResourceResponseDto[] => {
      return nodes.map((node) => {
        if (node.id === selectedEditNode.id) {
          return {
            ...node,
            code: nextCode,
            name: nextName,
            path: nextPath,
            icon: nextIcon,
          };
        }
        if (node.children && node.children.length > 0) {
          return {
            ...node,
            children: updateNodeInTree(node.children),
          };
        }
        return node;
      });
    };

    queryClient.setQueryData(
      getResourceControllerGetResourcesV1QueryKey(resourceParams),
      (oldData: { data?: ResourceResponseDto[] } | undefined) => {
        if (!oldData || !oldData.data) return oldData;
        return {
          ...oldData,
          data: updateNodeInTree(oldData.data),
        };
      },
    );

    toast.success('리소스 정보가 수정되었습니다.');
    setEditModalOpen(false);
    setSelectedEditNode(null);
  };

  const handleDeleteNode = (node: ResourceResponseDto) => {
    setSelectedDeleteNode(node);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDeleteNode) {
      return;
    }

    await deleteResource({ data: { id: selectedDeleteNode.id } });

    const deleteNodeFromTree = (nodes: ResourceResponseDto[]): ResourceResponseDto[] => {
      return nodes
        .filter((item) => item.id !== selectedDeleteNode.id)
        .map((item) => {
          if (item.children && item.children.length > 0) {
            return {
              ...item,
              children: deleteNodeFromTree(item.children),
            };
          }
          return item;
        });
    };

    queryClient.setQueryData(
      getResourceControllerGetResourcesV1QueryKey(resourceParams),
      (oldData: { data?: ResourceResponseDto[] } | undefined) => {
        if (!oldData || !oldData.data) return oldData;
        return {
          ...oldData,
          data: deleteNodeFromTree(oldData.data),
        };
      },
    );

    toast.success('리소스가 삭제되었습니다.');

    const subtreeIds = collectSubtreeIds(resourceTree, selectedDeleteNode.id);
    if (selectedEditNode && subtreeIds.includes(selectedEditNode.id)) {
      setEditModalOpen(false);
      setSelectedEditNode(null);
    }

    if (selectedLanguageNode && subtreeIds.includes(selectedLanguageNode.id)) {
      setLanguageModalOpen(false);
      setSelectedLanguageNode(null);
    }

    setDeleteConfirmOpen(false);
    setSelectedDeleteNode(null);
  };

  const handleChangePermission = async (node: ResourceResponseDto, value: ResourcePermissionValue) => {
    if (!isOrganizationScope) {
      return;
    }

    let nextValue: string[] | string | null = null;
    let actions: string[] = [];
    let constraint: string = '';

    if (node.type === 'MENU') {
      nextValue = Array.isArray(value) ? value : [];
      actions = nextValue;
    }
    else {
      nextValue = typeof value === 'string' && value !== '' ? value : null;
      if (typeof nextValue === 'string' && nextValue !== '') {
        actions = [nextValue];
        constraint = nextValue;
      }
    }

    setPermissions((prev) => ({
      ...prev,
      [node.id]: nextValue,
    }));

    await updateResourcePermissions({
      data: {
        id: node.id,
        scope: activeScope,
        actions,
        constraint: node.type === 'MENU' ? undefined : constraint,
      },
    });

    queryClient.setQueryData(
      getResourceControllerGetResourcesV1QueryKey(resourceParams),
      (oldData: { data?: ResourceResponseDto[] } | undefined) => {
        if (!oldData || !oldData.data) return oldData;
        return {
          ...oldData,
          data: updatePermissionsInTree(oldData.data, node.id, node.type, nextValue),
        };
      },
    );

    toast.success('권한 정보가 변경되었습니다.');
  };

  const getParentName = (parentId: string | null): string => findParentName(resourceTree, parentId);

  let content: React.ReactNode;
  if (isLoading) {
    content = (
      <div className="py-20 text-center text-slate-500">
        <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-slate-400" />
        <p>서버에서 실시간 데이터를 받아오고 있습니다...</p>
      </div>
    );
  }
  else if (isError) {
    content = (
      <div className="py-20 text-center text-red-500">
        <p className="mb-2 font-semibold">실시간 데이터를 가져오는데 실패했습니다.</p>
        <Button type="button" size="sm" variant="outline" onClick={() => { void refetch(); }} className="gap-2">
          <RefreshCw className="w-3.5 h-3.5" />
          다시 시도
        </Button>
      </div>
    );
  }
  else {
    content = (
      <div className="border rounded-xl bg-card shadow-sm overflow-hidden divide-y divide-border">
        <SortableTree<ResourceResponseDto | null>
          value={treeValue}
          onChange={handleTreeChange}
          canDrop={canDrop}
          expandedIds={expandedIds}
          onExpandedIdsChange={setExpandedIds}
          disabled={!isSortingMode}
          renderNode={({ node }) => {
            const res = node.value;
            if (!res) return null;
            const isComponent = res.type === 'COMPONENT';
            const currentValue = displayPermissions[res.id];
            let currentActions: string[] = [];
            if (Array.isArray(currentValue)) {
              currentActions = currentValue;
            }
            else if (typeof currentValue === 'string' && currentValue !== '') {
              currentActions = [currentValue];
            }
            const nextParentActions = res.type === 'MENU' ? currentActions : ['CREATE', 'READ', 'UPDATE', 'DELETE'];

            return (
              <div className="flex flex-row flex-wrap items-center justify-between group/tree-item-content transition-all duration-200 gap-y-2.5 gap-x-4 py-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-3.5 md:gap-4 flex-1 min-w-[280px]">
                  <div className={`flex items-center justify-center shrink-0 ${isComponent ? 'hidden' : 'w-8 h-8 rounded-md bg-slate-100 text-slate-500'}`}>
                    {renderNodeIcon(res)}
                  </div>

                  <div className="flex flex-col gap-1 min-w-0 w-full">
                    <div className="flex items-center gap-1.5 md:gap-2.5 flex-wrap">
                      <span className={`font-semibold truncate ${isComponent ? 'text-slate-800 text-[13px] md:text-[14px] font-medium' : 'text-slate-900 text-[13px] md:text-[14px] font-medium'}`}>
                        {res.name}
                      </span>
                      <Badge
                        variant={isComponent ? 'outline' : 'default'}
                        className={`rounded-md font-mono shadow-sm ${isComponent ? 'text-[9px] px-1.5 py-0.5 border-slate-200 text-slate-600 bg-slate-100' : 'text-[9px] md:text-[10px] px-1.5 py-0.5 border-slate-200 text-slate-600 bg-slate-100'}`}
                      >
                        {res.type}
                      </Badge>

                      <Badge
                        variant="outline"
                        className="rounded-md font-mono text-[9px] md:text-[10px] px-1.5 py-0.5 border-slate-200 text-slate-500 bg-white"
                      >
                        {res.scope}
                      </Badge>

                      {!isSortingMode && (
                        <div className="ml-1.5 flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover/tree-item-content:opacity-100 transition-opacity shrink-0">
                          {res.type === 'MENU' && !isOrganizationScope && (
                            <ResourceNodeMenuButton nodeId={res.id} onOpenSubModal={handleOpenSubModal} />
                          )}
                          <ResourceNodeEditButton
                            node={res}
                            onOpenEditModal={handleOpenEditModal}
                            title="아이콘 수정"
                          />
                          <ResourceNodeLanguageButton node={res} onOpenLanguageModal={handleOpenLanguageModal} />
                          {!isOrganizationScope && (
                            <ResourceNodeDeleteButton node={res} onDeleteNode={handleDeleteNode} />
                          )}
                        </div>
                      )}

                      {res.type === 'COMPONENT' && isOrganizationScope && !isSortingMode && (
                        <ResourceNodeComponentToggle node={res} currentValue={currentValue} onChange={(node, val) => { void handleChangePermission(node, val); }} />
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5 md:gap-2 text-[11px] md:text-[12px] text-slate-500 font-mono flex-wrap">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">Code:</span>
                          <span className="text-slate-700 font-medium">{res.code}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">Order:</span>
                          <span className="text-slate-700 font-medium">{res.sortOrder ?? '-'}</span>
                        </div>
                        {res.path && !isOrganizationScope && (
                          <>
                            <span className="text-slate-300">•</span>
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400">Path:</span>
                              <span className="px-1.5 py-0.2 rounded-md font-medium text-indigo-600 bg-indigo-50/70">
                                {res.path}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {isOrganizationScope && res.type === 'MENU' && !isSortingMode && (
                        <div className="flex items-center gap-2 shrink-0">
                          <ResourceNodeActions
                            node={res}
                            currentValue={currentValue}
                            onChange={(node, val) => { void handleChangePermission(node, val); }}
                            parentActions={nextParentActions}
                            permissions={permissions}
                          />
                        </div>
                      )}

                      {isOrganizationScope && res.type === 'COMPONENT' && !isSortingMode && (
                        <div className="flex items-center gap-2 shrink-0">
                          <ResourceNodeActions
                            node={res}
                            currentValue={currentValue}
                            onChange={(node, val) => { void handleChangePermission(node, val); }}
                            parentActions={nextParentActions}
                            permissions={permissions}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          }}
        />
      </div>
    );
  }

  return (
    <>
      <ResourcePanel
        icon={<ListTree className="h-5 w-5" />}
        title="조직 리소스"
        description="아이콘, 정렬 순서, 액션, 제약 조건만 수정합니다."
        actions={(
          <div className="flex flex-col items-end gap-3">
            <div className="flex flex-wrap items-center gap-2 justify-end">
              {isSortingMode
                ? (
                  <>
                    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 animate-pulse font-medium px-2.5 py-1">
                      정렬 모드 활성화 중
                    </Badge>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => {
                        if (backupTree) {
                          setLocalTree(backupTree);
                        }
                        setIsSortingMode(false);
                      }}
                      disabled={isSortingSaving}
                    >
                      취소
                    </Button>
                    <Button
                      type="button"
                      className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={() => { void handleSaveSort(); }}
                      disabled={isSortingSaving}
                    >
                      {isSortingSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <LucideIcons.Check className="w-4 h-4" />}
                      저장
                    </Button>
                  </>
                )
                : (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      type="button"
                      onClick={() => { void refetch(); }}
                      title="새로고침"
                      disabled={isLoading || isSaving}
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading || isSaving ? 'animate-spin' : ''}`} />
                    </Button>
                    {isOrganizationScope && (
                      <Button
                        variant="outline"
                        type="button"
                        className="gap-2 border-slate-200 text-slate-700 hover:bg-slate-50"
                        onClick={() => {
                          setBackupTree(treeValue);
                          setIsSortingMode(true);
                        }}
                        disabled={isLoading || isSaving || resourceTree.length === 0}
                      >
                        <LucideIcons.ArrowUpDown className="w-4 h-4" />
                        정렬
                      </Button>
                    )}
                    {!isOrganizationScope && (
                      <ResourceControl code="ROLE_RESOURCE_CREATE_BUTTON">
                        <Button
                          type="button"
                          className="gap-2"
                          onClick={() => setIsMenuModalOpen(true)}
                          disabled={isSaving}
                        >
                          <Plus className="w-4 h-4" />
                          {t('ROLE_RESOURCE_CREATE_BUTTON', { ns: 'resource', defaultValue: '메뉴 추가' })}
                        </Button>
                      </ResourceControl>
                    )}
                  </>
                )}
            </div>
          </div>
        )}
      >
        {content}
      </ResourcePanel>

      <MenuRegistrationModal
        key={`menu-${isMenuModalOpen ? 'open' : 'closed'}`}
        open={isMenuModalOpen}
        onOpenChange={setIsMenuModalOpen}
        onSave={(menu) => { void handleAddResource(menu); }}
      />

      <SubResourceRegistrationModal
        key={`sub-${subModalOpen ? 'open' : 'closed'}-${selectedParentId ?? 'none'}`}
        open={subModalOpen}
        onOpenChange={setSubModalOpen}
        onSave={(resource) => { void handleAddSubResource(resource); }}
        parentName={getParentName(selectedParentId)}
      />

      <ResourceEditModal
        key={`edit-${selectedEditNode?.id ?? 'none'}-${selectedEditNode?.scope ?? 'none'}-${editModalOpen ? 'open' : 'closed'}`}
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) {
            setSelectedEditNode(null);
          }
        }}
        resource={selectedEditNode}
        onSave={(updated) => { void handleSaveEdit(updated); }}
      />

      <ResourceLanguageModal
        key={`lang-${selectedLanguageNode?.id ?? 'none'}-${languageModalOpen ? 'open' : 'closed'}`}
        open={languageModalOpen}
        onOpenChange={(open) => {
          setLanguageModalOpen(open);
          if (!open) {
            setSelectedLanguageNode(null);
          }
        }}
        resource={selectedLanguageNode}
        locales={locales}
      />

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader className="pb-2 border-b border-border/40">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold tracking-tight text-red-600">
              <LucideIcons.Trash2 className="size-5 stroke-[2.5]" />
              <span>리소스 삭제 확인</span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs mt-1">
              삭제된 리소스는 영구히 복구할 수 없으며 하위 자식 리소스도 함께 삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium text-slate-800">
              &apos;
              <span className="font-bold text-red-600">
                {selectedDeleteNode?.name}
              </span>
              &apos; 리소스를 정말로 삭제하시겠습니까?
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setSelectedDeleteNode(null);
              }}
            >
              취소
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => { void handleConfirmDelete(); }}
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function updatePermissionsInTree(
  nodes: ResourceResponseDto[],
  nodeId: string,
  nodeType: string,
  nextValue: string[] | string | null,
): ResourceResponseDto[] {
  let actions: string[];
  if (nodeType === 'MENU') {
    actions = Array.isArray(nextValue) ? nextValue : [];
  }
  else {
    actions = typeof nextValue === 'string' && nextValue !== '' ? [nextValue] : [];
  }

  let constraint: string | undefined;
  if (nodeType === 'MENU') {
    constraint = undefined;
  }
  else {
    constraint = typeof nextValue === 'string' && nextValue !== '' ? nextValue : undefined;
  }

  return nodes.map((item) => {
    if (item.id === nodeId) {
      return {
        ...item,
        actions,
        constraint,
      };
    }
    if (item.children && item.children.length > 0) {
      return {
        ...item,
        children: updatePermissionsInTree(item.children, nodeId, nodeType, nextValue),
      };
    }
    return item;
  });
}
