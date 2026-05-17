import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, ErrorBoundary, toast } from '@pkg/ui';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import axios from 'axios';
import { AlertCircle, RefreshCcw } from 'lucide-react';

import type { ApiResponse } from '../api/model';
import { formatMessage } from '../lib/utils';

interface RouterContext {
  auth: {
    isAuthenticated: boolean
    mustChangePassword: boolean
  }
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <ErrorBoundary
      fallback={({ reset }) => (
        <div className="grid min-h-100 place-items-center p-4">
          <Card className="w-full max-w-md border-destructive/20 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl font-bold">오류가 발생했습니다</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              시스템에 일시적인 문제가 발생했거나 예상치 못한 오류가 있습니다.
              아래 버튼을 눌러 다시 시도해 주세요.
            </CardContent>
            <CardFooter className="justify-center">
              <Button variant="default" onClick={reset} className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                다시 시도
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      onError={(error) => {
        if (axios.isAxiosError<ApiResponse>(error)) {
          const message
            = error.response?.data.message
              ?? error.response?.data.error?.message
              ?? error.message;
          const displayMessage = Array.isArray(message) ? message[0] : message;
          toast.error(formatMessage(displayMessage));
        }
        else {
          toast.error(formatMessage(error.message));
        }
      }}
    >
      <Outlet />
    </ErrorBoundary>
  ),
});
