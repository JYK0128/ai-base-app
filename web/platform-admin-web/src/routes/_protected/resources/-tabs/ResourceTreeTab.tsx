import { Badge, Button, Checkbox, Label, RadioGroup, RadioGroupItem, Switch, toast, useAppForm } from '@pkg/ui';
import { useStore } from '@tanstack/react-form';
import * as LucideIcons from 'lucide-react';
import { ChevronDown, ChevronRight, Languages, ListTree, Loader2, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { type ComponentType, type ReactNode, useEffect, useMemo, useState } from 'react';

import { useResourceControllerCreateResourcesV1, useResourceControllerGetResourcesV1 } from '../../../../api/endpoints';
import { CreateResourceBatchItemDtoType, ResourceResponseDto, ResourceResponseDtoType } from '../../../../api/model';
import { ResourceControl } from '../../../../components/resource/ResourceControl';
import { MenuRegistrationModal } from '../-modals/MenuRegistrationModal';
import { ResourceEditModal } from '../-modals/ResourceEditModal';
import { ResourceLanguageModal } from '../-modals/ResourceLanguageModal';
import { SubResourceRegistrationModal } from '../-modals/SubResourceRegistrationModal';
import { ResourcePanel } from './ResourcePanel';

interface FormValues {
  permissions: ResourcePermissions
}

type ResourcePermissionValue = string[] | string | null | undefined;
type ResourcePermissions = Record<string, ResourcePermissionValue>;
type ResourceFieldValue = string[] | string | null | undefined;
type ResourceBatchOperation = 'CREATE' | 'UPDATE' | 'DELETE';

const RESOURCE_ACTIONS = ['CREATE', 'READ', 'UPDATE', 'DELETE'] as const;
const RESOURCE_GROUP_CLASS = 'flex w-fit max-w-full flex-none items-center gap-2 rounded-xl border border-slate-200/50 bg-slate-50/50 px-2 py-1.2 shadow-sm transition-all duration-200 hover:bg-slate-50/90 md:px-3.5 md:py-1.5';
const RESOURCE_GROUP_LABEL_CLASS = 'w-[84px] shrink-0 select-none font-mono text-[9px] font-extrabold tracking-wider text-slate-400';
const EMPTY_PERMISSIONS: ResourcePermissions = {};

interface ResourceCreateBatchItem {
  operation: ResourceBatchOperation
  tempId?: string
  id?: string
  code?: string
  name?: string
  type?: CreateResourceBatchItemDtoType
  path?: string
  icon?: string
  parentId?: string
  parentTempId?: string
  sortOrder?: number
}

function buildResourceMap(nodes: ResourceResponseDto[]): Map<string, ResourceResponseDto> {
  const map = new Map<string, ResourceResponseDto>();

  const traverse = (items: ResourceResponseDto[]) => {
    items.forEach((item) => {
      map.set(item.id, item);
      if (item.children?.length) {
        traverse(item.children);
      }
    });
  };

  traverse(nodes);
  return map;
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
        initialPermissions[item.id] = item.mappedAction || '';
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

function isTemporaryNode(nodeId: string): boolean {
  return nodeId.startsWith('new-') || nodeId.startsWith('sub-');
}

function toCreateResourceType(type: ResourceResponseDto['type']): CreateResourceBatchItemDtoType {
  return type === ResourceResponseDtoType.MENU
    ? CreateResourceBatchItemDtoType.MENU
    : CreateResourceBatchItemDtoType.COMPONENT;
}

function syncResourceActions(
  nodes: ResourceResponseDto[],
  permissions: ResourcePermissions,
): { resources: ResourceResponseDto[], changed: boolean } {
  let changed = false;

  const resources = nodes.map((node) => {
    const formValue = permissions[node.id];
    let nextActions: string[];
    if (node.type === 'MENU') {
      nextActions = Array.isArray(formValue) ? formValue : [];
    }
    else if (typeof formValue === 'string' && formValue !== '') {
      nextActions = [formValue];
    }
    else {
      nextActions = [];
    }

    const hasActionsChanged = JSON.stringify(node.actions || []) !== JSON.stringify(nextActions);
    let nextChildren = node.children;

    if (node.children?.length) {
      const childResult = syncResourceActions(node.children, permissions);
      if (childResult.changed) {
        nextChildren = childResult.resources;
        changed = true;
      }
    }

    if (hasActionsChanged) {
      changed = true;
      return {
        ...node,
        actions: nextActions,
        children: nextChildren,
      };
    }

    if (nextChildren !== node.children) {
      return {
        ...node,
        children: nextChildren,
      };
    }

    return node;
  });

  return { resources, changed };
}

function addChildResource(
  nodes: ResourceResponseDto[],
  selectedParentId: string,
  newChild: ResourceResponseDto,
): ResourceResponseDto[] {
  return nodes.map((node) => {
    if (node.id === selectedParentId) {
      return {
        ...node,
        children: [...(node.children || []), newChild],
      };
    }

    if (node.children?.length) {
      return { ...node, children: addChildResource(node.children, selectedParentId, newChild) };
    }

    return node;
  });
}

function getNextParentActions(node: ResourceResponseDto, currentActions: string[], parentActions: string[]): string[] {
  return node.type === 'MENU' ? currentActions : parentActions;
}

function collectCreateBatchItems(nodes: ResourceResponseDto[]): ResourceCreateBatchItem[] {
  const items: ResourceCreateBatchItem[] = [];

  const traverse = (
    list: ResourceResponseDto[],
    parentRef?: { readonly id: string, readonly isTemporary: boolean },
  ) => {
    list.forEach((node) => {
      const temporary = isTemporaryNode(node.id);
      if (temporary) {
        items.push({
          operation: 'CREATE',
          tempId: node.id,
          code: node.code,
          name: node.name,
          type: toCreateResourceType(node.type),
          path: node.path,
          icon: node.icon,
          sortOrder: node.sortOrder,
          parentId: parentRef && !parentRef.isTemporary ? parentRef.id : undefined,
          parentTempId: parentRef && parentRef.isTemporary ? parentRef.id : undefined,
          translations: node.translations,
          actions: node.actions,
        });
      }

      if (node.children?.length) {
        traverse(node.children, { id: node.id, isTemporary: temporary });
      }
    });
  };

  traverse(nodes);
  return items;
}

function collectDeleteBatchItems(ids: string[]): ResourceCreateBatchItem[] {
  return ids.map((id) => ({
    operation: 'DELETE',
    id,
  }));
}

function isResourceChanged(original: ResourceResponseDto, current: ResourceResponseDto): boolean {
  return (
    original.code !== current.code
    || original.name !== current.name
    || original.type !== current.type
    || original.path !== current.path
    || original.icon !== current.icon
    || original.sortOrder !== current.sortOrder
    || JSON.stringify(original.translations) !== JSON.stringify(current.translations)
    || JSON.stringify(original.actions || []) !== JSON.stringify(current.actions || [])
  );
}

function collectUpdateBatchItems(
  nodes: ResourceResponseDto[],
  originalMap: Map<string, ResourceResponseDto>,
): ResourceCreateBatchItem[] {
  const items: ResourceCreateBatchItem[] = [];

  const traverse = (list: ResourceResponseDto[]) => {
    list.forEach((node) => {
      if (!isTemporaryNode(node.id)) {
        const original = originalMap.get(node.id);
        if (original && isResourceChanged(original, node)) {
          items.push({
            operation: 'UPDATE',
            id: node.id,
            code: node.code,
            name: node.name,
            type: toCreateResourceType(node.type),
            path: node.path,
            icon: node.icon,
            sortOrder: node.sortOrder,
            translations: node.translations,
            actions: node.actions,
          });
        }
      }

      if (node.children?.length) {
        traverse(node.children);
      }
    });
  };

  traverse(nodes);
  return items;
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

function removeNodeById(nodes: ResourceResponseDto[], targetId: string): ResourceResponseDto[] {
  return nodes
    .filter((node) => node.id !== targetId)
    .map((node) => {
      if (!node.children?.length) {
        return node;
      }

      return {
        ...node,
        children: removeNodeById(node.children, targetId),
      };
    });
}

function updateNodeById(
  nodes: ResourceResponseDto[],
  targetId: string,
  updater: (node: ResourceResponseDto) => ResourceResponseDto,
): ResourceResponseDto[] {
  return nodes.map((node) => {
    if (node.id === targetId) {
      return updater(node);
    }

    if (!node.children?.length) {
      return node;
    }

    return {
      ...node,
      children: updateNodeById(node.children, targetId, updater),
    };
  });
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

interface ResourceNodeActionsProps {
  readonly node: ResourceResponseDto
  readonly AppField: ResourceFieldComponent
  readonly parentActions: string[]
}

function ResourceNodeActions({ node, AppField, parentActions }: ResourceNodeActionsProps) {
  if (node.type === 'MENU') {
    return (
      <AppField name={`permissions.${node.id}`}>
        {(field) => {
          const currentValue = Array.isArray(field.state.value) ? field.state.value : [];
          const handleToggle = (val: string, checked: boolean) => {
            const newValue = checked
              ? [...currentValue, val]
              : currentValue.filter((v) => v !== val);
            field.handleChange(newValue);
          };

          return (
            <div className={RESOURCE_GROUP_CLASS}>
              <span className={RESOURCE_GROUP_LABEL_CLASS}>ACTIONS</span>
              <div className="flex flex-wrap items-center gap-2">
                {RESOURCE_ACTIONS.map((action) => {
                  const id = `perm-${node.id}-${action}`;
                  const isChecked = currentValue.includes(action);

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
        }}
      </AppField>
    );
  }

  return (
    <AppField name={`permissions.${node.id}`}>
      {(field) => {
        const currentValue = typeof field.state.value === 'string' ? field.state.value : null;
        const allowedActions = parentActions.length > 0 ? parentActions : ['READ'];
        const isEnabled = currentValue !== null && currentValue !== '';
        const activeValue = currentValue ?? 'READ';

        if (!isEnabled) {
          return null;
        }

        return (
          <div className={RESOURCE_GROUP_CLASS}>
            <span className={RESOURCE_GROUP_LABEL_CLASS}>CONSTRAINTS</span>
            <RadioGroup
              name={field.name}
              value={activeValue}
              onValueChange={(value) => field.handleChange(value)}
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
      }}
    </AppField>
  );
}

interface ResourceFieldApi {
  readonly name: string
  readonly state: {
    readonly value: ResourceFieldValue
  }
  handleChange: (value: ResourceFieldValue) => void
}

type ResourceFieldComponent = ComponentType<{
  name: string
  children: (field: ResourceFieldApi) => ReactNode
}>;

interface ResourceTreeNodeProps {
  readonly node: ResourceResponseDto
  readonly depth: number
  readonly AppField: ResourceFieldComponent
  readonly permissions: Record<string, string[] | string | null | undefined>
  readonly expandedNodes: Record<string, boolean>
  readonly onToggleExpand: (id: string) => void
  readonly onOpenSubModal: (parentId: string) => void
  readonly onOpenEditModal: (node: ResourceResponseDto) => void
  readonly onOpenLanguageModal: (node: ResourceResponseDto) => void
  readonly onDeleteNode: (node: ResourceResponseDto) => void
  readonly parentActions: string[]
}

interface ResourceNodeMenuButtonProps {
  readonly nodeId: string
  readonly onOpenSubModal: (parentId: string) => void
}

function ResourceNodeMenuButton({ nodeId, onOpenSubModal }: ResourceNodeMenuButtonProps) {
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

interface ResourceNodeEditButtonProps {
  readonly node: ResourceResponseDto
  readonly onOpenEditModal: (node: ResourceResponseDto) => void
}

function ResourceNodeEditButton({ node, onOpenEditModal }: ResourceNodeEditButtonProps) {
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

interface ResourceNodeDeleteButtonProps {
  readonly node: ResourceResponseDto
  readonly onDeleteNode: (node: ResourceResponseDto) => void
}

function ResourceNodeDeleteButton({ node, onDeleteNode }: ResourceNodeDeleteButtonProps) {
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

interface ResourceNodeLanguageButtonProps {
  readonly node: ResourceResponseDto
  readonly onOpenLanguageModal: (node: ResourceResponseDto) => void
}

function ResourceNodeLanguageButton({ node, onOpenLanguageModal }: ResourceNodeLanguageButtonProps) {
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

interface ResourceNodeComponentToggleProps {
  readonly nodeId: string
  readonly AppField: ResourceFieldComponent
}

function ResourceNodeComponentToggle({ nodeId, AppField }: ResourceNodeComponentToggleProps) {
  return (
    <AppField name={`permissions.${nodeId}`}>
      {(field) => {
        const currentValue = typeof field.state.value === 'string' ? field.state.value : null;
        const isEnabled = currentValue !== null && currentValue !== '';

        return (
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <Switch
              checked={isEnabled}
              onCheckedChange={(checked) => {
                field.handleChange(checked ? 'READ' : null);
              }}
            />
            <Label className="text-xs font-semibold text-slate-700">
              제약 적용
            </Label>
          </div>
        );
      }}
    </AppField>
  );
}

function ResourceTreeNode({
  node,
  depth,
  AppField,
  permissions,
  expandedNodes,
  onToggleExpand,
  onOpenSubModal,
  onOpenEditModal,
  onOpenLanguageModal,
  onDeleteNode,
  parentActions,
}: ResourceTreeNodeProps) {
  const hasChildren = node.children?.length > 0;
  const isExpanded = expandedNodes[node.id];
  const isComponent = node.type === 'COMPONENT';
  const nodeActions = permissions[node.id] || [];
  let currentActions: string[];
  if (Array.isArray(nodeActions)) {
    currentActions = nodeActions;
  }
  else if (typeof nodeActions === 'string') {
    currentActions = [nodeActions];
  }
  else {
    currentActions = [];
  }
  const nextParentActions = getNextParentActions(node, currentActions, parentActions);

  let expandIcon: ReactNode = <div className="w-5 h-5" />;
  if (hasChildren) {
    expandIcon = isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />;
  }

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
                <ResourceNodeComponentToggle nodeId={node.id} AppField={AppField} />
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
                  <ResourceNodeActions node={node} AppField={AppField} parentActions={nextParentActions} />
                </div>
              )}

              {node.type === 'COMPONENT' && (
                <div className="flex items-center gap-2 shrink-0">
                  <ResourceNodeActions node={node} AppField={AppField} parentActions={nextParentActions} />
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {
        (() => {
          if (!hasChildren || !isExpanded) {
            return null;
          }

          return (
            <div className="mt-0.5 relative">
              <div
                className="absolute top-0 bottom-0 w-px bg-slate-200/50 pointer-events-none"
                style={{ left: `${depth * 28 + 30}px` }}
              />
              <ResourceTreeList
                nodes={node.children || []}
                depth={depth + 1}
                AppField={AppField}
                permissions={permissions}
                expandedNodes={expandedNodes}
                onToggleExpand={onToggleExpand}
                onOpenSubModal={onOpenSubModal}
                onOpenLanguageModal={onOpenLanguageModal}
                onOpenEditModal={onOpenEditModal}
                onDeleteNode={onDeleteNode}
                parentActions={nextParentActions}
              />
            </div>
          );
        })()
      }
    </div>
  );
}

interface ResourceTreeListProps {
  readonly nodes: ResourceResponseDto[]
  readonly depth?: number
  readonly AppField: ResourceFieldComponent
  readonly permissions: Record<string, string[] | string | null | undefined>
  readonly expandedNodes: Record<string, boolean>
  readonly onToggleExpand: (id: string) => void
  readonly onOpenSubModal: (parentId: string) => void
  readonly onOpenEditModal: (node: ResourceResponseDto) => void
  readonly onOpenLanguageModal: (node: ResourceResponseDto) => void
  readonly onDeleteNode: (node: ResourceResponseDto) => void
  readonly parentActions?: string[]
}

function ResourceTreeList({
  nodes,
  depth = 0,
  AppField,
  permissions,
  expandedNodes,
  onToggleExpand,
  onOpenSubModal,
  onOpenEditModal,
  onOpenLanguageModal,
  onDeleteNode,
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
          AppField={AppField}
          permissions={permissions}
          expandedNodes={expandedNodes}
          onToggleExpand={onToggleExpand}
          onOpenSubModal={onOpenSubModal}
          onOpenEditModal={onOpenEditModal}
          onOpenLanguageModal={onOpenLanguageModal}
          onDeleteNode={onDeleteNode}
          parentActions={parentActions}
        />
      ))}
    </>
  );
}

export function ResourceTreeTab() {
  const [localResources, setLocalResources] = useState<ResourceResponseDto[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [selectedEditNode, setSelectedEditNode] = useState<ResourceResponseDto | null>(null);
  const [selectedLanguageNode, setSelectedLanguageNode] = useState<ResourceResponseDto | null>(null);
  const [deletedResourceIds, setDeletedResourceIds] = useState<string[]>([]);
  const [originalResources, setOriginalResources] = useState<ResourceResponseDto[]>([]);

  // 🌟 localStorage 기반 현재 언어 (사이드바와 동일)
  const [currentLang, setCurrentLang] = useState<string>(
    () => localStorage.getItem('admin_lang') || 'ko',
  );
  useEffect(() => {
    const id = setInterval(() => {
      const lang = localStorage.getItem('admin_lang') || 'ko';
      setCurrentLang((prev) => (prev !== lang ? lang : prev));
    }, 300);
    return () => clearInterval(id);
  }, []);

  // 실시간 API 데이터 가져오기
  const { data: apiResponse, isLoading, isError, refetch } = useResourceControllerGetResourcesV1();
  const { mutateAsync: createResources, isPending: isSaving } = useResourceControllerCreateResourcesV1();

  // 🌟 버튼 코드별 다국어 라벨 — apiResponse 트리에서 코드로 리소스를 찾아 translations 활용
  const buttonLabels = useMemo(() => {
    const findByCode = (nodes: ResourceResponseDto[], code: string): ResourceResponseDto | undefined => {
      for (const node of nodes) {
        if (node.code === code) return node;
        if (node.children?.length) {
          const found = findByCode(node.children, code);
          if (found) return found;
        }
      }
      return undefined;
    };
    const all = apiResponse?.data ?? [];
    const getLabel = (code: string, fallback: string) => {
      const res = findByCode(all, code);
      if (!res?.translations) return fallback;
      return res.translations[currentLang] || res.translations['ko'] || fallback;
    };
    return {
      addMenu: getLabel('ROLE_RESOURCE_CREATE_BUTTON', '메뉴 추가'),
      save: getLabel('ROLE_RESOURCE_SAVE_BUTTON', '저장'),
    };
  }, [apiResponse, currentLang]);

  const form = useAppForm({
    defaultValues: {
      permissions: EMPTY_PERMISSIONS,
    },
    onSubmit: async () => {
      const batchItems = [
        ...collectCreateBatchItems(localResources),
        ...collectUpdateBatchItems(localResources, buildResourceMap(originalResources)),
        ...collectDeleteBatchItems(deletedResourceIds),
      ];

      if (batchItems.length === 0) {
        toast.error('저장할 새 리소스가 없습니다.');
        return;
      }

      try {
        const response = await createResources({
          data: {
            items: batchItems,
          },
        });

        const results = response.data?.results ?? [];
        const createdCount = results.filter((result) => result.operation === 'CREATE').length;
        const updatedCount = results.filter((result) => result.operation === 'UPDATE').length;
        const deletedCount = results.filter((result) => result.operation === 'DELETE').length;

        const messages = [
          createdCount > 0 ? `생성 ${createdCount}개` : '',
          updatedCount > 0 ? `수정 ${updatedCount}개` : '',
          deletedCount > 0 ? `삭제 ${deletedCount}개` : '',
        ].filter(Boolean);

        if (messages.length > 0) {
          toast.success(`${messages.join(', ')} 처리되었습니다.`);
        }

        setDeletedResourceIds([]);
        await refetch();
      }
      catch {
        toast.error('리소스 저장 중 오류가 발생했습니다.');
        return;
      }
    },
  });

  // permissions 값 실시간 구독 (하위 노드의 Radio 선택지 갱신 반응용)
  const permissions = useStore(form.baseStore, (state: { values: FormValues }) => state.values.permissions) ?? EMPTY_PERMISSIONS;
  const AppField = form.AppField as ResourceFieldComponent;

  // permissions 값 실시간 동기화
  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      setLocalResources((prevResources) => {
        const { resources, changed } = syncResourceActions(prevResources, permissions);
        return changed ? resources : prevResources;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [permissions]);

  // API 데이터 로드 완료 시 로컬 상태 및 Form 값 동기화

  useEffect(() => {
    if (apiResponse?.data) {
      let cancelled = false;
      queueMicrotask(() => {
        if (cancelled) {
          return;
        }

        setLocalResources(apiResponse.data);
        setOriginalResources(apiResponse.data);
        setDeletedResourceIds([]);
        form.setFieldValue('permissions', buildInitialPermissions(apiResponse.data));
        setExpandedNodes(buildInitialExpandedNodes(apiResponse.data));
      });

      return () => {
        cancelled = true;
      };
    }
  }, [apiResponse, form]);

  // 최상위 메뉴 추가 (로컬 상태 및 Form 값 업데이트)
  const handleAddResource = (newMenu: { code: string, name: string, path: string, icon: string, type: string }) => {
    // eslint-disable-next-line sonarjs/pseudo-random
    const newId = `new-${Math.random().toString(36).substring(7)}`;
    const newResource: ResourceResponseDto = {
      id: newId,
      code: newMenu.code,
      name: newMenu.name,
      type: newMenu.type as ResourceResponseDtoType,
      path: newMenu.path,
      icon: newMenu.icon,
      actions: ['READ'],
      children: [],
    };
    setLocalResources((prev) => [...prev, newResource]);
    form.setFieldValue(`permissions.${newId}`, ['READ']);
  };

  // 컴포넌트 리소스 추가 모달 열기
  const handleOpenSubModal = (parentId: string) => {
    setSelectedParentId(parentId);
    setSubModalOpen(true);
  };

  // 컴포넌트 리소스 추가 로직 (로컬 상태 및 Form 값 업데이트)
  const handleAddSubResource = (newResource: { code: string, name: string, type: string, actions: string[] }) => {
    if (!selectedParentId) return;

    // eslint-disable-next-line sonarjs/pseudo-random
    const newId = `sub-${Math.random().toString(36).substring(7)}`;
    const mappedAction = 'READ';

    const newChild: ResourceResponseDto = {
      id: newId,
      code: newResource.code,
      name: newResource.name,
      type: newResource.type as ResourceResponseDtoType,
      actions: [mappedAction],
      mappedAction,
      children: [],
    };

    setLocalResources((prev) => addChildResource(prev, selectedParentId, newChild));
    form.setFieldValue(`permissions.${newId}`, mappedAction);
    setExpandedNodes((prev) => ({ ...prev, [selectedParentId]: true }));
  };

  const handleOpenEditModal = (node: ResourceResponseDto) => {
    setSelectedEditNode(node);
    setEditModalOpen(true);
  };

  const handleOpenLanguageModal = (node: ResourceResponseDto) => {
    setSelectedLanguageNode(node);
    setLanguageModalOpen(true);
  };

  const handleSaveLanguage = ({
    resourceId,
    translations,
  }: {
    resourceId: string
    translations: Record<string, string>
  }) => {
    setLocalResources((prev) => updateNodeById(prev, resourceId, (node) => ({
      ...node,
      translations,
    })));
  };

  const handleSaveEdit = (updated: { code: string, name: string, path?: string, icon?: string }) => {
    if (!selectedEditNode) {
      return;
    }

    setLocalResources((prev) => updateNodeById(prev, selectedEditNode.id, (node) => ({
      ...node,
      code: updated.code,
      name: updated.name,
      path: node.type === 'MENU' ? updated.path : undefined,
      icon: node.type === 'MENU' ? updated.icon : undefined,
    })));
    setEditModalOpen(false);
    setSelectedEditNode(null);
  };

  const handleDeleteNode = (node: ResourceResponseDto) => {
    const confirmed = window.confirm(`'${node.name}' 리소스를 삭제할까요?`);
    if (!confirmed) {
      return;
    }

    const deletedIds = collectSubtreeIds(localResources, node.id);
    setDeletedResourceIds((prev) => Array.from(new Set([...prev, ...deletedIds])));
    setLocalResources((prev) => removeNodeById(prev, node.id));
    if (selectedEditNode && deletedIds.includes(selectedEditNode.id)) {
      setEditModalOpen(false);
      setSelectedEditNode(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 모달을 위한 상위 노드 명칭 찾기 함수
  const getParentName = (parentId: string | null): string => {
    return findParentName(localResources, parentId);
  };

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
        nodes={localResources}
        AppField={AppField}
        permissions={permissions}
        expandedNodes={expandedNodes}
        onToggleExpand={toggleExpand}
        onOpenSubModal={handleOpenSubModal}
        onOpenEditModal={handleOpenEditModal}
        onOpenLanguageModal={handleOpenLanguageModal}
        onDeleteNode={handleDeleteNode}
      />
    );
  }

  return (
    <>
      <form.AppForm>
        <form.Layout
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
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
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <ResourceControl code="ROLE_RESOURCE_CREATE_BUTTON">
                  <Button
                    type="button"
                    className="gap-2"
                    onClick={() => setIsMenuModalOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    {buttonLabels.addMenu}
                  </Button>
                </ResourceControl>
                <ResourceControl code="ROLE_RESOURCE_SAVE_BUTTON">
                  <form.Submit className="gap-2" disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {buttonLabels.save}
                  </form.Submit>
                </ResourceControl>
              </>
            )}
          >
            {content}
          </ResourcePanel>
        </form.Layout>
      </form.AppForm>

      <MenuRegistrationModal
        open={isMenuModalOpen}
        onOpenChange={setIsMenuModalOpen}
        onSave={handleAddResource}
      />

      <SubResourceRegistrationModal
        open={subModalOpen}
        onOpenChange={setSubModalOpen}
        onSave={handleAddSubResource}
        parentName={getParentName(selectedParentId)}
      />

      <ResourceEditModal
        key={`${selectedEditNode?.id ?? 'none'}-${editModalOpen ? 'open' : 'closed'}`}
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) {
            setSelectedEditNode(null);
          }
        }}
        resource={selectedEditNode}
        onSave={handleSaveEdit}
      />

      <ResourceLanguageModal
        key={`${selectedLanguageNode?.id ?? 'none'}-${languageModalOpen ? 'open' : 'closed'}`}
        open={languageModalOpen}
        onOpenChange={(open) => {
          setLanguageModalOpen(open);
          if (!open) {
            setSelectedLanguageNode(null);
          }
        }}
        resource={selectedLanguageNode}
        translations={selectedLanguageNode?.translations}
        onSave={handleSaveLanguage}
      />
    </>
  );
}
