import { createFileRoute } from '@tanstack/react-router';

import { ConsoleFrame } from '../-components/ConsoleFrame';
import { ConsoleSections } from '../-components/ConsoleSections';
import { PermissionManagementSection } from './-sections/PermissionManagementSection';

export const Route = createFileRoute('/_protected/permissions/')({
  component: PermissionManagementPage,
});

function PermissionManagementPage() {
  return (
    <ConsoleFrame
      title="권한 관리"
      description="조직 내 역할과 리소스 권한을 매핑하고, 역할 권한을 관리합니다."
    >
      <ConsoleSections>
        <PermissionManagementSection />
      </ConsoleSections>
    </ConsoleFrame>
  );
}
