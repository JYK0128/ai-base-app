import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, useAppForm } from '@pkg/ui';
import { z } from 'zod';

import type { GetResourceResponseDto } from '@/api/generated/model';

export type CreateMenuInput = Pick<GetResourceResponseDto, 'code' | 'name' | 'path' | 'type'>;

interface MenuRegistrationModalProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSave: (menu: CreateMenuInput) => void
}

export function MenuRegistrationModal({ open, onOpenChange, onSave }: MenuRegistrationModalProps) {
  const form = useAppForm({
    defaultValues: {
      code: '',
      name: '',
      path: '',
    },
    validators: {
      onSubmit: z.object({
        code: z.string().trim().min(1, '리소스 코드를 입력해주세요.'),
        name: z.string().trim().min(1, '리소스 이름을 입력해주세요.'),
        path: z.string().trim().min(1, '라우트 경로를 입력해주세요.'),
      }),
    },
    onSubmit: async ({ value }) => {
      onSave({
        code: value.code,
        name: value.name,
        path: value.path,
        type: 'MENU',
      });
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>메뉴 리소스 추가</DialogTitle>
          <DialogDescription>
            프론트엔드 네비게이션에 표시될 메뉴 리소스를 등록합니다.
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Layout className="space-y-4" onSubmit={(event) => void form.handleSubmit(event)}>
            <form.AppField name="code">
              {(field) => (
                <field.Input
                  label="리소스 코드 (영문)"
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
                  label="리소스 표시 이름"
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
                  label="라우트 경로 (Path)"
                  placeholder="예: /system"
                  required
                  orientation="vertical"
                  labelWidth="auto"
                  className="font-mono"
                />
              )}
            </form.AppField>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                취소
              </Button>
              <form.Submit>
                등록하기
              </form.Submit>
            </DialogFooter>
          </form.Layout>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
