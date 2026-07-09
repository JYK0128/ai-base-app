import { Badge, Button, confirm, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Skeleton, Textarea, toast } from '@pkg/ui';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';

import { useOrganizationControllerCreateOrganizationRoleV1,
         useOrganizationControllerDeleteOrganizationRoleV1,
         useOrganizationControllerGetOrganizationRoleListV1,
         useOrganizationControllerUpdateOrganizationRoleSortV1,
         useOrganizationControllerUpdateOrganizationRoleV1,
         useResourceControllerGetPermissionMapV1,
         useResourceControllerGetRolePermissionListV1,
         useResourceControllerUpdatePermissionSetPermissionsV1 } from '@/api/generated/endpoints';
import { type CreateOrganizationRoleRequestDto,
         type OrganizationRoleListItem,
         type RolePermissionListItem,
         type UpdateOrganizationRoleRequestDto,
         type UpdateOrganizationRoleSortRequestDto,
         type UpdatePermissionSetPermissionsRequestDto } from '@/api/generated/model';
import { pickApiItems } from '@/lib/api-response';

import { ConsolePanel } from '../../-components/ConsolePanel';
import { flattenResourceTree, type ResourceRow, resourceTypeTone } from '../../resources/-helpers/resource-tree.helper';

const CRUD_ORDER = ['CREATE', 'READ', 'UPDATE', 'DELETE'] as const;
type ActionType = (typeof CRUD_ORDER)[number];

const EMPTY_ROLE_PERMISSIONS: RolePermissionListItem[] = [];
const EMPTY_ORGANIZATION_ROLES: OrganizationRoleListItem[] = [];
const RESERVED_ROLE_CODES = new Set(['OWNER', 'MANAGER', 'VIEWER']);

type RoleModalMode = 'create' | 'edit';

function isActionType(value: string): value is ActionType {
  return CRUD_ORDER.includes(value as ActionType);
}

function buildPermissionCode(resourceCode: string, action: ActionType): string {
  return `${resourceCode}:${action}`;
}

function actionTone(active: boolean) {
  return active
    ? 'border-sky-200 bg-sky-50 text-sky-700'
    : 'border-slate-200 bg-white text-slate-400';
}

function sortPermissionCodes(codes: readonly string[]): string[] {
  return [...codes].sort((left, right) => left.localeCompare(right));
}

function isPermissionCodesEqual(left: readonly string[], right: readonly string[]): boolean {
  const leftSorted = sortPermissionCodes(left);
  const rightSorted = sortPermissionCodes(right);

  if (leftSorted.length !== rightSorted.length) {
    return false;
  }

  return leftSorted.every((code, index) => code === rightSorted[index]);
}

function buildSequentialRoleSortItems(roles: readonly OrganizationRoleListItem[]): UpdateOrganizationRoleSortRequestDto['items'] {
  return roles.map((role, index) => ({
    id: role.id,
    sortOrder: index + 1,
  }));
}

function moveRole(roles: readonly OrganizationRoleListItem[], roleId: string, delta: -1 | 1): OrganizationRoleListItem[] {
  const index = roles.findIndex((role) => role.id === roleId);

  if (index < 0) {
    return [...roles];
  }

  const nextIndex = index + delta;

  if (nextIndex < 0 || nextIndex >= roles.length) {
    return [...roles];
  }

  const nextRoles = [...roles];
  const [selectedRole] = nextRoles.splice(index, 1);

  if (!selectedRole) {
    return [...roles];
  }

  nextRoles.splice(nextIndex, 0, selectedRole);
  return nextRoles;
}

