import { Avatar, AvatarFallback, Badge, Button, type CellContext, type ColumnDef, DataTable, Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle, Separator } from '@pkg/ui';
import { Ban, CheckCircle2, Eye, UserCog } from 'lucide-react';
import { useState } from 'react';

import { useMembersControllerGetMembersV1, useMembersControllerToggleMemberStatusV1, useMembersControllerUpdateMemberRoleV1 } from '../../../../api/endpoints';
import type { MemberResponseDto as MemberItem, MemberResponseDtoRole as MemberRole, MemberResponseDtoStatus as MemberStatus } from '../../../../api/model';
import { getInitials, ROLE_META, ROLE_OPTIONS } from '../-members.shared';
import { MembersPanel } from './MembersPanel';

function formatLastLoginAt(lastLoginAt: MemberItem['lastLoginAt']): string {
  return typeof lastLoginAt === 'string' ? lastLoginAt : '-';
}

interface MembersTabProps {
  readonly isActive: boolean
}

type MemberOverride = Partial<Pick<MemberItem, 'role' | 'status'>>;

type MemberOverrideMap = Record<string, MemberOverride>;

interface MembersMutationContext {
  previousOverrides: MemberOverrideMap
}

const EMPTY_MEMBERS: MemberItem[] = [];

export const MEMBER_COLUMNS: ColumnDef<MemberItem>[] = [
  {
    accessorKey: 'name',
    header: '멤버',
    size: 320,
    enableSorting: true,
    cell: ({ row }: CellContext<MemberItem, unknown>) => {
      const member = row.original;

      return (
        <div className="flex items-start gap-3">
          <Avatar size="sm">
            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-semibold text-slate-900">{member.name}</p>
              {member.isMe
                ? (
                  <Badge variant="secondary" className="h-5 bg-sky-100 text-sky-700 hover:bg-sky-100">
                    내 계정
                  </Badge>
                )
                : null}
            </div>
            <p className="truncate text-xs text-slate-500">{member.email}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: '권한',
    size: 180,
    enableSorting: true,
    meta: {
      faceted: {
        options: ROLE_OPTIONS.map((option) => ({
          label: option.label,
          value: option.value,
        })),
      },
    },
    filterFn: 'faceted',
    cell: ({ row, table }: CellContext<MemberItem, unknown>) => {
      const member = row.original;
      const { action } = table.options.meta || {};

      return (
        <div className="flex justify-center">
          <select
            value={member.role}
            disabled={member.isMe}
            onChange={(event) => action?.updateMemberRole(member, event.target.value as MemberRole)}
            className="h-8 w-full max-w-40 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: '상태',
    size: 140,
    enableSorting: true,
    meta: {
      faceted: {
        options: [
          {
            label: '활성',
            value: 'ACTIVE',
            icon: CheckCircle2,
          },
          {
            label: '비활성',
            value: 'INACTIVE',
            icon: Ban,
          },
        ],
      },
    },
    filterFn: 'faceted',
    cell: ({ row }: CellContext<MemberItem, unknown>) => (
      <div className="flex justify-center">
        <MemberStatusBadge status={row.original.status} />
      </div>
    ),
  },
  {
    accessorKey: 'lastLoginAt',
    header: '최근 로그인',
    size: 180,
    enableSorting: true,
    cell: ({ row }: CellContext<MemberItem, unknown>) => (
      <div className="text-center">
        <p className="whitespace-nowrap font-medium text-slate-800">
          {formatLastLoginAt(row.original.lastLoginAt)}
        </p>
      </div>
    ),
  },
  {
    id: 'actions',
    header: '작업',
    size: 240,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row, table }: CellContext<MemberItem, unknown>) => {
      const { action } = table.options.meta || {};

      return (
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 whitespace-nowrap"
            onClick={() => action?.handleOpenDetail(row.original)}
          >
            <Eye className="size-3.5" />
            상세
          </Button>

          <MemberActionButton member={row.original} onToggleStatus={() => action?.toggleMemberStatus(row.original)} />
        </div>
      );
    },
  },
];

export function MembersTab({ isActive }: MembersTabProps) {
  const membersQuery = useMembersControllerGetMembersV1(undefined, {
    query: {
      enabled: isActive,
    },
  });
  const members = membersQuery.data?.data ?? EMPTY_MEMBERS;
  const [memberOverrides, setMemberOverrides] = useState<MemberOverrideMap>({});

  const membersView = members.map((member) => {
    const override = memberOverrides[member.id];

    return override ? { ...member, ...override } : member;
  });

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const selectedMember = membersView.find((member) => member.id === selectedMemberId) ?? null;

  const updateMemberRoleMutation = useMembersControllerUpdateMemberRoleV1<unknown, MembersMutationContext>({
    mutation: {
      onMutate: (variables) => {
        const previousOverrides = memberOverrides;

        setMemberOverrides((current) => ({
          ...current,
          [variables.data.id]: {
            ...(current[variables.data.id] ?? {}),
            role: variables.data.role,
          },
        }));

        return { previousOverrides };
      },
      onError: (_error, _variables, context) => {
        if (!context) {
          return;
        }

        setMemberOverrides(context.previousOverrides);
      },
    },
  });

  const toggleMemberStatusMutation = useMembersControllerToggleMemberStatusV1<unknown, MembersMutationContext>({
    mutation: {
      onMutate: (variables) => {
        const previousOverrides = memberOverrides;
        const currentMember = membersView.find((member) => member.id === variables.data.id);

        if (!currentMember) {
          return { previousOverrides };
        }

        const nextStatus = currentMember.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

        setMemberOverrides((current) => ({
          ...current,
          [variables.data.id]: {
            ...(current[variables.data.id] ?? {}),
            status: nextStatus,
          },
        }));

        return { previousOverrides };
      },
      onError: (_error, _variables, context) => {
        if (!context) {
          return;
        }

        setMemberOverrides(context.previousOverrides);
      },
    },
  });

  const handleDrawerOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedMemberId(null);
    }
  };

  const metaValue = {
    action: {
      updateMemberRole: (row: MemberItem, nextRole: MemberRole) => {
        void updateMemberRoleMutation.mutateAsync({ data: { id: row.id, role: nextRole } });
      },
      toggleMemberStatus: (row: MemberItem) => {
        void toggleMemberStatusMutation.mutateAsync({ data: { id: row.id } });
      },
      handleOpenDetail: (row: MemberItem) => {
        setSelectedMemberId(row.id);
      },
    },
  };

  return (
    <div className="flex flex-1 flex-col">
      <MembersPanel
        icon={<UserCog className="size-4 text-sky-600" />}
        title="멤버 목록"
        description="검색은 툴바에서, 상태와 권한은 컬럼 헤더 메뉴에서 조작합니다."
      >
        <div className="space-y-4">
          <div className="h-160">
            <DataTable
              columns={MEMBER_COLUMNS}
              data={membersView}
              defaultPageSize={10}
              filterColumns={['name', 'email', 'role', 'status', 'lastLoginAt', 'invitedAt', 'createdBy']}
              filterPlaceholder="이름, 이메일, 권한, 초대한 사람으로 검색"
              meta={metaValue}
            />
          </div>
        </div>
      </MembersPanel>

      <MemberDetailDrawer
        open={selectedMemberId !== null}
        member={selectedMember}
        onOpenChange={handleDrawerOpenChange}
        onToggleStatus={(id) => {
          void toggleMemberStatusMutation.mutateAsync({ data: { id } });
        }}
      />
    </div>
  );
}

