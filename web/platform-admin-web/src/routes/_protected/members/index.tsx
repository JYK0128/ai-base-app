import { Tabs, TabsContent, TabsList, TabsTrigger, TooltipProvider } from '@pkg/ui';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { InvitationsTab } from './-tabs/InvitationsTab';
import { MembersTab } from './-tabs/MembersTab';

export const Route = createFileRoute('/_protected/members/')({
  component: MembersPage,
});

type MemberTab = 'members' | 'invitations';

function MembersPage() {
  const [activeTab, setActiveTab] = useState<MemberTab>('members');

  return (
    <TooltipProvider delayDuration={1000}>
      <div className="
        grid size-full grid-rows-[auto_1fr] gap-6 overflow-hidden p-6
      "
      >
        <header className="space-y-2 border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">멤버 관리</h1>
          <p className="max-w-3xl text-sm text-slate-500">
            내 조직의 멤버와 초대 이력을 각 탭에서 독립적으로 조회하고 관리합니다.
          </p>
        </header>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as MemberTab)}
          className="flex min-h-0 flex-col gap-4 overflow-hidden"
        >
          <TabsList className="scroll-x w-full justify-start" variant="line">
            <TabsTrigger value="members" className="flex-none px-4">
              멤버 목록
            </TabsTrigger>
            <TabsTrigger value="invitations" className="flex-none px-4">
              초대 목록
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="members"
            className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <MembersTab isActive={activeTab === 'members'} />
          </TabsContent>

          <TabsContent
            value="invitations"
            className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <InvitationsTab isActive={activeTab === 'invitations'} />
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
