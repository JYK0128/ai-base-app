import { Badge, Button, Checkbox, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, toast, useAppForm } from '@pkg/ui';
import { useStore } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Info, Key, Loader2, Plus, RotateCcw, Save, Shield, Users } from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';

import { getResourceControllerGetPermissionSetsV1QueryKey, useResourceControllerCreatePermissionSetV1, useResourceControllerGetPermissionSetsV1, useResourceControllerGetResourcesV1, useResourceControllerUpdatePermissionSetPermissionsV1 } from '../../../../api/endpoints';
import type { PermissionSetResponseDto, ResourceResponseDto } from '../../../../api/model';
import { ResourceControllerGetResourcesV1Scope } from '../../../../api/model';

const AVAILABLE_ACTIONS = ['CREATE', 'READ', 'UPDATE', 'DELETE'] as const;
const CRUD_ORDER = ['CREATE', 'READ', 'UPDATE', 'DELETE'] as const;

type ActionType = (typeof AVAILABLE_ACTIONS)[number];

interface PermissionRow {
  id: string
  code: string
  name: string
  type: 'MENU' | 'COMPONENT'
  path?: string
  constraint?: string
  actions: ActionType[]
  depth: number
  parentCode?: string
}

interface PermissionSetForm {
  code: string
  name: string
  description: string
  copyFromId: string
}

const EMPTY_RESOURCE_ROWS: ResourceResponseDto[] = [];
const EMPTY_PERMISSION_SETS: PermissionSetResponseDto[] = [];
const EMPTY_PERMISSION_CODES: string[] = [];

function isActionType(value: string): value is ActionType {
  return AVAILABLE_ACTIONS.includes(value as ActionType);
}

function buildPermissionCode(resourceCode: string, action: ActionType): string {
  return `${resourceCode}:${action}`;
}

function normalizePermissionCodes(codes: readonly string[]): string[] {
  return Array.from(new Set(codes)).sort((left, right) => left.localeCompare(right));
}

function flattenResourceTree(nodes: ResourceResponseDto[], depth = 0, parentCode?: string): PermissionRow[] {
  return nodes.flatMap((node) => {
    const row: PermissionRow = {
      id: node.id,
      code: node.code,
      name: node.name,
      type: node.type,
      path: node.path,
      constraint: node.constraint,
      actions: node.actions.filter(isActionType),
      depth,
      parentCode,
    };

    return [
      row,
      ...(node.children.length > 0 ? flattenResourceTree(node.children, depth + 1, node.code) : []),
    ];
  });
}

function samePermissionCodes(left: readonly string[], right: readonly string[]): boolean {
  return normalizePermissionCodes(left).join('|') === normalizePermissionCodes(right).join('|');
}

function sanitizePermissionCodes(codes: readonly string[], permissionRows: PermissionRow[]): string[] {
  const availablePermissionCodes = new Set(
    permissionRows.flatMap((row) => row.actions.map((action) => buildPermissionCode(row.code, action))),
  );
  const rowMap = new Map(permissionRows.map((row) => [row.code, row] as const));
  const normalized = normalizePermissionCodes(codes.filter((code) => availablePermissionCodes.has(code)));
  const normalizedSet = new Set(normalized);

  return normalized.filter((permissionCode) => {
    const [resourceCode, action] = permissionCode.split(':');
    const row = rowMap.get(resourceCode);

    if (!row || !action || !isActionType(action)) {
      return false;
    }

    if (!row.actions.includes(action)) {
      return false;
    }

    if (row.type === 'COMPONENT' && row.parentCode) {
      const parentReadActive = normalizedSet.has(`${row.parentCode}:READ`);
      const parentWriteActive = ['CREATE', 'UPDATE', 'DELETE'].some((parentAction) =>
        normalizedSet.has(`${row.parentCode}:${parentAction}`),
      );

      if (!parentReadActive || !parentWriteActive) {
        return false;
      }
    }

    return true;
  });
}

