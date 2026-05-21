import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from '@pkg/ui';
import { FileQuestion, Home } from 'lucide-react';

export function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-4 font-sans">
      <Card className="w-full max-w-md border-slate-200/60 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100/80 text-slate-500 shadow-inner">
            <FileQuestion className="h-8 w-8 text-slate-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800 tracking-tight">페이지를 찾을 수 없습니다</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-slate-500 text-sm leading-relaxed px-6 py-4">
          요청하신 페이지가 존재하지 않거나, 해당 페이지에 접근할 수 있는 권한이 없습니다.
          입력하신 주소가 올바른지 확인해 주세요.
        </CardContent>
        <CardFooter className="justify-center pt-2 pb-6">
          <Button variant="default" onClick={() => window.location.href = '/'} className="gap-2 px-5 py-2">
            <Home className="h-4 w-4" />
            홈으로 이동
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
