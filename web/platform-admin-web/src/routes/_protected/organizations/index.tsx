import { createFileRoute } from '@tanstack/react-router';

import { ConsoleFrame } from '../-components/ConsoleFrame';
import { ConsoleTabs } from '../-components/ConsoleTabs';
import { MOCK_ACTIVITY } from './-helpers/organizations.helper';
import { OrganizationActivitySection } from './-sections/OrganizationActivitySection';
import { OrganizationOverviewSection } from './-sections/OrganizationOverviewSection';

export const Route = createFileRoute('/_protected/organizations/')({
  component: OrganizationsPage,
});

function OrganizationsPage() {
  return (
    <ConsoleFrame
      title="조직 관리"
      description="내 조직의 식별 정보와 운영 현황을 확인합니다."
    >
      <ConsoleTabs
        defaultValue="overview"
        items={[
          {
            value: 'overview',
            label: '기본 정보',
            content: () => <OrganizationOverviewSection />,
          },
          {
            value: 'activity',
            label: '활동 기록',
            content: () => <OrganizationActivitySection activity={MOCK_ACTIVITY} />,
          },
        ]}
      />
    </ConsoleFrame>
  );
}