function actionTone(action: ActionType) {
  switch (action) {
    case 'CREATE':
      return {
        active: 'border-emerald-200 bg-emerald-50/50 text-emerald-700 font-bold',
        dot: 'bg-emerald-500',
      };
    case 'READ':
      return {
        active: 'border-blue-200 bg-blue-50/50 text-blue-700 font-bold',
        dot: 'bg-blue-500',
      };
    case 'UPDATE':
      return {
        active: 'border-amber-200 bg-amber-50/50 text-amber-700 font-bold',
        dot: 'bg-amber-500',
      };
    case 'DELETE':
      return {
        active: 'border-rose-200 bg-rose-50/50 text-rose-700 font-bold',
        dot: 'bg-rose-500',
      };
  }
}

function buildPermissionSetListContent(params: {
  permissionSets: PermissionSetResponseDto[]
  isLoading: boolean
  selectedPermissionSetId: string
  onSelect: (permissionSetId: string) => void
}): ReactNode {
  const { isLoading, onSelect, permissionSets, selectedPermissionSetId } = params;

  if (isLoading && permissionSets.length === 0) {
    return (
      <div className="flex h-full min-h-[220px] items-center justify-center rounded border border-dashed border-slate-200 bg-slate-50/50 text-[10px] text-slate-400">
        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
        권한 세트를 불러오는 중입니다...
      </div>
    );
  }

  if (permissionSets.length === 0) {
    return (
      <div className="rounded border border-dashed border-slate-200 bg-slate-50/50 px-3 py-6 text-center text-[10px] text-slate-400">
        등록된 권한 세트가 없습니다.
      </div>
    );
  }

  return (
    <>
      {permissionSets.map((permissionSet) => {
        const isSelected = permissionSet.id === selectedPermissionSetId;

        return (
          <button
            key={permissionSet.id}
            type="button"
            onClick={() => onSelect(permissionSet.id)}
            className={`relative flex w-full flex-none flex-col items-start gap-1 rounded border p-3 text-left transition-colors duration-150 ${
              isSelected
                ? 'border-slate-300 bg-slate-50'
                : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span className={`text-xs font-bold tracking-tight ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                {permissionSet.name}
              </span>
              <Badge variant="secondary" className="rounded bg-slate-100 px-1 py-0 font-mono text-[9px] text-slate-500">
                {permissionSet.code}
              </Badge>
            </div>

            <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-slate-400">
              {permissionSet.description || '설명이 없습니다.'}
            </p>

            <div className="mt-2 flex items-center gap-3 text-[9px] font-medium text-slate-400">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3 text-slate-400" />
                배정 대상:
                {' '}
                <strong className="text-slate-600">
                  {permissionSet.assignmentCount}
                  명
                </strong>
              </span>
              {permissionSet.isActive && (
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="h-1 w-1 rounded-full bg-emerald-500" />
                  활성
                </span>
              )}
            </div>
          </button>
        );
      })}
    </>
  );
}

function buildResourceAreaContent(params: {
  resourceRows: PermissionRow[]
  draftPermissionCodes: string[]
  isLoading: boolean
  isError: boolean
  isRowAllChecked: (row: PermissionRow) => boolean
  isRowIndeterminate: (row: PermissionRow) => boolean
  onTogglePermission: (permissionCode: string, checked: boolean) => void
  onToggleAllRow: (row: PermissionRow, checked: boolean) => void
}): ReactNode {
  const {
    draftPermissionCodes,
    isError,
    isLoading,
    isRowAllChecked,
    isRowIndeterminate,
    onToggleAllRow,
    onTogglePermission,
    resourceRows,
  } = params;

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center px-6 py-10">
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          리소스 목록을 불러오는 데 실패했습니다.
        </div>
      </div>
    );
  }

  if (resourceRows.length === 0 && isLoading) {
    return (
      <div className="flex h-full items-center justify-center px-6 py-10 text-[10px] text-slate-400">
        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
        리소스 목록을 불러오는 중입니다...
      </div>
    );
  }

  if (resourceRows.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6 py-10 text-[10px] text-slate-400">
        사용할 수 있는 리소스가 없습니다.
      </div>
    );
  }

  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50">
          <th className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            리소스 / 권한 코드
          </th>
          <th className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            허용 액션
          </th>
          <th className="w-[80px] px-5 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
            전체 선택
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100">
        {resourceRows.map((row) => {
          const allChecked = isRowAllChecked(row);
          const indeterminate = isRowIndeterminate(row);

          return (
            <tr key={row.id} className="transition-colors duration-150 hover:bg-slate-50/20">
              <td className="px-5 py-2">
                <div className="flex items-center gap-1.5" style={{ paddingLeft: `${row.depth * 16}px` }}>
                  {row.depth > 0 && <span className="text-slate-300">↳</span>}
                  <Badge
                    variant="secondary"
                    className={`rounded px-1 py-0 text-[8px] font-bold tracking-wide ${
                      row.type === 'MENU'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-indigo-50/80 text-indigo-700'
                    }`}
                  >
                    {row.type}
                  </Badge>
                  <span className="text-xs font-bold text-slate-800">{row.name}</span>
                  <span className="font-mono text-[9px] text-slate-400">
                    (
                    {row.code}
                    )
                  </span>
                  {row.constraint && (
                    <Badge variant="secondary" className="rounded bg-slate-100 px-1 py-0 text-[8px] text-slate-500">
                      {row.constraint}
                    </Badge>
                  )}
                </div>
              </td>

              <td className="px-5 py-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {CRUD_ORDER.map((action) => {
                    const isSupported = row.actions.includes(action);
                    const permissionCode = buildPermissionCode(row.code, action);
                    const isChecked = draftPermissionCodes.includes(permissionCode);

                    if (!isSupported) {
                      return (
                        <div
                          key={action}
                          className="flex cursor-not-allowed select-none items-center gap-1 rounded border border-dashed border-slate-200 bg-slate-50/40 px-2 py-0.5 text-left text-[9px] font-medium text-slate-300"
                          title="이 리소스는 이 액션을 지원하지 않습니다."
                        >
                          <span className="h-1 w-1 rounded-full bg-slate-200" />
                          <span className="line-through decoration-slate-200/60">{action}</span>
                        </div>
                      );
                    }

                    const tone = actionTone(action);

                    return (
                      <button
                        key={action}
                        type="button"
                        onClick={() => onTogglePermission(permissionCode, !isChecked)}
                        className={`flex items-center gap-1 rounded border px-2 py-0.5 text-left text-[9px] font-semibold transition-all duration-150 ${
                          isChecked
                            ? tone.active
                            : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600'
                        }`}
                      >
                        <span className={`h-1 w-1 rounded-full ${isChecked ? tone.dot : 'bg-slate-300'}`} />
                        <span>{action}</span>
                      </button>
                    );
                  })}
                </div>
              </td>

              <td className="px-5 py-2 text-center">
                <div className="flex justify-center">
                  <Checkbox
                    id={`all-${row.id}`}
                    checked={indeterminate ? 'indeterminate' : allChecked}
                    onCheckedChange={(checked) => onToggleAllRow(row, !!checked)}
                  />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function buildCopyFromTemplateContent(params: {
  permissionSets: PermissionSetResponseDto[]
  selectedCopyFromId: string
  onChange: (permissionSetId: string) => void
}): ReactNode {
  const { onChange, permissionSets, selectedCopyFromId } = params;

  if (permissionSets.length === 0) {
    return (
      <div className="col-span-2 rounded border border-dashed border-slate-200 bg-slate-50/50 px-3 py-4 text-center text-[10px] text-slate-400">
        복사할 권한 세트가 없습니다.
      </div>
    );
  }

  return (
    <>
      {permissionSets.map((permissionSet) => (
        <label
          key={permissionSet.id}
          className={`flex cursor-pointer items-center gap-1.5 rounded border p-1.5 transition-colors ${
            selectedCopyFromId === permissionSet.id
              ? 'border-indigo-500 bg-indigo-50/10 text-indigo-900'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <input
            type="radio"
            name="copyFromTemplate"
            checked={selectedCopyFromId === permissionSet.id}
            onChange={() => onChange(permissionSet.id)}
            className="accent-indigo-600"
          />
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold leading-tight">{permissionSet.name}</span>
            <span className="font-mono text-[8px] tracking-wider text-slate-400">
              {permissionSet.code}
            </span>
          </div>
        </label>
      ))}
    </>
  );
}

export function PermissionManagementTab() {
  const queryClient = useQueryClient();
  const [permissionSets, setPermissionSets] = useState<PermissionSetResponseDto[]>(EMPTY_PERMISSION_SETS);
  const [selectedPermissionSetId, setSelectedPermissionSetId] = useState<string>('');
  const [draftPermissionCodes, setDraftPermissionCodes] = useState<string[]>(EMPTY_PERMISSION_CODES);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const permissionSetsQuery = useResourceControllerGetPermissionSetsV1();
  const resourcesQuery = useResourceControllerGetResourcesV1({
    scope: ResourceControllerGetResourcesV1Scope.ORGANIZATION,
  });

  const { mutateAsync: createPermissionSet, isPending: isCreatingPermissionSet } = useResourceControllerCreatePermissionSetV1();
  const { mutateAsync: updatePermissionSetPermissions, isPending: isUpdatingPermissionSet } = useResourceControllerUpdatePermissionSetPermissionsV1();

  const resourceRows = useMemo(() => {
    const resourceTree = resourcesQuery.data?.data ?? EMPTY_RESOURCE_ROWS;
    return flattenResourceTree(resourceTree);
  }, [resourcesQuery.data?.data]);

  const selectedPermissionSet = useMemo(
    () => permissionSets.find((permissionSet) => permissionSet.id === selectedPermissionSetId),
    [permissionSets, selectedPermissionSetId],
  );

  const savedPermissionCodes = useMemo(() => {
    if (!selectedPermissionSet) {
      return EMPTY_PERMISSION_CODES;
    }

    return sanitizePermissionCodes(selectedPermissionSet.permissionCodes, resourceRows);
  }, [resourceRows, selectedPermissionSet]);

  const hasChanges = !samePermissionCodes(draftPermissionCodes, savedPermissionCodes);
  const isLoading = permissionSetsQuery.isLoading || resourcesQuery.isLoading;
  const isSaving = isCreatingPermissionSet || isUpdatingPermissionSet;
  const saveButtonIcon = isUpdatingPermissionSet
    ? <Loader2 className="h-3 w-3 animate-spin" />
    : <Save className="h-3 w-3" />;
  const createButtonContent = isCreatingPermissionSet
    ? <Loader2 className="h-3 w-3 animate-spin" />
    : '권한 세트 생성';

  const createPermissionSetForm = useAppForm({
    defaultValues: {
      code: '',
      name: '',
      description: '',
      copyFromId: '',
    } satisfies PermissionSetForm,
    validators: {
      onSubmit: z.object({
        code: z.string().trim().min(1, '권한 세트 코드를 입력해 주세요.').transform((value) => value.toUpperCase().replace(/\s+/g, '_')),
        name: z.string().trim().min(1, '권한 세트 이름을 입력해 주세요.'),
        description: z.string().trim(),
        copyFromId: z.string(),
      }),
    },
    onSubmit: async ({ value }) => {
      const normalizedCode = value.code;
      const normalizedName = value.name;
      const normalizedDescription = value.description;

      if (permissionSets.some((permissionSet) => permissionSet.code === normalizedCode || permissionSet.id === normalizedCode)) {
        toast.error('이미 존재하는 권한 세트 코드입니다.');
        return;
      }

      try {
        const response = await createPermissionSet({
          data: {
            code: normalizedCode,
            name: normalizedName,
            description: normalizedDescription || undefined,
            copyFromId: value.copyFromId || undefined,
          },
        });

        const createdPermissionSet = response.data;
        if (!createdPermissionSet) {
          throw new Error('권한 세트 생성 응답이 비어 있습니다.');
        }

        setPermissionSets((current) => [...current, createdPermissionSet]);
        setSelectedPermissionSetId(createdPermissionSet.id);
        setDraftPermissionCodes(sanitizePermissionCodes(createdPermissionSet.permissionCodes, resourceRows));
        createPermissionSetForm.reset();
        createPermissionSetForm.setFieldValue('copyFromId', createdPermissionSet.id);
        setIsCreateModalOpen(false);

        await queryClient.invalidateQueries({ queryKey: getResourceControllerGetPermissionSetsV1QueryKey() });
        toast.success(`새로운 권한 세트 '${createdPermissionSet.name}'이 생성되었습니다.`);
      }
      catch (error) {
        toast.error(error instanceof Error ? error.message : '권한 세트 생성 중 오류가 발생했습니다.');
      }
    },
  });

  const selectedCopyFromId = useStore(
    createPermissionSetForm.baseStore,
    (state: { values: PermissionSetForm }) => state.values.copyFromId,
  ) ?? '';

  useEffect(() => {
    if (permissionSets.length === 0) {
      if (createPermissionSetForm.state.values.copyFromId !== '') {
        createPermissionSetForm.setFieldValue('copyFromId', '');
      }
      return;
    }

    if (!permissionSets.some((permissionSet) => permissionSet.id === createPermissionSetForm.state.values.copyFromId)) {
      createPermissionSetForm.setFieldValue('copyFromId', permissionSets[0].id);
    }
  }, [createPermissionSetForm, permissionSets]);

  useEffect(() => {
    if (permissionSetsQuery.data?.data) {
      setPermissionSets(permissionSetsQuery.data.data);
    }
  }, [permissionSetsQuery.data?.data]);

  useEffect(() => {
    if (permissionSets.length === 0) {
      setSelectedPermissionSetId('');
      return;
    }

    setSelectedPermissionSetId((current) => {
      if (current && permissionSets.some((permissionSet) => permissionSet.id === current)) {
        return current;
      }

      return permissionSets[0].id;
    });
  }, [permissionSets]);

  useEffect(() => {
    if (!selectedPermissionSet) {
      setDraftPermissionCodes(EMPTY_PERMISSION_CODES);
      return;
    }

    setDraftPermissionCodes(sanitizePermissionCodes(selectedPermissionSet.permissionCodes, resourceRows));
  }, [resourceRows, selectedPermissionSet]);

  const handleSelectPermissionSet = (permissionSetId: string) => {
    setSelectedPermissionSetId(permissionSetId);
  };

  const handleTogglePermission = (permissionCode: string, checked: boolean) => {
    setDraftPermissionCodes((current) => {
      const next = checked
        ? [...current, permissionCode]
        : current.filter((code) => code !== permissionCode);

      return sanitizePermissionCodes(next, resourceRows);
    });
  };

  const handleToggleAllRow = (row: PermissionRow, checked: boolean) => {
    const rowPermissionCodes = row.actions.map((action) => buildPermissionCode(row.code, action));

    setDraftPermissionCodes((current) => {
      const next = new Set(current);

      rowPermissionCodes.forEach((code) => {
        if (checked) {
          next.add(code);
        }
        else {
          next.delete(code);
        }
      });

      return sanitizePermissionCodes(Array.from(next), resourceRows);
    });
  };

  const isRowAllChecked = (row: PermissionRow) => {
    const rowPermissionCodes = row.actions.map((action) => buildPermissionCode(row.code, action));
    return rowPermissionCodes.length > 0 && rowPermissionCodes.every((code) => draftPermissionCodes.includes(code));
  };

  const isRowIndeterminate = (row: PermissionRow) => {
    const rowPermissionCodes = row.actions.map((action) => buildPermissionCode(row.code, action));
    const checkedCount = rowPermissionCodes.filter((code) => draftPermissionCodes.includes(code)).length;
    return checkedCount > 0 && checkedCount < rowPermissionCodes.length;
  };

  const handleReset = () => {
    if (!selectedPermissionSet) {
      return;
    }

    setDraftPermissionCodes(sanitizePermissionCodes(selectedPermissionSet.permissionCodes, resourceRows));
    toast.success('수정사항이 초기화되었습니다.');
  };

  const handleSave = async () => {
    if (!selectedPermissionSet) {
      toast.error('저장할 권한 세트를 선택해 주세요.');
      return;
    }

    if (!hasChanges) {
      toast.error('변경된 내용이 없습니다.');
      return;
    }

    try {
      const response = await updatePermissionSetPermissions({
        data: {
          id: selectedPermissionSet.id,
          permissionCodes: draftPermissionCodes,
        },
      });

      const updatedPermissionSet = response.data;
      if (!updatedPermissionSet) {
        throw new Error('권한 세트 저장 응답이 비어 있습니다.');
      }

      setPermissionSets((current) =>
        current.map((permissionSet) => (permissionSet.id === updatedPermissionSet.id ? updatedPermissionSet : permissionSet)),
      );
      setDraftPermissionCodes(sanitizePermissionCodes(updatedPermissionSet.permissionCodes, resourceRows));
      await queryClient.invalidateQueries({ queryKey: getResourceControllerGetPermissionSetsV1QueryKey() });
      toast.success(`'${updatedPermissionSet.name}' 권한 세트의 퍼미션 구성이 저장되었습니다.`);
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : '권한 세트 저장 중 오류가 발생했습니다.');
    }
  };

  const permissionSetListContent = buildPermissionSetListContent({
    isLoading,
    onSelect: handleSelectPermissionSet,
    permissionSets,
    selectedPermissionSetId,
  });
  const resourceAreaContent = buildResourceAreaContent({
    draftPermissionCodes,
    isError: resourcesQuery.isError,
    isLoading,
    isRowAllChecked,
    isRowIndeterminate,
    onToggleAllRow: handleToggleAllRow,
    onTogglePermission: handleTogglePermission,
    resourceRows,
  });
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col gap-6 overflow-hidden">
      <div className="grid flex-1 min-h-0 w-full grid-cols-1 gap-6 lg:grid-cols-12">
        <aside className="flex min-h-0 flex-col gap-3 overflow-hidden rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm lg:col-span-4 xl:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="space-y-0.5">
              <h2 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <Shield className="h-3.5 w-3.5 text-indigo-500" />
                권한 세트 목록
              </h2>
              <p className="text-[10px] text-slate-400">조직에 할당된 권한 세트</p>
            </div>

            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="h-7 gap-1 rounded bg-indigo-600 px-2 text-[10px] font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              <Plus className="h-3 w-3" />
              추가
            </Button>
          </div>

          {permissionSetsQuery.isError && (
            <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] text-rose-700">
              권한 세트 목록을 불러오는 데 실패했습니다.
            </div>
          )}

          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-0.5">
            {permissionSetListContent}
          </div>
        </aside>

        <main className="flex min-h-0 w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:col-span-8 xl:col-span-9">
          <header className="flex flex-col gap-4 border-b border-slate-150 bg-slate-50/30 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <h2 className="text-sm font-bold text-slate-900">권한 세트 편집</h2>
                <Badge variant="outline" className="rounded border-indigo-200 bg-indigo-50/50 px-1.5 py-0 text-[10px] font-mono font-bold text-indigo-700">
                  {selectedPermissionSet?.code ?? '선택 없음'}
                </Badge>
                <Badge variant="secondary" className="rounded bg-slate-100 px-1.5 py-0 text-[10px] text-slate-600">
                  배정 대상
                  {' '}
                  {selectedPermissionSet?.assignmentCount ?? 0}
                  명 배정됨
                </Badge>
                {!selectedPermissionSet?.isActive && selectedPermissionSet && (
                  <Badge variant="secondary" className="rounded bg-rose-50 px-1.5 py-0 text-[10px] text-rose-600">
                    비활성
                  </Badge>
                )}
              </div>
              <p className="text-[10px] text-slate-400">
                현재 조직에서 사용할 수 있는 리소스별 허용 액션을 선택하여 권한 세트를 완성합니다.
              </p>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-center">
              {hasChanges && (
                <span className="mr-1 flex items-center gap-1 text-[10px] font-semibold text-amber-600 animate-pulse">
                  <AlertCircle className="h-3 w-3" />
                  저장되지 않은 변경사항 있음
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={!selectedPermissionSet || !hasChanges || isSaving}
                className="h-7 gap-1 rounded border-slate-200 px-2.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
              >
                <RotateCcw className="h-3 w-3" />
                초기화
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  void handleSave();
                }}
                disabled={!selectedPermissionSet || !hasChanges || isSaving}
                className={`h-7 gap-1 rounded px-3 text-[10px] font-semibold shadow-sm transition-all duration-200 ${
                  hasChanges
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'cursor-not-allowed border-transparent bg-slate-100 text-slate-400'
                }`}
              >
                {saveButtonIcon}
                저장
              </Button>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-auto">
            {resourceAreaContent}
          </div>

          <footer className="flex items-start gap-1.5 border-t border-slate-100 bg-slate-50/30 p-3 text-[10px] text-slate-400">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />
            <div className="space-y-0.5">
              <span className="font-bold text-slate-600">권한 구조 제약 조건</span>
              <p className="leading-relaxed">
                부모 메뉴의 권한 상태가 READ(조회)뿐이라면, 해당 메뉴의 하위 컴포넌트(등록/저장 등 버튼 요소) 제약은 자동으로 목록에서 숨겨지고 권한 세트에서도 제거됩니다.
              </p>
            </div>
          </footer>
        </main>
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md rounded-lg bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
              <Key className="h-4 w-4 text-indigo-500" />
              새로운 권한 세트 추가
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              권한 세트를 추가하고 초기 퍼미션 템플릿을 설정합니다.
            </DialogDescription>
          </DialogHeader>

          <createPermissionSetForm.AppForm>
            <createPermissionSetForm.Layout
              className="space-y-3 pt-2"
              onSubmit={(event) => void createPermissionSetForm.handleSubmit(event)}
            >
              <createPermissionSetForm.AppField name="code">
                {(field) => (
                  <field.Input
                    label="권한 세트 코드"
                    placeholder="예: SYSTEM_OPERATOR"
                    required
                    orientation="vertical"
                    labelWidth="auto"
                    className="font-mono"
                  />
                )}
              </createPermissionSetForm.AppField>

              <createPermissionSetForm.AppField name="name">
                {(field) => (
                  <field.Input
                    label="권한 세트 이름"
                    placeholder="예: 시스템 운영담당자"
                    required
                    orientation="vertical"
                    labelWidth="auto"
                  />
                )}
              </createPermissionSetForm.AppField>

              <createPermissionSetForm.AppField name="description">
                {(field) => (
                  <field.Input
                    label="권한 세트 설명"
                    placeholder="예: 특정 리소스의 수정 및 모니터링 작업을 수행하는 실무자입니다."
                    orientation="vertical"
                    labelWidth="auto"
                  />
                )}
              </createPermissionSetForm.AppField>

              <div className="space-y-2 border-t border-slate-100 pt-2.5">
                <div className="block text-[10px] font-bold text-slate-600">
                  초기 퍼미션 복사 템플릿
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {buildCopyFromTemplateContent({
                    onChange: (permissionSetId) => {
                      createPermissionSetForm.setFieldValue('copyFromId', permissionSetId);
                    },
                    permissionSets,
                    selectedCopyFromId,
                  })}
                </div>
              </div>

              <DialogFooter className="mt-5 border-t border-slate-100 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="h-8 rounded text-xs font-semibold"
                >
                  취소
                </Button>
                <createPermissionSetForm.Submit className="h-8 rounded bg-indigo-600 px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700">
                  {createButtonContent}
                </createPermissionSetForm.Submit>
              </DialogFooter>
            </createPermissionSetForm.Layout>
          </createPermissionSetForm.AppForm>
        </DialogContent>
      </Dialog>
    </div>
  );
}
