import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from '@pkg/ui';
import { FileQuestion, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function NotFound() {
  const { t } = useTranslation('common');

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-4 font-sans">
      <Card className="w-full max-w-md border-slate-200/60 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100/80 text-slate-500 shadow-inner">
            <FileQuestion className="h-8 w-8 text-slate-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800 tracking-tight">{t('notFoundTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-slate-500 text-sm leading-relaxed px-6 py-4">
          {t('notFoundDescription')}
        </CardContent>
        <CardFooter className="justify-center pt-2 pb-6">
          <Button variant="default" onClick={() => window.location.href = '/'} className="gap-2 px-5 py-2">
            <Home className="h-4 w-4" />
            {t('goHome')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
