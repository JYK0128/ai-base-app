import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, useAppForm } from '@pkg/ui';
import { z } from 'zod';

import { CreateResourceRequestDtoScope } from '@/api/generated/model';

import { ResourceActionPicker } from '../-components/ResourceActionPicker';
import { COMMON_ICONS } from '../-constants/commonIcons';
import { RESOURCE_ACTION_OPTIONS, type ResourceAction } from '../-helpers/resource-actions.helper';

export type CreateMenuInput = {
  code: string
  name: string
  scope: keyof typeof CreateResourceRequestDtoScope
  path: string
  icon?: string
  actions: ResourceAction[]
};

interface MenuRegistrationModalProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly defaultScope: keyof typeof CreateResourceRequestDtoScope
  readonly onSave: (menu: CreateMenuInput) => void | Promise<void>
}

export function MenuRegistrationModal({ open, onOpenChange, defaultScope, onSave }: MenuRegistrationModalProps) {
  const form = useAppForm({
    defaultValues: {
      code: '',
      name: '',
      scope: defaultScope,
      path: '',
      icon: '',
      actions: [...RESOURCE_ACTION_OPTIONS],
    },
    validators: {
      onSubmit: z.object({
        code: z.string().trim().min(1, '리소스 코드를 입력해주세요.'),
        name: z.string().trim().min(1, '리소스 이름을 입력해주세요.'),
        scope: z.enum([CreateResourceRequestDtoScope.PLATFORM, CreateResourceRequestDtoScope.ORGANIZATION]),
        path: z.string().trim().min(1, '라우트 경로를 입력해주세요.'),
        icon: z.string().optional(),
        actions: z.array(z.enum(RESOURCE_ACTION_OPTIONS)),
      }),
    },
    onSubmit: async ({ value }) => {
      await onSave({
        code: value.code,
        name: value.name,
        scope: value.scope,
        path: value.path,
        icon: value.icon || undefined,
        actions: value.actions,
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

            <form.AppField name="scope">
              {(field) => (
                <field.Select
                  label="메뉴 범위"
                  placeholder="범위를 선택하세요"
                  required
                  orientation="vertical"
                  labelWidth="auto"
                  items={[
                    { label: '플랫폼 메뉴', value: CreateResourceRequestDtoScope.PLATFORM },
                    { label: '일반 메뉴', value: CreateResourceRequestDtoScope.ORGANIZATION },
                  ]}
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

            <form.AppField name="icon">
              {(field) => (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-slate-700">아이콘 선택</div>
                  <div className="
                    scroll-y grid max-h-44 grid-cols-5 gap-2 rounded-md border
                    border-slate-200 bg-slate-50 p-2
                  "
                  >
                    {COMMON_ICONS.map(({ name, icon: IconComponent }) => (
                      <button
                        key={name}
                        type="button"
                        title={name}
                        className={`
                          flex items-center justify-center rounded-md border p-2
                          transition-colors
                          ${
                      field.state.value === name
                        ? 'border-sky-300 bg-sky-100 text-sky-600'
                        : `
                          border-slate-200 bg-white text-slate-600
                          hover:bg-slate-100
                        `
                      }
                        `}
                        onClick={() => field.handleChange(field.state.value === name ? '' : name)}
                      >
                        <IconComponent className="size-5" />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    아이콘을 선택하지 않으면 기본 표시를 사용합니다.
                  </p>
                </div>
              )}
            </form.AppField>

            <form.AppField name="actions">
              {(field) => (
                <ResourceActionPicker
                  name="menu-actions"
                  label="허용 기능"
                  description="메뉴에 적용할 기능을 선택합니다."
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
