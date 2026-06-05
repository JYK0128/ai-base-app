import { Button,
         Card,
         CardContent,
         CardDescription,
         CardFooter,
         CardHeader,
         CardTitle,
         useAppForm } from '@pkg/ui';
import { createFileRoute, Navigate } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, Lock, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { useAuthControllerChangePasswordV1, useAuthControllerLogoutV1 } from '../../api/endpoints';
import { useAuth } from '../../hooks/useAuth';

export const Route = createFileRoute('/_public/change-password')({
  component: ChangePassword,
});

function ChangePassword() {
  const { logout: authLogout, isAuthenticated } = useAuth();
  const { t } = useTranslation('common');

  const { mutateAsync: logout } = useAuthControllerLogoutV1({
    mutation: {
      onSuccess: () => {
        authLogout();
      },
    },
  });

  const { mutateAsync: changePassword, isPending: isChanging } = useAuthControllerChangePasswordV1({
    mutation: {
      onSuccess: async () => {
        await logout();
      },
    },
  });

  const form = useAppForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: z.object({
        currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요.'),
        newPassword: z.string().min(6, '새 비밀번호는 최소 6자 이상이어야 합니다.'),
        confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
      }).refine((data) => data.newPassword === data.confirmPassword, {
        message: '새 비밀번호가 일치하지 않습니다.',
        path: ['confirmPassword'],
      }),
    },
    onSubmit: async ({ value }) => {
      await changePassword({ data: value });
    },
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Button
            type="button"
            variant="ghost"
            onClick={() => authLogout()}
          >
            <ArrowLeft />
            {t('changePasswordBack')}
          </Button>

          <div className="flex items-center gap-2">
            <ShieldCheck />
            <span>{t('changePasswordBrand')}</span>
          </div>

          <CardTitle>{t('changePasswordTitle')}</CardTitle>
          <CardDescription>{t('changePasswordSubtitle')}</CardDescription>
        </CardHeader>

        <CardContent>
          <form.AppForm>
            <form.Layout className="grid gap-4" onSubmit={(e) => void form.handleSubmit(e)}>
              <form.AppField name="currentPassword">
                {(field) => (
                  <field.Input
                    label={t('currentPassword')}
                    placeholder={t('currentPasswordPlaceholder')}
                    type="password"
                    autoComplete="current-password"
                    required
                    orientation="vertical"
                    labelWidth="auto"
                    leftSide={<Lock />}
                  />
                )}
              </form.AppField>

              <form.AppField name="newPassword">
                {(field) => (
                  <field.Input
                    label={t('newPassword')}
                    placeholder={t('newPasswordPlaceholder')}
                    type="password"
                    autoComplete="new-password"
                    required
                    orientation="vertical"
                    labelWidth="auto"
                    leftSide={<Lock />}
                  />
                )}
              </form.AppField>

              <form.AppField name="confirmPassword">
                {(field) => (
                  <field.Input
                    label={t('confirmNewPassword')}
                    placeholder={t('confirmNewPasswordPlaceholder')}
                    type="password"
                    autoComplete="new-password"
                    required
                    orientation="vertical"
                    labelWidth="auto"
                    leftSide={<Lock />}
                  />
                )}
              </form.AppField>

              <form.Submit
                disabled={isChanging}
                className="w-full"
              >
                {isChanging ? t('updatingStatus') : t('updatePassword')}
                <ArrowRight />
              </form.Submit>
            </form.Layout>
          </form.AppForm>
        </CardContent>

        <CardFooter className="justify-center">
          <CardDescription>{t('securedBy')}</CardDescription>
        </CardFooter>
      </Card>
    </div>
  );
}
