import { Button, Card, CardContent } from '@pkg/ui';
import { createFileRoute } from '@tanstack/react-router';

import { useAuth } from '../../../hooks/useAuth';

export const Route = createFileRoute('/_protected/dashboard/')({
  component: Dashboard,
});

function Dashboard() {
  const { logout } = useAuth();

  return (
    <div className="size-full mx-auto flex max-w-300 min-h-0 flex-col gap-6 overflow-hidden p-6">
      <header className="space-y-2 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">대시보드</h1>
        <p className="max-w-3xl text-sm text-slate-500">
          보호된 영역의 진입점입니다. 현재 계정을 확인하거나 세션을 종료할 수 있습니다.
        </p>
      </header>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardContent className="flex min-h-0 flex-1 items-center justify-center p-6">
          <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900">로그인 완료</h2>
              <p className="text-sm leading-6 text-slate-500">
                현재 로그인된 상태입니다. 로그아웃하면 세션을 종료하고 다시 로그인 화면으로 이동합니다.
              </p>
            </div>

            <Button
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              className="w-full max-w-40"
              variant="destructive"
            >
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
