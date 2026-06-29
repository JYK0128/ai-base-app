import { Card, CardContent } from '@pkg/ui';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected/dashboard/')({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="
      mx-auto flex size-full max-w-300 flex-col gap-6 overflow-hidden p-6
    "
    >
      <header className="space-y-2 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">대시보드</h1>
        <p className="max-w-3xl text-sm text-slate-500">
          보호된 영역의 진입점입니다.
        </p>
      </header>

      <Card className="
        flex flex-1 flex-col overflow-hidden border-slate-200 bg-white shadow-sm
      "
      >
        <CardContent className="flex flex-1 items-center justify-center p-6">
          대시보드 차트 이미지
        </CardContent>
      </Card>
    </div>
  );
}
