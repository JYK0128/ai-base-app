import { Button, useAppForm } from '@pkg/ui';
import { Building2 } from 'lucide-react';

import { OrganizationPanel } from '../-components/OrganizationPanel';
import { type OrganizationIdentityMock } from '../-organizations.shared';

export function OrganizationOverviewTab({ organization }: Readonly<{ organization: OrganizationIdentityMock }>) {
  const form = useAppForm({
    defaultValues: organization,
    onSubmit: async () => {},
  });

  return (
    <OrganizationPanel
      title="기본 정보"
      description="조직을 대표하는 정보를 수정합니다."
      icon={<Building2 className="size-4" />}
      actions={(
        <Button form="organization-overview-form" type="submit" size="sm" className="px-4">
          저장
        </Button>
      )}
    >
      <form.AppForm>
        <form.Layout
          id="organization-overview-form"
          className="space-y-4"
          onSubmit={(event) => void form.handleSubmit(event)}
        >
          <div className="grid gap-3 md:grid-cols-2">
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

            <form.AppField name="createdAt">
              {(field) => (
                <field.Input
                  label="생성 일시"
                  readOnly
                  className="bg-slate-50"
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
