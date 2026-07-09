import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, Avatar, AvatarFallback, Badge, Button, type CellContext, type ColumnDef, type ColumnFiltersState, DataTable, Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle, type PaginationState, type SortingState } from '@pkg/ui';
import { Ban, CheckCircle2, Eye, UserCog } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useMembersControllerGetMemberPageV1, useMembersControllerUpdateMemberRoleV1, useMembersControllerUpdateMemberStatusV1, useOrganizationControllerGetOrganizationRoleListV1 } from '@/api/generated/endpoints';
import { type GetMemberPageFiltersDto, MemberPageItem, MemberPageItemStatus, MembersControllerGetMemberPageV1DirectionItem, MembersControllerGetMemberPageV1SortItem, OrganizationRoleListItem } from '@/api/generated/model';

import { ConsolePanel } from '../../-components/ConsolePanel';
import { buildRoleOptions, getRoleMeta } from '../-helpers/members-role.helper';
import { getInitials } from '../-helpers/members-text.helper';

type MemberRow = MemberPageItem & {
  isMe?: boolean
};

function formatLastLoginAt(lastLoginAt: MemberRow['lastLoginAt']): string {
  return typeof lastLoginAt === 'string' ? lastLoginAt : '-';
}

interface MembersSectionProps {
  readonly isActive: boolean
}

type MemberOverride = Partial<Pick<MemberRow, 'roles' | 'status'>>;

type MemberOverrideMap = Record<string, MemberOverride>;

interface MembersMutationContext {
  previousOverrides: MemberOverrideMap
}

const EMPTY_MEMBERS: MemberRow[] = [];
const EMPTY_ORGANIZATION_ROLES: OrganizationRoleListItem[] = [];

type RoleOption = {
  id: string
  value: string
  label: string
};

function isMemberStatus(value: unknown): value is MemberPageItemStatus {
  return value === MemberPageItemStatus.ACTIVE || value === MemberPageItemStatus.INACTIVE;
}

function getServerStatusFilter(columnFilters: ColumnFiltersState): MemberPageItemStatus | undefined {
  const statusFilter = columnFilters.find((filter) => filter.id === 'status');
  const selectedStatuses = Array.isArray(statusFilter?.value)
    ? statusFilter.value.filter(isMemberStatus)
    : [];

  return selectedStatuses.length === 1 ? selectedStatuses[0] : undefined;
}

