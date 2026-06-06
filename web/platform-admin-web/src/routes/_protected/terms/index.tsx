import { createFileRoute } from '@tanstack/react-router';

import { TermsManagementTab } from './-tabs/TermsManagementTab';

export const Route = createFileRoute('/_protected/terms/')({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="size-full mx-auto flex max-w-300 flex-col gap-6 overflow-hidden p-6">
      <header className="space-y-2 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">약관 관리</h1>
        <p className="max-w-3xl text-sm text-slate-500">
          플랫폼 또는 조직에 연결된 활성 약관 문서와 버전을 관리합니다.
        </p>
      </header>

      <div className="flex-1 flex flex-col">
        <TermsManagementTab />
      </div>
    </div>
  );
}
