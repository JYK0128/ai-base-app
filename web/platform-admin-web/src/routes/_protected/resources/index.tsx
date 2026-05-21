import { createFileRoute } from '@tanstack/react-router';

import { ResourceTreeTab } from './-tabs/ResourceTreeTab';

export const Route = createFileRoute('/_protected/resources/')({
  component: ResourceManagementPage,
});

function ResourceManagementPage() {
  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 flex flex-col">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-4 border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">리소스 관리</h1>
          <p className="text-slate-500 mt-1 text-sm">메뉴와 컴포넌트 자원의 권한을 관리합니다.</p>
        </div>
      </div>

      <div className="flex-1">
        <ResourceTreeTab />
      </div>
    </div>
  );
}
