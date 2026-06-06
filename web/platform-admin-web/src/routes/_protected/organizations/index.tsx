import { Tabs, TabsContent, TabsList, TabsTrigger } from '@pkg/ui';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { MOCK_ACTIVITY, MOCK_ORGANIZATION, type OrganizationTab } from './-organizations.shared';
import { OrganizationActivityTab } from './-tabs/OrganizationActivityTab';
import { OrganizationOverviewTab } from './-tabs/OrganizationOverviewTab';

export const Route = createFileRoute('/_protected/organizations/')({
  component: OrganizationsPage,
});

function OrganizationsPage() {
  const [activeTab, setActiveTab] = useState<OrganizationTab>('overview');

  return (
    <div className="size-full mx-auto flex max-w-300 flex-col gap-6 overflow-hidden p-6">
      <header className="space-y-2 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">조직 관리</h1>
        <p className="max-w-3xl text-sm text-slate-500">
          내 조직의 식별 정보와 운영 현황을 확인합니다.
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as OrganizationTab)} className="flex flex-1 flex-col gap-4 overflow-hidden">
        <TabsList className="w-fit justify-start" variant="line">
          <TabsTrigger value="overview" className="flex-none px-4">
            기본 정보
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex-none px-4">
            활동 기록
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 flex flex-1 flex-col overflow-hidden">
          <OrganizationOverviewTab organization={MOCK_ORGANIZATION} />
        </TabsContent>

        <TabsContent value="activity" className="mt-0 flex flex-1 flex-col overflow-hidden">
          <OrganizationActivityTab activity={MOCK_ACTIVITY} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
