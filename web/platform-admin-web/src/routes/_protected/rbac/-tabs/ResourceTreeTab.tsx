import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Checkbox, Label, RadioGroup, RadioGroupItem, toast, useAppForm } from '@pkg/ui';
import { useStore } from '@tanstack/react-form';
import * as LucideIcons from 'lucide-react';
import { ChevronDown, ChevronRight, Loader2, Plus, RefreshCw } from 'lucide-react';
import { ComponentType, useEffect, useState } from 'react';

import { useRbacControllerGetResourcesV1 } from '../../../../api/endpoints';
import { ResourceResponseDto, ResourceResponseDtoType } from '../../../../api/model';
import { MenuRegistrationModal } from '../-modals/MenuRegistrationModal';
import { SubResourceRegistrationModal } from '../-modals/SubResourceRegistrationModal';

interface FormValues {
  permissions: Record<string, string[] | string>
}

export function ResourceTreeTab() {
  const [localResources, setLocalResources] = useState<ResourceResponseDto[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  // 실시간 API 데이터 가져오기
  const { data: apiResponse, isLoading, isError, refetch } = useRbacControllerGetResourcesV1();

  const form = useAppForm({
    defaultValues: {
      permissions: {} as Record<string, string[] | string>,
    },
    onSubmit: async ({ value }) => {
      // 로컬 트리 구조에 최종 선택된 권한들을 반영하여 최종 페이로드 구성
      const buildUpdatedTree = (nodes: ResourceResponseDto[]): ResourceResponseDto[] => {
        return nodes.map((node) => {
          const selected = value.permissions[node.id];
          let selectedActions: string[] = [];
          if (Array.isArray(selected)) {
            selectedActions = selected;
          }
          else if (selected) {
            selectedActions = [String(selected)];
          }

          return {
            ...node,
            actions: selectedActions,
            mappedAction: node.type !== 'MENU' && selectedActions.length > 0 ? selectedActions[0] : undefined,
            children: node.children ? buildUpdatedTree(node.children) : [],
          };
        });
      };

      const finalPayload = buildUpdatedTree(localResources);
      console.log('최종 저장 페이로드:', finalPayload);
      toast.success('리소스 권한 변경 사항이 성공적으로 저장되었습니다!');
    },
  });

  // permissions 값 실시간 구독 (하위 노드의 Radio 선택지 갱신 반응용)
  const permissions = useStore(form.baseStore, (state: { values: FormValues }) => state.values.permissions) || {};

  // API 데이터 로드 완료 시 로컬 상태 및 Form 값 동기화
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (apiResponse?.data) {
      setLocalResources(apiResponse.data);

      const initialPermissions: Record<string, string[] | string> = {};
      const traverse = (nodes: ResourceResponseDto[]) => {
        nodes.forEach((node) => {
          if (node.type === 'MENU') {
            initialPermissions[node.id] = node.actions || [];
          }
          else {
            initialPermissions[node.id] = (node.actions && node.actions.length > 0) ? node.actions[0] : (node.mappedAction || '');
          }
          if (node.children) {
            traverse(node.children);
          }
        });
      };
      traverse(apiResponse.data);
      form.setFieldValue('permissions', initialPermissions);

      // 첫 메뉴 노드들 자동 확장
      const initialExpanded: Record<string, boolean> = {};
      apiResponse.data.forEach((node) => {
        if (node.children && node.children.length > 0) {
          initialExpanded[node.id] = true;
        }
      });
      setExpandedNodes(initialExpanded);
    }
  }, [apiResponse, form]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
    setLocalResources([...localResources, newResource]);
    form.setFieldValue(`permissions.${newId}`, ['READ']);
  };

  // 하위 리소스(API, 컴포넌트) 추가 모달 열기
  const handleOpenSubModal = (parentId: string) => {
    setSelectedParentId(parentId);
    setSubModalOpen(true);
  };

  // 하위 리소스 추가 로직 (로컬 상태 및 Form 값 업데이트)
  const handleAddSubResource = (newResource: { code: string, name: string, path: string, type: string, actions: string[] }) => {
    if (!selectedParentId) return;

    // eslint-disable-next-line sonarjs/pseudo-random
    const newId = `sub-${Math.random().toString(36).substring(7)}`;
    const mappedAction = 'READ';

    const newChild: ResourceResponseDto = {
      id: newId,
      code: newResource.code,
      name: newResource.name,
      type: newResource.type as ResourceResponseDtoType,
      path: newResource.path,
      actions: [mappedAction],
      mappedAction,
      children: [],
    };

    const addChild = (nodes: ResourceResponseDto[]): ResourceResponseDto[] => {
      return nodes.map((node) => {
        if (node.id === selectedParentId) {
          return {
            ...node,
            children: [...(node.children || []), newChild],
          };
        }
        if (node.children) {
          return { ...node, children: addChild(node.children) };
        }
        return node;
      });
    };

    setLocalResources((prev) => addChild(prev));
    form.setFieldValue(`permissions.${newId}`, mappedAction);
    setExpandedNodes((prev) => ({ ...prev, [selectedParentId]: true }));
  };

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 모달을 위한 상위 노드 명칭 찾기 함수
  const getParentName = (parentId: string | null): string => {
    if (!parentId) return '';
    const findName = (nodes: ResourceResponseDto[]): string => {
      for (const n of nodes) {
        if (n.id === parentId) {
          return n.name;
        }
        if (n.children) {
          const found = findName(n.children);
          if (found !== '') {
            return found;
          }
        }
      }
      return '';
    };
    return findName(localResources);
  };

  const renderTree = (nodes: ResourceResponseDto[], depth = 0, parentActions: string[] = ['CREATE', 'READ', 'UPDATE', 'DELETE']) => {
    if (nodes.length === 0 && depth === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
          <p>등록된 리소스가 없습니다.</p>
        </div>
      );
    }

    const treeNodes = nodes.map((node) => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = expandedNodes[node.id];

      let IconComp: ComponentType<{ className?: string }> = LucideIcons.Folder;
      if (node.icon) {
        const IconFromComp = (LucideIcons as unknown as Record<string, ComponentType<{ className?: string }>>)[node.icon];
        if (IconFromComp) {
          IconComp = IconFromComp;
        }
      }

      // permissions에서 현재 노드의 권한 상태 가져오기
      const nodeActions = permissions[node.id] || [];
      const currentActions: string[] = Array.isArray(nodeActions) ? nodeActions : [String(nodeActions)];

      return (
        <div key={node.id} className="select-none">
          <div
            className="flex flex-row flex-wrap items-center justify-between py-3 md:py-2.5 px-4 hover:bg-slate-50/60 border-b border-slate-100/60 group transition-all duration-200 gap-y-2.5 gap-x-4"
            style={{ paddingLeft: `${depth * 28 + 16}px` }}
          >
            <div className="flex items-center gap-3.5 md:gap-4 flex-1 min-w-[280px]">
              <span
                onClick={() => hasChildren && toggleExpand(node.id)}
                className={`flex items-center justify-center w-7 h-7 cursor-pointer rounded-md hover:bg-slate-200/70 transition-colors ${
                  hasChildren ? 'text-slate-700' : 'text-slate-300 pointer-events-none'
                }`}
              >
                {hasChildren ? (isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />) : <div className="w-5 h-5" />}
              </span>

              <div className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-100/80 border border-slate-200/50 shadow-sm text-slate-600 shrink-0">
                <IconComp className="w-4 h-4 md:w-5 md:h-5" />
              </div>

              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-1.5 md:gap-2.5 flex-wrap">
                  <span className="font-semibold text-slate-900 text-[14px] md:text-[15px] truncate">{node.name}</span>
                  <Badge variant={node.type === 'MENU' ? 'default' : 'secondary'} className="rounded-md font-mono text-[9px] md:text-[10px] px-1.5 py-0.2 md:px-2 md:py-0.5 shadow-sm">
                    {node.type}
                  </Badge>
                  {node.type === 'MENU' && (
                    <Button
                      size="sm"
                      type="button"
                      variant="ghost"
                      className="h-7 w-7 p-0 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-md border border-transparent hover:border-slate-200/50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity ml-1.5 shrink-0"
                      title="하위 자원 추가"
                      onClick={() => handleOpenSubModal(node.id)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>

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
                        <span className="text-blue-600 bg-blue-50/70 px-1.5 py-0.2 rounded-md font-medium">{node.path}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* CRUD Actions capsule */}
            <div className="flex items-center gap-2 bg-slate-50/50 hover:bg-slate-50/90 border border-slate-200/50 rounded-xl px-2 py-1.2 md:px-3.5 md:py-1.5 shadow-sm transition-all duration-200 ml-11 md:ml-auto shrink-0">
              <span className="text-[9px] font-extrabold text-slate-400 tracking-wider font-mono mr-1 select-none">ACTIONS</span>
              <div className="flex items-center text-xs">
                {node.type === 'MENU'
                  ? (
                    <form.AppField name={`permissions.${node.id}`}>
                      {(field) => {
                        const currentValue = (field.state.value || []) as string[];
                        const handleToggle = (val: string, checked: boolean) => {
                          const newValue = checked
                            ? [...currentValue, val]
                            : currentValue.filter((v) => v !== val);
                          field.handleChange(newValue);
                        };
                        return (
                          <div className="flex items-center gap-2 md:gap-3.5 flex-row flex-wrap">
                            {['CREATE', 'READ', 'UPDATE', 'DELETE'].map((action) => {
                              const id = `perm-${node.id}-${action}`;
                              const isChecked = currentValue.includes(action);
                              return (
                                <div key={action} className="flex items-center gap-1.5 select-none">
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
                        );
                      }}
                    </form.AppField>
                  )
                  : (
                    <form.AppField name={`permissions.${node.id}`}>
                      {(field) => {
                        const currentValue = String(field.state.value ?? '');
                        const radioItems = parentActions.length > 0 ? parentActions : ['READ'];
                        return (
                          <RadioGroup
                            name={field.name}
                            value={currentValue}
                            onValueChange={(value) => field.handleChange(value)}
                            className="flex items-center gap-2 md:gap-3.5 flex-row flex-wrap"
                          >
                            {radioItems.map((action) => {
                              const id = `perm-${node.id}-${action}`;
                              return (
                                <div key={action} className="flex items-center gap-1.5 select-none">
                                  <RadioGroupItem
                                    value={action}
                                    id={id}
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
                          </RadioGroup>
                        );
                      }}
                    </form.AppField>
                  )}
              </div>
            </div>
          </div>
          {hasChildren && isExpanded && (
            <div className="mt-0.5 relative">
              {/* Tree line connector */}
              <div
                className="absolute top-0 bottom-0 w-px bg-slate-200/50 pointer-events-none"
                style={{ left: `${depth * 28 + 30}px` }}
              />
              {renderTree(node.children || [], depth + 1, node.type === 'MENU' ? currentActions : parentActions)}
            </div>
          )}
        </div>
      );
    });

    return <>{treeNodes}</>;
  };

  let content: React.ReactNode;
  if (isLoading) {
    content = (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-2" />
        <p>서버에서 실시간 데이터를 받아오고 있습니다...</p>
      </div>
    );
  }
  else if (isError) {
    content = (
      <div className="flex flex-col items-center justify-center py-20 text-red-500 bg-red-50/50 rounded-lg border border-dashed border-red-200">
        <p className="font-semibold mb-2">실시간 데이터를 가져오는데 실패했습니다.</p>
        <Button type="button" size="sm" variant="outline" onClick={() => { void refetch(); }} className="gap-2 border-red-200 text-red-600 hover:bg-red-50">
          <RefreshCw className="w-3.5 h-3.5" />
          다시 시도
        </Button>
      </div>
    );
  }
  else {
    content = (
      <div className="space-y-1">
        {renderTree(localResources)}
      </div>
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
          <Card className="animate-fade-in shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">리소스 트리</CardTitle>
                <CardDescription>시스템의 메뉴 및 API 자원을 계층 구조로 관리합니다 (실시간 데이터 연동).</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => { void refetch(); }}
                  title="새로고침"
                  disabled={isLoading}
                  className="text-slate-600"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  type="button"
                  className="gap-2 bg-slate-800 hover:bg-slate-900 text-white"
                  onClick={() => setIsMenuModalOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  메뉴 추가
                </Button>
                <form.Submit className="bg-slate-800 hover:bg-slate-900 text-white gap-2">
                  저장
                </form.Submit>
              </div>
            </CardHeader>
            <CardContent>
              {content}
            </CardContent>
          </Card>
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
    </>
  );
}
