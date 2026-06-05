import { Badge, Button, ButtonGroup, ButtonGroupSeparator, type CellContext, type ColumnDef, DataTable, Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger, toast, Tooltip, TooltipContent, TooltipTrigger, useAppForm } from '@pkg/ui';
import { Ban, CheckCircle2, ChevronDown, Mail, RefreshCcw, Send, UserPlus, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { z } from 'zod';

import { useMembersControllerCancelInviteV1, useMembersControllerCreateInviteV1, useMembersControllerGetInvitesV1, useMembersControllerResendInviteV1, useMembersControllerReviveInviteV1 } from '../../../../api/endpoints';
import type { CreateInviteDto, InviteResponseDto as InviteItem, InviteResponseDtoInviteStatus as InviteStatus, MemberResponseDtoRole as MemberRole } from '../../../../api/model';
import { ROLE_META, ROLE_OPTIONS, upsertById } from '../-members.shared';
import { MembersPanel } from './MembersPanel';

interface InvitationsTabProps {
  readonly isActive: boolean
}

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type InviteDisplayStatus = InviteStatus | 'EXPIRED';

interface InviteViewItem extends InviteItem {
  displayStatus: InviteDisplayStatus
}

type InvitePatch = Partial<Pick<InviteItem, 'inviteStatus' | 'status' | 'invitedAt' | 'expiresAt'>>;

type InvitePatchMap = Record<string, InvitePatch>;

type ButtonVariant = 'link' | 'outline' | 'default' | 'secondary' | 'ghost' | 'destructive';

const EMPTY_INVITES: InviteItem[] = [];

function getNextInviteExpiresAt(now = new Date()): string {
  return new Date(now.getTime() + INVITE_TTL_MS).toISOString();
}

function isInviteExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() <= Date.now();
}

function getInviteDisplayStatus(invite: InviteItem): InviteDisplayStatus {
  if (invite.inviteStatus === 'CANCELED' || invite.inviteStatus === 'ACCEPTED' || invite.inviteStatus === 'REJECTED') {
    return invite.inviteStatus;
  }

  return isInviteExpired(invite.expiresAt) ? 'EXPIRED' : 'PENDING';
}

