import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from '@pkg/ui';
import { FileQuestion, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function NotFound() {
  const { t } = useTranslation('common');

  return (
    <div className="
      grid min-h-screen place-items-center bg-slate-50 p-4 font-sans
    "
    >
      <Card className="
        w-full max-w-md border-slate-200/60 bg-white/80 shadow-xl
        backdrop-blur-sm
      "
      >
        <CardHeader className="pb-2 text-center">
          <div className="
            mx-auto mb-4 flex size-16 items-center justify-center rounded-full
            bg-slate-100/80 text-slate-500 shadow-inner
          "
          >
            <FileQuestion className="size-8 text-slate-400" />
          </div>
          <CardTitle className="
            text-2xl font-bold tracking-tight text-slate-800
          "
          >
            {t('notFoundTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="
          px-6 py-4 text-center text-sm/relaxed text-slate-500
        "
        >
          {t('notFoundDescription')}
        </CardContent>
        <CardFooter className="justify-center pt-2 pb-6">
          <Button
            variant="default"
            onClick={() => window.location.href = '/'}
            className="gap-2 px-5 py-2"
          >
            <Home className="size-4" />
            {t('goHome')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
