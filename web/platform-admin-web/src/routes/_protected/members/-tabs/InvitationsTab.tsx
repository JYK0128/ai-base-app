import { Badge, Button, Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle, ScrollArea, toast, useAppForm } from '@pkg/ui';
import { useStore } from '@tanstack/react-form';
import { Mail, Send, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';

import { useMembersControllerCreateInviteV1 } from '@/api/generated/endpoints';
import type { CreateInviteRequestDto } from '@/api/generated/model';

import { ROLE_OPTIONS } from '../-members.shared';
import { MembersPanel } from './MembersPanel';

interface InvitationsTabProps {
  readonly isActive: boolean
}

interface CreatedInviteItem {
  id: string
  name: string
  email: string
  role: string
  note?: string
}

const EMPTY_CREATED_INVITES: CreatedInviteItem[] = [];

export function InvitationsTab({ isActive }: InvitationsTabProps) {
  const [inviteDrawerOpen, setInviteDrawerOpen] = useState(false);
  const [createdInvites, setCreatedInvites] = useState<CreatedInviteItem[]>(EMPTY_CREATED_INVITES);

  const createInviteMutation = useMembersControllerCreateInviteV1({
    mutation: {
      onSuccess: (response, variables) => {
        const inviteId = response.data?.id;

        if (!inviteId) {
          return;
        }

        setCreatedInvites((current) => [
          {
            id: inviteId,
            name: variables.data.name,
            email: variables.data.email,
            role: variables.data.role,
            note: variables.data.note,
          },
          ...current,
        ]);
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
      role: 'MANAGER',
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

  const inviteCards = createdInvites;

  if (!isActive) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Drawer open={inviteDrawerOpen} onOpenChange={setInviteDrawerOpen} direction="right">
        <MembersPanel
          icon={<Mail className="size-4 text-sky-600" />}
          title="멤버 초대"
          description="현재 API에는 초대 생성만 제공됩니다. 발송 기록은 세션 내에서만 확인할 수 있습니다."
          actions={(
            <Button className="gap-2" onClick={() => setInviteDrawerOpen(true)}>
              <UserPlus className="size-3.5" />
              초대 생성
            </Button>
          )}
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-900">초대 이력</h3>
                <p className="mt-1 text-xs text-slate-500">
                  리스트 조회 API가 없어, 이 화면에서 생성한 초대만 표시합니다.
                </p>
              </div>
              <ScrollArea className="h-[540px]">
                <div className="space-y-2 p-3">
                  {inviteCards.length === 0
                    ? (
                      <Empty className="py-14">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <Mail className="size-6" />
                          </EmptyMedia>
                          <EmptyTitle>초대 기록이 없습니다</EmptyTitle>
                          <EmptyDescription>오른쪽 버튼으로 새 초대를 생성하세요.</EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    )
                    : inviteCards.map((invite) => (
                      <div key={invite.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-slate-900">{invite.name}</div>
                            <div className="truncate text-xs text-slate-500">{invite.email}</div>
                          </div>
                          <Badge variant="outline" className="shrink-0 border-slate-200 bg-white text-xs">
                            {invite.role}
                          </Badge>
                        </div>
                        {invite.note ? <p className="mt-2 text-xs leading-5 text-slate-600">{invite.note}</p> : null}
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </div>

            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-900">지원 범위</h3>
                <p className="text-xs leading-5 text-slate-600">
                  생성된 계약 기준으로는 초대 생성만 가능합니다. 초대 취소, 재발송, 복구 목록은 현재 백엔드 계약에 없습니다.
                </p>
              </div>
            </div>
          </div>
        </MembersPanel>

        <DrawerContent className="h-full w-120 max-w-[92vw] bg-white p-0">
          <div className="flex h-full flex-col">
            <DrawerHeader className="border-b border-slate-200 px-4 py-4">
              <DrawerTitle className="flex items-center gap-2 text-slate-900">
                <UserPlus className="size-4 text-sky-600" />
                초대 생성
              </DrawerTitle>
              <DrawerDescription className="text-slate-500">
                생성된 API의 요청 스펙에 맞춰 초대만 생성합니다.
              </DrawerDescription>
            </DrawerHeader>

            <inviteForm.AppForm>
              <inviteForm.Layout className="flex flex-1 flex-col gap-4 scroll p-4" onSubmit={(event) => void inviteForm.handleSubmit(event)}>
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
                  초대 생성 후 서버 응답의 `id`만 저장합니다.
                </div>

                <DrawerFooter className="border-t border-slate-200 px-4 py-4">
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