function RoleListSkeleton() {
  return (
    <div className="space-y-2 p-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`role-skeleton-${index}`}
          className="rounded-xl border border-slate-200 bg-white p-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
            <Skeleton className="h-5 w-10 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface RoleEditorModalProps {
  readonly open: boolean
  readonly mode: RoleModalMode
  readonly role: OrganizationRoleListItem | null
  readonly onOpenChange: (open: boolean) => void
  readonly onSave: (role: {
    code: string
    name: string
    description?: string
  }) => Promise<void>
}

interface ResourceContentProps {
  readonly isLoading: boolean
  readonly rows: readonly ResourceRow[]
  readonly permissionCodeSet: Set<string>
  readonly onTogglePermission: (permissionCode: string) => void
}

function ResourceContent({ isLoading, rows, permissionCodeSet, onTogglePermission }: ResourceContentProps) {
  if (isLoading && rows.length === 0) {
    return (
      <div className="
        flex min-h-80 items-center justify-center px-6 py-10 text-sm
        text-slate-500
      "
      >
        <Loader2 className="mr-2 size-4 animate-spin" />
        메뉴 목록을 불러오는 중입니다...
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="
        flex min-h-80 items-center justify-center px-6 py-10 text-sm
        text-slate-500
      "
      >
        <AlertCircle className="mr-2 size-4" />
        사용할 수 있는 메뉴가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <ResourceRowCard
          key={row.id}
          row={row}
          permissionCodeSet={permissionCodeSet}
          onTogglePermission={onTogglePermission}
        />
      ))}
    </div>
  );
}

interface ResourceRowCardProps {
  readonly row: ResourceRow
  readonly permissionCodeSet: Set<string>
  readonly onTogglePermission: (permissionCode: string) => void
}

