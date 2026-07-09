import { createFileRoute } from '@tanstack/react-router';

import { ConsoleFrame } from '../-components/ConsoleFrame';
import { ConsoleSections } from '../-components/ConsoleSections';
import { ResourceTreeSection } from './-sections/ResourceTreeSection';

export const Route = createFileRoute('/_protected/resources/')({
  component: ResourceManagementPage,
});

function ResourceManagementPage() {
  return (
    <ConsoleFrame
      title="리소스 관리"
      description="플랫폼 메뉴로 노출되는 리소스의 구조, 정렬, 아이콘과 다국어 메시지를 관리합니다."
    >
      <ConsoleSections>
        <ResourceTreeSection isActive />
      </ConsoleSections>
    </ConsoleFrame>
  );
}
