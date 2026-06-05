import { createFileRoute } from '@tanstack/react-router';

import { PermissionManagementTab } from '../resources/-tabs/PermissionManagementTab';

export const Route = createFileRoute('/_protected/permissions/')({
  component: PermissionManagementPage,
});

function PermissionManagementPage() {
  return (
    <div className="size-full mx-auto flex max-w-300 min-h-0 flex-col gap-6 overflow-hidden p-6">
      <header className="space-y-2 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">권한 관리</h1>
        <p className="max-w-3xl text-sm text-slate-500">
          조직 내 역할과 리소스 권한을 매핑하고, 권한 세트를 관리합니다.
        </p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        <PermissionManagementTab />
      </div>
    </div>
  );
}
