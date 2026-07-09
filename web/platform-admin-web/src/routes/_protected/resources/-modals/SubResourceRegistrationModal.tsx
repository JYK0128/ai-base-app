import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, useAppForm } from '@pkg/ui';
import { z } from 'zod';

import { ResourceActionPicker } from '../-components/ResourceActionPicker';
import { RESOURCE_ACTION_OPTIONS, type ResourceAction } from '../-helpers/resource-actions.helper';

export type CreateSubResourceInput = {
  code: string
  name: string
  actions: ResourceAction[]
};

interface SubResourceRegistrationModalProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly parentName?: string
  readonly availableActions: ResourceAction[]
  readonly onSave: (resource: CreateSubResourceInput) => void | Promise<void>
}

export function SubResourceRegistrationModal({ open, onOpenChange, parentName, availableActions, onSave }: SubResourceRegistrationModalProps) {
  const form = useAppForm({
    defaultValues: {
      code: '',
      name: '',
      actions: availableActions.length > 0 ? [availableActions[0]] : [],
    },
    validators: {
      onSubmit: z.object({
        code: z.string().trim().min(1, '리소스 코드를 입력해주세요.'),
        name: z.string().trim().min(1, '리소스 이름을 입력해주세요.'),
        actions: z.array(z.enum(RESOURCE_ACTION_OPTIONS)),
      }),
    },
    onSubmit: async ({ value }) => {
      await onSave({
        code: value.code,
        name: value.name,
        actions: value.actions,
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

            <form.AppField name="actions">
              {(field) => (
                <ResourceActionPicker
                  name="sub-resource-actions"
                  label="허용 기능"
                  description="컴포넌트 리소스에서 사용할 기능을 선택합니다."
                  availableActions={availableActions}
                  selectionMode="single"
                  value={field.state.value}
                  onChange={(actions) => field.handleChange(actions)}
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