export const INVITE_COLUMNS: ColumnDef<InviteViewItem>[] = [
  {
    accessorKey: 'name',
    header: '초대 대상',
    size: 260,
    enableSorting: true,
    cell: ({ row }: CellContext<InviteViewItem, unknown>) => {
      const invite = row.original;

      return (
        <div className="space-y-0.5">
          <div className="truncate font-semibold text-slate-900">{invite.name}</div>
          <p className="truncate text-xs text-slate-500">{invite.email}</p>
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: '권한',
    size: 120,
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
    cell: ({ row }: CellContext<InviteViewItem, unknown>) => {
      const invite = row.original;
      const roleOption = ROLE_META[invite.role];

      return (
        <Badge className={roleOption.badgeClassName}>
          {roleOption.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'displayStatus',
    header: '상태',
    size: 110,
    enableSorting: true,
    meta: {
      faceted: {
        options: [
          {
            label: '대기',
            value: 'PENDING',
            icon: Mail,
          },
          {
            label: '수락',
            value: 'ACCEPTED',
            icon: CheckCircle2,
          },
          {
            label: '거절',
            value: 'REJECTED',
            icon: XCircle,
          },
          {
            label: '만료',
            value: 'EXPIRED',
            icon: RefreshCcw,
          },
          {
            label: '취소',
            value: 'CANCELED',
            icon: Ban,
          },
        ],
      },
    },
    filterFn: 'faceted',
    cell: ({ row }: CellContext<InviteViewItem, unknown>) => (
      <InviteStatusBadge inviteStatus={row.original.displayStatus} />
    ),
  },
  {
    accessorKey: 'invitedAt',
    header: '초대일',
    size: 170,
    enableSorting: true,
    cell: ({ row }: CellContext<InviteViewItem, unknown>) => {
      const invite = row.original;

      return (
        <div className="space-y-0.5 text-center">
          <p className="whitespace-nowrap font-medium text-slate-800">{invite.invitedAt}</p>
          <p className="truncate text-[11px] text-slate-400">{invite.invitedBy}</p>
        </div>
      );
    },
  },
  {
    accessorKey: 'note',
    header: '메모',
    size: 80,
    enableSorting: false,
    cell: ({ row }: CellContext<InviteViewItem, unknown>) => {
      const invite = row.original;

      return (
        <div className="flex justify-center">
          {invite.note
            ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 px-0 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    aria-label={invite.name + ' 메모 보기'}
                  >
                    <span className="size-2 rounded-full bg-slate-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-70 whitespace-pre-wrap text-left">
                  {invite.note}
                </TooltipContent>
              </Tooltip>
            )
            : (
              <span className="text-sm text-slate-300">-</span>
            )}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: '작업',
    size: 240,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row, table }: CellContext<InviteViewItem, unknown>) => {
      const invite = row.original;
      const { action } = table.options.meta || {};

      return (
        <div className="flex justify-end">
          <InviteRowActions
            invite={invite}
            resendInvite={() => action?.resendInvite(invite)}
            cancelInvite={() => action?.cancelInvite(invite)}
            reviveInvite={() => action?.reviveInvite(invite)}
          />
        </div>
      );
    },
  },
];

export function InvitationsTab({ isActive }: InvitationsTabProps) {
  const { data: invitesResponse } = useMembersControllerGetInvitesV1(undefined, {
    query: {
      enabled: isActive,
    },
  });

  const invites = invitesResponse?.data ?? EMPTY_INVITES;
  const [invitePatches, setInvitePatches] = useState<InvitePatchMap>({});
  const [createdInvites, setCreatedInvites] = useState<InviteItem[]>(EMPTY_INVITES);
  const [inviteDrawerOpen, setInviteDrawerOpen] = useState(false);

  const invitesView = useMemo<InviteViewItem[]>(() => {
    const merged = new Map<string, InviteItem>();

    for (const invite of createdInvites) {
      merged.set(invite.id, invite);
    }

    for (const invite of invites) {
      merged.set(invite.id, invite);
    }

    return Array.from(merged.values()).map((invite) => {
      const patch = invitePatches[invite.id];
      const mergedInvite = patch ? { ...invite, ...patch } : invite;

      return {
        ...mergedInvite,
        displayStatus: getInviteDisplayStatus(mergedInvite),
      };
    });
  }, [createdInvites, invitePatches, invites]);

  const resendInviteMutation = useMembersControllerResendInviteV1({
    mutation: {
      onSuccess: (response) => {
        const inviteId = response.data?.id;
        if (!inviteId) return;

        setInvitePatches((current) => ({
          ...current,
          [inviteId]: {
            ...(current[inviteId] ?? {}),
            inviteStatus: 'PENDING',
            status: 'INACTIVE',
            invitedAt: new Date().toISOString(),
            expiresAt: getNextInviteExpiresAt(),
          },
        }));
      },
    },
  });

  const cancelInviteMutation = useMembersControllerCancelInviteV1({
    mutation: {
      onSuccess: (response) => {
        const inviteId = response.data?.id;
        if (!inviteId) return;

        setInvitePatches((current) => ({
          ...current,
          [inviteId]: {
            ...(current[inviteId] ?? {}),
            inviteStatus: 'CANCELED',
            status: 'INACTIVE',
          },
        }));
      },
    },
  });

  const reviveInviteMutation = useMembersControllerReviveInviteV1({
    mutation: {
      onSuccess: (response) => {
        const inviteId = response.data?.id;
        if (!inviteId) return;

        setInvitePatches((current) => ({
          ...current,
          [inviteId]: {
            ...(current[inviteId] ?? {}),
            inviteStatus: 'PENDING',
            status: 'INACTIVE',
            invitedAt: new Date().toISOString(),
            expiresAt: getNextInviteExpiresAt(),
          },
        }));
      },
    },
  });

  const createInviteMutation = useMembersControllerCreateInviteV1({
    mutation: {
      onSuccess: (response, variables) => {
        const inviteId = response.data?.id;
        if (!inviteId) return;

        const invitedAt = new Date().toISOString();
        const email = variables.data.email;
        const name = variables.data.name || email.split('@')[0] || 'Member';
        const note = variables.data.note;

        const nextInvite: InviteItem = {
          id: inviteId,
          name,
          email,
          role: variables.data.role,
          status: 'INACTIVE',
          lastLoginAt: null,
          invitedAt,
          expiresAt: getNextInviteExpiresAt(new Date(invitedAt)),
          invitedBy: 'system',
          note: note || undefined,
          isMe: false,
          inviteStatus: 'PENDING',
        };

        setCreatedInvites((current) => upsertById(current, nextInvite));
      },
      onError: () => {
        toast.error('멤버 초대 생성에 실패했습니다.');
      },
    },
  });

  const inviteForm = useAppForm({
    defaultValues: {
      name: '',
      email: '',
      role: 'MANAGER' as MemberRole,
      note: '',
    },
    validators: {
      onSubmit: z.object({
        name: z.string().trim(),
        email: z.email('올바른 이메일 형식을 입력해주세요.'),
        role: z.enum(['OWNER', 'MANAGER', 'VIEWER']),
        note: z.string().trim(),
      }),
    },
    onSubmit: async ({ value }) => {
      const email = value.email;
      const displayName = value.name || email.split('@')[0] || 'New Member';

      const data: CreateInviteDto = {
        name: displayName,
        email,
        role: value.role,
      };

      if (value.note) {
        data.note = value.note;
      }

      try {
        await createInviteMutation.mutateAsync({ data });
        inviteForm.reset();
        setInviteDrawerOpen(false);
      }
      catch {
        // Mutation handles the toast.
      }
    },
  });

  const metaValue = {
    action: {
      resendInvite: (row: InviteItem) => resendInviteMutation.mutate({ data: { id: row.id } }),
      cancelInvite: (row: InviteItem) => cancelInviteMutation.mutate({ data: { id: row.id } }),
      reviveInvite: (row: InviteItem) => reviveInviteMutation.mutate({ data: { id: row.id } }),
    },
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Drawer open={inviteDrawerOpen} onOpenChange={setInviteDrawerOpen} direction="right">
        <MembersPanel
          icon={<Mail className="size-4 text-sky-600" />}
          title="초대 이력"
          description="검색은 툴바에서, 초대 상태와 권한은 컬럼 헤더 메뉴에서 필터합니다."
          actions={(
            <DrawerTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="size-3.5" />
                멤버 초대
              </Button>
            </DrawerTrigger>
          )}
        >
          <div className="space-y-4">
            <div className="h-160">
              <DataTable
                columns={INVITE_COLUMNS}
                data={invitesView}
                defaultPageSize={10}
                filterColumns={['name', 'email', 'role', 'displayStatus', 'invitedAt', 'invitedBy', 'note']}
                filterPlaceholder="이름, 이메일, 권한, 초대한 사람으로 검색"
                meta={metaValue}
              />
            </div>
          </div>
        </MembersPanel>

        <DrawerContent className="h-full w-120 max-w-[92vw] bg-white p-0">
          <div className="flex h-full min-h-0 flex-col">
            <DrawerHeader className="border-b border-slate-200 px-4 py-4">
              <DrawerTitle className="flex items-center gap-2 text-slate-900">
                <UserPlus className="size-4 text-sky-600" />
                멤버 초대
              </DrawerTitle>
              <DrawerDescription className="text-slate-500">
                새 초대를 생성하면 목록에 즉시 반영됩니다.
              </DrawerDescription>
            </DrawerHeader>

            <inviteForm.AppForm>
              <inviteForm.Layout className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-4" onSubmit={(event) => void inviteForm.handleSubmit(event)}>
                <inviteForm.AppField name="name">
                  {(field) => (
                    <field.Input
                      label="이름"
                      placeholder="예: Hana Lee"
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
                      items={ROLE_OPTIONS.map((option) => ({
                        label: option.label,
                        value: option.value,
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

                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                  초대가 생성되면 목록에 즉시 반영되며, 발송과 상태 변경은 API로 처리합니다.
                </div>

                <DrawerFooter className="border-t border-slate-200 px-4 py-4">
                  <div className="flex gap-2">
                    <DrawerClose asChild>
                      <Button type="button" variant="outline" className="flex-1">
                        닫기
                      </Button>
                    </DrawerClose>
                    <inviteForm.Submit className="flex-1 gap-2">
                      <Send className="size-3.5" />
                      초대 메일 보내기
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

function InviteStatusBadge({ inviteStatus }: Readonly<{ inviteStatus: InviteDisplayStatus }>) {
  if (inviteStatus === 'PENDING') {
    return (
      <Badge className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50">
        대기
      </Badge>
    );
  }

  if (inviteStatus === 'ACCEPTED') {
    return (
      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
        수락
      </Badge>
    );
  }

  if (inviteStatus === 'REJECTED') {
    return (
      <Badge className="border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-50">
        거절
      </Badge>
    );
  }

  if (inviteStatus === 'EXPIRED') {
    return (
      <Badge className="border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-50">
        만료
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="border-slate-200 bg-slate-100 text-slate-700">
      취소
    </Badge>
  );
}

function InviteRowActions({
  invite,
  resendInvite,
  cancelInvite,
  reviveInvite,
}: Readonly<{
  invite: InviteViewItem
  resendInvite: (inviteId: string) => void
  cancelInvite: (inviteId: string) => void
  reviveInvite: (inviteId: string) => void
}>) {
  const actionSet = getInviteActionSet(invite, {
    resendInvite: () => resendInvite(invite.id),
    cancelInvite: () => cancelInvite(invite.id),
    reviveInvite: () => reviveInvite(invite.id),
  });

  if (!actionSet) {
    return <span className="text-sm text-slate-400">-</span>;
  }

  if (actionSet.secondary.length === 0) {
    return (
      <div className="flex justify-end">
        <Button
          size="sm"
          variant={actionSet.primary.buttonVariant as ButtonVariant}
          className="gap-1.5 whitespace-nowrap"
          onClick={actionSet.primary.onClick}
        >
          {actionSet.primary.icon}
          {actionSet.primary.label}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <ButtonGroup>
        <Button
          size="sm"
          variant={actionSet.primary.buttonVariant as 'link' | 'outline' | 'default' | 'secondary' | 'ghost' | 'destructive'}
          className="gap-1.5 whitespace-nowrap"
          onClick={actionSet.primary.onClick}
        >
          {actionSet.primary.icon}
          {actionSet.primary.label}
        </Button>
        <ButtonGroupSeparator />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon-sm"
              variant={actionSet.primary.buttonVariant as 'link' | 'outline' | 'default' | 'secondary' | 'ghost' | 'destructive'}
              className="px-0"
              aria-label={invite.name + ' 추가 작업'}
            >
              <ChevronDown className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuGroup>
              {actionSet.secondary.map((action) => (
                <DropdownMenuItem
                  key={action.label}
                  variant="default"
                  onSelect={action.onClick}
                >
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </div>
  );
}

function getInviteActionSet(
  invite: InviteViewItem,
  actions: {
    resendInvite: () => void
    cancelInvite: () => void
    reviveInvite: () => void
  },
) {
  if (invite.displayStatus === 'PENDING' || invite.displayStatus === 'EXPIRED') {
    return {
      primary: {
        label: '재전송',
        icon: <Send className="size-3.5" />,
        buttonVariant: 'default',
        onClick: actions.resendInvite,
      },
      secondary: [
        {
          label: '취소',
          icon: <Ban className="size-3.5" />,
          buttonVariant: 'ghost',
          onClick: actions.cancelInvite,
        },
      ],
    };
  }

  if (invite.displayStatus === 'CANCELED') {
    return {
      primary: {
        label: '복구',
        icon: <RefreshCcw className="size-3.5" />,
        buttonVariant: 'default',
        onClick: actions.reviveInvite,
      },
      secondary: [],
    };
  }

  return null;
}
