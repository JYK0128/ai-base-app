import { Button,
         Card,
         CardContent,
         CardDescription,
         CardFooter,
         CardHeader,
         CardTitle,
         useAppForm } from '@pkg/ui';
import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import { ArrowLeft, ArrowRight, Lock, ShieldCheck } from 'lucide-react';
import { z } from 'zod';

import { useAuthControllerChangePasswordV1, useAuthControllerLogoutV1 } from '../../api/endpoints';
import { isAuthenticatedAtom, useAuth } from '../../stores/auth.store';

export const Route = createFileRoute('/_public/change-password')({
  component: ChangePassword,
});

function ChangePassword() {
  const navigate = Route.useNavigate();
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const { logout: authLogout } = useAuth();

  const { mutate: logoutMutate } = useAuthControllerLogoutV1({
    mutation: {
      onSuccess: () => {
        authLogout();
      },
    },
  });

  const { mutate: changePasswordMutate, isPending: isChanging } = useAuthControllerChangePasswordV1({
    mutation: {
      onSuccess: () => {
        logoutMutate();
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
      changePasswordMutate({ data: value });
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
            onClick={() => void navigate({ to: '/login' })}
          >
            <ArrowLeft />
            Back to Login
          </Button>

          <div className="flex items-center gap-2">
            <ShieldCheck />
            <span>SECURITY</span>
          </div>

          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Please update your password to secure your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form.AppForm>
            <form.Layout className="grid gap-4" onSubmit={(e) => void form.handleSubmit(e)}>
              <form.AppField name="currentPassword">
                {(field) => (
                  <field.Input
                    label="Current Password"
                    placeholder="Enter current password"
                    type="password"
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
                    label="New Password"
                    placeholder="Min. 6 characters"
                    type="password"
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
                    label="Confirm New Password"
                    placeholder="Re-type new password"
                    type="password"
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
                {isChanging ? 'Updating...' : 'Update Password'}
                <ArrowRight />
              </form.Submit>
            </form.Layout>
          </form.AppForm>
        </CardContent>

        <CardFooter className="justify-center">
          <CardDescription>Secured by Platform Auth Service</CardDescription>
        </CardFooter>
      </Card>
    </div>
  );
}
