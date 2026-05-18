import { Button } from '@pkg/ui';
import { createFileRoute } from '@tanstack/react-router';
import { FolderPlus, Settings } from 'lucide-react';
import { useState } from 'react';

import { ResourceTreeTab } from './-tabs/ResourceTreeTab';
import { SettingsTab } from './-tabs/SettingsTab';

export const Route = createFileRoute('/_protected/rbac/')({
  component: RbacPage,
});

function RbacPage() {
  const [activeTab, setActiveTab] = useState<'resource-tree' | 'other'>('resource-tree');

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 flex flex-col">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-4 border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">권한 관리 (RBAC)</h1>
          <p className="text-slate-500 mt-1 text-sm">시스템의 권한과 자원을 관리합니다.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeTab === 'resource-tree' ? 'default' : 'outline'}
            onClick={() => setActiveTab('resource-tree')}
            className="gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            리소스 트리
          </Button>
          <Button
            variant={activeTab === 'other' ? 'default' : 'outline'}
            onClick={() => setActiveTab('other')}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            설정
          </Button>
        </div>
      </div>

      <div className="flex-1">
        {activeTab === 'resource-tree' && <ResourceTreeTab />}
        {activeTab === 'other' && <SettingsTab />}
      </div>
    </div>
  );
}
