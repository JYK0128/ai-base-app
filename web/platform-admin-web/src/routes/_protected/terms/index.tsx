import { createFileRoute } from '@tanstack/react-router';

import { ConsoleFrame } from '../-components/ConsoleFrame';
import { ConsoleSections } from '../-components/ConsoleSections';
import { TermsManagementSection } from './-sections/TermsManagementSection';

export const Route = createFileRoute('/_protected/terms/')({
  component: TermsPage,
});

function TermsPage() {
  return (
    <ConsoleFrame
      title="약관 관리"
      description="플랫폼과 조직별 활성 약관 문서와 버전을 관리합니다."
    >
      <ConsoleSections>
        <TermsManagementSection isActive />
      </ConsoleSections>
    </ConsoleFrame>
  );
}
