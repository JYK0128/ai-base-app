import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, toast, useAppForm } from '@pkg/ui';
import { useStore } from '@tanstack/react-form';
import { Loader2, ScrollText } from 'lucide-react';
import { z } from 'zod';

import { defaultTermsVersionEffectiveAtInput, toDatetimeLocalValue } from '../-helpers/terms-date.helper';
import { type ManagedTermsDocument, type ManagedTermsVersion } from '../-helpers/terms-management.helper';

interface TermsVersionModalProps {
  readonly document: ManagedTermsDocument | null
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSave: (version: {
    content: string
    effectiveAt: string
    label: string
    reason?: string
    status: 'DRAFT' | 'PUBLISHED'
    summary?: string
  }) => Promise<void> | void
  readonly version?: ManagedTermsVersion | null
}

const TERMS_VERSION_SCHEMA = z.object({
  label: z.string().trim().min(1, '버전 라벨을 입력해주세요.'),
  effectiveAt: z.string().trim().min(1, '효력 시각을 입력해주세요.'),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  summary: z.string().trim(),
  reason: z.string().trim(),
  content: z.string().trim().min(1, '약관 본문을 입력해주세요.'),
}).refine((value) => new Date(value.effectiveAt).getTime() > 0, {
  message: '효력 시각을 올바르게 입력해주세요.',
  path: ['effectiveAt'],
});

function getDefaultValues(version?: ManagedTermsVersion | null) {
  return {
    label: version?.label ?? '',
    effectiveAt: version?.effectiveAt ? toDatetimeLocalValue(version.effectiveAt) : defaultTermsVersionEffectiveAtInput(),
    status: version?.status ?? 'PUBLISHED',
    summary: version?.summary ?? '',
    reason: version?.reason ?? '',
    content: version?.content ?? '',
  };
}

export function TermsVersionModal({
  document,
  open,
  onOpenChange,
  onSave,
  version,
}: TermsVersionModalProps) {
  const isEditing = Boolean(version);
  const form = useAppForm({
    defaultValues: getDefaultValues(version),
    validators: {
      onSubmit: TERMS_VERSION_SCHEMA,
    },
    onSubmit: async ({ value }) => {
      try {
        await onSave({
          content: value.content.trim(),
          effectiveAt: value.effectiveAt,
          label: value.label.trim(),
          reason: value.reason.trim() || undefined,
          status: value.status,
          summary: value.summary.trim() || undefined,
        });
        toast.success(isEditing ? '약관 버전을 수정했습니다.' : '약관 버전을 추가했습니다.');
        onOpenChange(false);
      }
      catch {
        // 상위 레이어에서 오류를 처리합니다.
      }
    },
  });

  const isSubmitting = useStore(form.baseStore, (state) => state.isSubmitting);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="
        grid h-[85vh] max-w-5xl grid-rows-[auto_minmax(0,1fr)_auto]
        overflow-hidden bg-white
        sm:max-w-[96vw]
      "
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScrollText className="size-4" />
            {isEditing ? '약관 버전 수정' : '약관 버전 추가'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? '수정 가능한 버전의 라벨, 발효 시각, 상태, 본문을 변경합니다.'
              : '선택한 문서에 새 버전을 추가합니다.'}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Layout
            className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-4"
            onSubmit={(event) => void form.handleSubmit(event)}
          >
            <div className="scroll-y h-full">
              <div className="space-y-4 pr-2 pb-1">
                <div className="
                  grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4
                  text-sm text-slate-600
                "
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-slate-900">문서</span>
                    <span>{document?.document.title ?? '-'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-slate-900">문서 코드</span>
                    <span className="font-mono">{document?.document.code ?? '-'}</span>
                  </div>
                </div>

                <div className="
                  grid gap-4
                  lg:grid-cols-2
                "
                >
                  <form.AppField name="label">
                    {(field) => (
                      <field.Input
                        label="버전 라벨"
                        placeholder="예: v1.0.0"
                        required
                        orientation="vertical"
                        labelWidth="auto"
                      />
                    )}
                  </form.AppField>

                  <form.AppField name="status">
                    {(field) => (
                      <field.Select
                        label="버전 상태"
                        placeholder="상태를 선택하세요"
                        required
                        orientation="vertical"
                        labelWidth="auto"
                        items={[
                          { label: '임시저장', value: 'DRAFT' },
                          { label: '게시', value: 'PUBLISHED' },
                        ]}
                      />
                    )}
                  </form.AppField>
                </div>

                <div className="
                  grid gap-4
                  lg:grid-cols-2
                "
                >
                  <form.AppField name="effectiveAt">
                    {(field) => (
                      <field.Input
                        label="효력 시각"
                        type="datetime-local"
                        required
                        orientation="vertical"
                        labelWidth="auto"
                      />
                    )}
                  </form.AppField>

                  <form.AppField name="summary">
                    {(field) => (
                      <field.Input
                        label="개정 요약"
                        placeholder="선택 입력"
                        orientation="vertical"
                        labelWidth="auto"
                      />
                    )}
                  </form.AppField>
                </div>

                <form.AppField name="reason">
                  {(field) => (
                    <field.Input
                      label="변경 사유"
                      placeholder="선택 입력"
                      orientation="vertical"
                      labelWidth="auto"
                    />
                  )}
                </form.AppField>

                <form.AppField name="content">
                  {(field) => (
                    <field.Textarea
                      label="약관 본문"
                      placeholder="약관 본문을 입력하세요."
                      required
                      orientation="vertical"
                      labelWidth="auto"
                      className="min-h-64"
                    />
                  )}
                </form.AppField>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                취소
              </Button>
              <form.Submit className="min-w-24 gap-2">
                {isSubmitting
                  ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      저장 중
                    </>
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
