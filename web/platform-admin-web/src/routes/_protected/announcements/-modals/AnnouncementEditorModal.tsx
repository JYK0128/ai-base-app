import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Switch, toast, useAppForm } from '@pkg/ui';
import { useStore } from '@tanstack/react-form';
import { Loader2, Megaphone } from 'lucide-react';
import { z } from 'zod';

import type { AnnouncementPageItemAudience, AnnouncementPageItemCategory, AnnouncementPageItemPriority, CreateAnnouncementRequestDto, UpdateAnnouncementRequestDto } from '@/api/generated/model';

import { buildCreateAnnouncementDto, buildUpdateAnnouncementDto, toEditorState } from '../-helpers/announcements.helper';
import { ANNOUNCEMENT_AUDIENCE_LABELS, ANNOUNCEMENT_CATEGORY_LABELS, ANNOUNCEMENT_PRIORITY_LABELS, type AnnouncementEditorSeed, type AnnouncementEditorState } from '../-helpers/announcements-types.helper';

interface AnnouncementEditorModalProps {
  readonly announcement: AnnouncementEditorSeed
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSave: (announcement: CreateAnnouncementRequestDto | UpdateAnnouncementRequestDto) => void | Promise<void>
}

const CATEGORY_ITEMS = (Object.entries(ANNOUNCEMENT_CATEGORY_LABELS) as Array<[AnnouncementPageItemCategory, string]>).map(([value, label]) => ({
  value,
  label,
})) satisfies Array<{ value: AnnouncementPageItemCategory, label: string }>;

const AUDIENCE_ITEMS = [
  { value: 'ALL' as AnnouncementPageItemAudience, label: ANNOUNCEMENT_AUDIENCE_LABELS.ALL },
  { value: 'ORGANIZATION' as AnnouncementPageItemAudience, label: ANNOUNCEMENT_AUDIENCE_LABELS.ORGANIZATION },
] satisfies Array<{ value: AnnouncementPageItemAudience, label: string }>;

const PRIORITY_ITEMS = Object.entries(ANNOUNCEMENT_PRIORITY_LABELS).map(([value, label]) => ({
  value: value as AnnouncementPageItemPriority,
  label,
})) satisfies Array<{ value: AnnouncementPageItemPriority, label: string }>;

