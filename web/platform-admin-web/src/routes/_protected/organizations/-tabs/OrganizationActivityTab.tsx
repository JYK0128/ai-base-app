import { Badge } from '@pkg/ui';
import { Activity } from 'lucide-react';

import { OrganizationPanel } from '../-components/OrganizationPanel';
import { type OrganizationActivityMock } from '../-organizations.shared';

export function OrganizationActivityTab({ activity }: Readonly<{ activity: OrganizationActivityMock[] }>) {
  return (
    <OrganizationPanel
      title="활동 기록"
      description="조직에 영향을 준 최근 이벤트를 시간순으로 확인합니다."
      icon={<Activity className="size-4" />}
    >
      <div className="space-y-4">
        {activity.map((item, index) => (
          <div key={item.title} className="relative pl-6">
            {index < activity.length - 1
              ? <div className="absolute bottom-0 left-[11px] top-7 w-px bg-slate-200" />
              : null}
            <div className="absolute left-0 top-1 flex size-6 items-center justify-center rounded-full border border-slate-200 bg-white">
              <div className={getActivityToneClass(item.tone)}>
                <item.icon className="size-3.5" />
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{item.title}</p>
                <Badge variant="outline" className="border-slate-200 bg-white text-slate-600">
                  {item.when}
                </Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </OrganizationPanel>
  );
}

function getActivityToneClass(tone: OrganizationActivityMock['tone']) {
  if (tone === 'emerald') {
    return 'flex size-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700';
  }

  if (tone === 'sky') {
    return 'flex size-8 items-center justify-center rounded-xl bg-sky-100 text-sky-700';
  }

  if (tone === 'amber') {
    return 'flex size-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700';
  }

  return 'flex size-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600';
}
