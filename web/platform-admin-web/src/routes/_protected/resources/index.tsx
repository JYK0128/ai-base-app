import { createFileRoute } from '@tanstack/react-router';

import { ResourceTreeTab } from './-tabs/ResourceTreeTab';

export const Route = createFileRoute('/_protected/resources/')({
  component: ResourceManagementPage,
});

function ResourceManagementPage() {
  const { locales } = Route.useRouteContext();

  return (
    <div className="size-full mx-auto flex max-w-300 flex-col gap-6 p-6">
      <header className="space-y-2 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">리소스 관리</h1>
        <p className="max-w-3xl text-sm text-slate-500">
          플랫폼 메뉴로 노출되는 리소스의 아이콘과 다국어 메시지를 관리합니다.
        </p>
      </header>

      <div className="flex-1 min-h-0 flex flex-col">
        <ResourceTreeTab locales={locales} />
      </div>
    </div>
  );
}
