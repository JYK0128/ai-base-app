import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, useAppForm } from '@pkg/ui';
import { z } from 'zod';

import type { ResourceResponseDto } from '../../../../api/model';

export type CreateSubResourceInput = Pick<ResourceResponseDto, 'code' | 'name' | 'type'>;

interface SubResourceRegistrationModalProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly parentName?: string
  readonly onSave: (resource: CreateSubResourceInput) => void
}

export function SubResourceRegistrationModal({ open, onOpenChange, parentName, onSave }: SubResourceRegistrationModalProps) {
  const form = useAppForm({
    defaultValues: {
      type: 'COMPONENT' as const,
      code: '',
      name: '',
    },
    validators: {
      onSubmit: z.object({
        type: z.literal('COMPONENT'),
        code: z.string().trim().min(1, '리소스 코드를 입력해주세요.'),
        name: z.string().trim().min(1, '리소스 이름을 입력해주세요.'),
      }),
    },
    onSubmit: async ({ value }) => {
      onSave({
        code: value.code,
        name: value.name,
        type: 'COMPONENT',
      });
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>컴포넌트 리소스 추가</DialogTitle>
          <DialogDescription>
            {parentName ? `'${parentName}' 리소스에` : '선택한 리소스에'}
            {' '}
            속할 컴포넌트 리소스를 등록합니다.
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Layout className="space-y-4" onSubmit={(event) => void form.handleSubmit(event)}>
            <form.AppField name="code">
              {(field) => (
                <field.Input
                  label="리소스 코드 (영문)"
                  placeholder="예: BTN_USER_DELETE"
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
                  placeholder="예: 사용자 삭제 버튼"
                  required
                  orientation="vertical"
                  labelWidth="auto"
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
