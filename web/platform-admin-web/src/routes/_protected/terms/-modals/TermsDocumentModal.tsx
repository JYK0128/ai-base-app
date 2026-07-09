import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Switch, toast, useAppForm } from '@pkg/ui';
import { useStore } from '@tanstack/react-form';
import { Loader2, ScrollText } from 'lucide-react';
import { z } from 'zod';

import { normalizeDocumentCode, type TermsDocumentScope } from '../-helpers/terms-management.helper';

interface TermsDocumentModalProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly scope: TermsDocumentScope
  readonly onSave: (document: {
    code: string
    required: boolean
    scope: TermsDocumentScope
    title: string
  }) => Promise<void> | void
}

const TERMS_DOCUMENT_SCHEMA = z.object({
  code: z.string().trim().min(1, '문서 코드를 입력해주세요.'),
  title: z.string().trim().min(1, '문서 제목을 입력해주세요.'),
  required: z.boolean(),
});

export function TermsDocumentModal({
  open,
  onOpenChange,
  scope,
  onSave,
}: TermsDocumentModalProps) {
  const form = useAppForm({
    defaultValues: {
      code: '',
      title: '',
      required: true,
    },
    validators: {
      onSubmit: TERMS_DOCUMENT_SCHEMA,
    },
    onSubmit: async ({ value }) => {
      try {
        await onSave({
          code: normalizeDocumentCode(value.code),
          required: value.required,
          scope,
          title: value.title.trim(),
        });
        toast.success('약관 문서를 추가했습니다.');
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
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScrollText className="size-4" />
            약관 문서 생성
          </DialogTitle>
          <DialogDescription>
            현재 적용 범위에 새 약관 문서를 등록합니다.
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Layout
            className="space-y-4"
            onSubmit={(event) => void form.handleSubmit(event)}
          >
            <div className="
              grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4
              text-sm text-slate-600
            "
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium text-slate-900">scope</span>
                <span>{scope === 'organization' ? '조직' : '플랫폼'}</span>
              </div>
            </div>

            <form.AppField name="code">
              {(field) => (
                <field.Input
                  label="문서 코드"
                  placeholder="예: SERVICE_TOS"
                  required
                  orientation="vertical"
                  labelWidth="auto"
                  className="font-mono"
                />
              )}
            </form.AppField>

            <form.AppField name="title">
              {(field) => (
                <field.Input
                  label="문서 제목"
                  placeholder="예: 서비스 이용약관"
                  required
                  orientation="vertical"
                  labelWidth="auto"
                />
              )}
            </form.AppField>

            <form.AppField name="required">
              {(field) => (
                <div className="
                  flex items-center justify-between rounded-xl border
                  border-slate-200 bg-white px-4 py-3 shadow-sm
                "
                >
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-slate-900">필수 동의</div>
                    <div className="text-xs text-slate-500">활성 약관 동의 흐름에서 필수 항목으로 노출합니다.</div>
                  </div>
                  <Switch
                    checked={Boolean(field.state.value)}
                    onCheckedChange={(checked) => field.handleChange(Boolean(checked))}
                  />
                </div>
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
                  : '생성'}
              </form.Submit>
            </DialogFooter>
          </form.Layout>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
