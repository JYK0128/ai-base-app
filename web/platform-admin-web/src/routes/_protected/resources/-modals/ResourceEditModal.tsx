import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, toast, useAppForm } from '@pkg/ui';
import { useStore } from '@tanstack/react-form';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import { type GetResourceResponseDto } from '@/api/generated/model';

import { COMMON_ICONS } from '../-constants/commonIcons';

interface ResourceEditModalProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly resource: GetResourceResponseDto | null
  readonly onSave: (resource: {
    code?: string
    name?: string
    path?: string
    icon?: string
  }) => void
}

interface ResourceEditFormValues {
  code: string
  name: string
  path: string
  icon: string
}

export function ResourceEditModal({ open, onOpenChange, resource, onSave }: ResourceEditModalProps) {
  const description = '리소스의 표시 정보, 경로, 아이콘을 수정합니다.';

  const form = useAppForm({
    defaultValues: {
      code: resource?.code ?? '',
      name: resource?.name ?? '',
      path: resource?.path ?? '',
      icon: resource?.icon ?? '',
    } satisfies ResourceEditFormValues,
    validators: {
      onSubmit: z.object({
        code: z.string().trim().min(1, '리소스 코드를 입력해주세요.'),
        name: z.string().trim().min(1, '리소스 이름을 입력해주세요.'),
        path: z.string().trim(),
        icon: z.string(),
      }),
    },
    onSubmit: async ({ value }) => {
      onSave({
        code: value.code,
        name: value.name,
        path: value.path || undefined,
        icon: value.icon || undefined,
      });
      onOpenChange(false);
      toast.success('리소스를 수정했습니다.');
    },
  });
  const isSubmitting = useStore(form.baseStore, (state) => state.isSubmitting);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>리소스 수정</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Layout
            className="space-y-4"
            onSubmit={(event) => void form.handleSubmit(event)}
          >
            <form.AppField name="code">
              {(field) => (
                <field.Input
                  label="리소스 코드"
                  placeholder="예: SYSTEM_MANAGEMENT"
                  required
                  orientation="vertical"
                  labelWidth="auto"
                  className="font-mono"
                />
              )}
            </form.AppField>

            <form.AppField name="name">
              {(field) => (
                <field.Input
                  label="리소스 이름"
                  placeholder="예: 시스템 관리"
                  required
                  orientation="vertical"
                  labelWidth="auto"
                />
              )}
            </form.AppField>

            <form.AppField name="path">
              {(field) => (
                <field.Input
                  label="라우트 경로"
                  placeholder="예: /system"
                  orientation="vertical"
                  labelWidth="auto"
                  className="font-mono"
                />
              )}
            </form.AppField>

            <form.AppField name="icon">
              {(field) => (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-slate-700">아이콘 선택 - 선택사항</div>
                  <div className="grid max-h-40 grid-cols-5 gap-2 scroll-y rounded-md border border-slate-200 bg-slate-50 p-2">
                    {COMMON_ICONS.map(({ name, icon: IconComponent }) => (
                      <button
                        key={name}
                        type="button"
                        title={name}
                        className={`flex items-center justify-center rounded border p-2 transition-colors ${
                          field.state.value === name
                            ? 'border-blue-300 bg-blue-100 text-blue-600'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                        onClick={() => field.handleChange(field.state.value === name ? '' : name)}
                      >
                        <IconComponent className="size-5" />
                      </button>
                    ))}
                  </div>
                  {field.state.value && (
                    <p className="text-xs font-medium text-blue-600">
                      선택된 아이콘:
                      {' '}
                      {field.state.value}
                    </p>
                  )}
                </div>
              )}
            </form.AppField>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                취소
              </Button>
              <form.Submit className="min-w-20 gap-2">
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