const ANNOUNCEMENT_EDITOR_SCHEMA = z.object({
  title: z.string().trim().min(1, '제목을 입력해주세요.'),
  category: z.enum(['NOTICE', 'MAINTENANCE', 'SECURITY', 'EVENT']),
  audience: z.enum(['ALL', 'PLATFORM', 'ORGANIZATION']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH']),
  isPublished: z.boolean(),
  startAt: z.string().trim().min(1, '시작일을 입력해주세요.'),
  endAt: z.string().trim().min(1, '종료일을 입력해주세요.'),
  content: z.string().trim().min(1, '본문을 입력해주세요.'),
}).refine((value) => new Date(value.startAt).getTime() < new Date(value.endAt).getTime(), {
  message: '종료일은 시작일보다 이후여야 합니다.',
  path: ['endAt'],
});

function isAnnouncementEditing(announcement: AnnouncementEditorSeed): boolean {
  return Boolean(announcement.id);
}

export function AnnouncementEditorModal({
  announcement,
  open,
  onOpenChange,
  onSave,
}: AnnouncementEditorModalProps) {
  const form = useAppForm({
    defaultValues: toEditorState(announcement) satisfies AnnouncementEditorState,
    validators: {
      onChange: ANNOUNCEMENT_EDITOR_SCHEMA,
      onSubmit: ANNOUNCEMENT_EDITOR_SCHEMA,
    },
    onSubmit: async ({ value }) => {
      try {
        await onSave(
          isAnnouncementEditing(announcement)
            ? buildUpdateAnnouncementDto(announcement, value)
            : buildCreateAnnouncementDto(announcement, value),
        );
        toast.success('공지사항이 저장되었습니다.');
        onOpenChange(false);
      }
      catch {
        // Parent mutation handles the error toast.
      }
    },
  });

  const isSubmitting = useStore(form.baseStore, (state) => state.isSubmitting);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="
        grid h-[85vh] w-full grid-rows-[auto_1fr] overflow-hidden bg-white p-6
        sm:max-w-5xl!
      "
      >
        <DialogHeader className="border-b border-slate-200 pb-3">
          <DialogTitle className="
            flex items-center gap-2 text-lg font-bold tracking-tight
            text-slate-950
          "
          >
            <span className="
              rounded-xl border border-slate-200 bg-slate-50 p-1.5
              text-slate-500
            "
            >
              <Megaphone className="size-4" />
            </span>
            {isAnnouncementEditing(announcement) ? '공지 수정' : '공지 작성'}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            {isAnnouncementEditing(announcement)
              ? '공지 내용을 수정한 뒤 저장합니다.'
              : '새 공지의 제목, 대상, 게시 유무, 게시 일정과 본문을 입력합니다.'}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Layout className="grid h-full grid-rows-[minmax(0,1fr)_auto]" onSubmit={(event) => void form.handleSubmit(event)}>
            <div className="scroll py-4 pr-1">
              <div className="grid gap-6">
                <form.FieldSet className="
                  rounded-xl border border-slate-200 bg-slate-50/60 p-4
                "
                >
                  <form.FieldLegend className="
                    px-1 text-sm font-semibold text-slate-900
                  "
                  >
                    기본 정보
                  </form.FieldLegend>

                  <form.FieldGroup className="grid gap-4">
                    <form.AppField name="title">
                      {(field) => (
                        <field.Input
                          label="제목"
                          placeholder="공지 제목을 입력하세요."
                          required
                          orientation="vertical"
                          labelWidth="auto"
                        />
                      )}
                    </form.AppField>

                    <div className="
                      grid gap-4
                      lg:grid-cols-2
                    "
                    >
                      <form.AppField name="category">
                        {(field) => (
                          <field.Select
                            label="분류"
                            placeholder="분류를 선택하세요"
                            required
                            orientation="vertical"
                            labelWidth="auto"
                            items={CATEGORY_ITEMS}
                          />
                        )}
                      </form.AppField>

                      <form.AppField name="audience">
                        {(field) => (
                          <field.Select
                            label="대상"
                            placeholder="대상을 선택하세요"
                            required
                            orientation="vertical"
                            labelWidth="auto"
                            items={AUDIENCE_ITEMS}
                          />
                        )}
                      </form.AppField>
                    </div>

                    <div className="
                      grid gap-4
                      lg:grid-cols-2
                    "
                    >
                      <form.AppField name="priority">
                        {(field) => (
                          <field.Select
                            label="우선순위"
                            placeholder="우선순위를 선택하세요"
                            required
                            orientation="vertical"
                            labelWidth="auto"
                            items={PRIORITY_ITEMS}
                          />
                        )}
                      </form.AppField>
                    </div>

                    <form.AppField name="isPublished">
                      {(field) => (
                        <div className="
                          flex items-center justify-between rounded-xl border
                          border-slate-200 bg-white px-4 py-3 shadow-sm
                        "
                        >
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-slate-900">게시 유무</div>
                            <div className="text-xs text-slate-500">
                              토글을 켜면 저장 시 게시 상태로 반영됩니다.
                            </div>
                          </div>
                          <Switch
                            aria-label="게시 유무"
                            checked={Boolean(field.state.value)}
                            onCheckedChange={(checked) => field.handleChange(Boolean(checked))}
                          />
                        </div>
                      )}
                    </form.AppField>
                  </form.FieldGroup>
                </form.FieldSet>

                <form.FieldSet className="
                  rounded-xl border border-slate-200 bg-slate-50/60 p-4
                "
                >
                  <form.FieldLegend className="
                    px-1 text-sm font-semibold text-slate-900
                  "
                  >
                    게시 설정
                  </form.FieldLegend>

                  <form.FieldGroup className="
                    grid gap-4
                    lg:grid-cols-2
                  "
                  >
                    <form.AppField name="startAt">
                      {(field) => (
                        <field.Input
                          label="시작일"
                          type="datetime-local"
                          required
                          orientation="vertical"
                          labelWidth="auto"
                          step={60}
                        />
                      )}
                    </form.AppField>

                    <form.AppField name="endAt">
                      {(field) => (
                        <field.Input
                          label="종료일"
                          type="datetime-local"
                          required
                          orientation="vertical"
                          labelWidth="auto"
                          step={60}
                        />
                      )}
                    </form.AppField>
                  </form.FieldGroup>
                </form.FieldSet>

                <form.FieldSet className="
                  rounded-xl border border-slate-200 bg-slate-50/60 p-4
                "
                >
                  <form.FieldLegend className="
                    px-1 text-sm font-semibold text-slate-900
                  "
                  >
                    본문
                  </form.FieldLegend>

                  <form.FieldGroup className="grid gap-4">
                    <form.AppField name="content">
                      {(field) => (
                        <field.MarkdownEditor
                          label="내용"
                          placeholder="공지 내용을 입력하세요. 마크다운 문법을 사용할 수 있습니다."
                          required
                          orientation="vertical"
                          labelWidth="auto"
                          height="420px"
                        />
                      )}
                    </form.AppField>
                  </form.FieldGroup>
                </form.FieldSet>
              </div>
            </div>

            <DialogFooter className="border-t border-slate-200 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                취소
              </Button>
              <form.Submit className="min-w-24">
                {isSubmitting
                  ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-3.5 animate-spin" />
                      저장 중...
                    </span>
                  )
                  : '저장'}
              </form.Submit>
            </DialogFooter>
          </form.Layout>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
