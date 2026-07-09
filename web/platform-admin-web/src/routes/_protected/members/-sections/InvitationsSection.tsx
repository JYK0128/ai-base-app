import { Badge, Button, type CellContext, type ColumnDef, confirm, DataTable, Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, type PaginationState, type SortingState, toast, useAppForm } from '@pkg/ui';
import { useStore } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { Ban, RefreshCw, Send, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { z } from 'zod';

import { useMembersControllerCancelInviteV1, useMembersControllerCreateInviteV1, useMembersControllerGetInvitePageV1, useMembersControllerResendInviteV1, useOrganizationControllerGetOrganizationRoleListV1 } from '@/api/generated/endpoints';
import type { CreateInviteRequestDto, GetInvitePageFiltersDto, InvitePageItem } from '@/api/generated/model';
import { InvitePageItemStatus, MembersControllerGetInvitePageV1DirectionItem, MembersControllerGetInvitePageV1SortItem } from '@/api/generated/model';

import { ConsolePanel } from '../../-components/ConsolePanel';
import { buildRoleOptions } from '../-helpers/members-role.helper';

interface InvitationsSectionProps {
  readonly isActive: boolean
}

const INVITE_PAGE_LIMIT = 20;

const INVITE_STATUS_LABELS: Record<InvitePageItemStatus, string> = {
  QUEUED: '대기',
  PENDING: '발송',
  EXPIRED: '만료',
  CANCELED: '취소',
  ACCEPTED: '수락',
  REJECTED: '거절',
};

function formatInviteDateTime(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

type InviteTableRow = InvitePageItem;

function isInviteCancelable(invite: InviteTableRow): boolean {
  return invite.status === InvitePageItemStatus.QUEUED || invite.status === InvitePageItemStatus.PENDING;
}

function isInviteResendable(invite: InviteTableRow): boolean {
  return (
    invite.status === InvitePageItemStatus.QUEUED
    || invite.status === InvitePageItemStatus.PENDING
    || invite.status === InvitePageItemStatus.EXPIRED
  );
}

interface BuildInviteColumnsOptions {
  readonly cancelingInviteId: string | null
  readonly resendingInviteId: string | null
  readonly onCancelInvite: (invite: InviteTableRow) => void
  readonly onResendInvite: (invite: InviteTableRow) => void
}

function buildInviteColumns({
  cancelingInviteId,
  resendingInviteId,
  onCancelInvite,
  onResendInvite,
}: BuildInviteColumnsOptions): ColumnDef<InviteTableRow>[] {
  return [
    {
      accessorKey: 'name',
      header: '초대 대상',
      size: 340,
      enableSorting: false,
      cell: ({ row }: CellContext<InviteTableRow, unknown>) => {
        const invite = (row as unknown as { original: InviteTableRow }).original;

        return (
          <div className="min-w-0 space-y-0.5">
            <div className="truncate font-semibold text-slate-900">
              {invite.name}
            </div>
            <div className="truncate text-xs text-slate-500">
              {invite.email}
            </div>
            {invite.note && (
              <div className="truncate text-[11px] text-slate-400">
                {invite.note}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'roleName',
      header: '권한',
      size: 160,
      enableSorting: false,
      cell: ({ row }: CellContext<InviteTableRow, unknown>) => {
        const invite = (row as unknown as { original: InviteTableRow }).original;

        return (
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className="border-slate-200 bg-white text-xs"
            >
              {invite.roleName}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: '상태',
      size: 140,
      enableSorting: false,
      cell: ({ row }: CellContext<InviteTableRow, unknown>) => {
        const invite = (row as unknown as { original: InviteTableRow }).original;

        return (
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className="border-sky-100 bg-sky-50 text-[11px] text-sky-700"
            >
              {INVITE_STATUS_LABELS[invite.status]}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: '생성일시',
      size: 180,
      enableSorting: true,
      cell: ({ row }: CellContext<InviteTableRow, unknown>) => {
        const invite = (row as unknown as { original: InviteTableRow }).original;

        return (
          <div className="text-sm whitespace-nowrap text-slate-600">
            {formatInviteDateTime(invite.createdAt)}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '관리',
      size: 190,
      enableSorting: false,
      cell: ({ row }: CellContext<InviteTableRow, unknown>) => {
        const invite = row.original;
        const canCancel = isInviteCancelable(invite);
        const canResend = isInviteResendable(invite);

        if (!canCancel && !canResend) {
          return <div className="text-center text-xs text-slate-400">-</div>;
        }

        return (
          <div className="flex justify-center gap-2">
            {canResend
              ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="
                    h-8 gap-1.5 border-sky-100 px-2.5 text-xs text-sky-600
                    hover:bg-sky-50 hover:text-sky-700
                  "
                  disabled={resendingInviteId === invite.id}
                  onClick={() => onResendInvite(invite)}
                >
                  <RefreshCw className="size-3.5" />
                  재발송
                </Button>
              )
              : null}
            {canCancel
              ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="
                    h-8 gap-1.5 border-rose-100 px-2.5 text-xs text-rose-600
                    hover:bg-rose-50 hover:text-rose-700
                  "
                  disabled={cancelingInviteId === invite.id}
                  onClick={() => onCancelInvite(invite)}
                >
                  <Ban className="size-3.5" />
                  취소
                </Button>
              )
              : null}
          </div>
        );
      },
    },
  ];
}

export function InvitationsSection({ isActive }: InvitationsSectionProps) {
  const queryClient = useQueryClient();
  const [inviteDrawerOpen, setInviteDrawerOpen] = useState(false);
  const [cancelingInviteId, setCancelingInviteId] = useState<string | null>(null);
  const [resendingInviteId, setResendingInviteId] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: INVITE_PAGE_LIMIT,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const normalizedGlobalFilter = globalFilter.trim();

  const invitePageQueryParams = useMemo(() => {
    const filters: GetInvitePageFiltersDto = {};
    const createdAtSorting = sorting.find((item) => (
      item.id === MembersControllerGetInvitePageV1SortItem.createdAt
    ));

    if (normalizedGlobalFilter.length > 0) {
      filters.search = normalizedGlobalFilter;
    }

    return {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      filters,
      sort: [MembersControllerGetInvitePageV1SortItem.createdAt],
      direction: [
        createdAtSorting?.desc === false
          ? MembersControllerGetInvitePageV1DirectionItem.asc
          : MembersControllerGetInvitePageV1DirectionItem.desc,
      ],
    };
  }, [normalizedGlobalFilter, pagination.pageIndex, pagination.pageSize, sorting]);

  const invitePageQuery = useMembersControllerGetInvitePageV1(invitePageQueryParams, {
    query: {
      enabled: isActive,
    },
  });
  const organizationRolesQuery = useOrganizationControllerGetOrganizationRoleListV1({
    query: {
      enabled: isActive,
    },
  });
  const roleOptions = buildRoleOptions(organizationRolesQuery.data?.items ?? []);

  const createInviteMutation = useMembersControllerCreateInviteV1({
    mutation: {
      onSuccess: (response) => {
        const inviteId = response?.id;

        if (!inviteId) {
          return;
        }

        void queryClient.invalidateQueries({ queryKey: invitePageQuery.queryKey });
        toast.success('멤버 초대가 생성되었습니다.');
      },
    },
  });

  const cancelInviteMutation = useMembersControllerCancelInviteV1({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: invitePageQuery.queryKey });
        toast.success('초대가 취소되었습니다.');
      },
    },
  });

  const resendInviteMutation = useMembersControllerResendInviteV1({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: invitePageQuery.queryKey });
        toast.success('초대 메일을 재발송했습니다.');
      },
    },
  });

  const handleResendInvite = async (invite: InviteTableRow) => {
    const confirmed = await confirm({
      title: '초대 메일을 재발송할까요?',
      description: `${invite.name} (${invite.email}) 대상으로 새 초대 이력을 생성하고 메일을 발송합니다. 기존 초대 이력은 유지됩니다.`,
    });

    if (!confirmed) {
      return;
    }

    setResendingInviteId(invite.id);

    try {
      await resendInviteMutation.mutateAsync({ id: invite.id });
    }
    catch {
      // handled by mutation callbacks
    }
    finally {
      setResendingInviteId(null);
    }
  };

  const handleCancelInvite = async (invite: InviteTableRow) => {
    const confirmed = await confirm({
      title: '초대를 취소할까요?',
      description: `${invite.name} (${invite.email}) 초대를 취소합니다. 취소된 초대는 사용할 수 없습니다.`,
    });

    if (!confirmed) {
      return;
    }

    setCancelingInviteId(invite.id);

    try {
      await cancelInviteMutation.mutateAsync({ id: invite.id });
    }
    catch {
      // handled by mutation callbacks
    }
    finally {
      setCancelingInviteId(null);
    }
  };

  const inviteForm = useAppForm({
    defaultValues: {
      name: '',
      email: '',
      role: '',
      note: '',
    },
    validators: {
      onSubmit: z.object({
        name: z.string().trim().min(1, '이름을 입력해주세요.'),
        email: z.email('올바른 이메일 형식을 입력해주세요.'),
        role: z.string().trim().min(1, '권한을 선택해주세요.'),
        note: z.string().trim(),
      }),
    },
    onSubmit: async ({ value }) => {
      const data: CreateInviteRequestDto = {
        name: value.name.trim(),
        email: value.email.trim(),
        role: value.role,
      };

      if (value.note.trim()) {
        data.note = value.note.trim();
      }

      try {
        await createInviteMutation.mutateAsync({ data });
        inviteForm.reset();
        setInviteDrawerOpen(false);
      }
      catch {
        // handled by mutation callbacks
      }
    },
  });

  const isSubmitting = useStore(inviteForm.baseStore, (state) => state.isSubmitting);
  const inviteCards = invitePageQuery.data?.items ?? [];
  const totalCount = invitePageQuery.data?.totalCount ?? 0;
  const totalPages = invitePageQuery.data?.totalPages ?? 0;
  const inviteColumns = buildInviteColumns({
    cancelingInviteId,
    resendingInviteId,
    onCancelInvite: (invite) => {
      void handleCancelInvite(invite);
    },
    onResendInvite: (invite) => {
      void handleResendInvite(invite);
    },
  });

  if (!isActive) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Drawer open={inviteDrawerOpen} onOpenChange={setInviteDrawerOpen} direction="right">
        <ConsolePanel
          icon="mail"
          title="멤버 초대"
          description="초대 생성과 발송 이력을 서버 기준으로 확인합니다."
          actions={[
            <Button key="create-invite" className="gap-2" onClick={() => setInviteDrawerOpen(true)}>
              <UserPlus className="size-3.5" />
              초대 생성
            </Button>,
          ]}
        >
          <DataTable
            columns={inviteColumns}
            data={inviteCards}
            loading={invitePageQuery.isLoading}
            rowCount={totalCount}
            pageCount={totalPages}
            defaultPageSize={INVITE_PAGE_LIMIT}
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
            onPaginationChange={setPagination}
          />
        </ConsolePanel>

        <DrawerContent className="h-full w-120 max-w-[92vw] bg-white p-0">
          <div className="
            grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]
          "
          >
            <DrawerHeader className="border-b border-slate-200 p-4">
              <DrawerTitle className="flex items-center gap-2 text-slate-900">
                <UserPlus className="size-4 text-sky-600" />
                초대 생성
              </DrawerTitle>
              <DrawerDescription className="text-slate-500">
                초대 생성 후 이력 목록을 서버에서 다시 조회합니다.
              </DrawerDescription>
            </DrawerHeader>

            <inviteForm.AppForm>
              <inviteForm.Layout
                className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto]"
                onSubmit={(event) => void inviteForm.handleSubmit(event)}
              >
                <div className="scroll-y flex flex-col gap-4 p-4">
                  <inviteForm.AppField name="name">
                    {(field) => (
                      <field.Input
                        label="이름"
                        placeholder="예: Hana Lee"
                        required
                        orientation="vertical"
                        labelWidth="auto"
                      />
                    )}
                  </inviteForm.AppField>

                  <inviteForm.AppField name="email">
                    {(field) => (
                      <field.Input
                        label="이메일"
                        type="email"
                        placeholder="member@atlas.com"
                        required
                        orientation="vertical"
                        labelWidth="auto"
                      />
                    )}
                  </inviteForm.AppField>

                  <inviteForm.AppField name="role">
                    {(field) => (
                      <field.Select
                        label="권한"
                        placeholder="권한을 선택하세요"
                        required
                        orientation="vertical"
                        labelWidth="auto"
                        items={roleOptions.map((option) => ({
                          label: option.label,
                          value: option.id,
                        }))}
                      />
                    )}
                  </inviteForm.AppField>

                  <inviteForm.AppField name="note">
                    {(field) => (
                      <field.Textarea
                        label="메모"
                        placeholder="팀, 직무, 초대 사유 등"
                        orientation="vertical"
                        labelWidth="auto"
                        className="min-h-24"
                      />
                    )}
                  </inviteForm.AppField>

                  <div className="
                    rounded-xl border border-dashed border-slate-200 bg-slate-50
                    p-3 text-xs/5 text-slate-500
                  "
                  >
                    초대 생성 후 서버 목록을 다시 불러옵니다.
                  </div>
                </div>

                <DrawerFooter className="border-t border-slate-200 p-4">
                  <div className="flex gap-2">
                    <DrawerClose asChild>
                      <Button type="button" variant="outline" className="flex-1">
                        닫기
                      </Button>
                    </DrawerClose>
                    <inviteForm.Submit className="flex-1 gap-2" disabled={isSubmitting || createInviteMutation.isPending}>
                      <Send className="size-3.5" />
                      초대 생성
                    </inviteForm.Submit>
                  </div>
                </DrawerFooter>
              </inviteForm.Layout>
            </inviteForm.AppForm>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
