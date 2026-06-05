import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, ErrorBoundary, toast } from '@pkg/ui';
import { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import axios from 'axios';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { ApiResponse } from '../api/model';
import { formatMessage } from '../lib/utils';

interface RouterContext {
  auth: {
    isAuthenticated: boolean
    mustChangePassword: boolean
    permissions: string[]
  }
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <ErrorBoundary
      fallback={({ reset }) => <RootErrorFallback reset={reset} />}
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

interface RootErrorFallbackProps {
  readonly reset: () => void
}

function RootErrorFallback({ reset }: RootErrorFallbackProps) {
  const { t } = useTranslation('common');

  return (
    <div className="grid min-h-100 place-items-center p-4">
      <Card className="w-full max-w-md border-destructive/20 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl font-bold">{t('errorTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          {t('errorDescription')}
        </CardContent>
        <CardFooter className="justify-center">
          <Button variant="default" onClick={reset} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            {t('retry')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
