import { Badge, Button, Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle, toast, useAppForm } from '@pkg/ui';
import { useStore } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { Mail, Send, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';

import { useMembersControllerCreateInviteV1, useMembersControllerGetInviteListV1, useOrganizationControllerGetOrganizationRoleListV1 } from '@/api/generated/endpoints';
import type { CreateInviteRequestDto, InviteListItem, InviteListItemStatus } from '@/api/generated/model';

import { ManagementPanel } from '../../-components/ManagementPanel';
import { buildRoleOptions } from '../-helpers/members-role.helper';

interface InvitationsTabProps {
  readonly isActive: boolean
}

const INVITE_LIST_LIMIT = 20;

const INVITE_STATUS_LABELS: Record<InviteListItemStatus, string> = {
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

export function InvitationsTab({ isActive }: InvitationsTabProps) {
  const queryClient = useQueryClient();
  const [inviteDrawerOpen, setInviteDrawerOpen] = useState(false);
  const [inviteCursor, setInviteCursor] = useState<string | undefined>();
  const [loadedInviteCards, setLoadedInviteCards] = useState<InviteListItem[]>([]);
  const inviteListQuery = useMembersControllerGetInviteListV1({
    cursor: inviteCursor,
    limit: INVITE_LIST_LIMIT,
    sort: ['createdAt'],
    direction: ['desc'],
  }, {
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

        setInviteCursor(undefined);
        setLoadedInviteCards([]);
        void queryClient.invalidateQueries({ queryKey: inviteListQuery.queryKey });
        toast.success('멤버 초대가 생성되었습니다.');
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
  const currentInviteCards = inviteListQuery.data?.items ?? [];
  const inviteCards = inviteCursor ? [...loadedInviteCards, ...currentInviteCards] : currentInviteCards;

  const handleLoadMoreInvites = () => {
    const nextCursor = inviteListQuery.data?.endCursor;

    if (!nextCursor) {
      return;
    }

    setLoadedInviteCards((current) => {
      const knownIds = new Set(current.map((item) => item.id));
      const nextItems = currentInviteCards.filter((item) => !knownIds.has(item.id));

      return [...current, ...nextItems];
    });
    setInviteCursor(nextCursor);
  };

  const renderInviteCards = () => {
    if (inviteListQuery.isLoading) {
      return (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-lg bg-slate-100"
            />
          ))}
        </div>
      );
    }

    if (inviteCards.length === 0) {
      return (
        <Empty className="py-14">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Mail className="size-6" />
            </EmptyMedia>
            <EmptyTitle>초대 기록이 없습니다</EmptyTitle>
            <EmptyDescription>오른쪽 버튼으로 새 초대를 생성하세요.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      );
    }

    return (
      <>
        {inviteCards.map((invite) => (
          <div
            key={invite.id}
            className="rounded-lg border border-slate-200 bg-slate-50 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-semibold text-slate-900">
                  {invite.name}
                </div>
                <div className="truncate text-xs text-slate-500">{invite.email}</div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {formatInviteDateTime(invite.createdAt)}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge
                  variant="outline"
                  className="border-slate-200 bg-white text-xs"
                >
                  {invite.roleName}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-sky-100 bg-sky-50 text-[11px] text-sky-700"
                >
                  {INVITE_STATUS_LABELS[invite.status]}
                </Badge>
              </div>
            </div>
            {invite.note
              ? (
                <p className="mt-2 text-xs/5 text-slate-600">
                  {invite.note}
                </p>
              )
              : null}
          </div>
        ))}
      </>
    );
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Drawer open={inviteDrawerOpen} onOpenChange={setInviteDrawerOpen} direction="right">
        <ManagementPanel
          icon={<Mail className="size-4 text-sky-600" />}
          title="멤버 초대"
          description="초대 생성과 발송 이력을 서버 기준으로 확인합니다."
          actions={(
            <Button className="gap-2" onClick={() => setInviteDrawerOpen(true)}>
              <UserPlus className="size-3.5" />
              초대 생성
            </Button>
          )}
        >
          <div className="
            grid min-h-0 gap-4
            lg:grid-cols-[minmax(0,1fr)_320px]
          "
          >
            <div className="
              flex min-h-0 flex-col overflow-hidden rounded-xl border
              border-slate-200 bg-white shadow-sm
            "
            >
              <div className="border-b border-slate-200 px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-900">초대 이력</h3>
                <p className="mt-1 text-xs text-slate-500">
                  최근 초대부터 커서 기준으로 조회합니다.
                </p>
              </div>
              <div className="scroll-y flex-1">
                <div className="space-y-2 p-3">
                  {renderInviteCards()}
                  {inviteListQuery.data?.hasNextPage
                    ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={inviteListQuery.isFetching}
                        onClick={handleLoadMoreInvites}
                      >
                        더 보기
                      </Button>
                    )
                    : null}
                </div>
              </div>
            </div>

            <div className="
              self-start rounded-xl border border-dashed border-slate-200
              bg-slate-50 p-4
            "
            >
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-900">지원 범위</h3>
                <p className="text-xs/5 text-slate-600">
                  초대 취소, 재발송, 복구 처리는 별도 API 계약이 추가되면 이 영역에 연결할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </ManagementPanel>

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
