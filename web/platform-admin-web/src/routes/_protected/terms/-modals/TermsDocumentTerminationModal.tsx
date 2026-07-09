import { Badge, Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, toast, useAppForm } from '@pkg/ui';
import { useStore } from '@tanstack/react-form';
import { Loader2, TriangleAlert } from 'lucide-react';
import { z } from 'zod';

import { defaultTermsVersionEffectiveAtInput, toIsoDateString } from '../-helpers/terms-date.helper';
import { type ManagedTermsDocument } from '../-helpers/terms-management.helper';

interface TermsDocumentTerminationModalProps {
  readonly document: ManagedTermsDocument | null
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSave: (terminatedAt: string) => Promise<void> | void
}

const DOCUMENT_TERMINATION_SCHEMA = z.object({
  mode: z.enum(['IMMEDIATE', 'SCHEDULED']),
  terminatedAt: z.string().trim(),
}).refine((value) => {
  if (value.mode === 'IMMEDIATE') {
    return true;
  }

  return new Date(value.terminatedAt).getTime() > 0;
}, {
  message: '예약 폐기 일시를 올바르게 입력해주세요.',
  path: ['terminatedAt'],
});

export function TermsDocumentTerminationModal({
  document,
  open,
  onOpenChange,
  onSave,
}: TermsDocumentTerminationModalProps) {
  const defaultValues = {
    mode: 'IMMEDIATE' as const,
    terminatedAt: defaultTermsVersionEffectiveAtInput(),
  };

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: DOCUMENT_TERMINATION_SCHEMA,
    },
    onSubmit: async ({ value }) => {
      try {
        await onSave(value.mode === 'IMMEDIATE' ? toIsoDateString() : value.terminatedAt);
        toast.success(value.mode === 'IMMEDIATE' ? '약관 문서를 즉시 폐기했습니다.' : '약관 문서 폐기를 예약했습니다.');
        onOpenChange(false);
      }
      catch {
        // 상위 레이어에서 오류를 처리합니다.
      }
    },
  });

  const isSubmitting = useStore(form.baseStore, (state) => state.isSubmitting);
  const mode = useStore(form.baseStore, (state) => state.values.mode);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TriangleAlert className="size-4 text-amber-500" />
            약관 문서 폐기
          </DialogTitle>
          <DialogDescription>
            선택한 문서에 대해 즉시 폐기 또는 예약 폐기를 설정합니다.
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Layout
            className="space-y-4"
            onSubmit={(event) => void form.handleSubmit(event)}
          >
            <div className="
              rounded-xl border border-amber-200 bg-linear-to-br from-amber-50
              to-white p-4 shadow-sm
            "
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="
                    text-[11px] font-semibold tracking-[0.24em] text-amber-600
                    uppercase
                  "
                  >
                    폐기 대상 문서
                  </div>
                  <div className="
                    truncate text-base font-semibold text-slate-950
                  "
                  >
                    {document?.document.title ?? '-'}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="
                    shrink-0 border-amber-200 bg-white px-2.5 py-1 font-mono
                    text-[11px] text-amber-700
                  "
                >
                  {document?.document.code ?? '-'}
                </Badge>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                문서명과 코드 정보를 확인한 뒤 폐기 방식을 선택합니다.
              </div>
            </div>

            <form.AppField name="mode">
              {(field) => (
                <field.Select
                  label="폐기 방식"
                  placeholder="방식을 선택하세요"
                  required
                  orientation="vertical"
                  labelWidth="auto"
                  items={[
                    { label: '즉시 폐기', value: 'IMMEDIATE' },
                    { label: '예약 폐기', value: 'SCHEDULED' },
                  ]}
                />
              )}
            </form.AppField>

            <form.AppField name="terminatedAt">
              {(field) => (
                <field.Input
                  label="예약 폐기 일시"
                  type="datetime-local"
                  description="예약 폐기 방식에서만 사용합니다."
                  orientation="vertical"
                  labelWidth="auto"
                  disabled={mode === 'IMMEDIATE'}
                />
              )}
            </form.AppField>

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
                  : '적용'}
              </form.Submit>
            </DialogFooter>
          </form.Layout>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
