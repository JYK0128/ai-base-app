import { Button,
         Card,
         CardContent,
         CardDescription,
         CardFooter,
         CardHeader,
         CardTitle,
         useAppForm } from '@pkg/ui';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { useAuthControllerLoginV1 } from '@/api/generated/endpoints';

export const Route = createFileRoute('/_public/login')({
  beforeLoad: ({ context }) => {
    if (context.session.isAuthenticated) {
      throw redirect({ to: '/dashboard', replace: true });
    }
  },
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const { session } = Route.useRouteContext();
  const navigate = useNavigate();
  const { mutateAsync: loginMutate } = useAuthControllerLoginV1();
  const { t } = useTranslation('common');

  const form = useAppForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: z.object({
        email: z.email('올바른 이메일 형식을 입력해주세요.'),
        password: z.string().min(1, '비밀번호를 입력해주세요.'),
      }),
    },
    onSubmit: async ({ value }) => {
      await loginMutate({ data: value });
      await session.refresh();
      await navigate({ to: redirect ?? '/dashboard', replace: true });
    },
  });

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock />
            <span>{t('appName')}</span>
          </div>
          <CardTitle>{t('loginTitle')}</CardTitle>
          <CardDescription>{t('loginSubtitle')}</CardDescription>
        </CardHeader>

        <CardContent>
          <form.AppForm>
            <form.Layout className="grid gap-4" onSubmit={(e) => void form.handleSubmit(e)}>
              <form.AppField
                name="email"
              >
                {(field) => (
                  <field.Input
                    label={t('loginEmail')}
                    placeholder="name@company.com"
                    type="email"
                    autoComplete="email"
                    required
                    orientation="vertical"
                    labelWidth="auto"
                    leftSide={<Mail />}
                  />
                )}
              </form.AppField>

              <form.AppField
                name="password"
              >
                {(field) => (
                  <field.Input
                    label={t('loginPassword')}
                    placeholder="••••••••"
                    type="password"
                    autoComplete="current-password"
                    required
                    orientation="vertical"
                    labelWidth="auto"
                    leftSide={<Lock />}
                  />
                )}
              </form.AppField>

              <form.Submit className="w-full">
                {t('loginSubmit')}
                <ArrowRight />
              </form.Submit>
            </form.Layout>
          </form.AppForm>
        </CardContent>

        <CardFooter className="
          flex-col justify-between gap-2
          sm:flex-row
        "
        >
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              void navigate({ to: '/forgot-password' });
            }}
          >
            {t('loginForgotPassword')}
          </Button>
          <div className="flex items-center gap-2">
            <CardDescription>{t('loginNewHere')}</CardDescription>
            <Button
              type="button"
              variant="link"
              onClick={() => {
                void navigate({ to: '/signup' });
              }}
            >
              {t('loginCreateAccount')}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
