import { createFileRoute } from '@tanstack/react-router';

import { AnnouncementListTab } from './-tabs/AnnouncementListTab';

export const Route = createFileRoute('/_protected/announcements/')({
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  return (
    <div className="size-full mx-auto flex max-w-300 min-h-0 flex-col gap-6 overflow-hidden p-6">
      <header className="space-y-2 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">공지사항 관리</h1>
        <p className="max-w-3xl text-sm text-slate-500">공지 목록과 검색을 확인합니다.</p>
      </header>

      <AnnouncementListTab />
    </div>
  );
}
