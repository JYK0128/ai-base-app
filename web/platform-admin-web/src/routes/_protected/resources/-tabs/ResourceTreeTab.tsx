import { Badge, Button, Checkbox, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Label, RadioGroup, RadioGroupItem, Switch, toast } from '@pkg/ui';
import { useQueryClient } from '@tanstack/react-query';
import * as LucideIcons from 'lucide-react';
import { ChevronDown, ChevronRight, Languages, ListTree, Loader2, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getResourceControllerGetResourcesV1QueryKey,
         useResourceControllerCreateResourceV1,
         useResourceControllerDeleteResourceV1,
         useResourceControllerGetResourcesV1,
         useResourceControllerUpdateResourcePermissionsV1,
         useResourceControllerUpdateResourceV1 } from '../../../../api/endpoints';
import type { LocaleDto, ResourceResponseDto } from '../../../../api/model';
import { ResourceControl } from '../../../../components/resource/ResourceControl';
import { getStoredAdminLocale } from '../../../../lib/locale';
import { MenuRegistrationModal } from '../-modals/MenuRegistrationModal';
import { ResourceEditModal } from '../-modals/ResourceEditModal';
import { ResourceLanguageModal } from '../-modals/ResourceLanguageModal';
import { SubResourceRegistrationModal } from '../-modals/SubResourceRegistrationModal';
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
        initialPermissions[item.id] = item.actions || [];
      }
      else if (item.actions && item.actions.length > 0) {
        initialPermissions[item.id] = item.actions[0];
      }
      else {
        initialPermissions[item.id] = item.constraint || '';
      }

      if (item.children?.length) {
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
    if (node.children && node.children.length > 0) {
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

      if (node.children?.length) {
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
            if (child.children?.length) {
              collectChildren(child.children);
            }
          });
        };

        if (node.children?.length) {
          collectChildren(node.children);
        }

        return true;
      }

      if (node.children?.length && traverse(node.children)) {
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
    const currentActions = Array.isArray(currentValue) ? currentValue : [];

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
            if (child.children && child.children.length > 0) {
              return isActionUsedByComponents(child.children, action);
            }
            return false;
          });
        };

        if (node.children && isActionUsedByComponents(node.children, val)) {
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
  const allowedActions = parentActions.length > 0 ? parentActions : ['READ'];
  const isEnabled = currentAction !== null && currentAction !== '';
  const activeValue = currentAction ?? 'READ';

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

interface ResourceTreeNodeProps {
  readonly node: ResourceResponseDto
  readonly depth: number
  readonly permissions: ResourcePermissions
  readonly expandedNodes: Record<string, boolean>
  readonly onToggleExpand: (id: string) => void
  readonly onOpenSubModal: (parentId: string) => void
  readonly onOpenEditModal: (node: ResourceResponseDto) => void
  readonly onOpenLanguageModal: (node: ResourceResponseDto) => void
  readonly onDeleteNode: (node: ResourceResponseDto) => void
  readonly onChangePermission: (node: ResourceResponseDto, value: ResourcePermissionValue) => void
  readonly parentActions: string[]
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

function ResourceNodeEditButton({ node, onOpenEditModal }: { readonly node: ResourceResponseDto, readonly onOpenEditModal: (node: ResourceResponseDto) => void }) {
  return (
    <Button
      size="sm"
      type="button"
      variant="ghost"
      className="h-7 w-7 p-0 hover:text-slate-700 hover:bg-slate-100 rounded-md shrink-0"
      title="리소스 수정"
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
      title="다국어 관리"
      onClick={() => onOpenLanguageModal(node)}
    >
      <Languages className="w-4 h-4" />
    </Button>
  );
}

function ResourceTreeNode({
  node,
  depth,
  permissions,
  expandedNodes,
  onToggleExpand,
  onOpenSubModal,
  onOpenEditModal,
  onOpenLanguageModal,
  onDeleteNode,
  onChangePermission,
  parentActions,
}: ResourceTreeNodeProps) {
  const hasChildren = node.children?.length > 0;
  const isExpanded = expandedNodes[node.id];
  const isComponent = node.type === 'COMPONENT';
  const currentValue = permissions[node.id];
  const currentActions = Array.isArray(currentValue)
    ? currentValue
    : typeof currentValue === 'string' && currentValue !== ''
      ? [currentValue]
      : [];
  const nextParentActions = node.type === 'MENU' ? currentActions : parentActions;

  const expandIcon = hasChildren
    ? (isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />)
    : <div className="w-5 h-5" />;

  return (
    <div className="select-none">
      <div
        className="flex flex-row flex-wrap items-center justify-between px-4 border-b border-slate-100/60 group transition-all duration-200 gap-y-2.5 gap-x-4 py-2.5 hover:bg-slate-50"
        style={{ paddingLeft: `${isComponent ? depth * 28 + 16 : depth * 28 + 14}px` }}
      >
        <div className="flex items-center gap-3.5 md:gap-4 flex-1 min-w-[280px]">
          <button
            type="button"
            onClick={() => {
              if (hasChildren) {
                onToggleExpand(node.id);
              }
            }}
            className={`flex items-center justify-center w-7 h-7 cursor-pointer rounded-md hover:bg-slate-200/70 transition-colors ${
              hasChildren ? 'text-slate-700' : 'text-slate-300 pointer-events-none'
            }`}
          >
            {expandIcon}
          </button>

          <div className={`flex items-center justify-center shrink-0 ${isComponent ? 'hidden' : 'w-8 h-8 rounded-md bg-slate-100 text-slate-500'}`}>
            {renderNodeIcon(node)}
          </div>

          <div className="flex flex-col gap-1 min-w-0 w-full">
            <div className="flex items-center gap-1.5 md:gap-2.5 flex-wrap">
              <span className={`font-semibold truncate ${isComponent ? 'text-slate-800 text-[13px] md:text-[14px] font-medium' : 'text-slate-900 text-[13px] md:text-[14px] font-medium'}`}>
                {node.name}
              </span>
              <Badge
                variant={isComponent ? 'outline' : 'default'}
                className={`rounded-md font-mono shadow-sm ${isComponent ? 'text-[9px] px-1.5 py-0.5 border-slate-200 text-slate-600 bg-slate-100' : 'text-[9px] md:text-[10px] px-1.5 py-0.5 border-slate-200 text-slate-600 bg-slate-100'}`}
              >
                {node.type}
              </Badge>
              <div className="ml-1.5 flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                {node.type === 'MENU' && (
                  <ResourceNodeMenuButton nodeId={node.id} onOpenSubModal={onOpenSubModal} />
                )}
                <ResourceNodeLanguageButton node={node} onOpenLanguageModal={onOpenLanguageModal} />
                <ResourceNodeEditButton node={node} onOpenEditModal={onOpenEditModal} />
                <ResourceNodeDeleteButton node={node} onDeleteNode={onDeleteNode} />
              </div>

              {node.type === 'COMPONENT' && (
                <ResourceNodeComponentToggle node={node} currentValue={currentValue} onChange={onChangePermission} />
              )}
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 md:gap-2 text-[11px] md:text-[12px] text-slate-500 font-mono flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">Code:</span>
                  <span className="text-slate-700 font-medium">{node.code}</span>
                </div>
                {node.path && (
                  <>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">Path:</span>
                      <span className="px-1.5 py-0.2 rounded-md font-medium text-indigo-600 bg-indigo-50/70">
                        {node.path}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {node.type === 'MENU' && (
                <div className="flex items-center gap-2 shrink-0">
                  <ResourceNodeActions
                    node={node}
                    currentValue={currentValue}
                    onChange={onChangePermission}
                    parentActions={nextParentActions}
                    permissions={permissions}
                  />
                </div>
              )}

              {node.type === 'COMPONENT' && (
                <div className="flex items-center gap-2 shrink-0">
                  <ResourceNodeActions
                    node={node}
                    currentValue={currentValue}
                    onChange={onChangePermission}
                    parentActions={nextParentActions}
                    permissions={permissions}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-0.5 relative">
          <div
            className="absolute top-0 bottom-0 w-px bg-slate-200/50 pointer-events-none"
            style={{ left: `${depth * 28 + 30}px` }}
          />
          <ResourceTreeList
            nodes={node.children || []}
            depth={depth + 1}
            permissions={permissions}
            expandedNodes={expandedNodes}
            onToggleExpand={onToggleExpand}
            onOpenSubModal={onOpenSubModal}
            onOpenLanguageModal={onOpenLanguageModal}
            onOpenEditModal={onOpenEditModal}
            onDeleteNode={onDeleteNode}
            onChangePermission={onChangePermission}
            parentActions={nextParentActions}
          />
        </div>
      )}
    </div>
  );
}

interface ResourceTreeListProps {
  readonly nodes: ResourceResponseDto[]
  readonly depth?: number
  readonly permissions: ResourcePermissions
  readonly expandedNodes: Record<string, boolean>
  readonly onToggleExpand: (id: string) => void
  readonly onOpenSubModal: (parentId: string) => void
  readonly onOpenEditModal: (node: ResourceResponseDto) => void
  readonly onOpenLanguageModal: (node: ResourceResponseDto) => void
  readonly onDeleteNode: (node: ResourceResponseDto) => void
  readonly onChangePermission: (node: ResourceResponseDto, value: ResourcePermissionValue) => void
  readonly parentActions?: string[]
}

function ResourceTreeList({
  nodes,
  depth = 0,
  permissions,
  expandedNodes,
  onToggleExpand,
  onOpenSubModal,
  onOpenEditModal,
  onOpenLanguageModal,
  onDeleteNode,
  onChangePermission,
  parentActions = ['CREATE', 'READ', 'UPDATE', 'DELETE'],
}: ResourceTreeListProps) {
  if (nodes.length === 0 && depth === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
        <p>등록된 리소스가 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      {nodes.map((node) => (
        <ResourceTreeNode
          key={node.id}
          node={node}
          depth={depth}
          permissions={permissions}
          expandedNodes={expandedNodes}
          onToggleExpand={onToggleExpand}
          onOpenSubModal={onOpenSubModal}
          onOpenEditModal={onOpenEditModal}
          onOpenLanguageModal={onOpenLanguageModal}
          onDeleteNode={onDeleteNode}
          onChangePermission={onChangePermission}
          parentActions={parentActions}
        />
      ))}
    </>
  );
}

export function ResourceTreeTab({ locales }: ResourceTreeTabProps) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
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

  const [currentLang, setCurrentLang] = useState<string>(getStoredAdminLocale);
  useEffect(() => {
    const id = setInterval(() => {
      const lang = getStoredAdminLocale();
      setCurrentLang((prev) => (prev !== lang ? lang : prev));
    }, 300);
    return () => clearInterval(id);
  }, []);

  const queryClient = useQueryClient();
  const { data: apiResponse, isLoading, isError, refetch } = useResourceControllerGetResourcesV1();
  const { mutateAsync: createResource, isPending: isCreating } = useResourceControllerCreateResourceV1();
  const { mutateAsync: updateResource, isPending: isUpdating } = useResourceControllerUpdateResourceV1();
  const { mutateAsync: deleteResource, isPending: isDeleting } = useResourceControllerDeleteResourceV1();
  const { mutateAsync: updateResourcePermissions, isPending: isUpdatingPermissions } = useResourceControllerUpdateResourcePermissionsV1();

  const isSaving = isCreating || isUpdating || isDeleting || isUpdatingPermissions;
  const resourceTree = apiResponse?.data ?? EMPTY_RESOURCES;

  const initialPermissions = apiResponse?.data ? buildInitialPermissions(apiResponse.data) : EMPTY_PERMISSIONS;
  const displayPermissions = {
    ...initialPermissions,
    ...permissions,
  };

  const initialExpandedNodes = apiResponse?.data ? buildInitialExpandedNodes(apiResponse.data) : {};
  const displayExpandedNodes = {
    ...initialExpandedNodes,
    ...expandedNodes,
  };

  const handleAddResource = async (newMenu: { code: string, name: string, path: string, icon: string, type: string }) => {
    const response = await createResource({
      data: {
        code: newMenu.code,
        name: newMenu.name,
        type: toCreateResourceType(newMenu.type as ResourceResponseDto['type']),
        path: newMenu.path,
        icon: newMenu.icon,
      },
    });

    const newCreatedNode = response.data;
    if (!newCreatedNode) return;

    queryClient.setQueryData(
      getResourceControllerGetResourcesV1QueryKey(),
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

  const handleAddSubResource = async (newResource: { code: string, name: string, type: string, actions: string[] }) => {
    if (!selectedParentId) return;

    const response = await createResource({
      data: {
        code: newResource.code,
        name: newResource.name,
        type: toCreateResourceType(newResource.type as ResourceResponseDto['type']),
        parentId: selectedParentId,
      },
    });

    const newCreatedNode = response.data;
    if (!newCreatedNode) return;

    const appendNodeToTree = (nodes: ResourceResponseDto[]): ResourceResponseDto[] => {
      return nodes.map((node) => {
        if (node.id === selectedParentId) {
          return {
            ...node,
            children: [...(node.children || []), newCreatedNode],
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
      getResourceControllerGetResourcesV1QueryKey(),
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

  const handleSaveEdit = async (updated: { code: string, name: string, path?: string, icon?: string }) => {
    if (!selectedEditNode) {
      return;
    }

    const changed = (
      selectedEditNode.code !== updated.code
      || selectedEditNode.name !== updated.name
      || selectedEditNode.path !== (selectedEditNode.type === 'MENU' ? updated.path : undefined)
      || selectedEditNode.icon !== (selectedEditNode.type === 'MENU' ? updated.icon : undefined)
    );

    if (!changed) {
      toast.error('변경된 내용이 없습니다.');
      return;
    }

    await updateResource({
      data: {
        id: selectedEditNode.id,
        code: updated.code,
        name: updated.name,
        path: selectedEditNode.type === 'MENU' ? updated.path : undefined,
        icon: selectedEditNode.type === 'MENU' ? updated.icon : undefined,
      },
    });

    const updateNodeInTree = (nodes: ResourceResponseDto[]): ResourceResponseDto[] => {
      return nodes.map((node) => {
        if (node.id === selectedEditNode.id) {
          return {
            ...node,
            code: updated.code,
            name: updated.name,
            path: selectedEditNode.type === 'MENU' ? updated.path : undefined,
            icon: selectedEditNode.type === 'MENU' ? updated.icon : undefined,
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
      getResourceControllerGetResourcesV1QueryKey(),
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
      getResourceControllerGetResourcesV1QueryKey(),
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
    const nextValue = node.type === 'MENU'
      ? (Array.isArray(value) ? value : [])
      : (typeof value === 'string' && value !== '' ? value : null);

    setPermissions((prev) => ({
      ...prev,
      [node.id]: nextValue,
    }));

    if (node.type === 'MENU') {
      await updateResourcePermissions({
        data: {
          id: node.id,
          actions: Array.isArray(nextValue) ? nextValue : [],
        },
      });
    }
    else {
      await updateResourcePermissions({
        data: {
          id: node.id,
          actions: typeof nextValue === 'string' && nextValue !== '' ? [nextValue] : [],
          constraint: typeof nextValue === 'string' && nextValue !== '' ? nextValue : '',
        },
      });
    }

    const updatePermissionsInTree = (nodes: ResourceResponseDto[]): ResourceResponseDto[] => {
      return nodes.map((item) => {
        if (item.id === node.id) {
          return {
            ...item,
            actions: node.type === 'MENU'
              ? (Array.isArray(nextValue) ? nextValue : [])
              : (typeof nextValue === 'string' && nextValue !== '' ? [nextValue] : []),
            constraint: node.type === 'MENU'
              ? undefined
              : (typeof nextValue === 'string' && nextValue !== '' ? nextValue : null),
          };
        }
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: updatePermissionsInTree(item.children),
          };
        }
        return item;
      });
    };

    queryClient.setQueryData(
      getResourceControllerGetResourcesV1QueryKey(),
      (oldData: { data?: ResourceResponseDto[] } | undefined) => {
        if (!oldData || !oldData.data) return oldData;
        return {
          ...oldData,
          data: updatePermissionsInTree(oldData.data),
        };
      },
    );

    toast.success('권한 정보가 변경되었습니다.');
  };

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
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
      <ResourceTreeList
        nodes={resourceTree}
        permissions={displayPermissions}
        expandedNodes={displayExpandedNodes}
        onToggleExpand={toggleExpand}
        onOpenSubModal={handleOpenSubModal}
        onOpenEditModal={handleOpenEditModal}
        onOpenLanguageModal={handleOpenLanguageModal}
        onDeleteNode={handleDeleteNode}
        onChangePermission={handleChangePermission}
      />
    );
  }

  return (
    <>
      <ResourcePanel
        icon={<ListTree className="h-5 w-5" />}
        title="리소스 구조"
        description="메뉴 자원과 하위 컴포넌트의 권한을 계층 구조로 관리합니다."
        actions={(
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
          </>
        )}
      >
        {content}
      </ResourcePanel>

      <MenuRegistrationModal
        open={isMenuModalOpen}
        onOpenChange={setIsMenuModalOpen}
        onSave={(menu) => { void handleAddResource(menu); }}
      />

      <SubResourceRegistrationModal
        open={subModalOpen}
        onOpenChange={setSubModalOpen}
        onSave={(resource) => { void handleAddSubResource(resource); }}
        parentName={getParentName(selectedParentId)}
      />

      <ResourceEditModal
        key={`edit-${selectedEditNode?.id ?? 'none'}-${editModalOpen ? 'open' : 'closed'}`}
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
              '
              <span className="font-bold text-red-600">
                {selectedDeleteNode?.name}
              </span>
              ' 리소스를 정말로 삭제하시겠습니까?
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
