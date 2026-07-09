import { createFileRoute } from '@tanstack/react-router';

import { ConsoleFrame } from '../-components/ConsoleFrame';
import { ConsolePanel } from '../-components/ConsolePanel';
import { ConsoleSections } from '../-components/ConsoleSections';

export const Route = createFileRoute('/_protected/dashboard/')({
  component: Dashboard,
});

function Dashboard() {
  return (
    <ConsoleFrame
      title="대시보드"
      description="보호된 영역의 진입점입니다."
      actions={[
        <button
          key="refresh"
          type="button"
          className="
            rounded-md border border-slate-200 bg-white px-3 py-2 text-sm
            font-medium text-slate-700 shadow-sm
            hover:bg-slate-50
            focus:ring-2 focus:ring-slate-500 focus:ring-offset-2
            focus:outline-none
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          새로고침
        </button>,
      ]}
    >
      <ConsoleSections>
        <ConsolePanel
          description="dd"
          title="dd"
        >
          {Array.from({ length: 100 }).map((_, index) => (
            <div key={index}>{index}</div>
          ))}
        </ConsolePanel>
      </ConsoleSections>
    </ConsoleFrame>
  );
}