function ResourceRowCard({ row, permissionCodeSet, onTogglePermission }: ResourceRowCardProps) {
  const rowPermissionCodes = row.actions
    .filter(isActionType)
    .map((action) => buildPermissionCode(row.code, action));

  return (
    <div
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
        <span
          className="font-medium text-slate-900"
          style={{ paddingLeft: `${row.depth * 12}px` }}
        >
          {row.name}
        </span>
        <span className="font-mono text-xs text-slate-500">
          (
          {row.code}
          )
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {rowPermissionCodes.map((permissionCode) => {
          const action = permissionCode.split(':')[1] as ActionType;
          const active = permissionCodeSet.has(permissionCode);

          return (
            <button
              key={permissionCode}
              type="button"
              onClick={() => onTogglePermission(permissionCode)}
              className={`
                rounded-full border px-2.5 py-1 text-[11px] transition
                ${actionTone(active)}
              `}
            >
              {action}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RoleEditorModal({ open, mode, role, onOpenChange, onSave }: RoleEditorModalProps) {
  const [code, setCode] = useState(() => role?.code ?? '');
  const [name, setName] = useState(() => role?.name ?? '');
  const [description, setDescription] = useState(() => role?.description ?? '');

  const isSystemRole = Boolean(role && RESERVED_ROLE_CODES.has(role.code));
  const canEditCode = mode === 'create' || !isSystemRole;

  const handleSave = async () => {
    const nextCode = code.trim().toUpperCase();
    const nextName = name.trim();
    const nextDescription = description.trim();

    if (!nextCode || !nextName) {
      toast.error('역할 코드와 이름을 입력해주세요.');
      return;
    }

    await onSave({
      code: nextCode,
      name: nextName,
      ...(nextDescription ? { description: nextDescription } : {}),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? '역할 추가' : '역할 수정'}</DialogTitle>
          <DialogDescription>
            조직 역할의 코드, 이름, 설명을 입력합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-slate-700">코드</span>
            <Input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              disabled={!canEditCode}
              placeholder="AUDITOR"
              className="font-mono"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-slate-700">이름</span>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="감사자"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-slate-700">설명</span>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder="조직 역할 설명"
            />
          </label>
          {isSystemRole
            ? (
              <p className="text-xs text-slate-500">
                시스템 기본 역할은 코드 변경이 막혀 있습니다.
              </p>
            )
            : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button type="button" onClick={() => void handleSave()}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PermissionManagementSection() {
  const queryClient = useQueryClient();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [selectedPermissionRoleId, setSelectedPermissionRoleId] = useState<string>('');
  const [draftPermissionCodes, setDraftPermissionCodes] = useState<string[]>([]);
  const [isDraftTouched, setIsDraftTouched] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleModalMode, setRoleModalMode] = useState<RoleModalMode>('create');
  const [roleModalRole, setRoleModalRole] = useState<OrganizationRoleListItem | null>(null);

  const organizationRolesQuery = useOrganizationControllerGetOrganizationRoleListV1({
    query: {
      select: (response) => pickApiItems(response),
    },
  });
  const rolePermissionsQuery = useResourceControllerGetRolePermissionListV1({
    query: {
      select: (response) => pickApiItems(response),
    },
  });
  const permissionMapQuery = useResourceControllerGetPermissionMapV1({
    query: {
      select: (response) => pickApiItems(response),
    },
  });

  const createOrganizationRoleMutation = useOrganizationControllerCreateOrganizationRoleV1({
    mutation: {
      onSuccess: async (response) => {
        await queryClient.invalidateQueries({ queryKey: organizationRolesQuery.queryKey });
        await queryClient.invalidateQueries({ queryKey: rolePermissionsQuery.queryKey });
        const createdId = response?.id;

        if (createdId) {
          setSelectedRoleId(createdId);
          setSelectedPermissionRoleId(createdId);
        }

        setRoleModalOpen(false);
        toast.success('조직 역할이 추가되었습니다.');
      },
    },
  });
  const updateOrganizationRoleMutation = useOrganizationControllerUpdateOrganizationRoleV1({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: organizationRolesQuery.queryKey });
        await queryClient.invalidateQueries({ queryKey: rolePermissionsQuery.queryKey });
        setRoleModalOpen(false);
        toast.success('조직 역할이 저장되었습니다.');
      },
    },
  });
  const deleteOrganizationRoleMutation = useOrganizationControllerDeleteOrganizationRoleV1({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: organizationRolesQuery.queryKey });
        await queryClient.invalidateQueries({ queryKey: rolePermissionsQuery.queryKey });
        toast.success('조직 역할이 삭제되었습니다.');
      },
    },
  });
  const updateOrganizationRoleSortMutation = useOrganizationControllerUpdateOrganizationRoleSortV1({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: organizationRolesQuery.queryKey });
        await queryClient.invalidateQueries({ queryKey: rolePermissionsQuery.queryKey });
        toast.success('조직 역할 정렬이 저장되었습니다.');
      },
    },
  });
  const updatePermissionSetPermissionsMutation = useResourceControllerUpdatePermissionSetPermissionsV1({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: rolePermissionsQuery.queryKey });
        toast.success('권한 세트 퍼미션 구성이 저장되었습니다.');
      },
    },
  });

  const organizationRoles = organizationRolesQuery.data ?? EMPTY_ORGANIZATION_ROLES;
  const rolePermissions = rolePermissionsQuery.data ?? EMPTY_ROLE_PERMISSIONS;
  const resourceRows = useMemo(
    () => flattenResourceTree(permissionMapQuery.data ?? []),
    [permissionMapQuery.data],
  );
  const selectedRole = selectedRoleId
    ? organizationRoles.find((role) => role.id === selectedRoleId) ?? null
    : organizationRoles[0] ?? null;

  const resolvedSelectedPermissionRoleId = selectedPermissionRoleId || selectedRole?.id || rolePermissions[0]?.id || '';
  const selectedRolePermission = resolvedSelectedPermissionRoleId
    ? rolePermissions.find((rolePermission) => rolePermission.id === resolvedSelectedPermissionRoleId) ?? null
    : null;

  const basePermissionCodes = selectedRolePermission?.permissions ?? [];
  const effectivePermissionCodes = isDraftTouched ? draftPermissionCodes : basePermissionCodes;
  const permissionCodeSet = new Set(effectivePermissionCodes);
  const hasUnsavedChanges = isDraftTouched && !isPermissionCodesEqual(effectivePermissionCodes, basePermissionCodes);
  const isLoading = organizationRolesQuery.isPending || rolePermissionsQuery.isPending || permissionMapQuery.isPending;
  let roleListContent: ReactNode;

  if (organizationRolesQuery.isPending && organizationRoles.length === 0) {
    roleListContent = <RoleListSkeleton />;
  }
  else if (organizationRoles.length === 0) {
    roleListContent = (
      <div className="
        grid place-items-center rounded-lg border border-dashed border-slate-200
        bg-slate-50/60 px-3 py-8 text-sm text-slate-500
      "
      >
        등록된 역할이 없습니다.
      </div>
    );
  }
  else {
    roleListContent = organizationRoles.map((role) => {
      const isSelected = role.id === selectedRole?.id;
      const isReserved = RESERVED_ROLE_CODES.has(role.code);
      const permissionCount = rolePermissions.find((item) => item.id === role.id)?.permissions.length ?? 0;

      return (
        <div
          key={role.id}
          className={`
            rounded-xl border p-3 transition
            ${isSelected
          ? 'border-slate-300 bg-slate-50'
          : `
            border-slate-200 bg-white
            hover:border-slate-300 hover:bg-slate-50
          `
        }
          `}
        >
          <button
            type="button"
            onClick={() => {
              setSelectedRoleId(role.id);
              setSelectedPermissionRoleId(role.id);
              setDraftPermissionCodes(rolePermissions.find((item) => item.id === role.id)?.permissions ?? []);
              setIsDraftTouched(false);
            }}
            className="flex w-full items-start justify-between gap-3 text-left"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-medium text-slate-900">{role.name}</p>
                {isReserved
                  ? (
                    <Badge
                      variant="secondary"
                      className="bg-slate-100 text-[10px] text-slate-500"
                    >
                      시스템
                    </Badge>
                  )
                  : null}
              </div>
              <p className="mt-1 truncate text-xs text-slate-500">
                {role.description || '설명이 없습니다.'}
              </p>
            </div>
            <Badge
              variant="outline"
              className="shrink-0 rounded-full text-[10px] text-slate-500"
            >
              {permissionCount}
            </Badge>
          </button>
        </div>
      );
    });
  }

  const openCreateRoleModal = () => {
    setRoleModalMode('create');
    setRoleModalRole(null);
    setRoleModalOpen(true);
  };

  const openEditRoleModal = (role: OrganizationRoleListItem) => {
    setRoleModalMode('edit');
    setRoleModalRole(role);
    setRoleModalOpen(true);
  };

  const handleSaveRole = async (role: {
    code: string
    name: string
    description?: string
  }) => {
    if (roleModalMode === 'create') {
      await createOrganizationRoleMutation.mutateAsync({
        data: role satisfies CreateOrganizationRoleRequestDto,
      });
      return;
    }

    if (!roleModalRole) {
      return;
    }

    await updateOrganizationRoleMutation.mutateAsync({
      id: roleModalRole.id,
      data: {
        id: roleModalRole.id,
        ...role,
      } satisfies UpdateOrganizationRoleRequestDto,
    });
  };

  const handleDeleteRole = async (role: OrganizationRoleListItem) => {
    const confirmed = await confirm({
      title: '조직 역할을 삭제할까요?',
      description: `${role.name} (${role.code}) 역할을 삭제합니다. 할당된 멤버가 있으면 서버에서 거절됩니다.`,
    });

    if (!confirmed) {
      return;
    }

    await deleteOrganizationRoleMutation.mutateAsync({ id: role.id });

    if (selectedRole?.id === role.id) {
      const nextRole = organizationRoles.find((item) => item.id !== role.id) ?? null;
      setSelectedRoleId(nextRole?.id ?? null);
      setSelectedPermissionRoleId(nextRole?.id ?? '');
      setDraftPermissionCodes(
        nextRole
          ? rolePermissions.find((item) => item.id === nextRole.id)?.permissions ?? []
          : [],
      );
      setIsDraftTouched(false);
    }
  };

  const handleMoveRole = async (roleId: string, delta: -1 | 1) => {
    const nextRoles = moveRole(organizationRoles, roleId, delta);

    if (nextRoles.length === organizationRoles.length && nextRoles.every((role, index) => role.id === organizationRoles[index]?.id)) {
      return;
    }

    await updateOrganizationRoleSortMutation.mutateAsync({
      data: {
        items: buildSequentialRoleSortItems(nextRoles),
      } satisfies UpdateOrganizationRoleSortRequestDto,
    });
  };

  const handleTogglePermission = (permissionCode: string) => {
    const currentCodes = isDraftTouched ? draftPermissionCodes : basePermissionCodes;
    const nextCodes = permissionCodeSet.has(permissionCode)
      ? currentCodes.filter((code) => code !== permissionCode)
      : [...currentCodes, permissionCode];

    setDraftPermissionCodes(sortPermissionCodes(nextCodes));
    setIsDraftTouched(true);
  };

  const handleResetDraft = () => {
    setDraftPermissionCodes(basePermissionCodes);
    setIsDraftTouched(false);
  };

  const handleSavePermissions = async () => {
    if (!selectedRolePermission) {
      return;
    }

    await updatePermissionSetPermissionsMutation.mutateAsync({
      data: {
        id: selectedRolePermission.id,
        permissionCodes: sortPermissionCodes(effectivePermissionCodes),
      } satisfies UpdatePermissionSetPermissionsRequestDto,
    });

    setDraftPermissionCodes(basePermissionCodes);
    setIsDraftTouched(false);
  };

  return (
    <div className="
      grid h-full min-h-0 gap-4
      lg:grid-cols-[320px_minmax(0,1fr)]
    "
    >
      <ConsolePanel
        icon="shield"
        title="역할 목록"
        description="조직 역할을 목록에서 관리하고, 추가/수정은 모달에서 처리합니다."
      >
        <div className="
          grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden
          rounded-xl border border-slate-200 bg-white
        "
        >
          <div className="
            flex items-center justify-between gap-2 border-b border-slate-200
            bg-slate-50 px-3 py-2
          "
          >
            <div />
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="
                  size-7 rounded-md p-0 text-slate-500
                  hover:bg-slate-100 hover:text-slate-700
                "
                onClick={openCreateRoleModal}
                title="추가"
                aria-label="추가"
              >
                <Plus className="size-3.5" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="
                  size-7 rounded-md p-0 text-slate-500
                  hover:bg-slate-100 hover:text-slate-700
                "
                onClick={() => {
                  if (selectedRole) {
                    openEditRoleModal(selectedRole);
                  }
                }}
                disabled={!selectedRole}
                title="수정"
                aria-label="수정"
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="
                  size-7 rounded-md p-0 text-slate-500
                  hover:bg-slate-100 hover:text-slate-700
                "
                onClick={() => {
                  if (selectedRole) {
                    void handleDeleteRole(selectedRole);
                  }
                }}
                disabled={!selectedRole || deleteOrganizationRoleMutation.isPending}
                title="삭제"
                aria-label="삭제"
              >
                <Trash2 className="size-3.5" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="
                  size-7 rounded-md p-0 text-slate-500
                  hover:bg-slate-100 hover:text-slate-700
                "
                onClick={() => {
                  if (selectedRole) {
                    void handleMoveRole(selectedRole.id, -1);
                  }
                }}
                disabled={!selectedRole || selectedRole.id === organizationRoles[0]?.id || updateOrganizationRoleSortMutation.isPending}
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
                  size-7 rounded-md p-0 text-slate-500
                  hover:bg-slate-100 hover:text-slate-700
                "
                onClick={() => {
                  if (selectedRole) {
                    void handleMoveRole(selectedRole.id, 1);
                  }
                }}
                disabled={!selectedRole || selectedRole.id === organizationRoles[organizationRoles.length - 1]?.id || updateOrganizationRoleSortMutation.isPending}
                title="아래로"
                aria-label="아래로"
              >
                <ArrowDown className="size-3.5" />
              </Button>
            </div>
          </div>
          <div className="scroll-y min-h-0">
            <div className="space-y-2 p-3">
              {roleListContent}
            </div>
          </div>
        </div>
      </ConsolePanel>

      <ConsolePanel
        icon="tree-pine"
        title="메뉴 권한 맵"
        description="선택된 역할 권한에 포함된 권한 코드를 토글합니다."
        actions={[
          hasUnsavedChanges
            ? (
              <Badge
                key="dirty"
                variant="outline"
                className="border-amber-200 bg-amber-50 text-amber-700"
              >
                저장되지 않은 변경사항 있음
              </Badge>
            )
            : null,
          <Button
            key="reset"
            type="button"
            variant="outline"
            onClick={handleResetDraft}
            disabled={!hasUnsavedChanges}
          >
            초기화
          </Button>,
          <Button
            key="save"
            type="button"
            onClick={() => void handleSavePermissions()}
            disabled={!hasUnsavedChanges || updatePermissionSetPermissionsMutation.isPending}
          >
            저장
          </Button>,
        ]}
      >
        <ResourceContent
          isLoading={isLoading}
          rows={resourceRows}
          permissionCodeSet={permissionCodeSet}
          onTogglePermission={handleTogglePermission}
        />
      </ConsolePanel>

      <RoleEditorModal
        key={`${roleModalMode}-${roleModalRole?.id ?? 'new'}`}
        open={roleModalOpen}
        mode={roleModalMode}
        role={roleModalRole}
        onOpenChange={setRoleModalOpen}
        onSave={handleSaveRole}
      />
    </div>
  );
}
