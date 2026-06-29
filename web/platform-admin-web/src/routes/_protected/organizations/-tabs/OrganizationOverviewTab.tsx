import { Button, toast, useAppForm } from '@pkg/ui';
import { Building2 } from 'lucide-react';
import { z } from 'zod';

import { useOrganizationControllerUpdateOrganizationV1 } from '@/api/generated/endpoints';
import { useSession } from '@/hooks/useSession';

import { OrganizationPanel } from '../-components/OrganizationPanel';

export function OrganizationOverviewTab() {
  const session = useSession();
  const updateOrganizationMutation = useOrganizationControllerUpdateOrganizationV1();

  const form = useAppForm({
    defaultValues: {
      name: session.data?.organization?.name ?? '',
      email: session.data?.organization?.email ?? '',
    },
    validators: {
      onSubmit: z.object({
        name: z.string().trim(),
        email: z.email().trim(),

      }),
    },
    onSubmit: async ({ value }) => {
      await updateOrganizationMutation.mutateAsync({
        data: value,
      });
      await session.refresh();
      toast.success('조직 정보를 저장했습니다.');
    },
  });

  if (session.isPending) {
    return (
      <OrganizationPanel
        title="기본 정보"
        description="조직을 대표하는 정보를 수정합니다."
        icon={<Building2 className="size-4" />}
      >
        <div className="
          grid min-h-56 place-items-center rounded-lg border border-dashed
          border-slate-200 bg-slate-50 text-sm text-slate-500
        "
        >
          조직 정보를 불러오는 중입니다...
        </div>
      </OrganizationPanel>
    );
  }

  if (!session.data) {
    return (
      <OrganizationPanel
        title="기본 정보"
        description="조직을 대표하는 정보를 수정합니다."
        icon={<Building2 className="size-4" />}
      >
        <div className="
          grid min-h-56 place-items-center rounded-lg border border-dashed
          border-slate-200 bg-slate-50 text-sm text-slate-500
        "
        >
          조직 정보를 찾을 수 없습니다.
        </div>
      </OrganizationPanel>
    );
  }

  return (
    <OrganizationPanel
      title="기본 정보"
      description="조직을 대표하는 정보를 수정합니다."
      icon={<Building2 className="size-4" />}
      actions={(
        <Button
          form="organization-overview-form"
          type="submit"
          size="sm"
          className="px-4"
          disabled={updateOrganizationMutation.isPending}
        >
          {updateOrganizationMutation.isPending ? '저장 중' : '저장'}
        </Button>
      )}
    >
      <form.AppForm>
        <form.Layout
          id="organization-overview-form"
          className="space-y-4"
          onSubmit={(event) => void form.handleSubmit(event)}
        >
          <div className="
            grid gap-3
            md:grid-cols-2
          "
          >
            <form.AppField name="name">
              {(field) => (
                <field.Input
                  label="이름"
                  placeholder="조직명을 입력하세요"
                  orientation="vertical"
                  labelWidth="auto"
                />
              )}
            </form.AppField>

            <form.AppField name="email">
              {(field) => (
                <field.Input
                  label="대표 이메일"
                  placeholder="owner@example.com"
                  type="email"
                  orientation="vertical"
                  labelWidth="auto"
                />
              )}
            </form.AppField>
          </div>
        </form.Layout>
      </form.AppForm>
    </OrganizationPanel>
  );
}