function buildMemberColumns(roleOptions: readonly RoleOption[]): ColumnDef<MemberRow>[] {
  return [
    {
      accessorKey: 'name',
      header: '멤버',
      size: 320,
      enableSorting: true,
      cell: ({ row }: CellContext<MemberRow, unknown>) => {
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
                    <Badge
                      variant="secondary"
                      className="
                        h-5 bg-sky-100 text-sky-700
                        hover:bg-sky-100
                      "
                    >
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
      accessorKey: 'roles',
      header: '권한',
      size: 180,
      enableSorting: false,
      cell: ({ row, table }: CellContext<MemberRow, unknown>) => {
        const member = row.original;
        const { action } = table.options.meta || {};
        const selectedRoleId = roleOptions.find((option) => option.value === (member.roles?.[0] ?? ''))?.id ?? '';

        return (
          <div className="flex justify-center">
            <select
              value={selectedRoleId}
              disabled={Boolean(member.isMe)}
              onChange={(event) => action?.updateMemberRole(member, event.target.value)}
              className="
                h-8 w-full max-w-40 rounded-lg border border-slate-200 bg-white
                px-2.5 text-sm text-slate-700 shadow-sm transition outline-none
                focus:border-sky-400 focus:ring-2 focus:ring-sky-100
                disabled:cursor-not-allowed disabled:bg-slate-50
                disabled:text-slate-400
              "
            >
              {roleOptions.map((option) => (
                <option key={option.id} value={option.id}>
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
              value: MemberPageItemStatus.ACTIVE,
              icon: CheckCircle2,
            },
            {
              label: '비활성',
              value: MemberPageItemStatus.INACTIVE,
              icon: Ban,
            },
          ],
        },
      },
      filterFn: 'faceted',
      cell: ({ row }: CellContext<MemberRow, unknown>) => (
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
      cell: ({ row }: CellContext<MemberRow, unknown>) => (
        <div className="text-center">
          <p className="font-medium whitespace-nowrap text-slate-800">
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
      cell: ({ row, table }: CellContext<MemberRow, unknown>) => {
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
          </div>
        );
      },
    },
  ];
}

export function MembersSection({ isActive }: MembersSectionProps) {
  const organizationRolesQuery = useOrganizationControllerGetOrganizationRoleListV1({
    query: {
      enabled: isActive,
    },
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const normalizedGlobalFilter = globalFilter.trim();

  const membersQueryParams = useMemo(() => {
    const filters: GetMemberPageFiltersDto = {};
    const statusFilter = getServerStatusFilter(columnFilters);

    if (normalizedGlobalFilter.length > 0) {
      filters.search = normalizedGlobalFilter;
    }

    if (statusFilter) {
      filters.status = statusFilter;
    }

    const sortPairs = sorting
      .map((item) => ({
        sort: item.id as MembersControllerGetMemberPageV1SortItem,
        direction: item.desc
          ? MembersControllerGetMemberPageV1DirectionItem.desc
          : MembersControllerGetMemberPageV1DirectionItem.asc,
      }))
      .filter((item) => (
        item.sort === MembersControllerGetMemberPageV1SortItem.createdAt
        || item.sort === MembersControllerGetMemberPageV1SortItem.name
        || item.sort === MembersControllerGetMemberPageV1SortItem.status
        || item.sort === MembersControllerGetMemberPageV1SortItem.lastLoginAt
      ));

    return {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      filters,
      ...(sortPairs.length > 0
        ? {
          sort: sortPairs.map((item) => item.sort),
          direction: sortPairs.map((item) => item.direction),
        }
        : {}),
    };
  }, [columnFilters, normalizedGlobalFilter, pagination.pageIndex, pagination.pageSize, sorting]);

  const membersQuery = useMembersControllerGetMemberPageV1(membersQueryParams, {
    query: {
      enabled: isActive,
    },
  });
  const members = membersQuery.data?.items ?? EMPTY_MEMBERS;
  const totalCount = membersQuery.data?.totalCount ?? 0;
  const totalPages = membersQuery.data?.totalPages ?? 0;
  const organizationRoles = organizationRolesQuery.data?.items ?? EMPTY_ORGANIZATION_ROLES;
  const isLoading = organizationRolesQuery.isPending || membersQuery.isPending;
  const roleOptions = buildRoleOptions(organizationRoles);
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
        const nextRoleId = typeof variables.data.role === 'string' ? variables.data.role : '';
        const nextRoleCode = roleOptions.find((option) => option.id === nextRoleId)?.value;

        setMemberOverrides((current) => ({
          ...current,
          [variables.data.id]: {
            ...(current[variables.data.id] ?? {}),
            roles: nextRoleCode ? [nextRoleCode] : (current[variables.data.id]?.roles ?? []),
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

  const toggleMemberStatusMutation = useMembersControllerUpdateMemberStatusV1<unknown, MembersMutationContext>({
    mutation: {
      onMutate: (variables) => {
        const previousOverrides = memberOverrides;

        setMemberOverrides((current) => ({
          ...current,
          [variables.data.id]: {
            ...(current[variables.data.id] ?? {}),
            status: variables.data.status,
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
      updateMemberRole: (row: MemberRow, nextRoleId: string) => {
        void updateMemberRoleMutation.mutateAsync({
          data: {
            id: row.id,
            role: nextRoleId,
          },
        });
      },
      handleOpenDetail: (row: MemberRow) => {
        setSelectedMemberId(row.id);
      },
    },
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ConsolePanel
        icon="user-cog"
        title="멤버 목록"
        description="검색은 툴바에서, 권한은 목록에서, 상태는 상세에서 조작합니다."
      >
        <DataTable
          columns={buildMemberColumns(roleOptions)}
          data={membersView}
          rowCount={totalCount}
          pageCount={totalPages}
          defaultPageSize={10}
          filterColumns={['email']}
          filterPlaceholder="이름, 이메일로 검색"
          onGlobalFilterChange={(value) => {
            setGlobalFilter(typeof value === 'string' ? value : '');
            setPagination((current) => (
              current.pageIndex === 0
                ? current
                : { ...current, pageIndex: 0 }
            ));
          }}
          onSortingChange={(nextSorting) => {
            setSorting(nextSorting);
            setPagination((current) => (
              current.pageIndex === 0
                ? current
                : { ...current, pageIndex: 0 }
            ));
          }}
          onColumnFiltersChange={(nextColumnFilters) => {
            setColumnFilters(nextColumnFilters);
            setPagination((current) => (
              current.pageIndex === 0
                ? current
                : { ...current, pageIndex: 0 }
            ));
          }}
          onPaginationChange={setPagination}
          loading={isLoading}
          meta={metaValue}
        />
      </ConsolePanel>

      <MemberDetailDrawer
        open={selectedMemberId !== null}
        member={selectedMember}
        onOpenChange={handleDrawerOpenChange}
        onToggleStatus={(id) => {
          const member = membersView.find((item) => item.id === id);

          if (!member) {
            return;
          }

          void toggleMemberStatusMutation.mutateAsync({
            data: {
              id,
              status: member.status === MemberPageItemStatus.ACTIVE
                ? MemberPageItemStatus.INACTIVE
                : MemberPageItemStatus.ACTIVE,
            },
          });
        }}
      />
    </div>
  );
}

function MemberStatusBadge({ status }: Readonly<{ status: MemberPageItemStatus }>) {
  if (status === MemberPageItemStatus.ACTIVE) {
    return (
      <Badge className="
        border-emerald-200 bg-emerald-50 text-emerald-700
        hover:bg-emerald-50
      "
      >
        활성
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-slate-200 bg-slate-100 text-slate-700"
    >
      비활성
    </Badge>
  );
}

function RoleBadge({ role }: Readonly<{ role: string | null | undefined }>) {
  const option = getRoleMeta(role);

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
  member: MemberRow
  onToggleStatus: (id: string) => void
}>) {
  if (member.isMe) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="gap-1.5 whitespace-nowrap"
      >
        내 계정 보호
      </Button>
    );
  }

  const isActive = member.status === MemberPageItemStatus.ACTIVE;

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
  readonly member: MemberRow | null
  readonly onOpenChange: (open: boolean) => void
  readonly onToggleStatus: (id: string) => void
  readonly open: boolean
}

function MemberDetailDrawer({ open, member, onOpenChange, onToggleStatus }: MemberDetailDrawerProps) {
  const [isDeactivateConfirmOpen, setIsDeactivateConfirmOpen] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setIsDeactivateConfirmOpen(false);
    }

    onOpenChange(nextOpen);
  };

  const handleToggleStatus = () => {
    if (!member) {
      return;
    }

    if (member.status === MemberPageItemStatus.ACTIVE) {
      setIsDeactivateConfirmOpen(true);
      return;
    }

    onToggleStatus(member.id);
  };

  const handleConfirmDeactivate = () => {
    if (!member) {
      return;
    }

    setIsDeactivateConfirmOpen(false);
    onToggleStatus(member.id);
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} direction="right">
      <DrawerContent className="h-full w-120 max-w-[92vw] bg-white p-0">
        <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]">
          <DrawerHeader className="border-b border-slate-200 p-4">
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
              <div className="
                flex flex-1 flex-col items-center justify-center p-6
              "
              >
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
              <div className="scroll-y flex flex-col gap-4 p-4">
                <div className="
                  flex flex-col gap-3
                  sm:flex-row sm:items-start sm:justify-between
                "
                >
                  <div className="flex items-start gap-3">
                    <Avatar size="lg">
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-slate-950">{member.name}</p>
                        {member.isMe
                          ? (
                            <Badge
                              variant="secondary"
                              className="
                                h-5 bg-sky-100 text-sky-700
                                hover:bg-sky-100
                              "
                            >
                              내 계정
                            </Badge>
                          )
                          : null}
                      </div>
                      <p className="truncate text-sm text-slate-500">{member.email}</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <RoleBadge role={member.roles?.[0]} />
                        <MemberStatusBadge status={member.status} />
                      </div>
                    </div>
                  </div>

                  <div className="
                    shrink-0
                    sm:pt-1
                  "
                  >
                    <MemberActionButton member={member} onToggleStatus={handleToggleStatus} />
                  </div>
                </div>

                {member.isMe
                  ? (
                    <p className="
                      rounded-xl border border-dashed border-sky-200 bg-sky-50
                      px-3 py-2 text-xs/5 text-sky-700
                    "
                    >
                      내 계정은 비활성화할 수 없습니다.
                    </p>
                  )
                  : null}
              </div>
            )}

          <DrawerFooter className="border-t border-slate-200 p-4">
            <DrawerClose asChild>
              <Button type="button" variant="outline" className="w-full">
                닫기
              </Button>
            </DrawerClose>
          </DrawerFooter>

          <AlertDialog open={isDeactivateConfirmOpen} onOpenChange={setIsDeactivateConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>멤버를 비활성화할까요?</AlertDialogTitle>
                <AlertDialogDescription>
                  {member?.name ?? '선택한 멤버'}
                  의 계정을 비활성화합니다.
                  다시 활성화할 수 있지만, 비활성화 동안에는 접근이 제한됩니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDeactivate}>
                  비활성화
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
