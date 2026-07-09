import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, toast, useAppForm } from '@pkg/ui';
import { useStore } from '@tanstack/react-form';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import { type GetResourceResponseDto, UpdateResourceRequestDtoScope } from '@/api/generated/model';

import { ResourceActionPicker } from '../-components/ResourceActionPicker';
import { COMMON_ICONS } from '../-constants/commonIcons';
import { RESOURCE_ACTION_OPTIONS, type ResourceAction } from '../-helpers/resource-actions.helper';

interface ResourceEditModalProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly resource: GetResourceResponseDto | null
  readonly availableActions?: ResourceAction[]
  readonly lockedActions?: readonly ResourceAction[]
  readonly onSave: (resource: {
    code?: string
    name?: string
    scope?: keyof typeof UpdateResourceRequestDtoScope
    path?: string
    icon?: string
    actions?: ResourceAction[]
  }) => void | Promise<void>
}

interface ResourceEditFormValues {
  code: string
  name: string
  scope: keyof typeof UpdateResourceRequestDtoScope
  path: string
  icon: string
  actions: ResourceAction[]
}

export function ResourceEditModal({ open, onOpenChange, resource, availableActions, lockedActions = [], onSave }: ResourceEditModalProps) {
  const description = '리소스의 표시 정보, 경로, 아이콘을 수정합니다.';
  let selectableActions: ResourceAction[] = RESOURCE_ACTION_OPTIONS;

  if (availableActions?.length) {
    selectableActions = availableActions;
  }

  if (!availableActions?.length && resource?.type === 'COMPONENT') {
    selectableActions = resource.actions.length > 0
      ? resource.actions
      : [RESOURCE_ACTION_OPTIONS[1]];
  }

  const currentActions = resource?.actions.filter((action) => selectableActions.includes(action)) ?? [];
  let defaultActions: ResourceAction[] = currentActions;

  if (resource?.type === 'MENU' && defaultActions.length === 0) {
    defaultActions = [...selectableActions];
  }

  if (resource?.type === 'COMPONENT') {
    const selectedAction = currentActions[0]
      ?? selectableActions[0]
      ?? RESOURCE_ACTION_OPTIONS[1];

    defaultActions = [selectedAction];
  }

  defaultActions = [
    ...new Set([
      ...defaultActions,
      ...lockedActions.filter((action) => selectableActions.includes(action)),
    ]),
  ];

  const form = useAppForm({
    defaultValues: {
      code: resource?.code ?? '',
      name: resource?.name ?? '',
      scope: (resource?.scope as keyof typeof UpdateResourceRequestDtoScope)
        ?? UpdateResourceRequestDtoScope.ORGANIZATION,
      path: resource?.path ?? '',
      icon: resource?.icon ?? '',
      actions: defaultActions,
    } satisfies ResourceEditFormValues,
    validators: {
      onSubmit: z.object({
        code: z.string().trim().min(1, '리소스 코드를 입력해주세요.'),
        name: z.string().trim().min(1, '리소스 이름을 입력해주세요.'),
        scope: z.enum([UpdateResourceRequestDtoScope.PLATFORM, UpdateResourceRequestDtoScope.ORGANIZATION]),
        path: z.string().trim(),
        icon: z.string(),
        actions: z.array(z.enum(RESOURCE_ACTION_OPTIONS)),
      }),
    },
    onSubmit: async ({ value }) => {
      await onSave({
        code: value.code,
        name: value.name,
        scope: value.scope,
        path: value.path || undefined,
        icon: value.icon || undefined,
        actions: value.actions,
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

            {resource?.type === 'MENU'
              ? (
                <form.AppField name="scope">
                  {(field) => (
                    <field.Select
                      label="메뉴 범위"
                      placeholder="범위를 선택하세요"
                      required
                      orientation="vertical"
                      labelWidth="auto"
                      items={[
                        { label: '플랫폼 메뉴', value: UpdateResourceRequestDtoScope.PLATFORM },
                        { label: '일반 메뉴', value: UpdateResourceRequestDtoScope.ORGANIZATION },
                      ]}
                    />
                  )}
                </form.AppField>
              )
              : null}

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
                  <div className="
                    scroll-y grid max-h-40 grid-cols-5 gap-2 rounded-md border
                    border-slate-200 bg-slate-50 p-2
                  "
                  >
                    {COMMON_ICONS.map(({ name, icon: IconComponent }) => (
                      <button
                        key={name}
                        type="button"
                        title={name}
                        className={`
                          flex items-center justify-center rounded-sm border p-2
                          transition-colors
                          ${
                      field.state.value === name
                        ? 'border-blue-300 bg-blue-100 text-blue-600'
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
                  name="resource-edit-actions"
                  label="허용 기능"
                  description="리소스에 적용할 기능을 선택합니다."
                  availableActions={selectableActions}
                  lockedActions={lockedActions}
                  selectionMode={resource?.type === 'COMPONENT' ? 'single' : 'multiple'}
                  value={field.state.value}
                  onChange={(actions) => field.handleChange(actions)}
                />
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
