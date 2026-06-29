import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, ErrorBoundary, toast } from '@pkg/ui';
import { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { SessionContext } from '@/hooks/useSession';

import { formatMessage, resolveErrorMessage } from '../lib/utils';

interface RouterContext {
  session: SessionContext
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <ErrorBoundary
      fallback={({ reset }) => <RootErrorFallback reset={reset} />}
      onError={(error) => {
        toast.error(formatMessage(resolveErrorMessage(error)));
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
          <div className="
            mx-auto mb-4 flex size-12 items-center justify-center rounded-full
            bg-destructive/10
          "
          >
            <AlertCircle className="size-6 text-destructive" />
          </div>
          <CardTitle className="text-xl font-bold">{t('errorTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          {t('errorDescription')}
        </CardContent>
        <CardFooter className="justify-center">
          <Button variant="default" onClick={reset} className="gap-2">
            <RefreshCcw className="size-4" />
            {t('retry')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