function MemberStatusBadge({ status }: Readonly<{ status: MemberStatus }>) {
  if (status === 'ACTIVE') {
    return (
      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
        활성
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="border-slate-200 bg-slate-100 text-slate-700">
      비활성
    </Badge>
  );
}

function RoleBadge({ role }: Readonly<{ role: MemberRole }>) {
  const option = ROLE_META[role];

  return (
    <Badge variant="outline" className={option.badgeClassName}>
      {option.label}
    </Badge>
  );
}

function MemberActionButton({
  member,
  onToggleStatus,
}: Readonly<{
  member: MemberItem
  onToggleStatus: (id: string) => void
}>) {
  if (member.isMe) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-1.5 whitespace-nowrap">
        내 계정 보호
      </Button>
    );
  }

  const isActive = member.status === 'ACTIVE';

  return (
    <Button
      size="sm"
      variant={isActive ? 'destructive' : 'default'}
      className="gap-1.5 whitespace-nowrap"
      onClick={() => onToggleStatus(member.id)}
    >
      {isActive
        ? (
          <>
            <Ban className="size-3.5" />
            비활성화
          </>
        )
        : (
          <>
            <CheckCircle2 className="size-3.5" />
            활성화
          </>
        )}
    </Button>
  );
}

interface MemberDetailDrawerProps {
  readonly member: MemberItem | null
  readonly onOpenChange: (open: boolean) => void
  readonly onToggleStatus: (id: string) => void
  readonly open: boolean
}

function MemberDetailDrawer({ open, member, onOpenChange, onToggleStatus }: MemberDetailDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-full w-120 max-w-[92vw] bg-white p-0">
        <div className="flex h-full flex-col">
          <DrawerHeader className="border-b border-slate-200 px-4 py-4">
            <DrawerTitle className="flex items-center gap-2 text-slate-900">
              <UserCog className="size-4 text-sky-600" />
              멤버 상세
            </DrawerTitle>
            <DrawerDescription className="text-slate-500">
              선택한 멤버의 상세 정보 및 계정 상태를 관리합니다.
            </DrawerDescription>
          </DrawerHeader>

          {!member
            ? (
              <div className="flex flex-1 flex-col items-center justify-center p-6">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <UserCog className="size-6" />
                    </EmptyMedia>
                    <EmptyTitle>멤버를 찾을 수 없습니다</EmptyTitle>
                    <EmptyDescription>선택한 멤버가 목록에서 사라졌습니다.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            )
            : (
              <div className="flex flex-1 flex-col gap-4 scroll p-4">
                <div className="flex items-start gap-3">
                  <Avatar size="lg">
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-slate-950">{member.name}</p>
                      {member.isMe
                        ? (
                          <Badge variant="secondary" className="h-5 bg-sky-100 text-sky-700 hover:bg-sky-100">
                            내 계정
                          </Badge>
                        )
                        : null}
                    </div>
                    <p className="truncate text-sm text-slate-500">{member.email}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <RoleBadge role={member.role} />
                      <MemberStatusBadge status={member.status} />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-wrap gap-2">
                  <MemberActionButton member={member} onToggleStatus={onToggleStatus} />
                </div>

                {member.isMe
                  ? (
                    <p className="rounded-xl border border-dashed border-sky-200 bg-sky-50 px-3 py-2 text-xs leading-5 text-sky-700">
                      내 계정은 비활성화할 수 없습니다.
                    </p>
                  )
                  : null}
              </div>
            )}

          <DrawerFooter className="border-t border-slate-200 px-4 py-4">
            <DrawerClose asChild>
              <Button type="button" variant="outline" className="w-full">
                닫기
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
