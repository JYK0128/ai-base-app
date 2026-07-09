import { createFileRoute } from '@tanstack/react-router';

import { ConsoleFrame } from '../-components/ConsoleFrame';
import { ConsoleSections } from '../-components/ConsoleSections';
import { AnnouncementListSection } from './-sections/AnnouncementListSection';

export const Route = createFileRoute('/_protected/announcements/')({
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  return (
    <ConsoleFrame
      title="공지사항 관리"
      description="운영 공지의 작성, 게시 일정, 상단 고정과 미리보기를 한 화면에서 관리합니다."
    >
      <ConsoleSections>
        <AnnouncementListSection />
      </ConsoleSections>
    </ConsoleFrame>
  );
}
