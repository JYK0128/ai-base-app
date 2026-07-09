import { TooltipProvider } from '@pkg/ui';
import { createFileRoute } from '@tanstack/react-router';

import { ConsoleFrame } from '../-components/ConsoleFrame';
import { ConsoleTabs } from '../-components/ConsoleTabs';
import { InvitationsSection } from './-sections/InvitationsSection';
import { MembersSection } from './-sections/MembersSection';

export const Route = createFileRoute('/_protected/members/')({
  component: MembersPage,
});

function MembersPage() {
  return (
    <TooltipProvider delayDuration={1000}>
      <ConsoleFrame
        title="멤버 관리"
        description="내 조직의 멤버와 초대 이력을 각 탭에서 독립적으로 조회하고 관리합니다."
      >
        <ConsoleTabs
          defaultValue="members"
          items={[
            {
              value: 'members',
              label: '멤버 목록',
              content: ({ isActive }) => <MembersSection isActive={isActive} />,
            },
            {
              value: 'invitations',
              label: '초대 목록',
              content: ({ isActive }) => <InvitationsSection isActive={isActive} />,
            },
          ]}
        />
      </ConsoleFrame>
    </TooltipProvider>
  );
}
